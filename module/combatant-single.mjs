export class HeroSystem6eCombatantSingle extends Combatant {
    /**
     * Evaluates if this participant possesses an active action phase
     * in the specified speed chart calendar segment index.
     * Hardened to handle aided overcaps and massive resource drains cleanly.
     * @param {number} segmentIndex - Speed Chart segment column to examine (1-12)
     * @returns {boolean} True if the combatant is capable of taking a turn
     */
    hasPhaseInSegment(segmentIndex) {
        if (!this.actor) return false;

        // 1. Traverse cross-generation document data layers to find the true Speed score
        const rawSource =
            this.actor._source?.system ||
            this.actor.system?._source ||
            this.actor.data?._source?.system ||
            this.actor.data?.system ||
            {};
        const spdObj =
            this.actor.system?.characteristics?.spd ||
            this.actor.data?.system?.characteristics?.spd ||
            rawSource.characteristics?.spd ||
            rawSource.data?.characteristics?.spd;

        const rawSpd = spdObj?.value ?? spdObj?.total ?? spdObj?.base ?? spdObj?.current ?? 2;

        // 2. ✅ RULES SECURITY OVERCAP BOUNDARY SHIELD:
        // If Speed is drained below 1, they have zero phases.
        // If Speed is aided past 12, clamp it to 12 as characters cannot act more than once per segment.
        if (rawSpd <= 0) return false;
        const clampedSpd = Math.min(12, rawSpd);

        // 3. Fall back to your existing speed chart array grid matrix lookup pass
        // (Ensure this array match variable matches the nomenclature of your codebase)
        const systemSpeedChart = CONFIG.HERO?.speedChart || {
            1: [7],
            2: [6, 12],
            3: [4, 8, 12],
            4: [3, 6, 9, 12],
            12: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        };

        const activePhases = systemSpeedChart[clampedSpd] || [];
        return activePhases.includes(segmentIndex);
    }
}
