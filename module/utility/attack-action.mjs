import { getAttackTags } from "../item/item-attack.mjs";

export class AttackAction {
    stages = {
        TEMPLATE_PLACEMENT_ROLL: {
            complete: false,
        },
        TEMPLATE_SELECTIVE_TOHIT: {
            complete: false,
        },
        ROLL_DAMAGE_OR_EFFECT: {
            complete: false,
        },
        APPLY_DAMAGE_OR_EFFECT: {
            complete: false,
        },
        ROLL_KNOCKBACK: {
            complete: false,
        },
        APPLY_KNOCKBACK: {
            complete: false,
        },
        // AUTOFIRE?
        // MULTIFIRE?
    };

    constructor(data) {
        // Don't need "setData", move all that code here
        this.setData(data);

        //this.toHitData = data;
        //Object.freeze(this.toHitData);

        // Get rid of most setters as we want the toHitData immutable.

        // May want an array of targets so we can "fix targets, yet keep things immutable.
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
    // PETER thinks I should get rid of storing _messageId here.
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

    get placedAoeTemplate() {
        return canvas.scene?.templates.find((t) => t.flags[game.system.id]?.messageId === this.messageId);
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

    _data = {
        // toHit: array per target
        // damageCalculated,damageApplied, knockbackApplied
    };

    get data() {
        return this._data;
    }

    toJSON() {
        if (!this.effectiveItem) {
            throw new Error("missing effectiveItem");
        }
        if (this.effectiveItem._id) {
            throw new Error("effectiveItem must not be a real item");
        }

        // Store raw data to _source so we can use native serialization routines.
        // Trying to avoid hydrate/rehydrate functions, prefer something more generic.
        // Also getting rid of _active to avoid circular references, and I'm trying to depreciate it anyway.
        // TODO: Can we tweak the HeroSystem6eItem.toJSON toObjet or other serialization functions so we don't need this?
        //       Perhaps using _id to determine if we need to do anything special?
        //       Or perhaps rework all effectiveItem changes to use updateSource?
        const clonedEffectiveItem = foundry.utils.deepClone(this._effectiveItem);
        clonedEffectiveItem.system._active = undefined;
        clonedEffectiveItem.updateSource({ system: { ...clonedEffectiveItem.system } }, { diff: false });

        return { ...this, _effectiveItem: clonedEffectiveItem._source };
    }

    static fromJSON(jsonData) {
        if (jsonData.constructor.name === "String") {
            jsonData = JSON.parse(jsonData);
        }

        // REFER to Dice
        // static fromJSON(json) {
        // return HeroRoller.fromData(JSON.parse(json));
        // static fromData(dataObj) {

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

    get attackTags() {
        return getAttackTags(this.effectiveItem);
    }

    get toHitTags() {
        if (this.stages["TEMPLATE_PLACEMENT_ROLL"].heroRoller) {
            return this.stages["TEMPLATE_PLACEMENT_ROLL"].heroRoller.tags();
        }

        throw new Error("HeroRoller is required to get toHitTags");
    }
}
