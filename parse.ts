import { Expression } from "./types";

export function parse(input: string): Expression {
    const tokens = inputToTokens(input);
    return parseExpression(tokens);
}

function inputToTokens(input: string): string[] {
    let tokens: string[] = [];
    let currentToken = '';
    let stringContext = false;

    for (let i = 0; i < input.length; i++) {
        if (input.charAt(i) === '"') {
            currentToken += input.charAt(i);
            if (stringContext) {
                tokens.push(currentToken);
                currentToken = "";
            }
            stringContext = !stringContext;
        } else if (input.charAt(i) === " " && !stringContext) {
            if (currentToken !== "") {
                tokens.push(currentToken);
            }
            currentToken = "";
        } else if (input.charAt(i) === "(" && !stringContext) {
            if (currentToken === "") {
                // This is an anonymous function!
                currentToken = "\\";
            } else {
                // This is an application, split it into "before bracket" and "token in expr after"
                tokens.push(currentToken);
                currentToken = "";
            }
        } else if (input.charAt(i) === ")" && !stringContext) {
            // This signifies the end of a token, but don't include it in the parsing
            tokens.push(currentToken);
            currentToken = "";
        } else if (input.charAt(i) === ";" && !stringContext) {
            if (currentToken != "") {
                tokens.push(currentToken);
            }
            currentToken = "";
            tokens.push("in");
        } else {
            currentToken += input.charAt(i);
        }
    }

    if (currentToken !== "") {
        tokens.push(currentToken);
    }

    return tokens;
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
        throw new Error("Parse error: Let expression expects a semi-colon and new line");
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
    [remainingTokens, _] = expect("=>", remainingTokens);

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
