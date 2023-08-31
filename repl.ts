import prompt from "prompt-sync";

import { typeInference } from "./typeinference";
import { parse } from "./parse";
import { Context, Type } from "./types";
import { executeExpression } from "./execute";

function printType(type: Type): string {
    if (type.kind === "TFunction") {
        return `${printType(type.from)} -> ${printType(type.to)}`;
    } else if (type.kind === "TVar") {
        return type.name;
    } else {
        return type.kind.slice(1);
    }
}

function printEvaluatedExpression (result: any) {
    if (typeof(result) === "function") {
        return "Lambda Function"
    } else if (typeof(result) === "string") {
        return `"${result}"`;
    } else {
        return result;
    }
}

const primitives: Context = {
    "add": { "variables": [], type: { kind: "TFunction", from: { kind: "TInt" }, to: { kind: "TFunction", from: { kind: "TInt" }, to: { kind: "TInt" } } } },
    "mult": { "variables": [], type: { kind: "TFunction", from: { kind: "TInt" }, to: { kind: "TFunction", from: { kind: "TInt" }, to: { kind: "TInt" } } } },
    "intToString": { "variables": [], type: { kind: "TFunction", from: { kind: "TInt" }, to: { kind: "TString" } } },
};

export function repl(showTypes=true, showValues=true) {
    var inputPrompt: any = prompt({ sigint: true });
    while (true) {
        let input = inputPrompt(" > ")!;
        while (input.endsWith(";")) {
            input += ` ${inputPrompt(".. ")}`;
        }
        try {
            const ast = parse(input);
            const result = typeInference(primitives, ast);
            if (showTypes) {
                console.log("\x1b[36m%s\x1b[0m", printType(result));
            }
            if (showValues) {
                console.log(printEvaluatedExpression(executeExpression(ast, undefined)));
            }
            console.log("");
        } catch (e) {
            console.error("TYPE ERROR: ", e);
        }
    }
}

if (process.argv.length > 1) {
    if (process.argv[2] === "--types") {
        repl(true, false);
    } else if (process.argv[2] === "--exec") {
        repl(false, true);
    } else {
        repl();
    }
} else {
    repl();
}