import { getPowerInfo } from "../utility/util.mjs";

export class HeroSystem6eModifier {
    #baseInfo;
    constructor(json, options) {
        for (const key of Object.keys(json)) {
            this[key] = json[key];
        }

        for (const key of Object.keys(options)) {
            this[key] = options[key];
        }

        this.#baseInfo = getPowerInfo({ item: this, is5e: this.item?.is5e });
    }

    get item() {
        return fromUuidSync(this._itemUuid);
    }

    get baseInfo() {
        return this.#baseInfo;
    }
}
