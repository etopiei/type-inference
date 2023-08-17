import { Expression } from "./types";

type VariableTracker = {[key: string]: any};

const primitives: VariableTracker = {
    "add": (x: number) => (y: number) => x + y,
    "mult": (x: number) => (y: number) => x * y,
    "intToString": (x: number) => `"${x.toString()}"`,
};

export const executeExpression = (expression: Expression, variableTracker: VariableTracker | undefined): any => {
    if (variableTracker === undefined) {
        variableTracker = {...primitives};
    }

    if (expression.kind === "ELiteral") {
        return expression.literalValue.value;
    }

    if (expression.kind === "EVariable") {
        try {
            return variableTracker[expression.name];
        } catch {
            console.error("Runtime error: Undefined variable");
        }
    }

    if (expression.kind === "EApplication") {
        let arg = executeExpression(expression.rightExpression, variableTracker);
        return executeExpression(expression.leftExpression, variableTracker)(arg);
    }

    if (expression.kind === "ELambda") {
        return (a: any) => {
            let lambdaScope: VariableTracker = {};
            lambdaScope[expression.variable] = a;
            return executeExpression(expression.expression, {...variableTracker, ...lambdaScope});
        }
    }

    if (expression.kind === "ELet") {
        let bindValue = executeExpression(expression.expression, variableTracker);
        variableTracker[expression.name] = bindValue;
        return executeExpression(expression.inExpression, variableTracker);
    }
};