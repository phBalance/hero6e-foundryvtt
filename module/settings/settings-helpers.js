import { HEROSYS } from "../herosystem6e.js";

export default class SettingsHelpers {
    // Initialize System Settings after the Init Hook
    static initLevelSettings() {
        const module = "hero6efoundryvttv2";

        game.settings.register(module, "stunned", {
            name: "Use Stunned",
            scope: "world",
            config: true,
            type: Boolean,
            default: true,
            onChange: (value) => HEROSYS.log(false, value),
        });

        game.settings.register(module, "use endurance", {
            name: "Use Endurance",
            scope: "world",
            config: true,
            type: Boolean,
            default: true,
            onChange: (value) => HEROSYS.log(false, value),
        });

        game.settings.register(module, "knockback", {
            name: "Use Knockback",
            scope: "world",
            config: true,
            type: Boolean,
            default: false,
            onChange: (value) => HEROSYS.log(false, value),
        });

        game.settings.register(module, "hit locations", {
            name: "Hit Locations",
            scope: "world",
            config: true,
            type: Boolean,
            default: false,
            onChange: (value) => HEROSYS.log(false, value),
        });

        game.settings.register(module, "hitLocTracking", {
            name: "Hit Location: Track Damage Done to Individual Body Parts",
            scope: "world",
            config: true,
            type: String,
            choices: {
                none: "Don't track",
                all: "Track for all",
            },
            default: "none",
            onChange: (value) => HEROSYS.log(false, value),
        });

        game.settings.register(module, "optionalManeuvers", {
            name: "Optional Maneuvers",
            scope: "world",
            config: true,
            type: Boolean,
            default: false,
            onChange: (value) => HEROSYS.log(false, value),
        });

        game.settings.register(module, "equipmentWeightPercentage", {
            name: "Equipment Weight Percentage",
            hint: "This only applies to equipment (typically found in heroic themed games).  Default is 100% and follows standard rules.  Setting to 50 will halve the calculated weight of equipment.  Setting to 0 will effectively disable encumbrance penalties.",
            scope: "world",
            config: true,
            type: Number,
            range: {
                min: 0,
                max: 200,
                step: 10,
            },
            default: 100,
            onChange: () => {
                for (let actor of game.actors.contents) {
                    actor.applyEncumbrancePenalty();
                }
                for (const scene of game.scenes.contents) {
                    for (const token of scene.tokens) {
                        if (!token.actorLink && token.actor) {
                            token.actor.applyEncumbrancePenalty();
                        }
                    }
                }
            },
        });

        game.settings.register(module, "automation", {
            name: "Attack Card Automation",
            scope: "world",
            config: false, // UI is now part of AutomationMenu.  Intend to allow improved granularity.
            type: String,
            choices: {
                none: "No Automation",
                npcOnly: "NPCs Only (end, stun, body)",
                pcEndOnly: "PCs (end) and NPCs (end, stun, body)",
                all: "PCs and NPCs (end, stun, body)",
            },
            default: "all",
            onChange: (value) => HEROSYS.log(false, value),
        });

        game.settings.register(module, "automation2", {
            name: "Automation Preview",
            scope: "world",
            config: false, // UI is now part of AutomationMenu.  Intend to allow improved granularity.
            type: Object,
            default: {},
            onChange: (value) => HEROSYS.log(false, value),
        });

        game.settings.registerMenu(module, "AutomationMenu", {
            name: "Automation",
            label: "Automation Settings", // The text label used in the button
            //hint: "A description of what will occur in the submenu dialog.",
            icon: "fas fa-bars", // A Font Awesome icon used in the submenu button
            type: AutomationMenu, // A FormApplication subclass
            restricted: true, // Restrict this submenu to gamemaster only?
        });

        game.settings.register(module, "bar3", {
            name: "Add 3rd Bar and labels",
            hint: "Add a 3rd resource bar to tokens.  Each token will have a Body, Stun and Endurance resource bar with an appropriate label.  It is recommended this be disabled and instead use the BarBrawl module for custom bars.",
            scope: "world",
            config: true,
            type: Boolean,
            default: false,
            onChange: (value) => HEROSYS.log(false, value),
            requiresReload: true,
        });

        game.settings.register(module, "alphaTesting", {
            name: "Alpha Testing",
            hint: "Enable testing of alpha features and changes.  Intended for system developer only.",
            scope: "client",
            config: true,
            type: Boolean,
            default: false,
            requiresReload: true,
        });

        // Keep track of last migration version
        game.settings.register(module, "lastMigration", {
            name: "Last Migration",
            scope: "world",
            config: game.settings.get(game.system.id, "alphaTesting"),
            type: String,
            default: "1.0.0",
            requiresReload: true,
        });
    }
}

class AutomationMenu extends FormApplication {
    static get defaultOptions() {
        let options = super.defaultOptions;
        options = mergeObject(options, {
            classes: ["form"],
            popOut: true,
            template: `systems/hero6efoundryvttv2/templates/automationMenu.hbs`,
            id: "automation-form-application",
            closeOnSubmit: false, // do not close when submitted
            submitOnChange: true, // submit when any input changes
            title: "Automation Settings",
        });

        return options;
    }

    async getData() {
        const automation = game.settings.get(game.system.id, "automation");
        const settings = [
            { name: "Body", enabled: false },
            { name: "Stun", enabled: false },
            { name: "Endurance", enabled: false },
            { name: "Movement", enabled: false },
        ];
        switch (automation) {
            case "none":
                settings[0] = {
                    ...settings[0],
                    tokenType: "none",
                    gm: false,
                    owner: false,
                };
                settings[1] = {
                    ...settings[1],
                    tokenType: "none",
                    gm: false,
                    owner: false,
                };
                settings[2] = {
                    ...settings[2],
                    tokenType: "none",
                    gm: false,
                    owner: false,
                };
                break;
            case "npcOnly":
                settings[0] = {
                    ...settings[0],
                    tokenType: "npc",
                    gm: true,
                    owner: false,
                };
                settings[1] = {
                    ...settings[1],
                    tokenType: "npc",
                    gm: true,
                    owner: false,
                };
                settings[2] = {
                    ...settings[2],
                    tokenType: "npc",
                    gm: true,
                    owner: false,
                };
                break;
            case "pcEndOnly": //pcEndOnly: "PCs (end) and NPCs (end, stun, body)",
                settings[0] = {
                    ...settings[0],
                    tokenType: "npc",
                    gm: true,
                    owner: false,
                };
                settings[1] = {
                    ...settings[1],
                    tokenType: "npc",
                    gm: true,
                    owner: false,
                };
                settings[2] = {
                    ...settings[2],
                    tokenType: "all",
                    gm: true,
                    owner: false,
                };
                break;
            default:
                settings[0] = {
                    ...settings[0],
                    tokenType: "all",
                    gm: true,
                    owner: true,
                };
                settings[1] = {
                    ...settings[1],
                    tokenType: "all",
                    gm: true,
                    owner: true,
                };
                settings[2] = {
                    ...settings[2],
                    tokenType: "all",
                    gm: true,
                    owner: true,
                };
                break;
        }

        return {
            settings,
            choices: {
                none: "No Automation",
                npcOnly: "NPCs Only (end, stun, body)",
                pcEndOnly: "PCs (end) and NPCs (end, stun, body)",
                all: "PCs and NPCs (end, stun, body)",
            },
            automation,
        };
    }

    async _updateObject(event, formData) {
        const data = foundry.utils.expandObject(formData);
        await game.settings.set(game.system.id, "automation", data.automation);
        await this.render();
    }
}
