import { HEROSYS } from "../herosystem6e.js";

export default class SettingsHelpers {
    // Initialize System Settings after the Init Hook
    static initLevelSettings() {
        const module = "hero6efoundryvttv2";

        game.settings.register(module, "stunned", {
            name: game.i18n.localize("Settings.UseStunned"),
            scope: "world",
            config: true,
            type: Boolean,
            default: true,
            onChange: (value) => HEROSYS.log(false, value),
        });

        game.settings.register(module, "use endurance", {
            name: game.i18n.localize("Settings.UseEndurance"),
            scope: "world",
            config: true,
            type: Boolean,
            default: true,
            onChange: (value) => HEROSYS.log(false, value),
        });

        game.settings.register(module, "knockback", {
            name: game.i18n.localize("Settings.UseKnockback"),
            scope: "world",
            config: true,
            type: Boolean,
            default: false,
            onChange: (value) => HEROSYS.log(false, value),
        });

        game.settings.register(module, "hit locations", {
            name: game.i18n.localize("Settings.HitLocation.Name"),
            scope: "world",
            config: true,
            type: Boolean,
            default: false,
            onChange: (value) => HEROSYS.log(false, value),
        });

        game.settings.register(module, "hitLocTracking", {
            name: game.i18n.localize("Settings.HitLocation.Tracking.Name"),
            scope: "world",
            config: true,
            type: String,
            choices: {
                none: game.i18n.localize(
                    "Settings.HitLocation.Tracking.Choices.DoNotTrack",
                ),
                all: game.i18n.localize(
                    "Settings.HitLocation.Tracking.Choices.TrackForAll",
                ),
            },
            default: "none",
            onChange: (value) => HEROSYS.log(false, value),
        });

        game.settings.register(module, "optionalManeuvers", {
            name: game.i18n.localize("Settings.OptionalManeuvers.Name"),
            scope: "world",
            config: true,
            type: Boolean,
            default: false,
            onChange: (value) => HEROSYS.log(false, value),
        });

        game.settings.register(module, "equipmentWeightPercentage", {
            name: game.i18n.localize(
                "Settings.Equipment.WeightPercentage.Name",
            ),
            hint: game.i18n.localize(
                "Settings.Equipment.WeightPercentage.Hint",
            ),
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
            name: game.i18n.localize("Settings.Automation.Name"),
            scope: "world",
            config: false, // UI is now part of AutomationMenu.  Intend to allow improved granularity.
            type: String,
            choices: {
                none: game.i18n.localize("Settings.Automation.Choices.None"),
                npcOnly: game.i18n.localize(
                    "Settings.Automation.Choices.NpcOnly",
                ),
                pcEndOnly: game.i18n.localize(
                    "Settings.Automation.Choices.PcEndOnly",
                ),
                all: game.i18n.localize("Settings.Automation.Choices.All"),
            },
            default: "all",
            onChange: (value) => HEROSYS.log(false, value),
        });

        game.settings.register(module, "automation2", {
            name: game.i18n.localize("Settings.AutomationPreview.Name"),
            scope: "world",
            config: false, // UI is now part of AutomationMenu.  Intend to allow improved granularity.
            type: Object,
            default: {},
            onChange: (value) => HEROSYS.log(false, value),
        });

        game.settings.registerMenu(module, "AutomationMenu", {
            name: game.i18n.localize("Settings.Automation.Menu.Name"),
            label: game.i18n.localize("Settings.Automation.Menu.Label"), // The text label used in the button
            icon: "fas fa-bars", // A Font Awesome icon used in the submenu button
            type: AutomationMenu, // A FormApplication subclass
            restricted: true, // Restrict this submenu to game master only?
        });

        game.settings.register(module, "bar3", {
            name: game.i18n.localize("Settings.Bar3.Name"),
            hint: game.i18n.localize("Settings.Bar3.Hint"),
            scope: "world",
            config: true,
            type: Boolean,
            default: false,
            onChange: (value) => HEROSYS.log(false, value),
            requiresReload: true,
        });

        game.settings.register(module, "alphaTesting", {
            name: game.i18n.localize("Settings.AlphaTesting.Name"),
            hint: game.i18n.localize("Settings.AlphaTesting.Hint"),
            scope: "client",
            config: true,
            type: Boolean,
            default: false,
            requiresReload: true,
        });

        // Keep track of last migration version
        game.settings.register(module, "lastMigration", {
            name: game.i18n.localize(
                "Settings.AlphaTesting.LastMigration.Name",
            ),
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
                none: game.i18n.localize(
                    "Settings.AutomationPreview.Choices.None",
                ),
                npcOnly: game.i18n.localize(
                    "Settings.AutomationPreview.Choices.NpcOnly",
                ),
                pcEndOnly: game.i18n.localize(
                    "Settings.AutomationPreview.Choices.PcEndOnly",
                ),
                all: game.i18n.localize(
                    "Settings.AutomationPreview.Choices.All",
                ),
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
