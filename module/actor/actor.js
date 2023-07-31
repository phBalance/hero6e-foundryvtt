import { HeroSystem6eActorActiveEffects } from "./actor-active-effects.js"
import { HeroSystem6eItem } from '../item/item.js'
import { HEROSYS } from "../herosystem6e.js";
import { updateItemDescription } from "../utility/upload_hdc.js";

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

    async removeActiveEffect(activeEffect) {
        const existingEffect = this.effects.find(o => o.statuses.has(activeEffect.id));
        if (existingEffect) {

            if (activeEffect.id == "knockedOut") {
                //When he wakes up, his END equals his
                //current STUN total.
                let newEnd = Math.min(parseInt(this.system.characteristics.stun.value), parseInt(this.system.characteristics.end.max));
                await this.update({ "system.characteristics.end.value": newEnd });
            }

            //await existingEffect.update({ disabled: true });

            await existingEffect.delete();
            //await this.deleteEmbeddedDocuments("ActiveEffect", [existingEffect])
        }
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
            if (!existingEffect) {
                await this.createEmbeddedDocuments("ActiveEffect", [newEffect])
            }
        }



        if (activeEffect.id == "knockedOut") {
            // Knocked Out overrides Stunned
            await this.removeActiveEffect(HeroSystem6eActorActiveEffects.stunEffect);
        }


    }

    async ChangeType() {
        const template = "systems/hero6efoundryvttv2/templates/chat/actor-change-type-dialog.hbs"
        const actor = this
        let cardData = {
            actor,
            groupName: "typeChoice",
            choices: { pc: "PC", npc: "NPC" },
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
                await actor.update({ type: html.find('input:checked')[0].value })
            }
        });
    }

    /* -------------------------------------------- */

    /**
     * Handle how changes to a Token attribute bar are applied to the Actor.
     * This allows for game systems to override this behavior and deploy special logic.
     * @param {string} attribute    The attribute path
     * @param {number} value        The target attribute value
     * @param {boolean} isDelta     Whether the number represents a relative change (true) or an absolute change (false)
     * @param {boolean} isBar       Whether the new value is part of an attribute bar, or just a direct value
     * @returns {Promise<documents.Actor>}  The updated Actor document
     */
    async modifyTokenAttribute(attribute, value, isDelta = false, isBar = true) {
        const current = foundry.utils.getProperty(this.system, attribute);

        // Determine the updates to make to the actor data
        let updates;
        if (isBar) {
            if (isDelta) value = Math.clamped(-99, Number(current.value) + value, current.max);  // a negative bar is typically acceptable
            updates = { [`system.${attribute}.value`]: value };
        } else {
            if (isDelta) value = Number(current) + value;
            updates = { [`system.${attribute}`]: value };
        }
        const allowed = Hooks.call("modifyTokenAttribute", { attribute, value, isDelta, isBar }, updates);
        return allowed !== false ? this.update(updates) : this;
    }

    async _preUpdate(changed, options, userId) {
        await super._preUpdate(changed, options, userId)

        //if (ChatMessage.getWhisperRecipients("GM").map(o=>o.id).includes(game.user.id)) return;

        if (options.hideChatMessage || !options.render) return;

        let content = "";

        if (changed?.system?.characteristics?.stun) {
            if (parseInt(this.system.characteristics.stun.value) != parseInt(changed.system.characteristics.stun.value))
            {
                content = `STUN from ${this.system.characteristics.stun.value} to ${changed.system.characteristics.stun.value}`
            } else {
                content = `STUN changed to ${changed.system.characteristics.stun.value}`
            }
            if (changed.system.characteristics.stun.value === this.system.characteristics.stun.max) {
                content += " (at max)";
            }
        }

        if (changed?.system?.characteristics?.body) {
            if (parseInt(this.system.characteristics.body.value) != parseInt(changed.system.characteristics.body.value))
            {
                content = `BODY from ${this.system.characteristics.body.value} to ${changed.system.characteristics.body.value}`
            } else {
                content = `BODY changed to ${changed.system.characteristics.body.value}`
            }
            if (changed.system.characteristics.body.value === this.system.characteristics.body.max) {
                content += " (at max)";
            }
        }

        if (content) {
            const chatData = {
                user: game.user.id, //ChatMessage.getWhisperRecipients('GM'),
                whisper: ChatMessage.getWhisperRecipients("GM"),
                speaker: ChatMessage.getSpeaker({ actor: this }),
                blind: true,
                content: content,
            }
            await ChatMessage.create(chatData)
        }


    }

    async _onUpdate(data, options, userId) {
        super._onUpdate(data, options, userId);

        // If stun was changed and running under triggering users context
        if (data?.system?.characteristics?.stun && userId === game.user.id) {

            if (data.system.characteristics.stun.value <= 0) {
                this.addActiveEffect(HeroSystem6eActorActiveEffects.knockedOutEffect);
            }

            if (data.system.characteristics.stun.value > 0) {
                this.removeActiveEffect(HeroSystem6eActorActiveEffects.knockedOutEffect);
            }

        }

    }


    async TakeRecovery(asAction) {

        // RECOVERING
        // Characters use REC to regain lost STUN and expended END.
        // This is known as “Recovering” or “taking a Recovery.”
        // When a character Recovers, add his REC to his current
        // STUN and END totals (to a maximum of their full values, of
        // course). Characters get to Recover in two situations: Post-
        // Segment and when they choose to Recover as a Full Phase
        // Action.

        // RECOVERING AS AN ACTION
        // Recovering is a Full Phase Action and occurs at the end of
        // the Segment (after all other characters who have a Phase that
        // Segment have acted). A character who Recovers during a Phase
        // may do nothing else. He cannot even maintain a Constant Power
        // or perform Actions that cost no END or take no time. However,
        // he may take Zero Phase Actions at the beginning of his Phase
        // to turn off Powers, and Persistent Powers that don’t cost END
        // remain in effect.


        const chars = this.system.characteristics

        // Shouldn't happen, but you never know
        if (isNaN(parseInt(chars.stun.value))) {
            chars.stun.value = 0
        }
        if (isNaN(parseInt(chars.end.value))) {
            chars.end.value = 0
        }

        let newStun = parseInt(chars.stun.value) + parseInt(chars.rec.value)
        let newEnd = parseInt(chars.end.value) + parseInt(chars.rec.value)

        if (newStun > chars.stun.max) {
            newStun = Math.max(chars.stun.max, parseInt(chars.stun.value)) // possible > MAX (which is OKish)
        }
        let deltaStun = newStun - parseInt(chars.stun.value)

        if (newEnd > chars.end.max) {
            newEnd = Math.max(chars.end.max, parseInt(chars.end.value)) // possible > MAX (which is OKish)
        }
        let deltaEnd = newEnd - parseInt(chars.end.value)

        await this.update({
            'system.characteristics.stun.value': newStun,
            'system.characteristics.end.value': newEnd
        }, { hideChatMessage: true })

        let token = this.token
        let speaker = ChatMessage.getSpeaker({ actor: this, token })
        speaker["alias"] = this.name

        // let content = this.name + ` <span title="
        // Recovering is a Full Phase Action and occurs at the end of
        // the Segment (after all other characters who have a Phase that
        // Segment have acted). A character who Recovers during a Phase
        // may do nothing else. He cannot even maintain a Constant Power
        // or perform Actions that cost no END or take no time. However,
        // he may take Zero Phase Actions at the beginning of his Phase
        // to turn off Powers, and Persistent Powers that don't cost END
        // remain in effect."><i>Takes a Recovery</i></span>`;

        let content = this.name + ` <i>Takes a Recovery</i>`;
        if (deltaEnd || deltaStun) {
            content += `, gaining ${deltaEnd} endurance and ${deltaStun} stun.`;
        } else {
            content += ".";
        }



        

        // Endurance Reserve Recovery
        if (!asAction) {
            const enduranceReserve = this.items.find(o => o.system.XMLID === "ENDURANCERESERVE");
            if (enduranceReserve) {
                let erValue = parseInt(enduranceReserve.system.LEVELS.value);
                let erMax = parseInt(enduranceReserve.system.LEVELS.max);
                if (enduranceReserve.system.powers) {
                    const power = enduranceReserve.system.powers.find(o => o.XMLID === "ENDURANCERESERVEREC");
                    if (power) {
                        let erRec = parseInt(power.LEVELS);
                        let deltaEndReserve = Math.min(erRec, erMax - erValue);
                        if (deltaEndReserve) {
                            erValue += deltaEndReserve;
                            enduranceReserve.system.LEVELS.value = erValue;
                            updateItemDescription(enduranceReserve);
                            await enduranceReserve.update({ 'system.LEVELS': enduranceReserve.system.LEVELS, 'system.description': enduranceReserve.system.description });
                            content += ` ${enduranceReserve.name} +${deltaEndReserve} END.`;
                        }
                    }
                }
            }
        }

        const chatData = {
            user: game.user._id,
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            content: content,
            speaker: speaker
        }

        if (asAction) {
            await ChatMessage.create(chatData)

            // Remove stunned condition.
            // While not technically part of the rules, it is here as a convenience.
            // For example when Combat Tracker isn't being used.
            await this.removeActiveEffect(HeroSystem6eActorActiveEffects.stunEffect);
        }

        return content;
    }

    // When stunned, knockedout, etc you cannot act
    canAct(uiNotice) {

        if (this.statuses.has("knockedOut")) {
            if (uiNotice) ui.notifications.error(`${this.name} is KNOCKED OUT and cannot act.`);
            return false;
        }

        // A character
        // who is Stunned or recovering from being
        // Stunned can take no Actions, take no Recoveries
        // (except his free Post-Segment 12 Recovery), cannot
        // move, and cannot be affected by Presence Attacks.

        // Recovering from being Stunned requires a Full
        // Phase, and is the only thing the character can do
        // during that Phase.

        if (this.statuses.has("stunned")) {
            if (uiNotice) ui.notifications.error(`${this.name} is STUNNED and cannot act.`);
            return false;
        }
        return true;
    }

}

