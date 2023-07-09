import { HeroSystem6eActorActiveEffects } from "./actor-active-effects.js"
import { HeroSystem6eItem } from '../item/item.js'
import { HEROSYS } from "../herosystem6e.js";

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class HeroSystem6eActor extends Actor {

    /** @inheritdoc */
    async _preCreate(data, options, user) {
        await super._preCreate(data, options, user);

        //TODO: Add user configuration for initial prototype settings

        HEROSYS.log(false, "_preCreate")
        let prototypeToken = {
            // Leaving sight disabled.
            // TODO: Implement various Enhanced Visions
            // sight: { enabled: true }, 
            displayBars: CONST.TOKEN_DISPLAY_MODES.HOVER,
            displayName: CONST.TOKEN_DISPLAY_MODES.HOVER,
            // flags: {
            //     [game.system.id]: {
            //         bar3: {
            //             attribute: "characteristics.end"
            //         }
            //     }
            // }

        }

        if (this.type === "pc") {
            prototypeToken = {
                ...prototypeToken,
                actorLink: true,
                disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
                displayBars: CONST.TOKEN_DISPLAY_MODES.ALWAYS,
                displayName: CONST.TOKEN_DISPLAY_MODES.HOVER,

            };

        }

        this.updateSource({ prototypeToken });

        // Bar3 is a flag
        //await this.prototypeToken.setFlag(game.system.id, "bar3", { "attribute": "characteristics.end" })

    }

    // Adding ActiveEffects seems complicated.
    // Make sure only one of the same ActiveEffect is added
    // Assumes ActiveEffect is a statusEffects.
    // TODO: Allow for a non-statusEffects ActiveEffect (like from a power)
    async addActiveEffect(activeEffect) {



        const newEffect = deepClone(activeEffect)
        newEffect.label = `${game.i18n.localize(newEffect.label)}`


        // Check for standard StatusEffects
        // statuses appears to be necessary to associate with StatusEffects
        if (activeEffect.id) {
            newEffect.statuses = [activeEffect.id]

            // Check if this ActiveEffect already exists
            const existingEffect = this.effects.find(o => o.statuses.has(activeEffect.id));
            if (existingEffect) {
                HEROSYS.log(false, activeEffect.id + " already exists")
                return
            }
        }

        await this.createEmbeddedDocuments("ActiveEffect", [newEffect])

    }

    async ChangeType() {
        const template = "systems/hero6efoundryvttv2/templates/chat/actor-change-type-dialog.hbs"
        const actor = this
        let cardData = {
            actor,
            groupName: "typeChoice",
            choices:{ pc: "PC", npc: "NPC" },
            chosen: actor.type,
        }
        const html = await renderTemplate(template, cardData)
        return new Promise(resolve => {
            const data = {
                title: `Change ${this.name} Type`,
                content: html,
                buttons: {
                    normal: {
                        label: "Apply",
                        callback: html => resolve(
                            _processChangeType(html)
                        )
                    },
                    // cancel: {
                    //   label: "cancel",
                    //   callback: html => resolve({canclled: true})
                    // }
                },
                default: "normal",
                close: () => resolve({ cancelled: true })
            }
            new Dialog(data, null).render(true)

            async function _processChangeType(html) {
                await actor.update({ type: html.find('input:checked')[0].value})
            }
        });
    }



}