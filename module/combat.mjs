// import { HEROSYS } from "./herosystem6e.mjs";
import { clamp } from "./utility/compatibility.mjs";
// import { whisperUserTargetsForActor, expireEffects } from "./utility/util.mjs";

export class HeroSystem6eCombat extends Combat {
    constructor(data, context) {
        super(data, context);

        this.previous = this.previous || {
            combatantId: null,
        };
    }

    async rollInitiative(ids) {
        if (CONFIG.debug.combat) {
            console.debug(`Hero | rollInitiative`, ids);
        }
        ids = typeof ids === "string" ? [ids] : ids;
        //const currentId = this.combatant?.id;
        // Iterate over Combatants, performing an initiative roll for each
        const updates = [];
        for (const id of ids) {
            // Get Combatant data (non-strictly)
            const combatant = this.combatants.get(id);
            if (!combatant?.isOwner) continue;

            // Produce an initiative roll for the Combatant
            const characteristic = combatant.actor?.system?.initiativeCharacteristic || "dex";
            const initValue = combatant.actor?.system.characteristics[characteristic]?.value || 0;
            //const spdValue = Math.max(1, combatant.actor?.system.characteristics.spd?.value || 0);
            const initiativeValue = initValue; // + spdValue / 100;
            if (combatant.initiative != initiativeValue) {
                updates.push({ _id: id, "flags.initiative": initiativeValue }); // initiative: initiativeValue,
            }
        }
        if (!updates.length) return this;

        // Update multiple combatants
        if (updates) {
            await this.updateEmbeddedDocuments("Combatant", updates);
        }

        return this;
    }

    /**
     * Return the Array of combatants sorted into initiative order, breaking ties alphabetically by name.
     * @returns {Combatant[]}
     */
    setupTurns() {
        if (CONFIG.debug.combat) {
            console.debug(`Hero | setupTurns`);
        }

        this.turns ||= [];

        // Determine the turn order and the current turn
        const turns = this.combatants.contents.sort(this._sortCombatants);
        if (this.turn !== null) this.turn = Math.clamp(this.turn, 0, turns.length - 1);

        // Update state tracking
        let c = turns[this.turn];
        this.current = this._getCurrentState(c);

        // One-time initialization of the previous state
        if (!this.previous) this.previous = this.current;

        // Return the array of prepared turns
        return (this.turns = turns);
    }

    /**
     * Define how the array of Combatants is sorted in the displayed list of the tracker.
     * This method can be overridden by a system or module which needs to display combatants in an alternative order.
     * The default sorting rules sort in descending order of initiative using combatant IDs for tiebreakers.
     * @param {Combatant} a     Some combatant
     * @param {Combatant} b     Some other combatant
     * @protected
     */
    _sortCombatants(a, b) {
        const ia = Number.isNumeric(a.initiative) ? a.initiative : -Infinity;
        const ib = Number.isNumeric(b.initiative) ? b.initiative : -Infinity;
        return ia - ib || a.hasPlayerOwner < b.hasPlayerOwner || (a.tokenId > b.tokenId ? 1 : -1);
    }

    async _onCreateDescendantDocuments(parent, collection, documents, data, options, userId) {
        if (CONFIG.debug.combat) {
            console.debug(`Hero | _onCreateDescendantDocuments`);
        }

        // Automatically roll initiative for all combatants created in the combat tracker.
        // We could use rollAll() here, but rollInitiative is probably more efficient.
        await this.rollInitiative(documents.map((o) => o.id));

        // Call Super
        await super._onCreateDescendantDocuments(parent, collection, documents, data, options, userId);

        // Add or remove extra combatants based on SPD or Lightning Reflexes
        await this.extraCombatants();
    }

    async extraCombatants() {
        if (CONFIG.debug.combat) {
            console.debug(`Hero | extraCombatants`);
        }
        const uniqueTokens = Array.from(new Set(this.combatants.map((o) => o.tokenId))); //this.combatants.filter((c, i, ar) => ar.indexOf(c) === i);
        for (const _tokenId of uniqueTokens) {
            const _combatant = this.combatants.find((o) => o.tokenId === _tokenId && o.actor);
            const actor = _combatant?.actor;
            if (actor) {
                const targetCombatantCount = parseInt(actor.system.characteristics.spd.value);
                const tokenCombatants = this.combatants.filter((o) => o.tokenId === _tokenId);
                const tokenCombatantCount = tokenCombatants.length;

                if (tokenCombatantCount < targetCombatantCount) {
                    const toCreate = [];
                    for (let i = 0; i < targetCombatantCount - tokenCombatantCount; i++) {
                        toCreate.push(_combatant);
                    }
                    await this.createEmbeddedDocuments("Combatant", toCreate);
                }

                if (tokenCombatantCount > targetCombatantCount) {
                    const _combatants = this.combatants.filter((o) => o.tokenId === _tokenId && o.actor);
                    await this.deleteEmbeddedDocuments(
                        "Combatant",
                        _combatants.map((o) => o.id).slice(0, tokenCombatantCount - targetCombatantCount),
                    );
                }

                // Add custom hero flags for segments and such
                if (tokenCombatantCount === targetCombatantCount) {
                    const updates = [];
                    for (let c = 0; c < tokenCombatantCount; c++) {
                        const _combatant = tokenCombatants[c];
                        const spd = parseInt(_combatant.actor?.system.characteristics.spd.value);
                        if (spd) {
                            const segment = HeroSystem6eCombat.getSegment(spd, c);
                            const initiative = `${segment.toString().padStart(2, "0")}${_combatant.flags.initiative
                                .toString()
                                .padStart(3, "0")}${spd.toString().padStart(2, "0")}`;
                            updates.push({
                                _id: _combatant.id,
                                initiative,
                                "flags.segment": segment,
                            });
                        }
                    }
                    await this.updateEmbeddedDocuments("Combatant", updates);
                }
            }
            console.log(actor);
        }
    }

    static getSegment(spd, index) {
        let i = index;
        for (let segment = 1; segment <= 12; segment++) {
            if (HeroSystem6eCombat.hasPhase(spd, segment)) {
                i--;
                if (i < 0) {
                    return segment;
                } else {
                    console.log(index, i);
                }
            }
        }
        return 12;
    }

    static hasPhase(spd, segment) {
        switch (clamp(parseInt(spd), 0, 12)) {
            case 0:
                // At SPD 0, a character is frozen in place, unable to move or take any other Actions. He can only take Post-Segment 12 Recoveries,
                return [12].includes(segment);
            case 1:
                return [12].includes(segment);
            case 2:
                return [6, 12].includes(segment);
            case 3:
                return [4, 8, 12].includes(segment);
            case 4:
                return [3, 6, 9, 12].includes(segment);
            case 5:
                return [3, 5, 8, 10, 12].includes(segment);
            case 6:
                return [2, 4, 6, 8, 10, 12].includes(segment);
            case 7:
                return [2, 4, 6, 7, 9, 11, 12].includes(segment);
            case 8:
                return [2, 3, 5, 6, 8, 9, 11, 12].includes(segment);
            case 9:
                return [2, 3, 4, 6, 7, 8, 10, 11, 12].includes(segment);
            case 10:
                return [2, 3, 4, 5, 6, 8, 9, 10, 11, 12].includes(segment);
            case 11:
                return [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].includes(segment);
            case 12:
                return true;
            default:
                // if (spd < 1 && segment === 12) return true;
                // if (spd === undefined && segment === 12) return true;
                return false;
        }
    }

    // async _onDeleteDescendantDocuments(parent, collection, documents, ids, options, userId) {
    //     if (CONFIG.debug.combat) {
    //         console.debug(`Hero | _onDeleteDescendantDocuments`);
    //     }

    //     // Super
    //     await super._onDeleteDescendantDocuments(parent, collection, documents, ids, options, userId);
    // }

    // async _onUpdateDescendantDocuments(
    //     parent,
    //     collection,
    //     documents,
    //     changes,
    //     options,
    //     // eslint-disable-next-line no-unused-vars
    //     userId,
    // ) {
    //     if (CONFIG.debug.combat) {
    //         console.debug(`Hero | _onUpdateDescendantDocuments`);
    //     }
    //     super._onUpdateDescendantDocuments(parent, collection, documents, changes, options, userId);

    //     await this.extraCombatants();
    // }
}
