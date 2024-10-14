export default {
    extends: ["stylelint-config-standard-scss"],
    rules: {
        // TODO: Should fix code to handle this
        "no-descending-specificity": null,

        // Font Awesome has no real substitue so don't bother figuring we have one.
        "font-family-no-missing-generic-family-keyword": [true, { ignoreFontFamilies: ["Font Awesome 5 Free"] }],
    },
};
