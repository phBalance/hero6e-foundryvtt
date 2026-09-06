// Compare two compiled CSS builds by selector: `node scripts/css-diff.mjs before.css [...] -- after.css [...] [--core foundry2.css]`
import { readFileSync } from "node:fs";
import * as csstree from "css-tree";

const args = process.argv.slice(2);
const coreIndex = args.indexOf("--core");
const corePath = coreIndex >= 0 ? args.splice(coreIndex, 2)[1] : null;
const [before, after] = args
    .join(" ")
    .split(" -- ")
    .map((s) => s.trim().split(/\s+/).filter(Boolean));
if (!before?.length || !after?.length) {
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
                rules.set(selector, new Set([...(rules.get(selector) ?? []), ...decls]));
            }
        },
    });
    return { rules, used, defined, important };
}

const a = index(load(before));
const b = index(load(after));
const coreDefined = corePath ? index(readFileSync(corePath, "utf8")).defined : new Set();
const key = (set) => [...set].sort().join(";");

const removed = [...a.rules.keys()].filter((s) => !b.rules.has(s));
const added = [...b.rules.keys()].filter((s) => !a.rules.has(s));
const changed = [...a.rules.keys()]
    .filter((s) => b.rules.has(s) && key(a.rules.get(s)) !== key(b.rules.get(s)))
    .map((s) => ({
        selector: s,
        dropped: [...a.rules.get(s)].filter((d) => !b.rules.get(s).has(d)),
        introduced: [...b.rules.get(s)].filter((d) => !a.rules.get(s).has(d)),
    }));
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
