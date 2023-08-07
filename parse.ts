import { Expression } from "./types";

export function parse(input: string): Expression {
    // TODO: Fix parsing bug with strings with spaces in them (i.e. in string context, don't split on space)
    // Also maybe strip all whitespace so the parser is more resilient to accidently spacing things wrong
    const tokens = input.split(" ");
    return parseExpression(tokens);
}

function expect(expectedToken: string, tokens: string[]): [string[], string] {
    if (tokens.length > 0 && tokens[0] === expectedToken) {
        return [tokens.slice(1), expectedToken];
    }
    throw new Error(`Parse error: expected ${expectedToken}`);
}

function consume(tokens: string[]): [string[], string] {
    let result = tokens[0];
    return [tokens.slice(1), result];
}

function parseLetExpression(tokens: string[]): Expression {
    let _: any;
    let [remainingTokens, name] = consume(tokens);
    [remainingTokens, _] = expect("=", remainingTokens);

    let inTokenIndex = remainingTokens.findIndex((token) => token === "in");
    if (inTokenIndex === -1) {
        throw new Error("Parse error: Let expression expects an 'in'.");
    }

    const expression = parseExpression(remainingTokens.slice(0, inTokenIndex));
    const inExpression = parseExpression(remainingTokens.slice(inTokenIndex + 1));

    return {
        kind: "ELet",
        name,
        expression,
        inExpression
    };
}

function parseLambdaExpresion(tokens: string[]): Expression {
    let _: any;
    let [remainingTokens, variableNameWithSlash] = consume(tokens);
    const variable = variableNameWithSlash.slice(1);
    [remainingTokens, _] = expect("->", remainingTokens);

    const expression = parseExpression(remainingTokens);

    return {
        kind: "ELambda",
        variable,
        expression
    };
}

function parseLiteralOrVariable(tokens: string[]): Expression {
    const value = tokens[0];
    if (value === "true" || value === "false") {
        return {
            kind: "ELiteral",
            literalValue: {
                kind: "LiteralBoolean",
                value: Boolean(tokens[0])
            }
        };
    }

    if (/^\d+$/.test(value)) {
        return {
            kind: "ELiteral",
            literalValue: {
                kind: "LiteralInt",
                value: parseInt(value, 10)
            }
        };
    }

    if (value.startsWith('"') && value.endsWith('"')) {
        return {
            kind: "ELiteral",
            literalValue: {
                kind: "LiteralString",
                value: value.slice(1, value.length - 1)
            }
        };
    }

    // TODO: Maybe add a test here to make sure this name is okay?

    return {
        kind: "EVariable",
        name: value
    };
}

function parseApplication(tokens: string[]): Expression {
    return {
        kind: "EApplication",
        leftExpression: parseExpression([tokens[0]]),
        rightExpression: parseExpression(tokens.slice(1)),
    }
}

function parseExpression(tokens: string[]): Expression {
    if (tokens.length === 0) {
        throw new Error("Parse error: Empty input");
    }

    if (tokens[0] === 'let') {
        return parseLetExpression(tokens.slice(1))
    }

    if (tokens[0].startsWith("\\")) {
        return parseLambdaExpresion(tokens);
    }
    
    if (tokens.length > 1) {
        return parseApplication(tokens);
    }

    return parseLiteralOrVariable(tokens);
}

// DUMMY CALLS PREVIOUSLY
    // SUCCEEDS: \a -> a
    // return {
    //     "kind": "ELambda",
    //     "variable": "a",
    //     "expression": {kind: "EVariable", name: "a"}
    // }
    // SUCCEEDS: 1
    // return {
    //     kind: "ELiteral",
    //     literalValue: {
    //         kind: "LiteralInt",
    //         value: 1
    //     }
    // }
    // SUCCEES: (\a -> true) 1
    // return {
    //     kind: "EApplication",
    //     leftExpression: {
    //         kind: "ELambda",
    //         variable: "a",
    //         expression: {
    //             kind: "ELiteral",
    //             literalValue: {
    //                 kind: "LiteralBoolean",
    //                 value: true
    //             }
    //         }
    //     },
    //     rightExpression: {
    //         kind: "ELiteral",
    //         literalValue: {
    //             kind: "LiteralInt",
    //             value: 1
    //         }
    //     }
    // }
    // return {
    //     kind: "ELet",
    //     name: "z",
    //     expression: {
    //         kind: "ELambda",
    //         variable: "x",
    //         expression: {
    //             kind: "EVariable",
    //             name: "x"
    //         }
    //     },
    //     inExpression: {
    //         kind: "EApplication",
    //         leftExpression: {
    //             kind: "EVariable",
    //             name: "z",
    //         },
    //         rightExpression: {
    //             kind: "ELiteral",
    //             literalValue: {
    //                 kind: "LiteralInt",
    //                 value: 1,
    //             }
    //         },
    //     }
    // }

