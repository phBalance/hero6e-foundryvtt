// import { HEROSYS } from "./herosystem6e.mjs";
// import { clamp } from "./utility/compatibility.mjs";
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
            const spdValue = Math.max(1, combatant.actor?.system.characteristics.spd?.value || 0);
            const initiativeValue = initValue + spdValue / 100;
            if (combatant.initiative != initiativeValue) {
                updates.push({ _id: id, initiative: initiativeValue });
            }
        }
        if (!updates.length) return this;

        // Update multiple combatants
        await this.updateEmbeddedDocuments("Combatant", updates);

        return this;
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
        const uniqueTokens = Array.from(new Set(this.combatants.map((o) => o.tokenId))); //this.combatants.filter((c, i, ar) => ar.indexOf(c) === i);
        for (const _tokenId of uniqueTokens) {
            const _combatant = this.combatants.find((o) => o.tokenId === _tokenId && o.actor);
            const actor = _combatant?.actor;
            if (actor) {
                const targetCombatantCount = parseInt(actor.system.characteristics.spd.value);
                const currentCombatantCount = this.combatants.filter((o) => o.tokenId).length;

                if (currentCombatantCount < targetCombatantCount) {
                    await this.createEmbeddedDocuments("Combatant", [_combatant]);
                }

                // if (currentCombatantCount > targetCombatantCount) {
                //     await this.deleteEmbeddedDocuments("Combatant", { id: _combatant.id });
                // }
            }
            console.log(actor);
        }
    }

    async _onDeleteDescendantDocuments(parent, collection, documents, ids, options, userId) {
        if (CONFIG.debug.combat) {
            console.debug(`Hero | _onDeleteDescendantDocuments`);
        }

        // Super
        await super._onDeleteDescendantDocuments(parent, collection, documents, ids, options, userId);
    }
}
