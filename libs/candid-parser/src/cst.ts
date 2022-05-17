import { IDL } from '@dfinity/candid';
import { Visitor } from '@dfinity/candid/lib/cjs/idl';

export class TId extends IDL.ConstructType {
  constructor(public text: string) {
    super();
    this.name = `Knot(${text})`;
  }

  protected _buildTypeTableImpl(typeTable: any): void {
    throw new Error('Unreachable');
  }

  accept<D, R>(v: Visitor<D, R>, d: D): R {
    // @ts-ignore
    if (!this.prog) {
      throw new Error('Unreachable');
    }

    // @ts-ignore
    return this.prog.traverseIdlType(this).accept(v, d);
  }

  covariant(x: any): x is any {
    throw new Error('Unreachable');
  }

  decodeValue(x: any, t: any): any {
    throw new Error('Unreachable');
  }

  encodeValue(x: any): ArrayBuffer {
    throw new Error('Unreachable');
  }

  _setProg(prog: TProg) {
    Object.defineProperty(this, 'prog', { value: 'static', writable: true });

    // @ts-ignore
    this.prog = prog;
  }

  readonly name: string;
}

export enum TTypeKind {
  Vec,
  Opt,
  Record,
  Variant,
  Func,
  Actor,
}

export interface TType {
  _ty: TTypeKind;
}

export type TRefType = TFuncType | TActorType;

export interface TVecType extends TType {
  type: TDataType;
}

export interface TOptType extends TType {
  type: TDataType;
}

export interface TRecordType extends TType {
  comments: Record<string, string>;
  fields: Record<string, TDataType | null>;
}

export interface TVariantType extends TType {
  comments: Record<string, string>;
  fields: Record<string, TDataType | null>;
}

export type TConsType = TVecType | TOptType | TRecordType | TVariantType;

export type TCompType = TConsType | TRefType;

export type TDataType = TId | IDL.Type | TCompType;

export interface TFieldType {
  comment: string | null;
  needsIndexing: boolean;
  name: string | null;
  type: TDataType | null;
}

export interface TArgType {
  name: string | null;
  type: TDataType;
}

export interface TTupType {
  args: TArgType[];
}

export interface TFuncType extends TType {
  req: TTupType;
  resp: TTupType;
  annotations: string[];
}

export interface TMethType {
  comment: string | null;
  name: string;
  type: TFuncType | TId;
}

export interface TActorType extends TType {
  methods: Record<string, TFuncType | TId>;
  comments: Record<string, string>;
}

export interface TActor {
  comment: string | null;
  name: string | null;
  init: TTupType | null;
  type: TActorType | TId;
}

export interface TDef {
  id: TId;
  type: TDataType;
}

export class TImport {
  constructor(public path: string) {}
}

export class TProg {
  constructor(
    private imports: TImport[],
    private defs: Record<string, TDataType>,
    private actor: TActor | null,
  ) {
    this.imports;
    for (let id of Object.keys(defs)) {
      this.traverseIdlType(defs[id]);
    }
  }

  private searchingForId: Set<string> = new Set();
  private cache: Record<string, IDL.Type | TId> = {};

  private getDefType(id: TId): TDataType {
    let type = this.defs[id.text];
    if (!type) {
      throw new Error(`Unable to traverse type: ${id.text}`);
    }

    return type;
  }

  getIdlActor(): IDL.ServiceClass | null {
    if (this.actor == null) {
      return null;
    }

    return this.traverseIdlType(this.actor.type) as IDL.ServiceClass;
  }

  traverseIdlType(type: TDataType): IDL.Type | TId {
    if (type instanceof TId) {
      if (this.searchingForId.has(type.text)) {
        return type;
      }

      type._setProg(this);

      const cached = this.cache[type.text];
      if (!!cached) {
        return cached;
      }

      const innerType = this.getDefType(type);

      this.searchingForId.add(type.text);
      const ty = this.traverseIdlType(innerType);
      this.searchingForId.delete(type.text);

      this.cache[type.text] = ty;

      return ty;
    }

    if (type instanceof IDL.Type) {
      return type;
    }

    switch ((type as TCompType)._ty) {
      case TTypeKind.Opt:
        // @ts-ignore
        return IDL.Opt(this.traverseIdlType((type as TOptType).type));

      case TTypeKind.Vec:
        // @ts-ignore
        return IDL.Vec(this.traverseIdlType((type as TVecType).type));

      case TTypeKind.Record:
        let recType = type as TRecordType;
        let rec: Record<string, IDL.Type> = {};

        for (let k of Object.keys(recType.fields)) {
          // @ts-ignore
          rec[k] = recType.fields[k] == null ? IDL.Null : this.traverseIdlType(recType.fields[k]!);
        }
        return IDL.Record(rec);

      case TTypeKind.Variant:
        let rec1: Record<string, IDL.Type> = {};
        let varType = type as TVariantType;

        for (let k of Object.keys(varType.fields)) {
          // @ts-ignore
          rec1[k] = varType.fields[k] == null ? IDL.Null : this.traverseIdlType(varType.fields[k]!);
        }
        return IDL.Record(rec1);

      case TTypeKind.Func:
        let args: IDL.Type[] = [];
        for (let r of (type as TFuncType).req.args) {
          // @ts-ignore
          args.push(r.type == null ? IDL.Null : this.traverseIdlType(r.type));
        }
        let ret: IDL.Type[] = [];
        for (let r of (type as TFuncType).resp.args) {
          // @ts-ignore
          ret.push(r.type == null ? IDL.Null : this.traverseIdlType(r.type));
        }

        return IDL.Func(args, ret, (type as TFuncType).annotations);

      case TTypeKind.Actor:
        let rec2: Record<string, IDL.FuncClass> = {};
        const actor = type as TActorType;

        for (let m of Object.keys(actor.methods)) {
          rec2[m] = this.traverseIdlType(actor.methods[m]) as IDL.FuncClass;
        }
        return IDL.Service(rec2);

      default:
        throw new Error('Unreachable');
    }
  }
}

export function strToIDLPrimType(str: string): IDL.Type {
  switch (str) {
    case 'nat8':
      return IDL.Nat8;
    case 'nat16':
      return IDL.Nat16;
    case 'nat32':
      return IDL.Nat32;
    case 'nat64':
      return IDL.Nat64;
    case 'nat':
      return IDL.Nat;
    case 'int8':
      return IDL.Int8;
    case 'int16':
      return IDL.Int16;
    case 'int32':
      return IDL.Int32;
    case 'int64':
      return IDL.Int64;
    case 'int':
      return IDL.Int;
    case 'float32':
      return IDL.Float32;
    case 'float64':
      return IDL.Float64;
    case 'bool':
      return IDL.Bool;
    case 'text':
      return IDL.Text;
    case 'null':
      return IDL.Null;
    case 'reserved':
      return IDL.Reserved;
    case 'empty':
      return IDL.Empty;
    case 'principal':
      return IDL.Principal;

    default:
      throw new Error(`Invalid prim type ${str}`);
  }
}
