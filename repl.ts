import prompt from "prompt-sync";

import { typeInference } from "./typeinference";
import { parse } from "./parse";
import { Context, Type } from "./types";

function printType(type: Type): string {
    if (type.kind === "TFunction") {
        return `${printType(type.from)} -> ${printType(type.to)}`;
    } else if (type.kind === "TVar") {
        return type.name;
    } else {
        return type.kind.slice(1);
    }
}

const primitives: Context = {
    "add": { "variables": [], type: { kind: "TFunction", from: { kind: "TInt" }, to: { kind: "TFunction", from: { kind: "TInt" }, to: { kind: "TInt" } } } },
    "mult": { "variables": [], type: { kind: "TFunction", from: { kind: "TInt" }, to: { kind: "TFunction", from: { kind: "TInt" }, to: { kind: "TInt" } } } },
    "intToString": { "variables": [], type: { kind: "TFunction", from: { kind: "TInt" }, to: { kind: "TString" } } },
};

export function repl() {
    var inputPrompt: any = prompt({ sigint: true });
    while (true) {
        const input = inputPrompt("> ")!;
        try {
            const ast = parse(input);
            const result = typeInference(primitives, ast);
            console.log(printType(result));
            console.log("");
        } catch (e) {
            console.error("TYPE ERROR: ", e);
        }
    }
}