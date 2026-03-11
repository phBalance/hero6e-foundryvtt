import * as Attack from "../item/item-attack.mjs";

export class HeroSystem6eCardHelpers {
    static onMessageRendered(html) {
        Attack.onMessageRendered(html);
    }

    static chatListeners(html) {
        Attack.chatListeners(html);

        // May need passive: true
        html.on("pointerover", "[data-highlight-token]", HeroSystem6eCardHelpers._onChatMessageTokenHoverIn.bind(this));
        html.on("pointerout", "[data-highlight-token]", HeroSystem6eCardHelpers._onChatMessageTokenHoverOut.bind(this));
    }

    static async _onChatMessageTokenHoverIn(event) {
        const tokenDocument = await fromUuid(event.currentTarget.dataset.highlightToken);
        const tokenObject = tokenDocument?.object;
        if (tokenObject && tokenObject._canHover(game.user, event) && tokenObject.visible) {
            tokenObject._onHoverIn(event, { hoverOutOthers: true });
        }
    }

    static async _onChatMessageTokenHoverOut(event) {
        const tokenDocument = await fromUuid(event.currentTarget.dataset.highlightToken);
        const tokenObject = tokenDocument?.object;
        if (tokenObject && tokenObject._canHover(game.user, event)) {
            tokenObject._onHoverOut(event);
        }
    }
}
