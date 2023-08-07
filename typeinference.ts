import { Context, Expression, LiteralBoolean, LiteralInt, LiteralString, Scheme, Subsitution, Type } from "./types";
import { repl } from "./repl";

function applySubstitution(substitution: Subsitution, type: Type): Type {
    switch (type.kind) {
        case "TVar":
            if (type.name in substitution) {
                return substitution[type.name]
            }
            return type
        case "TFunction":
            return {
                kind: "TFunction",
                from: applySubstitution(substitution, type.from),
                to: applySubstitution(substitution, type.to),
            }
        default:
            return type;            
    }
}

function freeTypeVariables(type: Type): string[] {
    if (type.kind === "TVar") {
        return [type.name]
    }

    if (type.kind === "TFunction") {
        return [...freeTypeVariables(type.from), ...freeTypeVariables(type.to)];
    }

    return [];
}

function variableBind(variableName: string, type: Type): Subsitution {
    if (type.kind === "TVar") {
        return {};
    }

    if (variableName in freeTypeVariables(type)) {
        throw new Error("Occurs check error, potentialally unsound.");
    }

    let substitution: Subsitution = {};
    substitution[variableName] = type;
    return substitution;
}

function unify(typeA: Type, typeB: Type): Subsitution {
    const emptySubstitution = {};

    if (typeA.kind === "TVar") {
        return variableBind(typeA.name, typeB);
    } 

    if (typeB.kind === "TVar") {
        return variableBind(typeB.name, typeA);
    }

    if (typeA.kind === "TFunction" && typeB.kind === "TFunction") {
        const substitution1 = unify(typeA.from, typeB.from);
        const substitution2 = unify(
            applySubstitution(substitution1, typeA.to),
            applySubstitution(substitution1, typeB.to)
        );

        return composeSubstitution(substitution2, substitution1);
    }

    if (typeA.kind === typeB.kind) {
        return emptySubstitution;
    }

    throw new Error(`Types do not unify! \n${JSON.stringify(typeA)}\nCannot be unified with: \n${JSON.stringify(typeB)}`);

}

function instantiateScheme(scheme: Scheme): Type {
    const newVars = scheme.variables.map(_ => newTypeVariable());
    let substitution: Subsitution = {};

    for (let i = 0; i < newVars.length; i++) {
        substitution[scheme.variables[i]] = newVars[i];
    }

    return applySubstitution(substitution, scheme.type);
}

function inferLiteral(literal: LiteralBoolean | LiteralInt | LiteralString): [Subsitution, Type] {
    switch (literal.kind) {
        case "LiteralBoolean":
            return [{}, {kind: "TBool"}];
        case "LiteralInt":
            return [{}, {kind: "TInt"}];
        case "LiteralString":
            return [{}, {kind: "TString"}]
    }
}

let TYPE_COUNTER = 0
function newTypeVariable(): Type {
    const letter = String.fromCharCode("a".charCodeAt(0) + TYPE_COUNTER++);
    return {kind: "TVar", name: `'${letter}`};
}

function applySubstitutionToScheme(substitution: Subsitution, scheme: Scheme): Scheme {
    let substitution2 = Object.assign({}, substitution)
    scheme.variables.forEach(variable => {
        delete substitution2[variable];
    });

    return {
        variables: scheme.variables,
        type: applySubstitution(substitution2, scheme.type)
    };
}

function applySubstitutionToContext(substitution: Subsitution, context: Context): Context {
    let finalContext: Context = {};
    Object.entries(context).forEach(([variable, scheme]) => {
        finalContext[variable] = applySubstitutionToScheme(substitution, scheme);
    });
    return finalContext;
}

function composeSubstitution(substitutionA: Subsitution, substitutionB: Subsitution): Subsitution {
    const newSubstitutionTuples = Object.entries(substitutionB).map(([variable, type]) => {
        return [variable, applySubstitution(substitutionA, type)];
    });

    const newSubsitutions: Subsitution = Object.fromEntries(newSubstitutionTuples);

    return {
        ...newSubsitutions,
        ...substitutionA
    };

}

function infer(context: Context, expression: Expression): [Subsitution, Type] {
    if (expression.kind === "ELiteral") {
        return inferLiteral(expression.literalValue);
    }

    if (expression.kind === "EVariable") {
        if (expression.name in context) {
            const scheme = context[expression.name];
            return [{}, instantiateScheme(scheme)]
        }

        throw new Error(`Unbound variable: ${expression.name}`);
    }

    if (expression.kind === "EApplication") {
        let typeResult = newTypeVariable();

        let [substitution1, functionType] = infer(context, expression.leftExpression);
        let [substitution2, argumentType] = infer(applySubstitutionToContext(substitution1, context), expression.rightExpression);

        let substitution3 = unify(applySubstitution(substitution2, functionType), {kind: "TFunction", from: argumentType, to: typeResult});
        const finalSubstitution = composeSubstitution(composeSubstitution(substitution3, substitution2), substitution1);
        const finalType = applySubstitution(substitution3, typeResult);

        return [finalSubstitution, finalType];
    }

    if (expression.kind === "ELambda") {
        let typeBinder = newTypeVariable();

        let temporaryContext = Object.assign({}, context);
        temporaryContext[expression.variable] = {variables: [], type: typeBinder};

        const [substitution, bodyType] = infer(temporaryContext, expression.expression);
        return [substitution, {kind: "TFunction", from: applySubstitution(substitution, typeBinder), to: bodyType}];
    }

    if (expression.kind === "ELet") {
        const [substitution1, typeBinder] = infer(context, expression.expression);

        let scheme = {
            variables: [],
            type: applySubstitution(substitution1, typeBinder)
        };

        let temporaryContext = Object.assign({}, context);
        temporaryContext[expression.name] = scheme;

        const [substitution2, typeBody] = infer(
            applySubstitutionToContext(substitution1, temporaryContext),
            expression.inExpression
        );

        return [composeSubstitution(substitution1, substitution2), typeBody];
    }

    throw new Error(`Unexpected expression: ${expression}`);
}

export function typeInference(context: Context, expression: Expression) {
    TYPE_COUNTER = 0; // Reset this every type we run this
    const [substitution, type] = infer(context, expression);
    const finalType = applySubstitution(substitution, type);
    return finalType
}

repl();