import { CombatSkillLevelsForAttack } from "../utility/damage.js";
import {
    _processAttackOptions,
    _processAttackAoeOptions,
} from "../item/item-attack.js";
import { getSystemDisplayUnits } from "../utility/units.js";

const heroAoeTypeToFoundryAoeTypeConversions = {
    radius: "circle",
    cone: "cone",
    line: "ray",
    surface: "rect",
    any: "rect",
};

export class ItemAttackFormApplication extends FormApplication {
    constructor(data) {
        super();
        this.data = data;
        this.options.title = `${this.data?.item?.actor?.name} roll to hit`;

        Hooks.on(
            "updateItem",
            function (item, changes, options, userId) {
                if (!this.rendered) return;

                if (item.id === this.data.item.id) {
                    this.updateItem(item, changes, options, userId);
                }

                const cslSkill = CombatSkillLevelsForAttack(
                    this.data.item,
                ).skill;
                if (cslSkill && item.id === cslSkill.id) {
                    this.updateItem(item, changes, options, userId);
                }
                if (!cslSkill && data.cslSkill) {
                    this.updateItem(item, changes, options, userId);
                }
            }.bind(this),
        );

        Hooks.on(
            "targetToken",
            function (...args) {
                this.updateItem(...args);
            }.bind(this),
        );
    }

    async updateItem() {
        this.render();
    }

    static get defaultOptions() {
        let options = super.defaultOptions;
        options = mergeObject(options, {
            classes: ["form"],
            popOut: true,
            template: `systems/hero6efoundryvttv2/templates/attack/item-attack-application.hbs`,
            id: "item-attack-form-application",
            closeOnSubmit: false, // do not close when submitted
            submitOnChange: true, // submit when any input changes
        });

        return options;
    }

    getData() {
        const data = this.data;
        const item = data.item;

        const aoe = item.getAoeModifier();
        if (aoe) {
            data.aoeText = aoe.OPTION_ALIAS;
            if (aoe.LEVELS) {
                data.aoeText += ` (${aoe.LEVELS}${getSystemDisplayUnits(
                    item.actor,
                )})`;
            }

            if (this.getAoeTemplate() || game.user.targets.size > 0) {
                data.rollHide = false;
            } else {
                data.rollHide = true;
            }
        }

        data.ocvMod ??= item.system.ocv;
        data.dcvMod ??= item.system.dcv;
        data.effectiveStr ??= data.str;

        // Boostable Charges
        if (item.system.charges?.value > 1) {
            data.boostableCharges = item.system.charges.value - 1;
        }

        // Combat Skill Levels
        const csl = CombatSkillLevelsForAttack(item);
        if (csl && csl.skill) {
            data.cslSkill = csl.skill;
            let mental = csl.skill.system.XMLID === "MENTAL_COMBAT_LEVELS";
            let _ocv = mental ? "omcv" : "ocv";
            let _dcv = mental ? "dmcv" : "dcv";
            data.cslChoices = { [_ocv]: _ocv };
            if (csl.skill.system.OPTION != "SINGLE") {
                data.cslChoices[_dcv] = _dcv;
                data.cslChoices.dc = "dc";
            }

            // CSL radioBoxes names
            data.csl = [];
            for (
                let c = 0;
                c < parseInt(csl.skill.system.LEVELS) ||
                parseInt(csl.skill.system.LEVELS.value) ||
                0;
                c++
            ) {
                data.csl.push({
                    name: `system.csl.${c}`,
                    value: csl.skill.system.csl
                        ? csl.skill.system.csl[c]
                        : "undefined",
                });
            }
        } else {
            data.cslChoices = null;
            data.csl = null;
            data.cslSkill = null;
        }

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);
    }

    async _render(...args) {
        await super._render(...args);

        // CSL can cause differences in form size.
        if (this.position && this.rendered) {
            this.setPosition({ height: "auto" });
        }
    }

    async _updateObject(event, formData) {
        if (event.submitter?.name === "roll") {
            canvas.tokens.activate();
            await this.close();

            const aoe = this.data.item.getAoeModifier();
            if (aoe) {
                return _processAttackAoeOptions(this.data.item, formData);
            }

            return _processAttackOptions(this.data.item, formData);
        }

        if (event.submitter?.name === "aoe") {
            return this._spawnAreaOfEffect(this.data);
        }

        this._updateCsl(event, formData);

        this.data.aim = formData.aim;
        this.data.ocvMod = formData.ocvMod;
        this.data.dcvMod = formData.dcvMod;
        this.data.effectiveStr = formData.effectiveStr;
        this.data.boostableCharges = Math.max(
            0,
            Math.min(
                parseInt(formData.boostableCharges),
                this.data.item.charges?.value - 1,
            ),
        );
    }

    async _updateCsl(event, formData) {
        const item = this.data.item;
        // Combat Skill Levels (update SKILL if changed)
        const csl = CombatSkillLevelsForAttack(item);
        for (const key of Object.keys(formData).filter((o) =>
            o.match(/\.(\w+)\.(\d+)/),
        )) {
            const value = formData[key];
            const idx = parseInt(key.match(/\d+$/));
            if (csl.skill.system.csl[idx] != value) {
                csl.skill.system.csl[idx] = value;
                await csl.skill.update({ "system.csl": csl.skill.system.csl });
            }
        }
    }

    async _spawnAreaOfEffect() {
        const item = this.data.item;
        const aoeModifier = item.getAoeModifier();
        if (!aoeModifier) return;

        const aoeType = aoeModifier.OPTION.toLowerCase();
        const aoeValue = Math.max(
            item.actor.system.is5e ? 0.5 : 1,
            parseInt(aoeModifier.LEVELS || 0),
        ); // Even 1 hex it technically 1m

        const actor = item.actor;
        const actorIs6e = !item.actor?.system?.is5e;
        const token = actor.getActiveTokens()[0] || canvas.tokens.controlled[0];
        if (!token) return;

        // Close all windows except us
        for (let id of Object.keys(ui.windows)) {
            if (id != this.appId) {
                ui.windows[id].close();
            }
        }

        const templateType = heroAoeTypeToFoundryAoeTypeConversions[aoeType];
        const sceneGridSize = game.scenes
            .find((scene) => scene.active)
            .getDimensions().distance;

        const templateData = {
            t: templateType,
            user: game.user.id,
            distance: aoeValue * (actorIs6e ? 1 : sceneGridSize),
            direction: -token.document?.rotation || 0 + 90, // Top down tokens typically face south
            fillColor: game.user.color,
            flags: {
                itemId: item.id,
                aoeType,
                aoeValue,
                sceneGridSize,
            },
        };

        switch (templateType) {
            case "radius":
                break;

            case "cone":
                if (
                    (aoeModifier.adders || []).find(
                        (adder) => adder.XMLID === "THINCONE",
                    )
                ) {
                    templateData.angle = 31;
                } else {
                    templateData.angle = 61; // 60 has odd rounding error
                }

                break;

            case "ray":
                {
                    const widthDouble = parseInt(
                        (aoeModifier.ADDER || []).find(
                            (adder) => adder.XMLID === "DOUBLEWIDTH",
                        )?.LEVELS || 0,
                    );
                    const heightDouble = parseInt(
                        (aoeModifier.ADDER || []).find(
                            (adder) => adder.XMLID === "DOUBLEHEIGHT",
                        )?.LEVELS || 0,
                    );

                    // In 6e, widthDouble and heightDouble are the actual size and not instructions to double like 5e
                    const width = actorIs6e
                        ? widthDouble
                        : sceneGridSize * Math.pow(2, widthDouble);
                    const height = actorIs6e
                        ? heightDouble
                        : sceneGridSize * Math.pow(2, heightDouble);

                    templateData.width = width;
                    templateData.flags.width = width;
                    templateData.flags.height = height;
                }
                break;

            case "rect": {
                const warningMessage = game.i18n.localize(
                    "Warning.AreaOfEffectUnsupported",
                );

                ui.notifications.warn(warningMessage);

                return;
            }

            default:
                console.error(`unsupported template type ${templateType}`);
                break;
        }

        templateData.x = token.center.x;
        templateData.y = token.center.y;

        const existingTemplate = this.getAoeTemplate();
        if (existingTemplate) {
            // reuse exiting template, just update position
            await existingTemplate.update({
                x: templateData.x,
                y: templateData.y,
            });
        } else {
            canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [
                templateData,
            ]);
        }

        canvas.templates.activate();
        canvas.templates.selectObjects({
            x: templateData.x,
            y: templateData.y,
            releaseOthers: true,
            control: true,
            toggle: false,
        });
    }

    getAoeTemplate() {
        return Array.from(canvas.templates.getDocuments()).find(
            (o) =>
                o.user.id === game.user.id &&
                o.flags.itemId === this.data.item.id,
        );
    }
}

window.ItemAttackFormApplication = ItemAttackFormApplication;
