import { HeroCompatibility } from "./utility/compatibility.mjs";

export class HeroSystem6eCombatSingle extends Combat {
    /**
     * Safe getter for the current active Segment.
     * Explicitly falls back to Segment 12 if combat has not yet begun,
     * or if the global system configuration isn't fully initialized yet.
     * @type {number}
     */
    get segment() {
        if (!game.system?.id) return 12;
        if (!this.started) return 12;
        return this.getFlag(game.system.id, "currentSegment") ?? 12;
    }

    /**
     * Dynamically filters and returns only the active combatants for the current segment.
     * This overrides the core behavior to align perfectly with the Hero System 6e Speed Chart.
     * @type {Combatant[]}
     * @override
     */
    get turns() {
        // Return a baseline empty array if document collections aren't ready
        if (!this.combatants) return [];

        const activeSegment = this.segment;

        // Filter down strictly to actors who act right now or are holding actions
        const filteredTurns = this.combatants.contents.filter((c) => {
            const hasPhase = c.hasPhaseInSegment ? c.hasPhaseInSegment(activeSegment) : false;
            const isHolding = c.actor?.statuses.has("holding") ?? false;
            return hasPhase || isHolding;
        });

        // Sort the active segment participants cleanly using your priority comparison calculations
        return filteredTurns.sort((a, b) => this._comparePriority(a, b, this, activeSegment));
    }

    /**
     * Generates or fetches a flat dictionary cache of 3d6 initiative tie-breaker rolls
     * specifically for the requested segment index window.
     * @param {number|string} targetSegment - The calendar segment to process (1-12)
     * @returns {Promise<Record<string, number>>} A flat mapping of { [combatantId]: 3d6RollTotal }
     * @protected
     */
    async _generateSegmentRollCache(targetSegment) {
        // 1. Fetch the multi-segment master data map from flags safely
        const masterRollsCache = this.getFlag(game.system.id, "segmentRolls") ?? {};

        // 2. HERO 6E RULE: If rolls already exist for this segment, preserve them to allow rewinding safely
        if (masterRollsCache[targetSegment]) {
            // FIX: Return ONLY the specific segment's flat dictionary window so turn loops read it correctly
            return masterRollsCache[targetSegment];
        }

        const newSegmentMap = {};

        // 3. Clean block-scoped loop simulating standard 3d6 dice outcomes efficiently
        for (const combatant of this.combatants) {
            // Simulate 3d6 by generating 3 random integers between 1 and 6
            const d1 = Math.floor(Math.random() * 6) + 1;
            const d2 = Math.floor(Math.random() * 6) + 1;
            const d3 = Math.floor(Math.random() * 6) + 1;

            newSegmentMap[combatant.id] = d1 + d2 + d3;
        }

        // 4. Update the local master reference before writing back to the database flag tree
        masterRollsCache[targetSegment] = newSegmentMap;

        // 5. Update the flag array on the document to persist the history
        await this.setFlag(game.system.id, "segmentRolls", masterRollsCache);

        // FIX: Return the flat dictionary window to ensure updatedRollsCache[combatant.id] parses flawlessly
        return newSegmentMap;
    }

    /**
     * Modern Foundry V14 comparison anchor method.
     * Explicitly binds the active document context to prevent execution crashes inside Array.sort().
     * @override
     */
    compareCombatants(a, b) {
        return this._sortCombatants(a, b, this);
    }

    /**
     * Legacy Foundry V13 sorting anchor method.
     * Coordinates phase and holding rules uniformly across both environments.
     * @override
     */
    _sortCombatants(a, b, combatDoc) {
        const parentCombat = combatDoc ?? this ?? a.combat;
        let currentSegment = 12;

        if (game.system?.id && parentCombat) {
            const isStarted = parentCombat.started ?? parentCombat.fields?.started ?? false;
            if (isStarted) {
                currentSegment = parentCombat.getFlag(game.system.id, "currentSegment") ?? 12;
            }
        }

        // ✅ CANONICAL SOLUTION FOR BOTH V13 & V14:
        // Core turns must sort purely by their dynamic initiative characteristics priority.
        // We remove the phase capability filtering step from the document model sorting block.
        // The sidebar tracker view handles filtering out characters who don't act,
        // while the data layer maintains a predictable, permanent initiative hierarchy.
        return parentCombat ? parentCombat._comparePriority(a, b, parentCombat, currentSegment) : 0;
    }

    /**
     * Compares the initiative priorities of two combatants dynamically.
     * Higher initiative scores take action first (descending order).
     * @param {Combatant} a - First combatant for comparison
     * @param {Combatant} b - Second combatant for comparison
     * @param {Combat} [combatDoc] - The parent combat document instance reference
     * @param {number} [targetSegment] - Optional future segment index context to evaluate under
     * @returns {number} Sorting weight integer
     * @protected
     */
    _comparePriority(a, b, combatDoc, targetSegment) {
        const parentCombat = combatDoc ?? this ?? a.combat;
        if (!parentCombat) return 0;

        const spdKey = "spd";
        const dexKey = "dex";
        const activeSegment = targetSegment ?? parentCombat.segment ?? 12;

        // 1. EXTRACT SPEED VALUES FOR DRAINS PROTECTION SHIELDS
        const spdA = a.actor?.system?.characteristics?.[spdKey]?.value ?? 2;
        const spdB = b.actor?.system?.characteristics?.[spdKey]?.value ?? 2;

        const aDrained = spdA <= 0;
        const bDrained = spdB <= 0;

        if (aDrained !== bDrained) {
            return aDrained ? 1 : -1; // Active characters sort BEFORE completely drained ones
        }

        // 2. CORE SYSTEM DYNAMIC INITIATIVE PRIORITY SCORING
        const priorityA = parentCombat.getInitiativePriority(a, activeSegment);
        const priorityB = parentCombat.getInitiativePriority(b, activeSegment);

        if (priorityA !== priorityB) {
            return priorityB - priorityA; // Descending order (highest initiative score acts first)
        }

        // 3. CANONICAL TIE-BREAKER: Sort by base DEX characteristic score
        const dexA = a.actor?.system?.characteristics?.[dexKey]?.value ?? 10;
        const dexB = b.actor?.system?.characteristics?.[dexKey]?.value ?? 10;

        if (dexA !== dexB) {
            return dexB - dexA; // Descending order (highest base DEX characteristic score acts first)
        }

        // Alphanumeric document registration ID string fallback anchor
        return a.id.localeCompare(b.id);
    }

    /**
     * Evaluates a combatant's precise initiative value including characteristic scores and offsets.
     * @param {Combatant} combatant - The participant document to calculate priority for
     * @param {number} [targetSegment] - Optional segment window context (defaults to active segment)
     * @returns {number} Comprehensive decimal initiative priority score
     */
    getInitiativePriority(combatant, targetSegment) {
        if (!combatant?.actor) return 0;

        const parentCombat = combatant.combat ?? this;
        const activeSegment = targetSegment ?? parentCombat?.segment ?? 12;
        const statuses = combatant.actor.statuses;

        if (statuses.has("aborted")) return 0;

        const actorDoc = combatant.actor;
        const characteristicKey = actorDoc.system?.initiativeCharacteristic ?? "dex";
        const characteristicObj = actorDoc.system?.characteristics?.[characteristicKey];

        // Read directly from the standard active system property fields configuration
        const baseScore = characteristicObj?.value ?? 10;

        const spdObj = actorDoc.system?.characteristics?.spd;
        const resolvedSpd = spdObj?.value ?? 2;

        const hasPhase = combatant.hasPhaseInSegment ? combatant.hasPhaseInSegment(activeSegment) : false;
        const isHolding = statuses.has("holding") ?? false;

        // Hero System Rule: Negative speeds or inactive actors score a priority of absolute 0
        if (resolvedSpd <= 0 || (!hasPhase && !isHolding)) {
            return 0;
        }

        const segmentRolls = parentCombat
            ? parentCombat.getFlag(game.system.id, "segmentRolls")?.[activeSegment] || {}
            : {};
        const tieBreakerRoll = segmentRolls[combatant.id] || 11;
        const tieBreakerFraction = (19 - tieBreakerRoll) * 0.01;

        let maneuverOffset = 0;
        if (statuses.has("holding")) {
            maneuverOffset = CONFIG.HERO?.combatManeuverOffsets?.heldAction ?? 100.0;
        } else if (statuses.has("haymaker")) {
            maneuverOffset = CONFIG.HERO?.combatManeuverOffsets?.haymaker ?? -3.0;
        } else if (statuses.has("delayedPhase")) {
            maneuverOffset = CONFIG.HERO?.combatManeuverOffsets?.delayedPhase ?? -5.0;
        }

        return baseScore + tieBreakerFraction + maneuverOffset;
    }

    /**
     * Re-compiles the internal 'this.turns' array to strictly include ONLY the actors
     * who possess a valid phase or are holding actions in the active calendar segment.
     * Implements cache invalidation logic safely for multi-client V13 architectures.
     * @override
     */
    setupTurns() {
        const compiledTurns = super.setupTurns();

        if (!HeroCompatibility.isV14) {
            this._turns = null; // Drops the legacy V13 array cache natively during data-prep passes
        }

        return compiledTurns;
    }

    /** @override */
    async startCombat() {
        console.log(`[${game.system.id}] Initializing Hero System Turn 1 at Segment 12...`);

        // Force explicit initialization override boundaries to shield legacy V13 clients from race conditions
        this._forceStartedSortingOverride = true;

        const startPayload = {
            round: 1,
            started: true,
        };
        startPayload[`flags.${game.system.id}.currentSegment`] = 12;
        startPayload[`flags.${game.system.id}.recoveredRounds`] = [];

        // Build the initial segment rolls cache dictionary inside a single atomic transaction payload
        const initialRolls = (await this._generateSegmentRollCache(12)) || {};
        startPayload[`flags.${game.system.id}.segmentRolls`] = initialRolls;

        // Compile embedded initiative updates mapping characteristic weights cleanly
        const combatantUpdates = [];
        this.combatants.forEach((combatant) => {
            combatantUpdates.push({
                _id: combatant.id,
                initiative: this.getInitiativePriority(combatant, 12),
            });
        });

        // ✅ CANONICAL ALL-VERSION STARTUP SIMULATION:
        // Create a shadow list mapping the exact data structure updates that the database will save.
        // We override the internal initiative properties in-memory so they can be sorted natively.
        const startTurns = this.combatants.map((c) => {
            const match = combatantUpdates.find((u) => u._id === c.id);
            const clone = Object.create(c);
            if (match) {
                Object.defineProperty(clone, "initiative", {
                    value: match.initiative,
                    writable: true,
                    configurable: true,
                });
            }
            return clone;
        });

        // Sort the simulated array using your system rules manually forced to evaluate under Segment 12
        startTurns.sort((a, b) => {
            return this._comparePriority(a, b, this, 12);
        });

        // Seek out the exact identity ID of the highest priority participant acting in Segment 12
        const targetActorDoc = startTurns.find((t) => {
            const acts = t.hasPhaseInSegment ? t.hasPhaseInSegment(12) : false;
            const holds = t.actor?.statuses.has("holding") ?? false;
            return acts || holds;
        });
        const targetCombatantId = targetActorDoc?.id || null;

        // Find exactly what index position our targeted actor will occupy in the final collection layout.
        // Both V13 and V14 handle 'this.turns' as an unfiltered collection sorted strictly by initiative priority.
        const absoluteStartTurnIndex = startTurns.findIndex((t) => t.id === targetCombatantId);

        // Write the perfect targeted start index directly into the master update dictionary payload
        startPayload.turn = absoluteStartTurnIndex !== -1 ? absoluteStartTurnIndex : 0;

        // Commit document data changes cleanly to database drivers
        const result = await HeroCompatibility.updateEmbedded(this, "combatants", combatantUpdates, startPayload);

        this._forceStartedSortingOverride = false;
        if (!HeroCompatibility.isV14) {
            this._turns = null; // Clear legacied memory matrices references safely
        }

        return result;
    }

    /**
     * Advance down the turn index loop, checking for fresh-phase held action overwrites.
     * @override
     */
    async nextTurn() {
        const allCombatants = this.combatants.contents;
        const turns = this.turns;
        const startIndex = (this.turn ?? -1) + 1;
        const activeSegment = this.segment;
        let targetIndex = -1;

        // 1. Scan remainder of the active segment array to find the next acting combatant
        for (let i = startIndex; i < turns.length; i++) {
            const candidate = turns[i];
            const hasPhase = candidate ? candidate.hasPhaseInSegment(activeSegment) : false;
            const isHolding = candidate?.actor?.statuses.has("holding") ?? false;

            if (hasPhase || isHolding) {
                targetIndex = i;
                break;
            }
        }

        // 2. Step straight to them if found inside the active segment window
        if (targetIndex !== -1) {
            return this.update({ turn: targetIndex });
        }

        // 3. Otherwise, nobody remains. Prepare chronological segment advancement.
        let nextSegment = activeSegment;
        let nextRoundCycle = this.round;
        let segmentDeltaCount = 0;
        const updateData = {};
        let segmentActorsFound = false;

        // Scan segments sequentially forward (up to a max rotation loop of 12 steps)
        for (let check = 1; check <= 12; check++) {
            nextSegment++;
            segmentDeltaCount++;
            if (nextSegment > 12) {
                nextSegment = 1;
                nextRoundCycle += 1;

                const roundToRecover = nextRoundCycle - 1;
                const recoveryApplied = await this._executePostSegment12Recovery(roundToRecover);
                if (recoveryApplied) {
                    const recoveredRounds = this.getFlag(game.system.id, "recoveredRounds") ?? [];
                    recoveredRounds.push(roundToRecover);
                    updateData[`flags.${game.system.id}.recoveredRounds`] = recoveredRounds;
                }
            }

            const foundActors = allCombatants.filter(
                (c) => c.hasPhaseInSegment(nextSegment) || (c.actor?.statuses.has("holding") ?? false),
            );
            if (foundActors.length > 0) {
                segmentActorsFound = true;
                break;
            }
        }

        if (!segmentActorsFound) return this;

        // 4. TRANSACTION BOUNDARY GENERATION: Cache tie-breakers for the upcoming segment
        const masterRollsCache = this.getFlag(game.system.id, "segmentRolls") ?? {};
        let updatedRollsCache = masterRollsCache[nextSegment];

        if (!updatedRollsCache) {
            updatedRollsCache = {};
            for (const combatant of this.combatants) {
                const d1 = Math.floor(Math.random() * 6) + 1;
                const d2 = Math.floor(Math.random() * 6) + 1;
                const d3 = Math.floor(Math.random() * 6) + 1;
                updatedRollsCache[combatant.id] = d1 + d2 + d3;
            }
            masterRollsCache[nextSegment] = updatedRollsCache;
        }
        updateData[`flags.${game.system.id}.segmentRolls`] = masterRollsCache;

        // 5. DETERMINING FIRST ACTIVE ACTOR SAFELY VIA IN-MEMORY SIMULATION
        let targetCombatantId = null;
        const upcomingActors = allCombatants.filter(
            (c) => c.hasPhaseInSegment(nextSegment) || (c.actor?.statuses.has("holding") ?? false),
        );

        if (upcomingActors.length > 0) {
            upcomingActors.sort((a, b) => {
                return this._comparePriority(a, b, this, nextSegment);
            });
            // ✅ FIXED TYPO: Removed the double question mark syntax error
            targetCombatantId = upcomingActors[0]?.id || null;
        }

        // --- GENERIC PHASE END EXPIRY PROCESSING FOR SEGMENT LEAPS ---
        const incomingCombatant = this.combatants.get(targetCombatantId);
        if (incomingCombatant?.actor?.statuses.has("aborted")) {
            const phaseEndEffects = incomingCombatant.actor.effects.filter((e) => e.duration?.expiry === "phaseEnd");
            for (const effect of phaseEndEffects) {
                HeroCompatibility.refreshActiveEffect(effect);
            }
        }

        // 6. COMPILE EMBEDDED CHILD DATA WITH RECALCULATED INITIATIVES
        const combatantUpdates = [];
        this.combatants.forEach((combatant) => {
            combatantUpdates.push({
                _id: combatant.id,
                initiative: this.getInitiativePriority(combatant, nextSegment),
            });
        });

        // 7. PERFECT PREDICTED FUTURE ARRAY SIMULATION USING TRUE INITIATIVE HIERARCHY:
        const recompiledTurns = this.combatants.map((c) => {
            const match = combatantUpdates.find((u) => u._id === c.id);
            const clone = Object.create(c);
            if (match) {
                Object.defineProperty(clone, "initiative", {
                    value: match.initiative,
                    writable: true,
                    configurable: true,
                });
            }
            return clone;
        });

        // Sort the simulated array exactly how your system's data-prep engine executes
        recompiledTurns.sort((a, b) => {
            return this._comparePriority(a, b, this, nextSegment);
        });

        const absoluteTargetTurnIndex = recompiledTurns.findIndex((t) => t.id === targetCombatantId);

        // 8. Populate master data object safely
        updateData.round = nextRoundCycle;
        updateData.turn = absoluteTargetTurnIndex !== -1 ? absoluteTargetTurnIndex : 0;
        updateData[`flags.${game.system.id}.currentSegment`] = nextSegment;

        // 9. Package options context parameters
        const updateOptions = { direction: 1, previousCombatantId: this.combatant?.id };
        if (segmentDeltaCount > 0) {
            updateOptions.worldTime = { delta: segmentDeltaCount };
        }

        // ✅ THE LOCAL LIFECYCLE MEMORY SYNC BRIDGE:
        // Forcefully invalidate the cached '_turns' registry reference array synchronously
        // right before the database transaction flushes. This instructs legacy V13 clients
        // to drop old memory matrices and evaluate the segment advancement natively.
        if (!HeroCompatibility.isV14) {
            this._turns = null;
        }

        // 10. Execute actual database modification flush
        return HeroCompatibility.updateEmbedded(this, "combatants", combatantUpdates, updateData, updateOptions);
    }

    /**
     * Step backwards up the turn index loop, checking for start-of-combat resets.
     * @override
     */
    async previousTurn() {
        // 1. CHECK START OF COMBAT BOUNDARY RESET
        // If we are at the very beginning of Turn 1 at Segment 12, reset to an unstarted state.
        if (this.round === 1 && this.segment === 12 && (this.turn ?? 0) === 0) {
            return this._handleCombatStartReset();
        }

        const turns = this.turns;
        const startIndex = (this.turn ?? 0) - 1;
        const activeSegment = this.segment; // Capture the true active segment window
        let targetIndex = -1;

        // 2. Scan backwards within the current segment window to find the previous actor
        // Only allow an in-array rewind if the preceding actor also has a phase in this EXACT segment.
        for (let i = startIndex; i >= 0; i--) {
            const candidate = turns[i];
            const hasPhase = candidate ? candidate.hasPhaseInSegment(activeSegment) : false;
            const isHolding = candidate?.actor?.statuses.has("holding") ?? false;

            if (hasPhase || isHolding) {
                targetIndex = i;
                break;
            }
        }

        // 3. If an actor was found earlier in the active segment, step directly back to them
        if (targetIndex !== -1) {
            return this.update({ turn: targetIndex });
        }

        // 4. Segment boundary crossed. Initialize step variables to scan chronologically backwards.
        let prevSegment = activeSegment;
        let prevRoundCycle = this.round;
        let segmentDeltaCount = 0;
        const updateData = {};
        let foundActors = [];

        // Scan segments sequentially backward (up to a max rotation loop of 12 steps)
        for (let check = 1; check <= 12; check++) {
            prevSegment--;
            segmentDeltaCount++; // Accumulate every calendar second wound backwards

            if (prevSegment < 1) {
                prevSegment = 12;
                prevRoundCycle = Math.max(1, prevRoundCycle - 1);
            }

            // Safeguard: If we drop below Turn 1, force a complete combat reset instead of entering an illegal state
            if (prevRoundCycle < 1) {
                return this._handleCombatStartReset();
            }

            // Filter all actors who act naturally or are holding an action in this preceding segment window
            foundActors = turns.filter(
                (t) => t.hasPhaseInSegment(prevSegment) || (t.actor?.statuses.has("holding") ?? false),
            );

            if (foundActors.length > 0) {
                break;
            }
        }

        // 5. Final fallback: If we scanned 12 segments backwards and found absolutely NO ONE active, reset to combat start.
        if (foundActors.length === 0 && prevRoundCycle === 1) {
            return this._handleCombatStartReset();
        }

        // 6. TRANSACTION BOUNDARY GENERATION: Fetch or build rolls cache for the preceding segment
        const updatedRollsCache = (await this._generateSegmentRollCache(prevSegment)) || {};
        updateData[`flags.${game.system.id}.segmentRolls`] = updatedRollsCache;

        // 7. DETERMINING INTENDED ACTOR SAFELY VIA IN-MEMORY SIMULATION
        let targetCombatantId = null;
        if (foundActors.length > 0) {
            foundActors.sort((a, b) => {
                const getProjPriority = (combatant) => {
                    if (!combatant?.actor) return 0;
                    if (combatant.actor.statuses.has("aborted")) return 0;

                    const chKey = combatant.actor.system.initiativeCharacteristic ?? "dex";
                    const base = combatant.actor.system?.characteristics?.[chKey]?.value || 0;

                    const rollValue = updatedRollsCache[combatant.id] || 11;
                    const fraction = (19 - rollValue) * 0.01;

                    let offset = 0;
                    const s = combatant.actor.statuses;
                    if (s.has("holding")) offset = CONFIG.HERO.combatManeuverOffsets.heldAction ?? 100.0;
                    else if (s.has("haymaker")) offset = CONFIG.HERO.combatManeuverOffsets.haymaker ?? -3.0;
                    else if (s.has("delayedPhase")) offset = CONFIG.HERO.combatManeuverOffsets.delayedPhase ?? -5.0;

                    return base + fraction + offset;
                };

                const pA = getProjPriority(a);
                const pB = getProjPriority(b);
                if (pA !== pB) return pB - pA;
                return (b.initiative || 0) - (a.initiative || 0);
            });

            // HERO RULE: When rewinding segments, we want to land on the LAST person who acts in that segment (lowest priority)
            targetCombatantId = foundActors[foundActors.length - 1]?.id || null;
        }

        // --- GENERIC PHASE END EXPIRY PROCESSING FOR REWIND LEAPS ---
        const incomingCombatant = this.combatants.get(targetCombatantId);
        if (incomingCombatant?.actor?.statuses.has("aborted")) {
            const phaseEndEffects = incomingCombatant.actor.effects.filter((e) => e.duration?.expiry === "phaseEnd");
            for (const effect of phaseEndEffects) {
                HeroCompatibility.refreshActiveEffect(effect);
            }
        }

        // 8. COMPILE EMBEDDED CHILD DATA WITH RECALCULATED INITIATIVES
        const combatantUpdates = [];
        this.combatants.forEach((combatant) => {
            const rollValue = updatedRollsCache[combatant.id] || 11;
            const chKey = combatant.actor?.system?.initiativeCharacteristic ?? "dex";
            const base = combatant.actor?.system?.characteristics?.[chKey]?.value || 0;

            let finalInitiative = base + (19 - rollValue) * 0.01;
            if (combatant.actor) {
                const s = combatant.actor.statuses;
                if (s.has("holding")) finalInitiative += CONFIG.HERO.combatManeuverOffsets.heldAction ?? 100.0;
                else if (s.has("haymaker")) finalInitiative += CONFIG.HERO.combatManeuverOffsets.haymaker ?? -3.0;
                else if (s.has("delayedPhase"))
                    finalInitiative += CONFIG.HERO.combatManeuverOffsets.delayedPhase ?? -5.0;
                if (s.has("aborted")) finalInitiative = 0;
            }

            combatantUpdates.push({
                _id: combatant.id,
                initiative: finalInitiative,
            });
        });

        // 9. PERMANENT FIX FOR SEGMENT REWIND TRACKING DESYNCHRONIZATION:
        // Locate the absolute target index position straight from the core master 'turns' list.
        // This perfectly matches how Foundry maps database turn integers during update flushes.
        const recompiledTurns = this.combatants.map((c) => {
            const match = combatantUpdates.find((u) => u._id === c.id);
            const clone = Object.create(c);
            if (match) {
                Object.defineProperty(clone, "initiative", { value: match.initiative, writable: true });
            }
            return clone;
        });

        recompiledTurns.sort((a, b) => {
            const aActs = a.hasPhaseInSegment(prevSegment) || (a.actor?.statuses.has("holding") ?? false);
            const bActs = b.hasPhaseInSegment(prevSegment) || (b.actor?.statuses.has("holding") ?? false);
            if (aActs !== bActs) return aActs ? -1 : 1;
            return (b.initiative || 0) - (a.initiative || 0);
        });

        const absoluteTargetTurnIndex = recompiledTurns.findIndex((t) => t.id === targetCombatantId);

        // 10. Populate master data object safely
        updateData.round = prevRoundCycle;
        updateData.turn = absoluteTargetTurnIndex !== -1 ? absoluteTargetTurnIndex : 0;
        updateData[`flags.${game.system.id}.currentSegment`] = prevSegment;

        // 11. Package options context parameters
        const updateOptions = { direction: -1, previousCombatantId: this.combatant?.id };
        if (segmentDeltaCount > 0) {
            updateOptions.worldTime = { delta: -segmentDeltaCount };
        }

        // Route updates through the version compatibility layer to support clean V14 arrays and V13 flat strings.
        return HeroCompatibility.updateEmbedded(this, "combatants", combatantUpdates, updateData, updateOptions);
    }

    /**
     * Advance the tracker forward by an entire Turn Cycle (12 Segments / 12 Seconds).
     * @override
     */
    async nextRound() {
        // 1. STATE GUARD: If combat hasn't started yet, forward execution straight to startup structures
        if (!this.started) return this.startCombat();

        const turns = this.turns;
        const currentRound = this.round;
        const currentSegment = this.segment;

        // 2. RECOVERY EXECUTION: Process recovery updates for the round we are completing
        await this._executePostSegment12Recovery(currentRound);

        // 3. FLAG MANAGEMENT: Append current round to history array atomically
        const recoveredRounds = this.getFlag(game.system.id, "recoveredRounds") ?? [];
        if (!recoveredRounds.includes(currentRound)) {
            recoveredRounds.push(currentRound);
        }

        // 4. CHRONOLOGICAL INCREMENT: Advance the round number while retaining the active segment index
        const nextRoundCycle = currentRound + 1;

        // 5. TURN POINTER RESOLUTION: Evaluate who should hold top priority in this current segment window
        const actorsInSegment = turns.filter((t) => t.hasPhaseInSegment(currentSegment));
        let targetTurnIndex = 0;

        if (actorsInSegment.length > 0) {
            // Sort using your internal system priority formula
            actorsInSegment.sort((a, b) => this._comparePriority(a, b));
            targetTurnIndex = turns.indexOf(actorsInSegment[0]);
        }

        // 6. DATA TRANSACTION PAYLOAD: Bundle properties cleanly
        const updateData = {
            round: nextRoundCycle,
            turn: targetTurnIndex !== -1 ? targetTurnIndex : 0,
            [`flags.${game.system.id}.recoveredRounds`]: recoveredRounds,
        };

        // 7. CONTEXT PARAMETERS: Let core handle standard time delta calculations automatically
        const updateOptions = {
            direction: 1,
            previousCombatantId: this.combatant?.id,
        };

        // 8. DATABASE COMMIT: Execute mutation through your compatibility bridge
        // Note: Passing an empty array [] to updateEmbedded under V14 is safe when the collection
        // update is a complete no-op, but since no combatant values are changing, we pass an empty array.
        return HeroCompatibility.updateEmbedded(this, "combatants", [], updateData, updateOptions);
    }

    /**
     * Rewind the tracker backward by an entire Turn Cycle (12 Segments / 12 Seconds).
     * @override
     */
    async previousRound() {
        // 1. HERO 6E BOUNDARY CHECK
        // Reset combat if we are on Turn 1, OR if we are on Turn 2 but haven't completed a full cycle yet
        // (Jumping backward 12 seconds from Turn 2, Segment 1-11 would push the timeline before Turn 1 Segment 12).
        if (this.round === 1 || (this.round === 2 && this.segment < 12)) {
            return this._handleCombatStartReset();
        }

        const turns = this.turns;
        const currentRound = this.round;
        const currentSegment = this.segment;

        // 2. CHRONOLOGICAL REWIND: Calculate the prior turn cycle number (clamped safely to a minimum of 1)
        const prevRoundCycle = Math.max(1, currentRound - 1);

        // 3. TURN POINTER RESOLUTION: Figure out who holds top priority in this same segment in the prior turn cycle
        const actorsInSegment = turns.filter((t) => t.hasPhaseInSegment(currentSegment));
        let targetTurnIndex = 0;

        if (actorsInSegment.length > 0) {
            // Sort using your internal system priority formula
            actorsInSegment.sort((a, b) => this._comparePriority(a, b));
            targetTurnIndex = turns.indexOf(actorsInSegment[0]);
        }

        // 4. DATA TRANSACTION PAYLOAD: Segment index stays exactly the same
        const updateData = {
            round: prevRoundCycle,
            turn: targetTurnIndex !== -1 ? targetTurnIndex : 0,
        };

        // 5. CONTEXT PARAMETERS: Let core handle standard time delta tracking automatically
        const updateOptions = {
            direction: -1,
            previousCombatantId: this.combatant?.id,
        };

        // 6. DATABASE COMMIT: Execute mutation through your compatibility bridge
        // Passing an empty array [] to updateEmbedded under V14 is completely fine since
        // no child combatant records are modified in this block.
        return HeroCompatibility.updateEmbedded(this, "combatants", [], updateData, updateOptions);
    }

    /**
     * Completely resets custom system flags and child initiative fields,
     * dropping the encounter state machine back onto the "Start Combat" panel.
     * @returns {Promise<HeroCombat>}
     * @private
     */
    async _handleCombatStartReset() {
        ui.notifications.info(`[${game.system.id}] Resetting combat encounter to default startup state.`);

        // 1. Prepare child collection updates to reset initiatives back to null (dice icons)
        const combatantUpdates = [];
        this.combatants.forEach((combatant) => {
            combatantUpdates.push({
                _id: combatant.id,
                initiative: null,
            });
        });

        // 2. Prepare the clean top-level metadata values
        const resetData = {
            started: false,
            round: 0,
            turn: null,
        };

        // 3. Purge dynamic system flags safely using a structured object block
        // This format ensures inner key macros handle deletions smoothly across database iterations
        resetData[`flags.${game.system.id}`] = {
            "-=currentSegment": null,
            "-=segmentRolls": null,
            "-=recoveredRounds": null,
        };

        // 4. Update parent properties and children simultaneously through your compatibility bridge
        return HeroCompatibility.updateEmbedded(this, "combatants", combatantUpdates, resetData);
    }

    /**
     * Processes recovery calculations and returns true if an update was committed.
     * @param {number} roundToRecover
     * @returns {Promise<boolean>}
     * @private
     */
    async _executePostSegment12Recovery(roundToRecover) {
        // 1. ENVIRONMENT BRIDGE: Use isGM to safely pass cross-version referee checks
        if (!game.user.isGM) return false;

        const recoveredRounds = this.getFlag(game.system.id, "recoveredRounds") ?? [];
        if (recoveredRounds.includes(roundToRecover)) {
            await ChatMessage.create({
                flavor: `<strong>[${game.system.id.toUpperCase()}] Post-Segment 12 Recovery (Turn ${roundToRecover})</strong>`,
                content: `<em>Recovery cycle skipped (Already applied).</em>`,
            });
            return false;
        }

        const updates = [];

        // 2. SCHEMA EXTRACTION: Loop through participants to determine value changes
        for (const combatant of this.combatants) {
            const actor = combatant.actor;
            if (!actor) continue;

            const characteristics = actor.system?.characteristics;
            const rec = characteristics?.rec?.value || 0;
            const stun = characteristics?.stun || { value: 0, max: 0 };
            const end = characteristics?.end || { value: 0, max: 0 };

            // If the actor is already fully healed, skip them safely
            if (stun.value >= stun.max && end.value >= end.max) continue;

            const newStun = Math.min(stun.max, stun.value + rec);
            const newEnd = Math.min(end.max, end.value + rec);

            // FIX: Build structural schema objects to ensure maximum database compatibility
            updates.push({
                _id: actor.id,
                system: {
                    characteristics: {
                        stun: { value: newStun },
                        end: { value: newEnd },
                    },
                },
            });
        }

        // 3. DATABASE COMMIT BOUNDARY: Bulk update the documents safely
        if (updates.length > 0) {
            // Actor.updateDocuments accepts clean structured objects across both V13 and V14
            await Actor.updateDocuments(updates);
        }

        await ChatMessage.create({
            flavor: `<strong>[${game.system.id.toUpperCase()}] Post-Segment 12 Recovery (Turn ${roundToRecover})</strong>`,
            content: `<em>Recovery processing complete. Resources adjusted for active participants.</em>`,
        });

        return true;
    }

    /**
     * Post-database update handler. Executes on all clients when combat values change.
     * @override
     */
    _onUpdate(changed, options, userId) {
        super._onUpdate(changed, options, userId);

        // 1. ENVIRONMENT BRIDGE: Use isGM to safely pass cross-version referee checks
        if (!game.user.isGM) return;

        const turnChanged = changed.turn !== undefined;
        const roundChanged = changed.round !== undefined;

        // 2. STABLE FLAG EVALUATION: Check for flag changes using version-agnostic lookup utilities
        // This safely catches both V14 nested objects and V13 flattened dotted path strings
        const systemFlagKey = `flags.${game.system.id}`;
        const flagsChanged = foundry.utils.hasProperty(changed, systemFlagKey);

        // If neither the phase pointers nor the custom segment properties updated, exit early
        if (!turnChanged && !roundChanged && !flagsChanged) return;

        // 3. SECURE OPTION ACQUISITION: Safely resolve the previous actor target parameter
        // Fall back gracefully to standard core navigation trackers if options are stripped over network sockets
        const prevId = foundry.utils.getProperty(options, "previousCombatantId");
        const previousCombatant = prevId ? this.combatants.get(prevId) : null;

        if (!previousCombatant?.actor) return;

        // Execute status tracking cleanup safely inside a clean variable scope
        this._maintainTacticalStatuses(previousCombatant);
    }

    /**
     * Evaluates action economies and removes spent tactical statuses post-turn.
     * @param {Combatant} combatant
     * @private
     */
    async _maintainTacticalStatuses(combatant) {
        if (!combatant?.actor) return;

        const statuses = combatant.actor.statuses;
        const currentSegment = this.segment;

        // ─── HERO 6E RULE: EXPIRE HELD ACTION POST-TURN ───
        // If they concluded their turn, and this segment matches their natural speed-chart phase,
        // their held action is officially consumed/expired.
        if (statuses.has("holding") && combatant.hasPhaseInSegment(currentSegment)) {
            const holdingEffect = combatant.actor.effects.find((e) => e.statuses.has("holding"));

            if (holdingEffect) {
                // FIX: Completely dropped explicit .delete() in favor of your core expiry abstraction manager
                HeroCompatibility.refreshActiveEffect(holdingEffect);

                await ChatMessage.create({
                    speaker: ChatMessage.getSpeaker({ actor: combatant.actor }),
                    flavor: `<strong>[${game.system.id.toUpperCase()}] Action Economy Notice</strong>`,
                    content: `<em>${combatant.actor.name}'s Held Action was consumed by their natural Phase in Segment ${currentSegment}.</em>`,
                });
            }
        }

        // FIX: Prepended await to ensure custom system phaseEnd loops execute sequentially
        // This blocks time desynchronization across server clients during fast turn updates
        await this._expireCustomSystemEffects(combatant.actor);
    }

    /**
     * Scans a combatant's actor sheet and auto-expires matching active effect keys
     * tracked inside the global HERO configuration dictionary.
     * @param {Actor} actor
     * @private
     */
    async _expireCustomSystemEffects(actor) {
        if (!actor) return;

        // 1. CONFIG CHECK: Gather your custom keys directly out of the configuration definition object
        const expiryEvents = CONFIG.HERO?.activeEffectExpiryEvents;
        if (!expiryEvents) return;
        const customSystemKeys = Object.keys(expiryEvents);

        // 2. FILTER PASS: Locate any active effects currently matching your system keys
        const matchingEffects = actor.effects.filter((effect) => {
            const activeExpiryKey = effect.duration?.expiry;
            return customSystemKeys.includes(activeExpiryKey);
        });

        if (matchingEffects.length === 0) return;

        // 3. SAFE VERSION CONFIGURATION RESOLUTION: Pull V14 data parameters without crashing V13 runtimes
        // Uses getProperty to safely return undefined on V13 instead of generating a TypeError
        const defaultExpiryAction = HeroCompatibility.isV14 ? "disable" : "delete";
        const expiryAction = foundry.utils.getProperty(CONFIG, "ActiveEffect.expiryAction") ?? defaultExpiryAction;

        const effectsToDelete = [];
        const updatesToApply = [];

        // 4. GROUP SEGMENT MATRIX: Group effects based on your global settings matrix
        for (const effect of matchingEffects) {
            const activeExpiryKey = effect.duration?.expiry;

            if (activeExpiryKey === "phaseEnd") {
                if (expiryAction === "delete") {
                    effectsToDelete.push(effect.id);
                } else {
                    // If the action is disable, change its core disabled property boolean value to true
                    if (effect.statuses?.size > 0) {
                        // Aborted or marked actions get forced deletion rules
                        effectsToDelete.push(effect.id);
                    } else {
                        updatesToApply.push({
                            _id: effect.id,
                            disabled: true,
                        });
                    }
                }
            }
        }

        // 5. ATOMIC BATCH OPERATION COMMITS
        // Satisfies V14 canonical layout rules while remaining fully backwards compatible
        if (effectsToDelete.length > 0) {
            await actor.deleteEmbeddedDocuments("ActiveEffect", effectsToDelete);
        }

        if (updatesToApply.length > 0) {
            // In V14, updateEmbeddedDocuments accepts the update array natively.
            // In V13, it flattens standard objects correctly.
            await actor.updateEmbeddedDocuments("ActiveEffect", updatesToApply);
        }
    }

    /**
     * Recalculates and flushes initiative values for all combatants.
     * Employs the HeroCompatibility adapter to bridge V14 array styles safely with V13 clients.
     * @returns {Promise<Document>} The updated parent Combat document instance
     */
    async updateCodeInitiatives() {
        const combatantUpdates = [];

        // 1. Scoped iteration to build clean child document delta data structures
        this.combatants.forEach((combatant) => {
            combatantUpdates.push({
                _id: combatant.id,
                initiative: this.getInitiativePriority(combatant),
            });
        });

        // 2. Safely commit updates using your compatibility bridge.
        // This provides clean V14 collection arrays natively and falls back to flat string properties in V13.
        return HeroCompatibility.updateEmbedded(this, "combatants", combatantUpdates);
    }
}
