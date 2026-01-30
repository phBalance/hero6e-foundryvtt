import { HeroSystemActorSheetV2 } from "./actor-sheet-v2.mjs";

export class HeroSystemActorSheetV2a extends HeroSystemActorSheetV2 {
    static get DEFAULT_OPTIONS() {
        return foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
            classes: ["herosystem6e", "actor-sheet-v2a"],
        });
    }
}
