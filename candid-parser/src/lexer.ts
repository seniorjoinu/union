import {createToken, Lexer} from 'chevrotain';

export const Semi = createToken({
    name: 'Semi',
    pattern: /;/,
});
export const Colon = createToken({
    name: 'Colon',
    pattern: /:/,
});
export const Eq = createToken({
    name: 'Eq',
    pattern: /=/,
});
export const Arrow = createToken({
    name: 'Arrow',
    pattern: /->/,
});
export const LBrace = createToken({
    name: 'LBrace',
    pattern: /{/,
});
export const RBrace = createToken({
    name: 'RBrace',
    pattern: /}/,
});
export const LParen = createToken({
    name: 'LParen',
    pattern: /\(/,
});
export const RParen = createToken({
    name: 'RParen',
    pattern: /\)/,
});
export const Comma = createToken({
    name: 'Comma',
    pattern: /,/,
});

export const Id = createToken({
    name: 'Id',
    pattern: /[a-zA-Z_][a-zA-Z0-9_]*/,
});

export const Type = createToken({
    name: 'Type',
    pattern: /type/,
    longer_alt: Id,
});
export const Import = createToken({
    name: 'Import',
    pattern: /import/,
    longer_alt: Id,
});
export const Service = createToken({
    name: 'Service',
    pattern: /service/,
    longer_alt: Id,
});
export const Func = createToken({
    name: 'Func',
    pattern: /func/,
    longer_alt: Id,
});

export const Opt = createToken({
    name: 'Opt',
    pattern: /opt/,
    longer_alt: Id,
});
export const Vec = createToken({
    name: 'Vec',
    pattern: /vec/,
    longer_alt: Id,
});
export const Blob = createToken({
    name: 'Blob',
    pattern: /blob/,
    longer_alt: Id,
});
export const Record = createToken({
    name: 'Record',
    pattern: /record/,
    longer_alt: Id,
});
export const Variant = createToken({
    name: 'Variant',
    pattern: /variant/,
    longer_alt: Id,
});

export const FuncAnn = createToken({
    name: 'FuncAnn',
    pattern: /(oneway)|(query)/,
    longer_alt: Id,
});
export const PrimType = createToken({
    name: 'PrimType',
    pattern: /(nat8)|(nat16)|(nat32)|(nat64)|(nat)|(int8)|(int16)|(int32)|(int64)|(int)|(float32)|(float64)|(bool)|(text)|(null)|(reserved)|(empty)|(principal)/,
    longer_alt: Id,
});

export const Text = createToken({
    name: 'Text',
    pattern: /"[\p{L}\p{N}\p{M}\p{S}\p{Z}]+"/u,
});
export const Nat = createToken({
    name: 'Nat',
    pattern: /([0-9][0-9_]*)|(0x([0-9a-fA-F][0-9a-fA-F_]*))/,
});

export const WhiteSpace = createToken({
    name: "WhiteSpace",
    pattern: /\s+/,
    group: Lexer.SKIPPED
});

export const SLComment = createToken({
    name: 'SLComment',
    pattern: /\/\/.*?\n/,
});

export const MLComment = createToken({
    name: 'MLComment',
    pattern: /\/\*.*?\*\//,
})

export const AllTokens = [
    WhiteSpace,
    Semi,
    Colon,
    Eq,
    Arrow,
    LBrace,
    RBrace,
    LParen,
    RParen,
    Comma,
    Type,
    Import,
    Service,
    Func,
    Opt,
    Vec,
    Blob,
    Record,
    Variant,
    FuncAnn,
    PrimType,
    Nat,
    Id,
    Text,
    SLComment,
    MLComment,
];

export const lexer = new Lexer(AllTokens);