export type EVariable = {
    kind: "EVariable",
    name: string
};

export type LiteralInt = {
    kind: "LiteralInt",
    value: Number
 };

 export type LiteralString = {
    kind: "LiteralString",
    value: string,
 }

export type LiteralBoolean = {
    kind: "LiteralBoolean",
    value: Boolean
};

export type ELiteral = {
    kind: "ELiteral",
    literalValue: LiteralBoolean | LiteralInt | LiteralString
};

export type EApplication = {
    kind: "EApplication",
    leftExpression: Expression,
    rightExpression: Expression
};

export type ELambda = {
    kind: "ELambda",
    variable: string,
    expression: Expression
};

export type ELet = {
    kind: "ELet",
    name: string,
    expression: Expression,
    inExpression: Expression
};

export type TVar = {
    kind: "TVar",
    name: string
};

export type TFunction = {
    kind: "TFunction",
    from: Type,
    to: Type
};

export type TInt = {
    kind: "TInt",
};

export type TBool = {
    kind: "TBool",
};

export type TString = {
    kind: "TString",
};

export type Expression = EVariable | ELiteral | EApplication | ELambda | ELet;
export type Type = TInt | TBool | TString | TVar | TFunction
export type Subsitution = {[key: string]: Type};
export type Scheme = {variables: string[], type: Type};
export type Context = {[key: string]: Scheme};

