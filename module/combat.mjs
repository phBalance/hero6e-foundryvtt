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

    // parent, collection, documents, data, options, userId
    async _onCreateDescendantDocuments(...args) {
        if (CONFIG.debug.combat) {
            console.debug(`Hero | _onCreateDescendantDocuments`);
        }

        await this.rollAll();
        await super._onCreateDescendantDocuments(...args);
    }
}
