// Compare two compiled CSS builds by selector: `node scripts/css-diff.mjs before.css [...] -- after.css [...] [--core foundry2.css]`
import { readFileSync } from "node:fs";
import * as csstree from "css-tree";

const args = process.argv.slice(2);
const coreIndex = args.indexOf("--core");
const corePath = coreIndex >= 0 ? args.splice(coreIndex, 2)[1] : null;
const sep = args.indexOf("--");
const before = sep >= 0 ? args.slice(0, sep) : [];
const after = sep >= 0 ? args.slice(sep + 1) : [];
if (!before.length || !after.length) {
    console.error("usage: css-diff.mjs <before.css...> -- <after.css...> [--core foundry2.css]");
    process.exit(2);
}

const load = (files) => files.map((f) => readFileSync(f, "utf8")).join("\n");
const RUNTIME_DEFINED = /^--cursor-/;

function index(css) {
    const rules = new Map();
    const used = new Set();
    const defined = new Set();
    let important = 0;
    csstree.walk(csstree.parse(css), {
        visit: "Rule",
        enter(rule) {
            const selectors = csstree
                .generate(rule.prelude)
                .split(",")
                .map((s) => s.trim());
            const decls = [];
            rule.block.children.forEach((node) => {
                if (node.type !== "Declaration") return;
                const value = csstree.generate(node.value);
                if (node.important) important++;
                if (node.property.startsWith("--")) defined.add(node.property);
                for (const m of value.matchAll(/var\((--[\w-]+)/g)) used.add(m[1]);
                decls.push(`${node.property}:${value}${node.important ? "!important" : ""}`);
            });
            for (const selector of selectors) {
                let set = rules.get(selector);
                if (!set) rules.set(selector, (set = new Set()));
                for (const d of decls) set.add(d);
            }
        },
    });
    return { rules, used, defined, important };
}

// Only the custom property names matter for core, so skip selector and value generation
function definedVars(css) {
    const defined = new Set();
    csstree.walk(csstree.parse(css), {
        visit: "Declaration",
        enter(node) {
            if (node.property.startsWith("--")) defined.add(node.property);
        },
    });
    return defined;
}

const a = index(load(before));
const b = index(load(after));
const coreDefined = corePath ? definedVars(readFileSync(corePath, "utf8")) : new Set();

const removed = [...a.rules.keys()].filter((s) => !b.rules.has(s));
const added = [...b.rules.keys()].filter((s) => !a.rules.has(s));
const changed = [...a.rules.keys()]
    .filter((s) => b.rules.has(s))
    .map((s) => ({
        selector: s,
        dropped: [...a.rules.get(s)].filter((d) => !b.rules.get(s).has(d)),
        introduced: [...b.rules.get(s)].filter((d) => !a.rules.get(s).has(d)),
    }))
    .filter(({ dropped, introduced }) => dropped.length || introduced.length);
const undefinedVars = [...b.used].filter((v) => !b.defined.has(v) && !coreDefined.has(v) && !RUNTIME_DEFINED.test(v));

const section = (title, items) => {
    console.log(`\n## ${title} (${items.length})`);
    for (const item of items) console.log(typeof item === "string" ? `  ${item}` : JSON.stringify(item));
};
console.log(`selectors: ${a.rules.size} -> ${b.rules.size}; !important: ${a.important} -> ${b.important}`);
section("removed", removed);
section("added", added);
section("changed", changed);
section(corePath ? "vars used but not defined locally or in core" : "vars used but not defined locally", undefinedVars);
