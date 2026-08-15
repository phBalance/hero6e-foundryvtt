import js from "@eslint/js";
import globals from "globals";

import stylistic from "@stylistic/eslint-plugin";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
    {
        plugins: {
            "@stylistic": stylistic,
        },

        languageOptions: {
            ecmaVersion: 2022,

            globals: {
                ...globals.browser,
                ...globals.jquery,
                ...globals.node,

                _replace: "readonly",
                ActiveEffect: "readonly",
                ActiveEffectConfig: "readonly",
                Application: "readonly",
                canvas: "readonly",
                ChatMessage: "readonly",
                Combat: "readonly",
                Combatant: "readonly",
                CombatTracker: "readonly",
                CONFIG: "readonly",
                CONST: "readonly",
                DefaultTokenConfig: "readonly",
                DetectionMode: "readonly",
                Dialog: "readonly",
                Die: "readonly",
                DocumentSheetConfig: "readonly",
                Folder: "readonly",
                ForgeAPI: "readonly",
                FormApplication: "readonly",
                foundry: "readonly",
                fromUuid: "readonly",
                fromUuidSync: "readonly",
                game: "readonly",
                getDocumentClass: "readonly",
                Handlebars: "readonly",
                HERO: "readonly",
                HeroSystem6eItem: "readonly",
                HexagonalGrid: "readonly",
                Hooks: "readonly",
                Hooks$1: "readonly",
                MeasuredTemplate: "readonly",
                NumericTerm: "readonly",
                OperatorTerm: "readonly",
                OutlineOverlayFilter: "readonly",
                PIXI: "readonly",
                quench: "readonly",
                Roll: "readonly",
                RollTerm: "readonly",
                Scene: "readonly",
                SceneNavigation: "readonly",
                SimpleCalendar: "readonly",
                ui: "readonly",
                User: "readonly",
            },
        },
    },
    js.configs.recommended,
    {
        // Extra rules beyond the recommended set
        rules: {
            "no-use-before-define": [
                "error",
                {
                    functions: false,
                    classes: true,
                    variables: true,
                    allowNamedExports: true,
                },
            ],
        },
    },
    eslintConfigPrettier,
];
