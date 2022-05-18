import { EmbeddedActionsParser } from 'chevrotain';
import {
  AllTokens,
  Arrow,
  Blob,
  Colon,
  Eq,
  Func,
  FuncAnn,
  Id,
  Import,
  LBrace,
  LParen,
  MLComment,
  Nat,
  Opt,
  PrimType,
  RBrace,
  Record,
  RParen,
  Semi,
  Service,
  SLComment,
  Text,
  Type,
  Variant,
  Vec,
} from './lexer';
import {
  strToIDLPrimType,
  TActor,
  TActorType,
  TArgType,
  TCompType,
  TConsType,
  TDataType,
  TDef,
  TFieldType,
  TFuncType,
  TId,
  TImport,
  TMethType,
  TProg,
  TRefType,
  TTupType,
  TTypeKind,
} from './cst';
import { IDL } from '@dfinity/candid';

export class CandidParser extends EmbeddedActionsParser {
  constructor() {
    super(AllTokens);
    this.performSelfAnalysis();
  }

  public prog = this.RULE('prog', () => {
    const imports: TImport[] = [];
    const defs: Record<string, TDataType> = {};
    let actor: TActor | null = null;

    this.MANY(() => {
      this.MANY1(() => {
        this.SUBRULE(this.comment);
      });
      const def = this.SUBRULE(this.def);

      this.ACTION(() => {
        if (def instanceof TImport) {
          imports.push(def);
        } else {
          defs[def.id.text] = def.type;
        }
      });

      this.CONSUME(Semi);
    });
    this.OPTION2(() => {
      actor = this.SUBRULE(this.actor);
    });

    return this.ACTION(() => new TProg(imports, defs, actor));
  });

  public def = this.RULE('def', () => {
    let def: TDef | TImport;

    this.OR([
      {
        ALT: () => {
          this.CONSUME(Type);
          const id = this.CONSUME(Id);
          this.CONSUME(Eq);
          const type = this.SUBRULE(this.datatype);

          this.ACTION(() => {
            def = {
              id: new TId(id.image),
              type,
            };
          });
        },
      },
      {
        ALT: () => {
          this.CONSUME(Import);
          const path = this.CONSUME1(Text);

          this.ACTION(() => {
            def = new TImport(path.image.replace('"', ''));
          });
        },
      },
    ]);

    return def!;
  });

  public actor = this.RULE('actor', () => {
    const comments: string[] = [];
    this.MANY2(() => {
      const comment = this.SUBRULE1(this.comment);

      this.ACTION(() => {
        comments.push(comment);
      });
    });

    this.CONSUME(Service);

    let name: string | null = null;
    this.OPTION(() => {
      const id = this.CONSUME(Id);
      this.ACTION(() => {
        name = id.image;
      });
    });

    this.CONSUME(Colon);

    let init: TTupType | null = null;
    this.OPTION1(() => {
      init = this.SUBRULE(this.tuptype);
      this.CONSUME(Arrow);
    });

    let type: TActorType | TId;
    this.OR([
      {
        ALT: () => {
          type = this.SUBRULE(this.actortype);
        },
      },
      {
        ALT: () => {
          const id = this.CONSUME1(Id);

          this.ACTION(() => {
            type = new TId(id.image);
          });
        },
      },
    ]);

    return this.ACTION(() => {
      const actor: TActor = {
        comment: comments.length > 0 ? comments[comments.length - 1] : null,
        name,
        init,
        type: type!,
      };
      return actor;
    });
  });

  public actortype = this.RULE('actortype', () => {
    const actortype: TActorType = {
      comments: {},
      methods: {},
      _ty: TTypeKind.Actor,
    };

    this.CONSUME(LBrace);
    this.MANY1(() => {
      const comments: string[] = [];
      this.MANY2(() => {
        const comment = this.SUBRULE1(this.comment);

        this.ACTION(() => {
          comments.push(comment);
        });
      });

      const method = this.SUBRULE(this.methtype);
      this.ACTION(() => {
        if (comments.length > 0) {
          method.comment = comments[comments.length - 1];
        }

        actortype.methods[method.name] = method.type;
        if (method.comment) {
          actortype.comments[method.name] = method.comment;
        }
      });

      this.CONSUME(Semi);
    });
    this.CONSUME(RBrace);

    return actortype;
  });

  public methtype = this.RULE('methtype', () => {
    const name = this.SUBRULE(this.name);
    this.CONSUME(Colon);

    let type: TFuncType | TId;
    this.OR([
      {
        ALT: () => {
          type = this.SUBRULE(this.functype);
        },
      },
      {
        ALT: () => {
          const id = this.CONSUME(Id);

          this.ACTION(() => {
            type = new TId(id.image);
          });
        },
      },
    ]);

    return this.ACTION(() => {
      const methtype: TMethType = {
        comment: null,
        name,
        type: type!,
      };
      return methtype;
    });
  });

  public functype = this.RULE('functype', () => {
    const req = this.SUBRULE(this.tuptype);
    this.CONSUME(Arrow);
    const resp = this.SUBRULE1(this.tuptype);

    const annotations: string[] = [];
    this.MANY(() => {
      const ann = this.CONSUME(FuncAnn);

      this.ACTION(() => {
        annotations.push(ann.image);
      });
    });

    return this.ACTION(() => {
      const functype: TFuncType = {
        _ty: TTypeKind.Func,
        req,
        resp,
        annotations,
      };
      return functype;
    });
  });

  public tuptype = this.RULE('tuptype', () => {
    let tuptype: TTupType = {
      args: [],
    };

    this.CONSUME(LParen);
    this.MANY_SEP({
      SEP: Colon,
      DEF: () => {
        const arg = this.SUBRULE(this.argtype);
        this.ACTION(() => {
          tuptype.args.push(arg);
        });
      },
    });
    this.CONSUME(RParen);

    return tuptype;
  });

  public argtype = this.RULE('argtype', () => {
    let name: string | null = null;

    this.OPTION(() => {
      name = this.SUBRULE(this.name);
      this.CONSUME(Colon);
    });

    let type = this.SUBRULE(this.datatype);

    return this.ACTION(() => {
      let argtype: TArgType = {
        name,
        type,
      };

      return argtype;
    });
  });

  public fieldtype = this.RULE('fieldtype', () => {
    let fieldtype: TFieldType = {
      comment: null,
      needsIndexing: false,
      name: null,
      type: null,
    };

    this.OR([
      {
        ALT: () => {
          let name: string;
          this.OR1([
            {
              ALT: () => {
                name = this.CONSUME(Nat).image;
              },
            },
            {
              ALT: () => {
                name = this.SUBRULE(this.name);
              },
            },
          ]);

          let type: TDataType | null;
          this.OPTION(() => {
            this.CONSUME(Colon);
            type = this.SUBRULE(this.datatype);
          });

          this.ACTION(() => {
            fieldtype.name = name;
            fieldtype.type = type;
          });
        },
      },
      {
        ALT: () => {
          const type = this.SUBRULE2(this.datatype);

          this.ACTION(() => {
            fieldtype.type = type;
            fieldtype.needsIndexing = true;
          });
        },
        IGNORE_AMBIGUITIES: true,
      },
    ]);

    return fieldtype;
  });

  public datatype = this.RULE('datatype', () => {
    let datatype: TDataType;

    this.OR([
      {
        ALT: () => {
          const primtype = this.CONSUME(PrimType);

          this.ACTION(() => {
            datatype = strToIDLPrimType(primtype.image);
          });
        },
      },
      {
        ALT: () => {
          datatype = this.SUBRULE(this.comptype);
        },
      },
      {
        ALT: () => {
          const id = this.CONSUME(Id);

          this.ACTION(() => {
            datatype = new TId(id.image);
          });
        },
      },
    ]);

    return datatype!;
  });

  public comptype = this.RULE('comptype', () => {
    let comptype: TCompType;

    this.OR([
      {
        ALT: () => {
          comptype = this.SUBRULE(this.constype);
        },
      },
      {
        ALT: () => {
          comptype = this.SUBRULE(this.reftype);
        },
      },
    ]);

    return comptype!;
  });

  public constype = this.RULE('constype', () => {
    let constype: TConsType;

    this.OR([
      {
        ALT: () => {
          this.CONSUME(Blob);

          this.ACTION(() => {
            constype = {
              type: IDL.Nat8,
              _ty: TTypeKind.Vec,
            };
          });
        },
      },
      {
        ALT: () => {
          let _ty: TTypeKind;

          this.OR1([
            {
              ALT: () => {
                this.CONSUME(Opt);
                _ty = TTypeKind.Opt;
              },
            },
            {
              ALT: () => {
                this.CONSUME(Vec);
                _ty = TTypeKind.Vec;
              },
            },
          ]);

          const type = this.SUBRULE(this.datatype);

          this.ACTION(() => {
            constype = {
              type,
              _ty: _ty!,
            };
          });
        },
      },
      {
        ALT: () => {
          let _ty: TTypeKind;
          this.OR2([
            {
              ALT: () => {
                this.CONSUME(Record);
                _ty = TTypeKind.Record;
              },
            },
            {
              ALT: () => {
                this.CONSUME(Variant);
                _ty = TTypeKind.Variant;
              },
            },
          ]);

          const fields: TFieldType[] = [];
          let i = 0;

          this.CONSUME(LBrace);
          this.MANY(() => {
            const comments: string[] = [];
            this.MANY1(() => {
              comments.push(this.SUBRULE(this.comment));
            });

            const field = this.SUBRULE(this.fieldtype);
            this.ACTION(() => {
              if (comments.length > 0) {
                field.comment = comments[comments.length - 1];
              }
              if (field.needsIndexing) {
                field.name = i.toString();
                i += 1;
              }
            });
            fields.push(field);

            this.CONSUME(Semi);
          });
          this.CONSUME(RBrace);

          this.ACTION(() => {
            const fieldsRec: Record<string, TDataType | null> = {};
            const commentsRec: Record<string, string> = {};

            for (let f of fields) {
              fieldsRec[f.name!] = f.type;
              if (f.comment) {
                commentsRec[f.name!] = f.comment;
              }
            }

            constype = {
              fields: fieldsRec,
              comments: commentsRec,
              _ty: _ty!,
            };
          });
        },
      },
    ]);

    return constype!;
  });

  public reftype = this.RULE('reftype', () => {
    let reftype: TRefType;

    this.OR([
      {
        ALT: () => {
          this.CONSUME(Func);
          reftype = this.SUBRULE(this.functype);
        },
      },
      {
        ALT: () => {
          this.CONSUME(Service);
          reftype = this.SUBRULE(this.actortype);
        },
      },
    ]);

    return reftype!;
  });

  public name = this.RULE('name', () => {
    let name: string;

    this.OR([
      {
        ALT: () => {
          name = this.CONSUME(Id).image;
        },
      },
      {
        ALT: () => {
          name = this.CONSUME(Text).image.replace('"', '');
        },
      },
    ]);

    return name!;
  });

  public comment = this.RULE('comment', () => {
    let comment: string;

    this.OR([
      {
        ALT: () => {
          comment = this.CONSUME(SLComment)
            .image.replace(/(\/\/)|(\n)/, '')
            .trim();
        },
      },
      {
        ALT: () => {
          comment = this.CONSUME(MLComment)
            .image.replace(/(\/\*)|(\*\/)/, '')
            .trim();
        },
      },
    ]);

    return comment!;
  });
}

export const Parser = new CandidParser();
