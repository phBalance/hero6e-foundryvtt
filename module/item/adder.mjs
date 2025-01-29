import { getPowerInfo, getModifierInfo } from "../utility/util.mjs";
import { HeroSystem6eItem } from "./item.mjs";

export class HeroSystem6eAdder {
    #baseInfo;
    constructor(json, options) {
        // These are needed first
        this.item = options.item;
        if (!this.item) {
            debugger;
        }
        this.#baseInfo = getModifierInfo({ xmlid: json.XMLID, actor: this.item?.actor, is5e: this.item?.is5e });

        for (const key of Object.keys(json)) {
            if (foundry.utils.hasProperty(this, key)) {
                this[`_${key}`] = json[key];
            } else {
                this[key] = json[key];
            }
        }

        for (const key of Object.keys(options)) {
            this[key] = options[key];
        }
    }

    get baseInfo() {
        return this.#baseInfo;
    }

    get cost() {
        let _cost = 0;
        // Custom costs calculations
        if (this.baseInfo?.cost) {
            _cost = this.baseInfo.cost(this, this.item);
        } else {
            // Generic cost calculations
            _cost = parseFloat(this.BASECOST);

            const costPerLevel = this.baseInfo?.costPerLevel(this) || 0;
            const levels = parseInt(this.LEVELS) || 0;
            _cost += levels * costPerLevel;
        }

        if (this.parent instanceof HeroSystem6eItem) {
            _cost = Math.ceil(_cost);
        }

        return _cost;
    }

    get BASECOST_total() {
        if (this._BASECOST_total !== undefined) {
            if (this._BASECOST_total !== this.cost) {
                console.error(`BASECOST_total (${this.cost}) did not match cost ${this._BASECOST_total}`);
            }
        }
        return this.cost;
    }

    set BASECOST_total(value) {
        if (this.cost != value) {
            //debugger;
            console.error(
                `${this.item?.actor.name}/${this.item?.name}/${this.item?.system.XMLID}/${this.XMLID} BASECOST_total (${value}) did not match cost ${this.BASECOST_total}`,
            );
        }
    }
}
