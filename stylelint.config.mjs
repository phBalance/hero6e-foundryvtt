const legacyTokens = [
    "/--herosystem-/",
    "/--color-(border|text)-(light|dark)/",
    "/--color-border-highlight/",
    "/--color-shadow-(dark|primary)/",
    "/--color-bg-/",
    "/--color-underline/",
    "/--form-field-height/",
    "/--font-primary/",
];

export default {
    extends: ["stylelint-config-standard-scss"],
    rules: {
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
