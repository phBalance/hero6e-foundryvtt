import { getModifierInfo } from "../utility/util.mjs";
import { HeroSystem6eItem } from "./item.mjs";

export class HeroSystem6eAdder {
    #baseInfo;
    constructor(json, options) {
        // These are needed first
        this.item = options.item;
        // if (!this.item) {
        //     debugger;
        // }
        this.#baseInfo = getModifierInfo({
            xmlid: json.XMLID,
            actor: this.item?.actor,
            is5e: this.item?.is5e,
            item: this.item,
            xmlTag: "ADDER",
        });

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

        if (!this.#baseInfo) {
            if (!window.warnAdder?.includes(this.XMLID)) {
                console.warn(
                    `${this.item?.actor.name}/${this.item?.name}/${this.item?.system.XMLID}/${this.XMLID}: missing baseInfo.`,
                    this,
                );
                window.warnAdder ??= [];
                window.warnAdder.push(this.XMLID);
            }
        }
    }

    get baseInfo() {
        return this.#baseInfo;
    }

    get cost() {
        if (this.SELECTED === false) {
            return 0;
        }

        let _cost = 0;
        // Custom costs calculations
        if (this.#baseInfo?.cost) {
            _cost = this.#baseInfo.cost(this, this.item);
        } else {
            // Generic cost calculations
            _cost = parseFloat(this.BASECOST);

            let costPerLevel = this.#baseInfo?.costPerLevel(this) || 0;
            const levels = parseInt(this.LEVELS) || 0;
            // Override default costPerLevel?
            if (this.LVLCOST && levels > 0) {
                const _costPerLevel = parseFloat(this.LVLCOST || 0) / parseFloat(this.LVLVAL || 1) || 1;
                if (costPerLevel !== _costPerLevel && this.#baseInfo) {
                    console.warn(
                        `${this.item?.actor.name}/${this.item?.name}/${this.item?.system.XMLID}/${this.XMLID}: costPerLevel inconsistency ${costPerLevel} vs ${_costPerLevel}`,
                        this,
                    );
                }
                costPerLevel = _costPerLevel;
            }
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
        // ADDITIONALED is prorated based on ADDITIONALPD, which the legacy code does not do properly.
        if (this.cost != value && this.XMLID !== "ADDITIONALED") {
            console.error(
                `${this.item?.actor.name}/${this.item?.name}/${this.item?.system.XMLID}/${this.XMLID} BASECOST_total (${value}) did not match cost ${this.BASECOST_total}`,
            );
            return;
        }
    }
}
