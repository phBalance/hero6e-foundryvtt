export class AttackAction {
    constructor(data) {
        this.setData(data);
    }

    _aim = null;
    get aim() {
        return this._aim;
    }
    set aim(value) {
        if (value.constructor?.name !== "String") {
            throw new Error("aim expecting a String");
        }
        this._aim = value;
    }

    _attackerToken = null;
    get attackerToken() {
        return this._attackerToken;
    }
    set attackerToken(value) {
        this._attackerToken = value;
    }
    _attackMods = [];
    get attackMods() {
        return this._attackMods;
    }
    set attackMods(value) {
        if (value.constructor?.name !== "Array") {
            throw new Error("attackMods expecting an Array");
        }
        this._attackMods = value;
    }

    _effectiveItem = null;
    get effectiveItem() {
        return this._effectiveItem;
    }
    set effectiveItem(value) {
        if (value.constructor?.name !== "HeroSystem6eItem") {
            throw new Error("effectiveRealCost expecting a HeroSystem6eItem");
        }
        this._effectiveItem = value;
    }

    _effectiveRealCost = 0;
    get effectiveRealCost() {
        return this._effectiveRealCost;
    }
    set effectiveRealCost(value) {
        if (value.constructor?.name !== "Number") {
            throw new Error("effectiveRealCost expecting a Number");
        }

        this._effectiveRealCost = value;
    }

    _targetTokens = [];
    get targetTokens() {
        return this._targetTokens;
    }
    set targetTokens(value) {
        if (value.constructor?.name !== "Array") {
            throw new Error("targetTokens expecting an Array");
        }
        for (const token of value) {
            if (token.constructor?.name !== "HeroSystem6eToken") {
                throw new Error("targetTokens elements expecting a HeroSystem6eToken");
            }
        }
        this._targetTokens = value;
    }

    _message;
    get message() {
        return this._message;
    }
    set message(value) {
        this._message = value;
    }

    get actor() {
        return this.effectiveItem?.actor ?? this.attackerToken?.actor;
    }

    setData(data) {
        if (!data) {
            return;
        }
        this.effectiveItem = data.effectiveItem ?? this.effectiveItem;
        this.effectiveRealCost = data.effectiveRealCost ?? this.effectiveRealCost;
        this.attackMods = data.attackMods ?? this.attackMods;
        this.attackerToken = data.attackerToken ?? this.attackerToken;
        this.targetTokens = data.targetTokens ?? this.targetTokens;
    }

    _data = {};

    get data() {
        return this._data;
    }

    // get toJSON() {
    //     return JSON.stringify(this);
    // }

    static fromJSON(jsonData) {
        if (jsonData.constructor.name === "String") {
            jsonData = JSON.parse(jsonData);
        }

        // Create a new instance and assign properties
        const newAttackAction = new AttackAction();
        Object.assign(newAttackAction, jsonData);

        if (newAttackAction._effectiveItem?.constructor.name === "Object") {
            newAttackAction._effectiveItem = new HeroSystem6eItem(newAttackAction._effectiveItem);
        }
        return newAttackAction;
    }
}
