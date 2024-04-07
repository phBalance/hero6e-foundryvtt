import { HeroSystem6eCard } from "./card.mjs";
import * as Attack from "../item/item-attack.mjs";

export class HeroSystem6eCardHelpers {
    static onMessageRendered(html) {
        Attack.onMessageRendered(html);
    }

    static chatListeners(html) {
        HeroSystem6eCard.chatListeners(html);
        Attack.chatListeners(html);
    }
}
