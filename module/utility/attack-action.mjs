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

    _attackerTokenUuid = null;
    get attackerTokenUuid() {
        return this._attackerTokenUuid;
    }
    set attackerTokenUuid(value) {
        this._attackerTokenUuid = value;
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

    _targetTokenIds = [];
    get targetTokenIds() {
        return this._targetTokenIds;
    }
    set targetTokenIds(value) {
        if (value.constructor?.name !== "Array") {
            throw new Error("targetTokens expecting an Array");
        }
        for (const token of value) {
            if (token.constructor?.name !== "Number") {
                throw new Error("targetTokenIds elements expecting a Number");
            }
        }
        this._targetTokenIds = value;
    }

    // For convenience, doesn't seem necessary.
    // The message should be avail from the "event" of
    // subsequent listen handlers.
    _messageId;
    get messageId() {
        return this._messageId;
    }
    set messageId(value) {
        this._messageId = value;
    }

    get attackerToken() {
        return fromUuidSync(this.attackerTokenUuid);
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
        this.attackerTokenUuid = data.attackerTokenUuid ?? this.attackerTokenUuid;
        this.targetTokenIds = data.targetTokenIds ?? this.targetTokenIds;
    }

    _data = {};

    get data() {
        return this._data;
    }

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

    async saveToMessage() {
        const message = ChatMessage.get(this.messageId);
        if (!message) {
            throw new Error(`missing message`);
        }

        const parsedMessageContent = document.createElement("div");
        parsedMessageContent.innerHTML = message.content;
        const el = parsedMessageContent.querySelector(`[data-attack-action]`);
        el.dataset.attackAction = JSON.stringify(this);
        await message.update({ content: parsedMessageContent.innerHTML });
    }
}
