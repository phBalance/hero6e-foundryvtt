import { HEROSYS } from "../herosystem6e.mjs";
import { HeroSystem6eCard } from "./card.mjs";
import { HeroSystem6eToHitCard } from "./toHit-card.mjs";

export class HeroSystem6eAttackCard extends HeroSystem6eCard {
    static chatListeners(html) {
        html.on(
            "click",
            ".attack-card .card-buttons button",
            this._onChatCardAction.bind(this),
        );
    }

    static onMessageRendered(html) {
        html.find(".attack-card .card-buttons button").each((i, button) => {
            if (button.getAttribute("data-action") != "apply-defenses") {
                HeroSystem6eAttackCard.setCardStateAsync(button);
            }
            button.style.display = "block";
        });
    }

    static async setCardStateAsync(button) {
        const card = button.closest(".chat-card");

        let actor = await this._getChatCardActor(card);

        if (!actor) return;

        if (!actor.isOwner) {
            button.setAttribute("disabled", true);
        }
    }

    /**
     * Handle execution of a chat card action via a click event on one of the card buttons
     * @param {Event} event       The originating click event
     * @returns {Promise}         A promise which resolves once the handler workflow is complete
     * @private
     */
    static async _onChatCardAction(event) {
        event.preventDefault();
        HEROSYS.log(false, "_onChatCardAction");

        // not being used anymore, leaving in here for now just in case
    }

    static async _RollToHit(item, html, actor, itemId, version) {
        if (version === 2) {
            return HeroSystem6eAttackCard._RollToHit2(
                item,
                html,
                actor,
                itemId,
            );
        }

        // get attack card input
        let form = html[0].querySelector("form");

        let effectiveStr = 0;
        if ("effectiveStr" in form) {
            effectiveStr = form.effectiveStr.value;
        }

        let aim = "";
        if ("aim" in form) {
            aim = form.aim.value;
        }

        let data = {
            toHitModTemp: form.toHitMod.value,
            aim: aim,
            effectiveStr: effectiveStr,
            damageMod: form.damageMod.value,
        };

        if (game.settings.get("hero6efoundryvttv2", "knockback")) {
            data["knockbackMod"] = form.knockbackMod.value;
        }

        await HeroSystem6eToHitCard.createFromAttackCard(
            item,
            data,
            actor,
            itemId,
        );
    }

    // _RollToHit2 is slightly different from _RollToHit.
    // It uses targeted tokens instead of selected tokens.
    // "t" to target.  Shift-t to target multiple tokens.
    static async _RollToHit2(item, html, actor) {
        // get attack card input
        let form = html[0].querySelector("form");

        let effectiveStr = 0;
        if ("effectiveStr" in form) {
            effectiveStr = form.effectiveStr.value;
        }

        let aim = "";
        if ("aim" in form) {
            aim = form.aim.value;
        }

        let data = {
            toHitModTemp: form.toHitMod.value,
            aim: aim,
            effectiveStr: effectiveStr,
            damageMod: form.damageMod.value,
        };

        if (game.settings.get("hero6efoundryvttv2", "knockback")) {
            data["knockbackMod"] = form.knockbackMod.value;
        }

        await HeroSystem6eToHitCard.createFromAttackCard(
            item,
            data,
            actor,
            game.user.targets,
        );
    }

    async render() {
        return await HeroSystem6eAttackCard._renderInternal(
            this.item,
            this.actor,
            this.message.data.flags["state"],
        );
    }

    /**
     * Display the chat card for an Item as a Chat Message
     * @param {object} options          Options which configure the display of the item chat card
     * @param {string} rollMode         The message visibility mode to apply to the created card
     * @param {boolean} createMessage   Whether to automatically create a ChatMessage entity (if true), or only return
     *                                  the prepared message data (if false)
     */
    static async createAttackPopOutFromItem(item, actor, itemId, version) {
        const content = await this._renderInternal(item, actor, {}, itemId);

        // Attack Card as a Pop Out
        let options = {
            width: 300,
        };

        return new Promise((resolve) => {
            const data = {
                title: "Roll to Hit",
                content: content,
                buttons: {
                    rollToHit: {
                        label: "Roll to Hit",
                        callback: (html) =>
                            resolve(
                                this._RollToHit(
                                    item,
                                    html,
                                    actor,
                                    itemId,
                                    version,
                                ),
                            ),
                    },
                },
                default: "rollToHit",
                close: () => resolve({}),
            };

            new Dialog(data, options).render(true);
        });
    }
}
