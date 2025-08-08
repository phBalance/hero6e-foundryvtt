import { getModifierInfo } from "../utility/util.mjs";
import { HeroSystem6eItem } from "./item.mjs";
import { HeroSystem6eAdder } from "./adder.mjs";

export class HeroSystem6eModifier {
    #baseInfo = null;

    // get XMLID() {
    //     return this._original.XMLID;
    // }
    // get ID() {
    //     return this._original.ID;
    // }
    // get BASECOST() {
    //     return this._original.BASECOST;
    // }
    // get LEVELS() {
    //     return this._original.LEVELS;
    // }
    // get ALIAS() {
    //     return this._original.ALIAS;
    // }
    // get MULTIPLIER() {
    //     return this._original.MULTIPLIER;
    // }
    // get GRAPHIC() {
    //     return this._original.GRAPHIC;
    // }
    // get COLOR() {
    //     return this._original.COLOR;
    // }
    // get SFX() {
    //     return this._original.SFX;
    // }
    // get SHOW_ACTIVE_COST() {
    //     return this._original.SHOW_ACTIVE_COST;
    // }
    // get OPTION() {
    //     return this._original.OPTION;
    // }
    // get OPTIONID() {
    //     return this._original.OPTIONID;
    // }
    // get OPTION_ALIAS() {
    //     return this._original.OPTION_ALIAS;
    // }
    // get INCLUDE_NOTES_IN_PRINTOUT() {
    //     return this._original.INCLUDE_NOTES_IN_PRINTOUT;
    // }
    // get NAME() {
    //     return this._original.NAME;
    // }
    // get COMMENTS() {
    //     return this._original.COMMENTS;
    // }
    // get PRIVATE() {
    //     return this._original.PRIVATE;
    // }
    // get FORCEALLOW() {
    //     return this._original.FORCEALLOW;
    // }
    // get NOTES() {
    //     return this._original.NOTES;
    // }
    // get xmlTag() {
    //     return this._original.xmlTag;
    // }
    // get POSITION() {
    //     return this._original.POSITION;
    // }

    constructor(json, options) {
        window.testModifier = (window.testModifier || 0) + 1;
        if (json?.constructor !== Object) {
            console.error(`Expected JSON object`, this, json, options);
        }
        // Item first so we can get baseInfo
        this._item = options?.item;
        this._id = json?.ID;
        this._original = json; //this.#original;
        this._parent = options.parent;
        this.#baseInfo = getModifierInfo({
            xmlid: json.XMLID,
            actor: options?.item?.actor,
            is5e: options?.item?.is5e,
            xmlTag: "MODIFIER",
            item: options?.item,
        });

        for (const key of Object.keys(json).filter((k) => !k.startsWith("_") && k !== "BASECOST_total")) {
            /// Create getters (if we don't already have one)
            if (!Object.getOwnPropertyDescriptor(HeroSystem6eModifier.prototype, key)?.["get"]) {
                {
                    Object.defineProperty(this, key, {
                        get() {
                            //const original = this._original;
                            return this._original[key];
                        },

                        // set() {
                        //     return this._original[key];
                        // },
                    });
                }
            } else {
                if (key === "adders") {
                    console.console.error(
                        `${this.item?.actor?.name}/${this.item?.detailedName()}/${json.XMLID}: Unexpected "adders" modifier property (${key}). Shouldn't be a problem, re-uploading from HDC should resolve.`,
                        this,
                        json,
                        options,
                    );
                } else {
                    console.warn(
                        `${this.item?.actor?.name}/${this.item?.detailedName()}/${json.XMLID}: Unexpected modifier property (${key}). Shouldn't be a problem, re-uploading from HDC should resolve.`,
                        this,
                        json,
                        options,
                    );
                }

                // AARON: DO NOT UPDATE database!!!
                // We may be able to fix the legacy mistaken value on the fly so a re-upload isn't really necessary
                // if (key === "adders") {
                //     debugger;
                //     // try {
                //     //     delete options.item.system.MODIFIER.find((m) => m.XMLID === json.XMLID)[key];
                //     //     options.item.update({ [`system.MODIFIER`]: options.item.system.MODIFIER });
                //     // } catch (e) {
                //     //     console.error(e);
                //     // }
                // }
            }
        }

        // for (const key of Object.keys(options)) {
        //     this[key] = options[key];
        // }

        if (!(this.item instanceof HeroSystem6eItem)) {
            console.warn(`${this.XMLID} item not found`);
        }

        if (!this.#baseInfo && !this.BASECOST) {
            if (!window.warnAdder?.includes(this.XMLID)) {
                console.info(
                    `${this.item?.actor.name}/${this.item?.detailedName()}/${this.XMLID}: missing baseInfo.`,
                    this,
                );
                window.warnAdder ??= [];
                window.warnAdder.push(this.XMLID);
            }
        }
    }

    get parent() {
        return this._parent;
    }

    get item() {
        return this._item;
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

            let costPerLevel = this.baseInfo?.costPerLevel(this) || 0;
            const levels = parseInt(this.LEVELS) || 0;
            if (!costPerLevel && this.LVLCOST) {
                console.warn(
                    `${this.item?.actor.name}/${this.item?.detailedName()}/${this.XMLID}: is missing costPerLevel, using LVLCOST & LVLVAL`,
                );
                costPerLevel = parseFloat(this.LVLCOST || 0) / parseFloat(this.LVLVAL || 1) || 1;
            }
            _cost += levels * costPerLevel;
        }

        // Some MODIFIERs have ADDERs
        for (const adder of this.adders) {
            _cost += adder.cost;
        }

        // Some MODIFIERs have MODIFIERs (CONTINUOUSCONCENTRATION & ACTIVATEONLY)
        for (const modifier of this.modifiers) {
            _cost += modifier.cost;
        }

        // Some modifiers have a minimumLimitation (REQUIRESASKILLROLL)
        if (this.baseInfo?.minimumLimitation) {
            if (this.baseInfo?.minimumLimitation < 0) {
                _cost = Math.min(this.baseInfo?.minimumLimitation, _cost);
            } else {
                _cost = Math.max(this.baseInfo?.minimumLimitation, _cost);
            }
        }

        return _cost;
    }

    get adders() {
        const _adders = [];
        for (const _adderJson of this.ADDER || []) {
            _adders.push(new HeroSystem6eAdder(_adderJson, { item: this.item, parent: this }));
        }
        return _adders;
    }

    get modifiers() {
        const _modifiers = [];
        for (const _modifierJson of this.MODIFIER || []) {
            _modifiers.push(new HeroSystem6eModifier(_modifierJson, { item: this.item, parent: this }));
        }
        return _modifiers;
    }

    get addersDescription() {
        const textArray = [];
        for (const _adder of this.adders) {
            if (_adder.addersDescription) {
                textArray.push(_adder.addersDescription(_adder));
            } else {
                textArray.push(_adder.OPTION_ALIAS || _adder.ALIAS);
            }
        }
        return textArray.join(", ");
    }

    get BASECOST_total() {
        if (this._BASECOST_total !== undefined) {
            if (this._BASECOST_total !== this.cost) {
                console.warn(
                    `${this.item?.actor.name}/${this.item?.detailedName()}/${this.XMLID} BASECOST_total (${this.cost}) did not match cost ${this._BASECOST_total}`,
                    this,
                );
            }
        }
        return this.cost;
    }

    set BASECOST_total(value) {
        if (this.cost !== value) {
            console.error(
                `${this.item?.actor.name}/${this.item?.detailedName()}/${this.XMLID} BASECOST_total (${value}) did not match cost ${this.BASECOST_total}`,
            );
        }
    }
}
