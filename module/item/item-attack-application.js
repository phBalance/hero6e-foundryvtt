import { CombatSkillLevelsForAttack } from '../utility/damage.js';
import { _processAttackOptions } from '../item/item-attack.js';


export class ItemAttackFormApplication extends FormApplication {
    constructor(data) {
        super();
        this.data = data;
        this.options.title = `${this.data?.item?.actor?.name} roll to hit`
        const data2 = data;

        Hooks.on("updateItem", function (item, changes, options, userId) {
            if (!this.rendered) return;

            // if (changes.system.attacks) {
            //   const key = Object.keys(changes.system.attacks)[0]
            //   const value = changes.system.attacks[key]
            //   item.system.attacks[key] = value;
            // }
            if (item.id === this.data.item.id) {
                this.updateItem(item, changes, options, userId)
            }


            const cslSkill = CombatSkillLevelsForAttack(this.data.item).skill
            if (cslSkill && item.id === cslSkill.id) {
                this.updateItem(item, changes, options, userId)
            }
            if (!cslSkill && data.cslSkill) {
                this.updateItem(item, changes, options, userId)

            }

        }.bind(this));

        Hooks.on("targetToken", function (...args) {
            this.updateItem(...args);
        }.bind(this));

    }

    async updateItem(...args) {
        this.render();
    }

    static get defaultOptions() {
        let options = super.defaultOptions
        options = mergeObject(options, {
            classes: ['form'],
            popOut: true,
            template: `systems/hero6efoundryvttv2/templates/attack/item-attack-application.hbs`,
            id: 'item-attack-form-application',
            //title: `${actor.name} roll to hit`,
            //resizable: true,
            closeOnSubmit: false, // do not close when submitted
            submitOnChange: true, // submit when any input changes
        });
        return options
    }

    getData() {
        const data = this.data;
        const item = data.item;

        const aoe = item.system.modifiers.find(o => o.XMLID === "AOE");
        if (aoe) {
            data.aoeText = aoe.OPTION_ALIAS
            if (aoe.LEVELS) {
                data.aoeText += ` (${aoe.LEVELS})`
            }

            if (this.aoeTemplate() || game.user.targets.size > 0) {
                data.rollHide = false;
            } else
            {
                data.rollHide = true;
            }
        }
        

        data.ocvMod ??= item.system.ocv
        data.dcvMod ??= item.system.dcv
        data.effectiveStr ??= data.str;

        // Combat Skill Levels
        const csl = CombatSkillLevelsForAttack(item);
        if (csl && csl.skill) {
            data.cslSkill = csl.skill;
            let _ocv = csl.omcv > 0 ? 'omcv' : 'ocv';
            data.cslChoices = { [_ocv]: _ocv };
            if (csl.skill.system.OPTION != "SINGLE") {
                data.cslChoices.dcv = "dcv";
                data.cslChoices.dc = "dc";
            }

            // CSL radioBoxes names
            data.csl = []
            for (let c = 0; c < parseInt(csl.skill.system.LEVELS.value); c++) {
                data.csl.push({ name: `system.csl.${c}`, value: csl.skill.system.csl ? csl.skill.system.csl[c] : 'undefined' })
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
        //html.find(".combat-skill-levels input").change((event) => this._updateCsl(event, html));


    }

    async _render(...args) {
        await super._render(...args);

        // CSL can cause differences in form size.
        if (this.position) {
            this.setPosition({ height: 'auto' });
        }

    }

    async _updateObject(event, formData) {

        if (event.submitter.name === "roll") {
            canvas.tokens.activate()
            await this.close();
            return _processAttackOptions(this.data.item, formData);
        }

        if (event.submitter.name === "aoe") {
            return this._spawnAreaOfEffect(this.data);
        }

        this._updateCsl(event, formData)

        this.data.aim = formData.aim;
        this.data.ocvMod = formData.ocvMod;
        this.data.dcvMod = formData.dcvMod;
        this.data.effectiveStr = formData.effectiveStr;


    }

    async _updateCsl(event, formData) {
        const item = this.data.item
        // Combat Skill Levels (update SKILL if changed)
        const csl = CombatSkillLevelsForAttack(item)
        for (const key of Object.keys(formData).filter(o => o.match(/\.(\w+)\.(\d+)/))) {
            const value = formData[key];
            const idx = parseInt(key.match(/\d+$/));
            if (csl.skill.system.csl[idx] != value) {
                csl.skill.system.csl[idx] = value;
                await csl.skill.update({ 'system.csl': csl.skill.system.csl });
            }

        }
        //const checked = formData.find(".combat-skill-levels input:checked");
        //if (csl && checked) {
        //   let updateRequired = false;
        //   for (let input of checked) {
        //     let m = input.name.match(/\.(\w+)\.(\d+)/);
        //     let name = m[1];
        //     let idx = m[2];

        //     if (csl.skill.system.csl[idx] != input.value) {
        //       csl.skill.system.csl[idx] = input.value;
        //       updateRequired = true;
        //     }
        //   }
        //   if (updateRequired) {
        //     await csl.skill.update({ 'system.csl': csl.skill.system.csl });
        //   }


        // }
    }

    async _spawnAreaOfEffect(event) {
        const item = this.data.item
        const aoe = item.system.modifiers.find(o => o.XMLID === "AOE");
        if (!aoe) return;

        const aoeType = aoe.OPTION.toLowerCase();
        const aoeValue = parseInt(aoe.LEVELS || 0);
        const actor = item.actor;
        const token = actor.getActiveTokens()[0] || canvas.tokens.controlled[0];
        if (!token) return;

        // Close all windows except us
        for (let id of Object.keys(ui.windows)) {
            if (id != this.appId) {
                ui.windows[id].close();
            }
        }

        const keyConversions = {
            radius: "circle",
            cone: "cone",
            line: "ray",
            surface: "rect",
            any: "rect"
        }

        const templateType = keyConversions[aoeType]

        const templateData = {
            t: templateType,
            user: game.user.id,
            distance: aoeValue,
            direction: -token.document?.rotation || 0 + 90,  // Top down tokens typically face south
            fillColor: game.user.color,
            flags: {
                itemId: item.id,
                aoeType,
                aoeValue
            }
        };

        switch (templateType) {
            case ("radius"): {
                break;
            }
            case ("cone"): {
                break;
            }
            case ("ray"): {
                templateData.width = 2; //2m = 1 hex
                break;
            }
            case ("rect"): {
                const warningMessage = game.i18n.localize("Warning.AreaOfEffectUnsupported")

                ui.notifications.warn(warningMessage)

                return

                break;
            }
            default: {
                break;
            }
        }

        templateData.x = token.center.x;
        templateData.y = token.center.y;

        const existingTemplate = this.aoeTemplate();
        if (existingTemplate) {
            // reuse exiting template, just update position
            await existingTemplate.update({ x: templateData.x, y: templateData.y });
        } else {
            canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [templateData]);
        }

        canvas.templates.activate()
        canvas.templates.selectObjects({
            x: templateData.x,
            y: templateData.y,
            releaseOthers: true,
            control: true,
            toggle: false
        })

    }

    aoeTemplate() {
        return Array.from(canvas.templates.getDocuments()).find(o => o.user.id === game.user.id && o.flags.itemId === this.data.item.id);
 
    }

}

window.ItemAttackFormApplication = ItemAttackFormApplication;