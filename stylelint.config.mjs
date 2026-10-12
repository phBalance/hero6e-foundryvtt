const legacyTokens = [
    "/--herosystem-/",
    "/--color-(border|text)-(light|dark)/",
    "/--color-border-highlight/",
    "/--color-shadow-(dark|primary)/",
    "/--color-bg-/",
    "/--color-underline/",
    "/--form-field-height/",
];

export default {
    // stylelint owns SCSS. It checks both style rules and formatting.
    // @stylistic carries the formatting rules that stylelint-config-standard dropped.
    // oxfmt and oxlint skip .scss files; see .oxfmtrc.json and .oxlintrc.json.
    extends: ["stylelint-config-standard-scss", "@stylistic/stylelint-config"],
    rules: {
        // Match the project layout: 4 space indents, 120 column lines.
        "@stylistic/indentation": 4,
        "@stylistic/max-line-length": 120,

        // `} @else {` is the house style for SCSS conditionals.
        "@stylistic/block-closing-brace-newline-after": ["always", { ignoreAtRules: ["if", "else"] }],

        // System CSS loads in @layer system, above every core layer
        "declaration-no-important": true,

        // Colour literals live in scss/theme/_tokens.scss only
        "color-no-hex": true,
        "color-named": "never",
        "function-disallowed-list": ["rgb", "rgba", "hsl", "hsla"],

        // V1-only core variables resolve to nothing in ApplicationV2
        "property-disallowed-list": ["/^--herosystem-/"],
        "declaration-property-value-disallowed-list": { "/.*/": legacyTokens },

        // Icon fonts have no generic fallback.
        "font-family-no-missing-generic-family-keyword": [true, { ignoreFontFamilies: ["Font Awesome 5 Free"] }],
    },
    overrides: [
        {
            files: ["scss/theme/_tokens.scss"],
            rules: {
                "color-no-hex": null,
                "color-named": null,
                "function-disallowed-list": null,
            },
        },
    ],
};
