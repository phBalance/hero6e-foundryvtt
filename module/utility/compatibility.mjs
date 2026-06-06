/**
 * System compatibility and database translation layer for Hero System 6e.
 * Adapts modern V14 paradigms to V13 environments safely.
 */
export class HeroCompatibility {
    /**
     * True if the host environment is running Foundry VTT V14 or later.
     * @type {boolean}
     */
    static get isV14() {
        // Falls back gracefully if game.release isn't ready during ultra-early initialization
        const generation = game.release?.generation ?? 13;
        return generation >= 14;
    }

    /**
     * Safely updates an array of embedded documents inside a parent document.
     * Enforces V14 array assignment, falling back to flattened path keys in V13.
     *
     * @param {Document} parentDoc - The parent document (e.g., a Combat or Actor instance).
     * @param {string} embeddedKey - The key of the embedded collection (e.g., "combatants", "effects").
     * @param {Array<object>} embeddedUpdates - Array of update objects, each containing a mandatory `_id`.
     * @param {object} [topLevelUpdates={}] - Additional top-level document adjustments (e.g., flag updates).
     * @returns {Promise<Document>} The updated parent document.
     */
    static async updateEmbedded(parentDoc, embeddedKey, embeddedUpdates, topLevelUpdates = {}) {
        if (!parentDoc || typeof parentDoc.update !== "function") {
            throw new Error(`[${game.system.id}] Invalid parent document provided for embedded mutation.`);
        }

        // 1. Process for Modern Foundry V14 Environments
        if (this.isV14) {
            const mergedV14Payload = {
                ...topLevelUpdates,
                [embeddedKey]: embeddedUpdates,
            };
            return parentDoc.update(mergedV14Payload);
        }

        // 2. Process for Legacy Foundry V13 Environments
        const flattenedV13Payload = { ...topLevelUpdates };

        for (const updateData of embeddedUpdates) {
            const { _id, ...fields } = updateData;
            if (!_id) continue; // Skip malformed inputs safely

            for (const [property, value] of Object.entries(fields)) {
                // Flat path construction happens strictly here, keeping your features clean
                flattenedV13Payload[`${embeddedKey}.${_id}.${property}`] = value;
            }
        }

        return parentDoc.update(flattenedV13Payload);
    }

    /**
     * Version-agnostic wrapper for refreshing active effect expiry lifecycles.
     * Avoids fake custom timers or hallucinated core hooks.
     *
     * @param {ActiveEffect} effect - Target ActiveEffect instance.
     */
    static refreshActiveEffect(effect) {
        if (!effect) return;

        if (this.isV14) {
            // Native V14 core architecture handler
            if (ActiveEffect.expiry?.refresh) {
                ActiveEffect.expiry.refresh();
            }
        } else {
            // V13 Fallback evaluation: Explicitly delete expired documents
            const remaining = effect.duration?.remaining;
            if (remaining === 0) {
                // Scoped standard CRUD execution
                effect.delete();
            }
        }
    }

    /**
     * FoundryVTT overloads Math to add the clamped or clamp method depending on the version.
     * Just provide a straight implementation.
     *
     * If max < min then min = max
     *
     * @param {number} num - The number to clamp
     * @param {number} min - The lower bound to clamp num to
     * @param {number} max - The upper bound to clamp num to
     *
     * @returns number
     */
    static clamp(num, min, max) {
        if (max < min) {
            max = min;
        }

        return Math.min(Math.max(num, min), max);
    }
}
