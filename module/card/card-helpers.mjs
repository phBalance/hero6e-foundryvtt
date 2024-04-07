import * as Attack from "../item/item-attack.mjs";

export class HeroSystem6eCardHelpers {
    static onMessageRendered(html) {
        Attack.onMessageRendered(html);
    }

    static chatListeners(html) {
        Attack.chatListeners(html);
    }
}
