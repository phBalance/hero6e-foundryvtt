import { HeroCompatibility } from "./utility/compatibility.mjs";
import { HeroSystem6eCombatantSingle } from "./combatant-single.mjs";
import { HeroSystem6eActorActiveEffects } from "./actor/actor-active-effects.mjs";
import { expireManeuverNextPhaseEffects } from "./item/maneuver.mjs";
import { userInteractiveVerifyOptionallyPromptThenSpendResources } from "./item/item-resources.mjs";
import { promptToDeleteAoeInstantRegions } from "./combat.mjs";
import { expireEffects, gmActive, toHHMMSS, whisperUserTargetsForActor } from "./utility/util.mjs";

export class HeroSystem6eCombatSingle extends Combat {
    /**
     * Safe getter for the current active Segment.
     * Pulls strictly from database flags to guarantee multi-client synchronization.
     * @type {number}
     */
    get segment() {
        if (!game.system?.id) return 12;
        if (!this.started) return 12;
        return this.getFlag(game.system.id, "currentSegment") ?? 12;
    }

    /**
     * The current combat position for chat cards, e.g. "Segment 4 of Turn 2".
     * @type {string}
     */
    get currentPhaseLabel() {
        return HeroSystem6eCombatantSingle.phaseLabel(
            HeroSystem6eCombatantSingle.absoluteSegment(this.round, this.segment),
        );
    }

    /* -------------------------------------------- */
    /*  Combat event ledger                         */
    /* -------------------------------------------- */

    /**
     * Append-only audit log of what happened in this combat, stored as an object
     * flag keyed by zero-padded sequence (`e000042`) so each append writes a single
     * flag path (tiny socket diffs) — a flag ARRAY would be replaced wholesale on
     * every write. Events are generic envelopes so the log can grow into a full
     * audit record (actions, damage, resources):
     *
     *   { t, abs, round, segment, ts, userId,
     *     combatantId?, actorId?, name?, img?, priority?,   // denormalized snapshot
     *     data? }
     *
     * The name/img/priority snapshot lets the tracker render history rows for
     * combatants that have since been removed. Rewinds APPEND a `rewind` event;
     * history is never deleted by turn flow — the log lives and dies with the
     * combat document (End Combat deletes it; a rewind past the start purges it).
     */

    /**
     * Whether this combat has recorded any ledger events.
     * @type {boolean}
     */
    get hasLedger() {
        const log = this.getFlag(game.system.id, "eventLog");
        return !!log && Object.keys(log).length > 0;
    }

    /**
     * Assembles a ledger event envelope at the current combat position.
     * @param {string} type - Namespaced event type, e.g. "hold.use"
     * @param {object} [options]
     * @param {Combatant} [options.combatant] - Subject; snapshots id/name/img/priority
     * @param {number} [options.priority] - Overrides the snapshotted priority
     * @param {object} [options.data] - Type-specific payload
     * @returns {object}
     */
    buildEvent(type, { combatant = null, priority = null, data = undefined, abs = null } = {}) {
        // Events describing a position being committed (pointer moves) pass the
        // TARGET abs; the document still reads the pre-update position here
        const eventAbs = abs ?? HeroSystem6eCombatantSingle.absoluteSegment(this.round, this.segment);
        const event = {
            t: type,
            abs: eventAbs,
            round: HeroSystem6eCombatantSingle.roundOf(eventAbs),
            segment: HeroSystem6eCombatantSingle.segmentOf(eventAbs),
            ts: game.time.worldTime,
            userId: game.user.id,
        };
        if (combatant) {
            event.combatantId = combatant.id;
            event.actorId = combatant.actorId ?? null;
            event.name = combatant.name ?? combatant.actor?.name ?? null;
            event.img = combatant.img ?? combatant.actor?.img ?? null;
            if (combatant.hidden) event.hidden = true;
            event.priority = priority ?? this.getInitiativePriority(combatant, event.segment, { queryAbs: event.abs });
        } else if (priority !== null) {
            event.priority = priority;
        }
        if (data !== undefined) event.data = data;
        return event;
    }

    /**
     * Allocates monotonic event sequence numbers. The cursor rides ahead of the
     * persisted eventLogSeq flag so several payloads built before any of them
     * commit still get distinct keys (only the GM client writes the log).
     * @param {number} count
     * @returns {number} First allocated sequence number
     * @private
     */
    _allocateEventSeqs(count) {
        const persistedNext = this.getFlag(game.system.id, "eventLogSeq") ?? 0;
        this._eventSeqCursor = Math.max(this._eventSeqCursor ?? 0, persistedNext);
        const start = this._eventSeqCursor;
        this._eventSeqCursor += count;
        return start;
    }

    /**
     * Builds the flag-path fragment that appends the given events, for inlining
     * into an update payload that is being committed anyway (pointer moves) —
     * atomic with the move and no extra round-trips.
     * @param {object[]} events
     * @returns {Record<string, object|number>}
     */
    eventLogAppendPayload(events) {
        if (!events?.length) return {};
        const start = this._allocateEventSeqs(events.length);
        const payload = {};
        events.forEach((event, i) => {
            const seq = start + i;
            payload[`flags.${game.system.id}.eventLog.e${String(seq).padStart(6, "0")}`] = { seq, ...event };
        });
        payload[`flags.${game.system.id}.eventLogSeq`] = start + events.length;
        return payload;
    }

    /**
     * Appends events to the combat ledger. Non-GM clients relay through the GM
     * (players cannot write combat flags). The log is never pruned — it lives
     * and dies with the combat document (deleted on End Combat; purged by a
     * rewind past the start).
     * @param {object[]} events
     * @returns {Promise<void>}
     */
    async logEvents(events) {
        if (!events?.length) return;
        if (!game.user.isGM) {
            this._requestGmTurnAction("logCombatEvent", { events });
            return;
        }
        await this.update(this.eventLogAppendPayload(events));
    }

    /**
     * Appends a single event to the combat ledger.
     * @param {string} type
     * @param {object} [options] - See {@link buildEvent}
     * @returns {Promise<void>}
     */
    async logEvent(type, options = {}) {
        return this.logEvents([this.buildEvent(type, options)]);
    }

    /**
     * Reads ledger events, oldest first.
     * @param {object} [options]
     * @param {number} [options.fromAbs] - Only events at or after this absolute segment
     * @param {number} [options.toAbs] - Only events at or before this absolute segment
     * @param {string[]} [options.types] - Only these event types
     * @returns {object[]}
     */
    getEventLog({ fromAbs = null, toAbs = null, types = null } = {}) {
        const log = this.getFlag(game.system.id, "eventLog") ?? {};
        return Object.values(log)
            .filter((event) => {
                if (fromAbs !== null && (event.abs ?? 0) < fromAbs) return false;
                if (toAbs !== null && (event.abs ?? 0) > toAbs) return false;
                if (types && !types.includes(event.t)) return false;
                return true;
            })
            .sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0));
    }

    /**
     * What actually happened in a past segment, assembled from the ledger: one row
     * per acting combatant with the position they acted at, using the denormalized
     * snapshot so rows survive combatant deletion. Returns null when the ledger has
     * nothing for that segment (pre-ledger combats fall back to live computation).
     * @param {number} abs
     * @returns {{combatantId: string|null, actorId: string|null, name: string, img: string|null,
     *            priority: number, kind: string, detail: string|null}[]|null}
     */
    historyRowsForSegment(abs) {
        if (!this.hasLedger) return null;
        const rows = new Map();
        const kindRank = { acted: 0, haymaker: 1, "held-forfeit": 2, "held-used": 3, aborted: 4 };
        const addRow = (event, kind, { priority = null, detail = null } = {}) => {
            if (!event.combatantId && !event.actorId) return;
            const key = event.combatantId ?? event.actorId;
            const row = {
                combatantId: event.combatantId ?? null,
                actorId: event.actorId ?? null,
                name: event.name ?? "Unknown",
                img: event.img ?? null,
                hidden: !!event.hidden,
                priority: priority ?? event.priority ?? 0,
                kind,
                detail,
            };
            const existing = rows.get(key);
            if (!existing || (kindRank[kind] ?? 0) >= (kindRank[existing.kind] ?? 0)) rows.set(key, row);
        };

        let sawSegment = false;
        for (const event of this.getEventLog()) {
            const atAbs = event.abs === abs;
            if (atAbs) sawSegment = sawSegment || ["turn.start", "segment.start", "round.start"].includes(event.t);
            switch (event.t) {
                case "turn.start":
                    if (atAbs) addRow(event, "acted");
                    break;
                case "hold.use":
                    if (atAbs) addRow(event, "held-used");
                    break;
                case "hold.demote":
                case "hold.forfeit":
                case "hold.release":
                    if (atAbs) addRow(event, "held-forfeit");
                    break;
                case "abort.declare":
                    // The consumed Phase renders in the segment it was spent from
                    if (event.data?.spentAbs === abs) {
                        addRow(event, "aborted", { detail: event.data?.toAction ?? null });
                    }
                    break;
                case "haymaker.resolve":
                    if (atAbs) addRow(event, "haymaker");
                    break;
            }
        }
        if (!sawSegment && rows.size === 0) return null;
        return [...rows.values()].sort((a, b) => b.priority - a.priority);
    }

    /**
     * Rolls a tie-break entry for one combatant: a 0-99 roll, plus a Fast Draw
     * roll when the actor owns the FAST_DRAW skill (the GM-option tie-break, 6E2 19).
     * @param {Combatant} combatant
     * @returns {{r: number, fd: number|null}}
     * @protected
     */
    _rollTieBreak(combatant) {
        const hasFastDraw = !!combatant.actor?.items.find((i) => i.system?.XMLID === "FAST_DRAW");
        return {
            r: Math.floor(Math.random() * 100),
            fd: hasFastDraw ? Math.floor(Math.random() * 100) : null,
        };
    }

    /**
     * Resolves a stored tie-break entry to the initiative fraction. With the
     * fastDrawTieBreak setting on, Fast Draw owners always outrank non-owners at
     * the same DEX (their fraction lives in the upper half) and compare fd rolls
     * among themselves. Scalar entries from older combats read as plain rolls.
     * @param {{r: number, fd: number|null}|number|undefined} rollEntry
     * @returns {number} 0..0.99
     * @protected
     */
    _tieBreakerFraction(rollEntry) {
        const entry = typeof rollEntry === "number" ? { r: rollEntry, fd: null } : (rollEntry ?? { r: 50, fd: null });
        let fastDraw = false;
        try {
            fastDraw = !!game.settings.get(game.system.id, "fastDrawTieBreak");
        } catch (e) {
            console.warn(`Unable to read the Fast Draw tie-break setting`, e);
        }
        if (!fastDraw) return (entry.r ?? 50) * 0.01;
        if (entry.fd !== null && entry.fd !== undefined) return 0.5 + entry.fd * 0.0049;
        return (entry.r ?? 50) * 0.0049;
    }

    /**
     * Rolls fresh tie-breaker entries for every combatant. Rolls are keyed by
     * root actor id so every token of the same base actor shares one roll and
     * therefore ties on the same DEX, letting the tracker group them.
     * @returns {Record<string, {r: number, fd: number|null}>}
     * @protected
     */
    _buildSegmentRollMap() {
        const newSegmentMap = {};
        for (const combatant of this.combatants) {
            const rollKey = this._tieRollKey(combatant);
            newSegmentMap[rollKey] ??= this._rollTieBreak(combatant);
            // Per-member sub-roll: members of a shared entry shuffle within the
            // group's position each segment (6E2 18)
            (newSegmentMap[rollKey].m ??= {})[combatant.tokenId || combatant.id] ??= Math.floor(Math.random() * 100);
        }
        return newSegmentMap;
    }

    /**
     * Generates or fetches the tie-breaker roll map for an absolute segment. Maps
     * are keyed by ABSOLUTE segment so ties re-roll every Turn (6E2 18: tied
     * characters roll off per Segment) while rewinds within recorded history
     * reuse the original rolls.
     * @param {number|string} targetAbs - Absolute segment (round*12+segment)
     * @returns {Promise<Record<string, {r: number, fd: number|null}>>}
     * @protected
     */
    async _generateSegmentRollCache(targetAbs) {
        // 1. Fetch the multi-segment master data map from flags safely
        const masterRollsCache = this.getFlag(game.system.id, "segmentRolls") ?? {};

        // 2. If rolls already exist for this position, preserve them to allow rewinding safely
        if (masterRollsCache[targetAbs]) {
            return masterRollsCache[targetAbs];
        }

        const newSegmentMap = this._buildSegmentRollMap();

        // 3. Update the local master reference before writing back to the database flag tree
        masterRollsCache[targetAbs] = newSegmentMap;

        // 4. Persist, with a ledger record of the fresh tie-break rolls
        const payload = { [`flags.${game.system.id}.segmentRolls`]: masterRollsCache };
        if (this.started && game.user.isGM) {
            Object.assign(
                payload,
                this.eventLogAppendPayload([
                    this.buildEvent("tie.roll", {
                        abs: Number(targetAbs) || undefined,
                        data: { rolls: newSegmentMap },
                    }),
                ]),
            );
        }
        await this.update(payload);

        return newSegmentMap;
    }

    /**
     * Final sort tiebreak, stable across delete-and-re-add: combatant ids change on
     * re-creation, so equal-priority pairs would silently flip order. Token (or
     * actor) identity persists; the id compare stays only as the total-order
     * backstop for tokenless duplicates.
     * @param {Combatant} a
     * @param {Combatant} b
     * @returns {number}
     */
    static stableTiebreak(a, b) {
        const keyA = a.tokenId || a.actorId || a.id;
        const keyB = b.tokenId || b.actorId || b.id;
        return keyA.localeCompare(keyB) || a.id.localeCompare(b.id);
    }

    /**
     * The key a combatant's tie-break roll is stored under. Tokens of the same
     * base actor share one roll (and therefore group in the tracker) unless the
     * combatant has been split out of its group with the soloTieRoll flag.
     * @param {Combatant} combatant
     * @returns {string}
     */
    _tieRollKey(combatant) {
        if (game.system?.id && combatant.getFlag?.(game.system.id, "soloTieRoll")) {
            return `solo:${combatant.tokenId || combatant.id}`;
        }
        return combatant.actorId || combatant.id;
    }

    /**
     * The combatant's per-member sub-roll within its shared roll entry, or null.
     * @param {Combatant} combatant
     * @param {object} rollsMap - One absolute segment's roll map
     * @returns {number|null}
     * @private
     */
    _memberSubRoll(combatant, rollsMap) {
        const entry = rollsMap?.[this._tieRollKey(combatant)];
        if (!entry || typeof entry === "number") return null;
        return entry.m?.[combatant.tokenId || combatant.id] ?? null;
    }

    /**
     * Equal-priority ordering. Members sharing a roll entry (a ×N group) shuffle
     * per segment via their sub-rolls — the same 6E2 18 roll-off ungrouped tied
     * combatants get — highest first; everything else (and missing rolls) falls
     * back to the re-add-stable identity compare.
     * @param {Combatant} a
     * @param {Combatant} b
     * @param {number|null} [queryAbs] - Position being ordered; defaults to current
     * @returns {number}
     */
    tieBreakOrder(a, b, queryAbs = null) {
        const keyA = this._tieRollKey(a);
        const keyB = this._tieRollKey(b);
        // Different roll groups tied on the same priority order by GROUP first.
        // This keeps the comparator TRANSITIVE: mixing per-member sub-roll order
        // (inside a group) with identity order (against outsiders) allowed
        // m2 < m1 < U < m2 cycles when an outsider's fraction collided with a
        // group's — Array.sort went unstable and nextTurn's tie re-admission
        // bounced the pointer between the group and the outsider forever.
        if (keyA !== keyB) {
            return keyA.localeCompare(keyB) || HeroSystem6eCombatSingle.stableTiebreak(a, b);
        }
        const abs = queryAbs ?? HeroSystem6eCombatantSingle.absoluteSegment(this.round, this.segment);
        const rollsFlag = this.getFlag(game.system.id, "segmentRolls") ?? {};
        const rollsMap = rollsFlag[abs] ?? rollsFlag[HeroSystem6eCombatantSingle.segmentOf(abs)] ?? {};
        const subA = this._memberSubRoll(a, rollsMap);
        const subB = this._memberSubRoll(b, rollsMap);
        if (subA !== null && subB !== null && subA !== subB) return subB - subA;
        return HeroSystem6eCombatSingle.stableTiebreak(a, b);
    }

    /**
     * Ensures every combatant has a roll entry (and a member sub-roll) in every
     * recorded map — newcomers, split/rejoined members, and re-adds otherwise
     * sort at defaults. Mutates the passed cache.
     * @param {object} masterRollsCache
     * @param {Combatant[]|Collection} [combatants]
     * @returns {boolean} Whether anything was added
     * @private
     */
    _backfillTieRolls(masterRollsCache, combatants = this.combatants) {
        let dirty = false;
        for (const rollsMap of Object.values(masterRollsCache)) {
            if (typeof rollsMap !== "object" || rollsMap === null) continue;
            for (const combatant of combatants) {
                const rollKey = this._tieRollKey(combatant);
                let entry = rollsMap[rollKey];
                if (typeof entry === "number") continue; // legacy scalar: leave as-is
                if (entry === undefined) {
                    rollsMap[rollKey] = entry = this._rollTieBreak(combatant);
                    dirty = true;
                }
                const memberKey = combatant.tokenId || combatant.id;
                entry.m ??= {};
                if (entry.m[memberKey] === undefined) {
                    entry.m[memberKey] = Math.floor(Math.random() * 100);
                    dirty = true;
                }
            }
        }
        return dirty;
    }

    /**
     * Splits a combatant out of (or rejoins it to) its same-actor ×N group by
     * giving it an independent tie-break roll. GM bookkeeping: the backfill and
     * ledger writes are combat-flag updates players cannot commit.
     * @param {string} combatantId
     * @param {boolean} solo
     * @returns {Promise<void>}
     */
    async setCombatantSoloTieRoll(combatantId, solo) {
        if (!game.user.isGM) return;
        const combatant = this.combatants.get(combatantId);
        if (!combatant) return;

        if (solo) await combatant.setFlag(game.system.id, "soloTieRoll", true);
        else await combatant.unsetFlag(game.system.id, "soloTieRoll");

        if (!this.started) {
            this.collection.render();
            return;
        }

        // Backfill the member's (new) roll key into every recorded map so it
        // doesn't sort at the +0.50 default
        const masterRollsCache = foundry.utils.deepClone(this.getFlag(game.system.id, "segmentRolls") ?? {});
        const activeId = this.combatant?.id ?? null;
        const payload = {};
        if (this._backfillTieRolls(masterRollsCache, [combatant])) {
            payload[`flags.${game.system.id}.segmentRolls`] = masterRollsCache;
        }
        Object.assign(
            payload,
            this.eventLogAppendPayload([this.buildEvent(solo ? "group.split" : "group.rejoin", { combatant })]),
        );
        await this.update(payload);

        // Mid-segment priority change: refresh changed initiatives and keep the
        // pointer on the active combatant (actingPriority deliberately untouched)
        const updates = this.combatants
            .map((c) => ({ _id: c.id, initiative: this.getInitiativePriority(c, this.segment) }))
            .filter((u) => this.combatants.get(u._id)?.initiative !== u.initiative);
        if (updates.length > 0) await this.updateEmbeddedDocuments("Combatant", updates);
        await this.resyncTurnPointer(activeId);
        await this._combatCard(
            combatant,
            solo
                ? `${combatant.name} acts separately from their group (own tie-break rolls).`
                : `${combatant.name} rejoins their group.`,
        );
    }

    /**
     * HERO rolls no initiative in this tracker: priorities derive from DEX + the
     * per-segment tie-break rolls. Core's roll paths (row d20, Roll All/NPCs,
     * macros, modules) would otherwise write the raw formula over them.
     * @override
     */
    async rollInitiative() {
        return this;
    }

    /** @override */
    async rollAll() {
        return this;
    }

    /** @override */
    async rollNPC() {
        return this;
    }

    /**
     * Modern Foundry V14 comparison anchor method.
     * @override
     */
    compareCombatants(a, b) {
        return this._sortCombatants(a, b, this);
    }

    /**
     * Legacy Foundry V13 sorting anchor method.
     * Coordinates descending initiative priorities uniformly across both environments.
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

        if (!parentCombat) return 0;

        // ✅ THE STRUCTURAL MULTIPLAYER ALIGNMENT:
        // Force active segment phase capability evaluation directly into the core sorting block.
        // Inactive combatants are pushed to the bottom of the array configuration loop natively.
        // This perfectly matches the true array layout order across all connected player clients.
        const aEligible = a.occupiesSegment?.(currentSegment) ?? false;
        const bEligible = b.occupiesSegment?.(currentSegment) ?? false;

        if (aEligible !== bEligible) {
            return aEligible ? -1 : 1; // Eligible participants always sort BEFORE inactive ones
        }

        return parentCombat._comparePriority(a, b, parentCombat, currentSegment);
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
    _comparePriority(a, b, combatDoc, targetSegment, { queryAbs = null } = {}) {
        const parentCombat = combatDoc ?? this ?? a.combat;
        if (!parentCombat) return 0;

        const priorityA = parentCombat.getInitiativePriority(a, targetSegment, { queryAbs });
        const priorityB = parentCombat.getInitiativePriority(b, targetSegment, { queryAbs });

        if (priorityA !== priorityB) {
            return priorityB - priorityA; // Descending order (highest score acts first)
        }

        return parentCombat.tieBreakOrder
            ? parentCombat.tieBreakOrder(a, b, queryAbs)
            : HeroSystem6eCombatSingle.stableTiebreak(a, b);
    }

    /**
     * Evaluates a combatant's precise initiative value including characteristic scores and offsets.
     * @param {Combatant} combatant - The participant document to calculate priority for
     * @param {number} [targetSegment] - Optional segment window context (defaults to active segment)
     * @param {object} [options]
     * @param {boolean} [options.ignoreHold] - Score the natural Phase position even when a
     *   positional hold exists (used for the position a combatant just acted at)
     * @param {number} [options.queryAbs] - Exact absolute segment being scored. Segment
     *   numbers alias across Turns (the same number recurs every 12 segments), so
     *   callers scoring a position outside the current Turn must pass it; the default
     *   resolves to the first occurrence at or after the current combat position.
     * @returns {number} Comprehensive decimal initiative priority score
     */
    getInitiativePriority(combatant, targetSegment, { ignoreHold = false, queryAbs = null } = {}) {
        if (!combatant?.actor) return 0;

        const parentCombat = combatant.combat ?? this;
        const activeSegment = targetSegment ?? parentCombat?.segment ?? 12;

        const combatSegment = parentCombat?.segment ?? activeSegment;
        const combatAbs = HeroSystem6eCombatantSingle.absoluteSegment(parentCombat?.round ?? 0, combatSegment);
        const scoredAbs = queryAbs ?? combatAbs + ((activeSegment - combatSegment + 12) % 12);

        // Aborted combatants keep their natural priority: the skip lives entirely in
        // _takesTurnInSegment. Zeroing here re-sorted them mid-segment (turn is an
        // index into the sorted array) and rendered the consumed Phase at 0.00 instead
        // of struck through at its DEX position.

        const actorDoc = combatant.actor;
        const characteristicKey = actorDoc.system?.initiativeCharacteristic ?? "dex";
        const characteristicObj = actorDoc.system?.characteristics?.[characteristicKey];

        const baseScore = characteristicObj?.value ?? 10;

        // Lightning Reflexes raises effective DEX for acting order only (6E1 116; 5ER 96).
        // Unrestricted All Actions levels always apply; scoped purchases (single action,
        // group, HTH/ranged — the character may only execute that action when acting
        // early) apply only while the combatant elevated themselves this segment.
        const lr = combatant.lightningReflexes ?? { always: 0, scoped: null };
        let lightningReflexesLevels = lr.always;
        if (lr.scoped && combatant.lrElevatedAbs === scoredAbs) {
            lightningReflexesLevels += lr.scoped.levels;
        }

        const spdObj = actorDoc.system?.characteristics?.spd;
        const resolvedSpd = spdObj?.value ?? 2;

        const hasPhase = combatant.hasPhaseInSegment ? combatant.hasPhaseInSegment(activeSegment, scoredAbs) : false;
        // A positional Held Action slots the combatant at their declared DEX in the declared
        // segment; event/generic holds occupy no initiative position (tracker panel instead).
        // A spent hold keeps the acted position for display sorting until the segment ends.
        const positionalHold = !ignoreHold && combatant.holdsPositionAtAbs?.(scoredAbs) ? combatant.heldAction : null;
        const spentHold = combatant.spentHoldAtAbs?.(scoredAbs) ? combatant.spentHoldPosition : null;

        if (resolvedSpd <= 0 || (!hasPhase && !positionalHold && !spentHold)) {
            return 0;
        }

        // Maps are keyed by absolute segment; segment-number keys are the legacy
        // shape from in-flight combats and read as a fallback
        const rollsFlag = (parentCombat ? parentCombat.getFlag(game.system.id, "segmentRolls") : null) ?? {};
        const segmentRolls = rollsFlag[scoredAbs] ?? rollsFlag[activeSegment] ?? {};
        // Rolls are keyed by root actor id (or a solo key for split members); fall
        // back to combatant id for pre-existing combats
        const rollKey = (parentCombat ?? this)._tieRollKey?.(combatant) ?? (combatant.actorId || combatant.id);
        const tieBreakerEntry =
            segmentRolls[rollKey] ?? segmentRolls[combatant.actorId || combatant.id] ?? segmentRolls[combatant.id];
        const tieBreakerFraction = this._tieBreakerFraction(tieBreakerEntry);

        if (positionalHold) {
            // The declared DEX is the exact acting position: LR and maneuver offsets
            // don't move it, and an explicitly declared decimal pins the tie-break
            return (positionalHold.dex ?? baseScore) + (positionalHold.fraction ?? tieBreakerFraction);
        }
        if (spentHold) {
            return (spentHold.dex ?? baseScore) + (spentHold.fraction ?? tieBreakerFraction);
        }

        // A Haymaker does not move the character's DEX position (6E2 — the wind-up
        // resolves at the end of the next Segment; see the haymaker combatant flag)
        return baseScore + lightningReflexesLevels + tieBreakerFraction;
    }

    /**
     * Whether a combatant actually receives a turn in the given segment: they must have
     * a Phase there (or a positional Held Action declared for it), must not be skipped
     * as defeated when the core tracker's Skip Defeated setting is on, and must not have
     * aborted their Phase. Event/generic holds receive no turn; they act on demand via
     * the tracker's Held Actions panel.
     * @param {Combatant} combatant
     * @param {number} segment
     * @param {object} [options]
     * @param {boolean} [options.ignoreAbort] - Treat a lingering aborted status as spent
     *   because the aborted Phase already passed earlier in the same advance
     * @param {number} [options.queryAbs] - Exact absolute segment being probed. A 12-step
     *   scan ends on the same segment NUMBER in the next round, so position-bound
     *   records (spent holds, abort spends, held slots) must compare by absolute
     *   position or this round's records block next round's Phase.
     * @param {boolean} [options.ignoreHold] - Evaluate the natural Phase as if a pending
     *   positional hold were already consumed (used for the ending combatant whose
     *   taken held slot is spent asynchronously after the advance commits)
     * @returns {boolean}
     * @protected
     */
    _takesTurnInSegment(combatant, segment, { ignoreAbort = false, queryAbs = null, ignoreHold = false } = {}) {
        const actor = combatant?.actor;
        if (!actor) return false;
        if ((this.settings?.skipDefeated ?? false) && combatant.isOutOfCombat) return false;
        const currentAbs = HeroSystem6eCombatantSingle.absoluteSegment(this.round, this.segment);
        const abs = queryAbs ?? currentAbs + ((segment - this.segment + 12) % 12);
        if (!ignoreAbort && (combatant.abortAppliesAtAbs?.(abs) ?? actor.statuses.has("aborted"))) return false;
        // A spent hold already consumed this segment's action (using a Held Action
        // replaces the Phase: he cannot have two Phases in one Segment, 6E2 20)
        if (combatant.spentHoldAtAbs?.(abs)) return false;
        const hold = ignoreHold ? null : combatant.heldAction;
        // A positional hold commits the banked Phase to its declared slot
        if (hold?.mode === "position") return combatant.holdsPositionAtAbs(abs);
        return combatant.hasPhaseInSegment?.(segment, abs) ?? false;
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
            this._turns = null; // Sync the legacy array cache natively during data-prep passes
        }
        return compiledTurns;
    }

    /** @override */
    async startCombat() {
        console.log(`[${game.system.id}] Initializing Hero System Turn 1 at Segment 12...`);

        const startPayload = { round: 1, started: true };
        startPayload[`flags.${game.system.id}.currentSegment`] = 12;
        startPayload[`flags.${game.system.id}.recoveredRounds`] = [];

        // Combat opens at Turn 1 Segment 12 (abs 24); nest under the abs key — the
        // old code wrote the flat roll map over the whole flag, corrupting its shape
        const startAbs = HeroSystem6eCombatantSingle.absoluteSegment(1, 12);
        const initialRolls = (await this._generateSegmentRollCache(startAbs)) || {};
        startPayload[`flags.${game.system.id}.segmentRolls`] = { [startAbs]: initialRolls };

        const combatantUpdates = [];
        this.combatants.forEach((combatant) => {
            combatantUpdates.push({
                _id: combatant.id,
                initiative: this.getInitiativePriority(combatant, 12),
            });
        });

        const startInitiativeById = new Map(combatantUpdates.map((u) => [u._id, u]));
        const startTurns = this.combatants.map((c) => {
            const match = startInitiativeById.get(c.id);
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

        // Sort using our hardened segment eligibility check logic rules
        startTurns.sort((a, b) => {
            const aActs = a.occupiesSegment ? a.occupiesSegment(12) : false;
            const bActs = b.occupiesSegment ? b.occupiesSegment(12) : false;
            if (aActs !== bActs) return aActs ? -1 : 1;
            return this._comparePriority(a, b, this, 12);
        });

        const targetActorDoc = startTurns.find((t) => this._takesTurnInSegment(t, 12));
        const targetCombatantId = targetActorDoc?.id || null;

        const finalTargetTurnsArray = HeroCompatibility.isV14
            ? startTurns.filter((t) => t.occupiesSegment?.(12) ?? false)
            : startTurns;

        const absoluteStartTurnIndex = finalTargetTurnsArray.findIndex((t) => t.id === targetCombatantId);
        startPayload.turn = absoluteStartTurnIndex !== -1 ? absoluteStartTurnIndex : 0;
        startPayload[`flags.${game.system.id}.actingPriority`] = targetActorDoc
            ? this.getInitiativePriority(targetActorDoc, 12)
            : null;

        const startEvents = [this.buildEvent("segment.start", { abs: startAbs })];
        if (targetActorDoc) {
            startEvents.push(
                this.buildEvent("turn.start", {
                    combatant: targetActorDoc,
                    abs: startAbs,
                    data: { turnIndex: startPayload.turn, storedActingPriority: null },
                }),
            );
        }
        Object.assign(startPayload, this.eventLogAppendPayload(startEvents));

        const result = await HeroCompatibility.updateEmbedded(this, "combatants", combatantUpdates, startPayload);
        if (!HeroCompatibility.isV14) this._turns = null;

        // Combat opens on Segment 12: offer/apply Lightning Reflexes right away
        // (the started flag short-circuits _onUpdate's boundary maintenance)
        await this._segmentStartLightningReflexes();
        return result;
    }

    /**
     * Combatants who could elevate a scoped Lightning Reflexes purchase in the
     * current segment: a natural Phase here, no hold or spent action, not already
     * up, and not locked out by Stunned or an abort.
     * @returns {Combatant[]}
     * @private
     */
    _lrElevationCandidates() {
        const currentAbs = HeroSystem6eCombatantSingle.absoluteSegment(this.round, this.segment);
        const activeId = this.combatant?.id;
        return this.combatants.filter((c) => {
            const actor = c.actor;
            if (!actor) return false;
            if (!c.lightningReflexes?.scoped) return false;
            if (c.id === activeId) return false;
            if (c.lrElevatedAbs === currentAbs) return false;
            if (!c.hasPhaseInSegment(this.segment)) return false;
            if (c.heldAction) return false;
            if (c.spentHoldInSegment?.(this.segment)) return false;
            if (actor.statuses.has("stunned")) return false;
            if (c.abortAppliesAtAbs?.(currentAbs) ?? actor.statuses.has("aborted")) return false;
            if ((this.settings?.skipDefeated ?? false) && c.isOutOfCombat) return false;
            return true;
        });
    }

    /**
     * Segment-start Lightning Reflexes handling. With the lrAutoElevate world
     * setting on, every candidate is elevated immediately (preempting the pointer
     * when a stop outranks the incoming actor); otherwise each candidate's owners
     * get a whispered prompt with an Act Early button — players rarely watch the
     * tracker at the top of a segment.
     * @private
     */
    async _segmentStartLightningReflexes() {
        if (!this.started) return;
        const candidates = this._lrElevationCandidates();
        if (candidates.length === 0) return;

        let autoElevate = false;
        try {
            autoElevate = !!game.settings.get(game.system.id, "lrAutoElevate");
        } catch (e) {
            console.warn(`Unable to read the Lightning Reflexes auto setting`, e);
        }

        const currentAbs = HeroSystem6eCombatantSingle.absoluteSegment(this.round, this.segment);
        const escapeHTML = foundry.utils.escapeHTML ?? ((value) => Handlebars.escapeExpression(value));

        if (!autoElevate) {
            for (const combatant of candidates) {
                const scoped = combatant.lightningReflexes.scoped;
                const whisper = whisperUserTargetsForActor(combatant.actor);
                if (whisper.length === 0) continue;
                const effectiveDex = Math.floor(this.getInitiativePriority(combatant, this.segment) + scoped.levels);
                await ChatMessage.create({
                    speaker: ChatMessage.getSpeaker({ actor: combatant.actor }),
                    whisper,
                    content: `<p><b>Segment ${this.segment}</b>: ${escapeHTML(combatant.actor.name)} can act early at effective DEX ${effectiveDex} with Lightning Reflexes (only: ${escapeHTML(scoped.label)}).</p>
                        <button type="button" class="hero-lr-act-early" data-combat-id="${this.id}" data-combatant-id="${combatant.id}">⚡ Act Early (DEX ${effectiveDex})</button>`,
                });
            }
            return;
        }

        // Auto mode: elevate every candidate up front. The active id is captured
        // before the write — the re-sort shifts the stored turn index on V13
        const activeId = this.combatant?.id ?? null;
        await this.updateEmbeddedDocuments(
            "Combatant",
            candidates.map((c) => ({ _id: c.id, [`flags.${game.system.id}.lrElevatedAbs`]: currentAbs })),
        );

        const announce = (list, whisper) =>
            list.length > 0
                ? ChatMessage.create({
                      speaker: { alias: "Lightning Reflexes" },
                      content: `${escapeHTML(list.map((c) => c.actor.name).join(", "))} act${list.length === 1 ? "s" : ""} early this Segment (Lightning Reflexes).`,
                      ...(whisper ? { whisper } : {}),
                  })
                : Promise.resolve();
        await announce(
            candidates.filter((c) => !c.hidden),
            null,
        );
        await announce(
            candidates.filter((c) => c.hidden),
            ChatMessage.getWhisperRecipients("GM"),
        );

        await this.logEvents(
            candidates.map((c) => this.buildEvent("lr.elevate", { combatant: c, data: { auto: true } })),
        );

        // A stop that outranks the incoming actor preempts the pointer, exactly as a
        // manual elevation would
        const sorted = [...candidates].sort((a, b) => this._comparePriority(a, b, this, this.segment));
        const top = sorted[0];
        if (top) await this.lrPreemptPointer(top.id, activeId);
    }

    /**
     * Moves the turn pointer onto an elevated Lightning Reflexes stop when it
     * outranks the position the current actor is acting at. Shared by the manual
     * tracker toggle, the chat Act Early button, and segment-start auto-elevation.
     * Non-GM callers relay to the GM: the update carries the actingPriority flag,
     * which core forbids players from writing.
     * @param {string} combatantId - The elevated combatant
     * @param {string|null} [activeId] - The active combatant captured BEFORE the
     *   elevation flag was written (flag writes re-sort the turns array under the
     *   stored index, so the live lookup can drift)
     * @returns {Promise<void>}
     */
    async lrPreemptPointer(combatantId, activeId = this.combatant?.id ?? null) {
        if (!game.user.isGM) {
            this._requestGmTurnAction("lrPreempt", { combatantId, activeId });
            return;
        }
        const combatant = this.combatants.get(combatantId);
        const currentAbs = HeroSystem6eCombatantSingle.absoluteSegment(this.round, this.segment);
        if (!this.started || combatant?.lrElevatedAbs !== currentAbs) return;
        if (!activeId || activeId === combatantId) return;
        // Reached via the async maintenance chain, chat buttons, and the socket
        // relay — staleness guards (#4558): the displaced combatant must still
        // exist, and the threshold is re-read HERE, not at capture time, so a
        // concurrent advance that already passed the elevated position bails out
        // below instead of pointing the turn backward. (A strict active-identity
        // check is deliberately NOT used: the elevation flag write itself re-sorts
        // the turns array under the stored index, so the live lookup drifts even
        // without any real advance.)
        if (!this.combatants.has(activeId)) return;

        const elevatedPriority = this.getInitiativePriority(combatant, this.segment);
        const active = this.combatants.get(activeId);
        const actingPriority =
            this.getFlag(game.system.id, "actingPriority") ??
            (active ? this.getInitiativePriority(active, this.segment) : -Infinity);
        if (elevatedPriority <= actingPriority) return;

        if (!HeroCompatibility.isV14) {
            this._turns = null;
            this.setupTurns();
        }
        const index = this.turns.findIndex((t) => t.id === combatantId);
        if (index === -1) return;
        const preemptPayload = { turn: index, [`flags.${game.system.id}.actingPriority`]: elevatedPriority };
        Object.assign(
            preemptPayload,
            this.eventLogAppendPayload([
                this.buildEvent("lr.preempt", {
                    combatant,
                    priority: elevatedPriority,
                    data: {
                        displacedId: activeId,
                        actingPriority: Number.isFinite(actingPriority) ? actingPriority : null,
                    },
                }),
                this.buildEvent("turn.start", {
                    combatant,
                    priority: elevatedPriority,
                    data: { turnIndex: index, storedActingPriority: null, viaLrPreempt: true },
                }),
            ]),
        );
        await this.update(preemptPayload, { direction: 1, previousCombatantId: combatantId });
    }

    /**
     * Points the turn index back at the given combatant after a mid-segment
     * priority change re-sorted the turns array. previousCombatantId is the active
     * combatant itself so the natural-turn hold consumption's self-advance guard
     * (and the Phase start/end work) skip this pointer-only update.
     * @param {string|null} activeId
     * @returns {Promise<void>}
     */
    async resyncTurnPointer(activeId) {
        if (!this.started || !activeId) return;
        if (!HeroCompatibility.isV14) {
            this._turns = null;
            this.setupTurns();
        }
        const index = this.turns.findIndex((t) => t.id === activeId);
        if (index === -1 || index === this.turn) return;
        try {
            await this.update({ turn: index }, { direction: 1, previousCombatantId: activeId });
        } catch (e) {
            console.warn(`Unable to re-sync the turn pointer`, e);
        }
    }

    /**
     * Relays a turn-flow operation to the active GM over the system socket. Core
     * permits non-GM Combat updates only on round/turn/combatants, and every
     * advance here carries system flags (segment, acting priority, tie-breaker
     * rolls), so players cannot commit them directly.
     * @param {string} operation
     * @param {object} [payload]
     * @returns {this}
     * @private
     */
    _requestGmTurnAction(operation, payload = {}) {
        if (!gmActive()) {
            ui.notifications.warn(`Could not perform this operation because there is no GM connected.`);
            return this;
        }
        game.socket.emit(`system.${game.system.id}`, {
            operation,
            combatId: this.id,
            userId: game.user.id,
            ...payload,
        });
        return this;
    }

    /**
     * Advance down the turn index loop, checking for fresh-phase held action overwrites.
     * @override
     */
    async nextTurn() {
        if (!game.user.isGM) return this._requestGmTurnAction("nextTurn");

        const allCombatants = this.combatants.contents;
        const activeSegment = this.segment;
        const currentAbsNow = this.round * 12 + activeSegment;

        // Captured before any writes below re-sort the turns array under the index
        const ending = this.combatant ?? null;

        // Scoped Lightning Reflexes is played as Phase-splitting (table ruling on
        // 6E1 116): the elevated stop covers only the scoped action, and ending it
        // returns the rest of the Phase to the segment at natural DEX. The elevation
        // is consumed up front so every selection below sees the natural priority.
        let lrRemainderId = null;
        if (this.started && ending?.lrElevatedAbs === currentAbsNow) {
            // Captured while the flag still applies: the spent stop keeps displaying
            // at the elevated position for the rest of the segment
            const elevatedPriority = this.getInitiativePriority(ending, activeSegment);
            // render: false — this intermediate write re-sorts the turns array under
            // the still-stale index; letting it render made the tracker (and the
            // auto-scroll) hop to the combatant's natural row for a frame before the
            // real turn update landed
            await ending.update(
                {
                    [`flags.${game.system.id}.lrElevatedAbs`]: null,
                    [`flags.${game.system.id}.spentLrPosition`]: {
                        segmentAbs: currentAbsNow,
                        priority: elevatedPriority,
                    },
                },
                { render: false },
            );
            lrRemainderId = ending.id;
        }

        // Within-segment selection runs on LIVE priorities rather than the cached turns
        // array, so a positional hold declared mid-segment re-enters the order at its
        // declared DEX without waiting for a re-sort. The ending combatant's acting
        // position is their natural Phase unless they just acted at their held slot.
        const endingHold = ending?.heldAction;
        const endingAtHeldSlot =
            endingHold?.mode === "position" &&
            endingHold.segmentAbs === currentAbsNow &&
            ending.getFlag(game.system.id, "heldSlotTakenAbs") === currentAbsNow;
        // The threshold is the position the ending combatant ACTED at, recorded when
        // their turn began — live priorities move mid-segment (Aid/Drain) and would
        // re-admit combatants who already acted or skip ones who have not
        const storedActingPriority = this.getFlag(game.system.id, "actingPriority");
        const endingPriority =
            storedActingPriority ??
            (ending ? this.getInitiativePriority(ending, activeSegment, { ignoreHold: !endingAtHeldSlot }) : Infinity);

        const stillToAct = allCombatants.filter((c) => {
            if (!this._takesTurnInSegment(c, activeSegment, { queryAbs: currentAbsNow })) return false;
            const cHold = c.heldAction;
            const cHeldHere = cHold?.mode === "position" && cHold.segmentAbs === currentAbsNow;
            // A held slot only comes up once
            if (cHeldHere && c.getFlag(game.system.id, "heldSlotTakenAbs") === currentAbsNow) return false;
            // The ending combatant re-enters the segment only via an unused held slot
            // or as the natural-DEX remainder of a just-ended Lightning Reflexes stop
            if (c.id === ending?.id && !cHeldHere && c.id !== lrRemainderId) return false;
            const priority = this.getInitiativePriority(c, activeSegment);
            if (priority < endingPriority) return true;
            return (
                priority === endingPriority &&
                !!ending &&
                c.id !== ending.id &&
                this.tieBreakOrder(c, ending, currentAbsNow) > 0
            );
        });

        if (stillToAct.length > 0) {
            stillToAct.sort((a, b) => this._comparePriority(a, b, this, activeSegment));
            const target = stillToAct[0];

            // A mid-segment hold changes live priorities, and any embedded combatant write
            // re-sorts the turns array — so the turn index must address the RE-SORTED
            // order. Only changed initiatives persist: unchanged writes are wasted
            // round-trips, and any single combatant write re-sorts every client.
            let inlineCombatantUpdates = this.combatants
                .map((c) => ({
                    _id: c.id,
                    initiative: this.getInitiativePriority(c, activeSegment),
                }))
                .filter((u) => this.combatants.get(u._id)?.initiative !== u.initiative);

            // Landing on a positional holder's declared slot marks it taken in the
            // same update, so ending that turn consumes the hold race-free
            const targetHold = target.heldAction;
            if (targetHold?.mode === "position" && targetHold.segmentAbs === currentAbsNow) {
                const targetUpdate = inlineCombatantUpdates.find((u) => u._id === target.id);
                if (targetUpdate) targetUpdate[`flags.${game.system.id}.heldSlotTakenAbs`] = currentAbsNow;
                else
                    inlineCombatantUpdates.push({
                        _id: target.id,
                        [`flags.${game.system.id}.heldSlotTakenAbs`]: currentAbsNow,
                    });
            }

            // Players may only write combatants they own; the GM-side _onUpdate
            // backfills any slot-taken marker dropped here
            if (!game.user.isGM) {
                inlineCombatantUpdates = inlineCombatantUpdates.filter((u) => this.combatants.get(u._id)?.isOwner);
            }

            let predictedTurns = [...allCombatants].sort((a, b) => this._sortCombatants(a, b, this));
            if (HeroCompatibility.isV14) {
                predictedTurns = predictedTurns.filter((t) => t.occupiesSegment?.(activeSegment) ?? false);
            }
            const targetIndex = predictedTurns.findIndex((t) => t.id === target.id);

            if (targetIndex !== -1) {
                if (!HeroCompatibility.isV14) this._turns = null;
                // Completed turns raise the segment's high-water mark: a Lightning
                // Reflexes elevation may only slot below it — positions above it have
                // genuinely been passed, while the current actor merely being up has not
                const priorHighWater = this.getFlag(game.system.id, "segmentHighWater");
                const segmentHighWater = ending
                    ? Math.max(priorHighWater ?? -Infinity, endingPriority)
                    : priorHighWater;
                const withinSegmentPayload = {
                    turn: targetIndex,
                    [`flags.${game.system.id}.actingPriority`]: this.getInitiativePriority(target, activeSegment),
                    [`flags.${game.system.id}.segmentHighWater`]: Number.isFinite(segmentHighWater)
                        ? segmentHighWater
                        : null,
                };
                if (game.user.isGM) {
                    Object.assign(
                        withinSegmentPayload,
                        this.eventLogAppendPayload([
                            this.buildEvent("turn.start", {
                                combatant: target,
                                abs: currentAbsNow,
                                data: { turnIndex: targetIndex, storedActingPriority: storedActingPriority ?? null },
                            }),
                        ]),
                    );
                }
                const result = await HeroCompatibility.updateEmbedded(
                    this,
                    "combatants",
                    inlineCombatantUpdates,
                    withinSegmentPayload,
                    { direction: 1, previousCombatantId: ending?.id },
                );
                if (!HeroCompatibility.isV14) {
                    this._turns = null;
                    this.setupTurns();
                }
                return result;
            }
        }

        let nextSegment = activeSegment;
        let nextRoundCycle = this.round;
        let segmentDeltaCount = 0;
        const updateData = {};
        let segmentActorsFound = false;

        // An abort spends the combatant's next Phase: the scan passes over that Phase's
        // segment, after which they count as able to act again (the status itself is
        // cleared by _clearExpiredAborts once those segments have elapsed). Aborted
        // combatants with a Phase in the segment now ending have already spent it.
        const abortSpentIds = new Set(
            allCombatants
                .filter((c) => {
                    if (!c.abortEffect) return false;
                    // Declared aborts record the exact Phase they consume; bare statuses
                    // fall back to matching the ending segment
                    const spentAbs = c.abortSpentAbs;
                    if (spentAbs !== null) return spentAbs <= currentAbsNow;
                    return c.hasPhaseInSegment(activeSegment);
                })
                .map((c) => c.id),
        );

        for (let check = 1; check <= 12; check++) {
            nextSegment++;
            segmentDeltaCount++;
            if (nextSegment > 12) {
                nextSegment = 1;
                nextRoundCycle += 1;

                await this._executePostSegment12Recovery(nextRoundCycle - 1);
            }

            const scanAbs = nextRoundCycle * 12 + nextSegment;
            const foundActors = allCombatants.filter((c) => {
                if (c.abortEffect && !abortSpentIds.has(c.id)) {
                    const spentAbs = c.abortSpentAbs;
                    const spendsHere =
                        spentAbs !== null ? spentAbs <= scanAbs : c.hasPhaseInSegment(nextSegment, scanAbs);
                    if (spendsHere) abortSpentIds.add(c.id);
                    return false;
                }
                // The ending combatant's taken held slot is spent by the post-update
                // maintenance; the scan already treats the hold as consumed or the
                // still-live effect blocks every probe and the advance dead-ends
                return this._takesTurnInSegment(c, nextSegment, {
                    ignoreAbort: true,
                    queryAbs: scanAbs,
                    ignoreHold: c.id === ending?.id && endingAtHeldSlot,
                });
            });
            if (foundActors.length > 0) {
                segmentActorsFound = true;
                break;
            }
        }

        if (!segmentActorsFound) {
            ui.notifications.warn(`No combatant can take a turn; the tracker did not advance.`);
            return this;
        }

        const nextAbs = nextRoundCycle * 12 + nextSegment;
        const masterRollsCache = this.getFlag(game.system.id, "segmentRolls") ?? {};
        let updatedRollsCache = masterRollsCache[nextAbs];

        let freshRollMap = null;
        if (!updatedRollsCache) {
            updatedRollsCache = this._buildSegmentRollMap();
            masterRollsCache[nextAbs] = updatedRollsCache;
            freshRollMap = updatedRollsCache;
        }
        // Prune maps outside the tracker's two-Turn rewind window; this also drops
        // the legacy segment-number keys (1-12) from in-flight combats over time
        for (const key of Object.keys(masterRollsCache)) {
            const keyAbs = Number(key);
            if (Number.isFinite(keyAbs) && keyAbs < currentAbsNow - 24) {
                delete masterRollsCache[key];
                updateData[`flags.${game.system.id}.segmentRolls.-=${key}`] = null;
            }
        }
        updateData[`flags.${game.system.id}.segmentRolls`] = masterRollsCache;
        let targetCombatantId = null;
        const upcomingActors = allCombatants.filter((c) =>
            this._takesTurnInSegment(c, nextSegment, {
                ignoreAbort: abortSpentIds.has(c.id),
                queryAbs: nextAbs,
                ignoreHold: c.id === ending?.id && endingAtHeldSlot,
            }),
        );

        if (upcomingActors.length > 0) {
            upcomingActors.sort((a, b) => {
                return this._comparePriority(a, b, this, nextSegment, { queryAbs: nextAbs });
            });
            targetCombatantId = upcomingActors[0]?.id || null;
        }

        const combatantUpdates = [];
        this.combatants.forEach((combatant) => {
            combatantUpdates.push({
                _id: combatant.id,
                initiative: this.getInitiativePriority(combatant, nextSegment, { queryAbs: nextAbs }),
            });
        });

        // Landing on a positional holder's declared slot marks it taken in the same update
        const incomingHold = this.combatants.get(targetCombatantId)?.heldAction;
        if (incomingHold?.mode === "position" && incomingHold.segmentAbs === nextRoundCycle * 12 + nextSegment) {
            const targetUpdate = combatantUpdates.find((u) => u._id === targetCombatantId);
            if (targetUpdate) targetUpdate[`flags.${game.system.id}.heldSlotTakenAbs`] = incomingHold.segmentAbs;
        }

        // Persist only changed initiatives, and for players only owned combatants;
        // the GM-side _onUpdate backfills any dropped slot-taken marker
        let persistedCombatantUpdates = combatantUpdates.filter(
            (u) => this.combatants.get(u._id)?.initiative !== u.initiative || Object.keys(u).length > 2,
        );
        if (!game.user.isGM) {
            persistedCombatantUpdates = persistedCombatantUpdates.filter((u) => this.combatants.get(u._id)?.isOwner);
        }

        const initiativeById = new Map(combatantUpdates.map((u) => [u._id, u]));
        const recompiledTurns = this.combatants.map((c) => {
            const match = initiativeById.get(c.id);
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

        recompiledTurns.sort((a, b) => {
            const aE = a.occupiesSegment?.(nextSegment) ?? false;
            const bE = b.occupiesSegment?.(nextSegment) ?? false;
            if (aE !== bE) return aE ? -1 : 1;
            return this._comparePriority(a, b, this, nextSegment, { queryAbs: nextAbs });
        });

        const finalTargetTurnsArray = HeroCompatibility.isV14
            ? recompiledTurns.filter((t) => t.occupiesSegment?.(nextSegment) ?? false)
            : recompiledTurns;

        const absoluteTargetTurnIndex = finalTargetTurnsArray.findIndex((t) => t.id === targetCombatantId);

        updateData.round = nextRoundCycle;
        updateData.turn = absoluteTargetTurnIndex !== -1 ? absoluteTargetTurnIndex : 0;
        updateData[`flags.${game.system.id}.currentSegment`] = nextSegment;
        const incomingCombatant = this.combatants.get(targetCombatantId);
        updateData[`flags.${game.system.id}.actingPriority`] = incomingCombatant
            ? this.getInitiativePriority(incomingCombatant, nextSegment, { queryAbs: nextAbs })
            : null;
        // A fresh segment has no completed turns yet
        updateData[`flags.${game.system.id}.segmentHighWater`] = null;

        if (game.user.isGM) {
            const crossEvents = [];
            if (nextRoundCycle !== this.round) crossEvents.push(this.buildEvent("round.start", { abs: nextAbs }));
            crossEvents.push(this.buildEvent("segment.start", { abs: nextAbs }));
            if (freshRollMap) {
                crossEvents.push(
                    this.buildEvent("tie.roll", { abs: nextAbs, data: { segment: nextSegment, rolls: freshRollMap } }),
                );
            }
            if (incomingCombatant) {
                crossEvents.push(
                    this.buildEvent("turn.start", {
                        combatant: incomingCombatant,
                        abs: nextAbs,
                        data: { turnIndex: updateData.turn, storedActingPriority: storedActingPriority ?? null },
                    }),
                );
            }
            Object.assign(updateData, this.eventLogAppendPayload(crossEvents));
        }

        const updateOptions = {
            direction: 1,
            previousCombatantId: this.combatant?.id,
            previousSegment: activeSegment,
            segmentsElapsed: segmentDeltaCount,
        };
        if (segmentDeltaCount > 0) {
            updateOptions.worldTime = { delta: segmentDeltaCount };
        }

        if (!HeroCompatibility.isV14) {
            this._turns = null;
        }

        const result = await HeroCompatibility.updateEmbedded(
            this,
            "combatants",
            persistedCombatantUpdates,
            updateData,
            updateOptions,
        );

        if (!HeroCompatibility.isV14) {
            this._turns = null;
            this.setupTurns();
        }

        return result;
    }

    /**
     * Step backwards up the turn index loop, checking for start-of-combat resets.
     * @override
     */
    async previousTurn() {
        if (!game.user.isGM) return this._requestGmTurnAction("previousTurn");

        if (this.round === 1 && this.segment === 12 && (this.turn ?? 0) === 0) {
            console.log(`[${game.system.id}] Rewinding past initial turn boundary. Resetting encounter state...`);

            if (typeof this._handleCombatStartReset === "function") {
                await this._handleCombatStartReset();
            }

            const resetPayload = { started: false, round: 0, turn: 0 };
            resetPayload[`flags.${game.system.id}.currentSegment`] = 12;
            resetPayload[`flags.${game.system.id}.recoveredRounds`] = [];

            if (!HeroCompatibility.isV14) {
                this._turns = null;
            }

            return this.update(resetPayload, { direction: -1 });
        }

        const allCombatants = this.combatants.contents;
        const turns = this.turns;
        const activeSegment = this.segment;

        const currentActiveTurns = HeroCompatibility.isV14
            ? turns
            : turns.filter((t) => this._takesTurnInSegment(t, activeSegment));

        const currentFilteredIndex = currentActiveTurns.findIndex((t) => t.id === this.combatant?.id);

        // A completed scoped-LR stop is not a turns entry, so the standard index
        // walk would skip straight past it (often into the previous segment) and
        // the flag resets would erase it. When the most recent completed action
        // this segment was an LR stop, rewinding steps back ONTO it: the elevation
        // is restored and the stop becomes the active turn again.
        const currentAbsWithin = this.round * 12 + activeSegment;
        const currentPriority =
            this.getFlag(game.system.id, "actingPriority") ??
            (this.combatant ? this.getInitiativePriority(this.combatant, activeSegment) : -Infinity);
        const spentLrStops = allCombatants
            .map((c) => ({ combatant: c, spent: c.getFlag(game.system.id, "spentLrPosition") }))
            .filter(({ spent }) => spent?.segmentAbs === currentAbsWithin && spent.priority > currentPriority)
            .sort((a, b) => a.spent.priority - b.spent.priority);
        if (spentLrStops.length > 0) {
            const { combatant: stop, spent } = spentLrStops[0];
            const regularPrev = currentFilteredIndex > 0 ? currentActiveTurns[currentFilteredIndex - 1] : null;
            const regularPriority = regularPrev ? this.getInitiativePriority(regularPrev, activeSegment) : Infinity;
            if (spent.priority < regularPriority) {
                const previousId = this.combatant?.id;
                // Restore the elevation render-suppressed: the re-sort under the
                // still-stale index must not paint before the pointer lands
                await stop.update(
                    {
                        [`flags.${game.system.id}.lrElevatedAbs`]: currentAbsWithin,
                        [`flags.${game.system.id}.spentLrPosition`]: null,
                    },
                    { render: false },
                );
                if (!HeroCompatibility.isV14) {
                    this._turns = null;
                    this.setupTurns();
                }
                const stopIndex = this.turns.findIndex((t) => t.id === stop.id);
                const payload = {
                    turn: stopIndex !== -1 ? stopIndex : 0,
                    [`flags.${game.system.id}.actingPriority`]: spent.priority,
                    [`flags.${game.system.id}.segmentHighWater`]: null,
                };
                Object.assign(
                    payload,
                    this.eventLogAppendPayload([
                        this.buildEvent("rewind", { combatant: stop, data: { targetAbs: currentAbsWithin } }),
                    ]),
                );
                return this.update(payload, { direction: -1, previousCombatantId: previousId });
            }
        }

        if (currentFilteredIndex > 0) {
            const targetCombatant = currentActiveTurns[currentFilteredIndex - 1];
            const masterTargetIndex = turns.findIndex((t) => t.id === targetCombatant.id);

            if (!HeroCompatibility.isV14) {
                this._turns = null;
            }

            const targetPriority = this.getInitiativePriority(targetCombatant, activeSegment);
            const inlineUpdateData = {
                turn: masterTargetIndex !== -1 ? masterTargetIndex : 0,
                [`flags.${game.system.id}.actingPriority`]: targetPriority,
                // Rewinds forget completed turns; lenient for re-declared elevations
                [`flags.${game.system.id}.segmentHighWater`]: null,
            };
            Object.assign(
                inlineUpdateData,
                this.eventLogAppendPayload([
                    this.buildEvent("rewind", {
                        combatant: targetCombatant,
                        data: { targetAbs: this.round * 12 + activeSegment },
                    }),
                ]),
            );
            const rewindResets = this._rewindHoldFlagResets(this.round * 12 + activeSegment, { targetPriority });

            const result = await HeroCompatibility.updateEmbedded(this, "combatants", rewindResets, inlineUpdateData, {
                direction: -1,
                previousCombatantId: this.combatant?.id,
            });

            if (!HeroCompatibility.isV14) {
                this._turns = null;
                this.setupTurns();
            }

            return result;
        }

        let prevSegment = activeSegment;
        let prevRoundCycle = this.round;
        let segmentDeltaCount = 0;
        const updateData = {};
        let segmentActorsFound = false;

        for (let check = 1; check <= 12; check++) {
            prevSegment--;
            segmentDeltaCount--;
            if (prevSegment < 1) {
                prevSegment = 12;
                prevRoundCycle -= 1;

                if (prevRoundCycle < 1) {
                    if (typeof this._handleCombatStartReset === "function") {
                        await this._handleCombatStartReset();
                    }

                    const resetPayload = { started: false, round: 0, turn: 0 };
                    resetPayload[`flags.${game.system.id}.currentSegment`] = 12;
                    resetPayload[`flags.${game.system.id}.recoveredRounds`] = [];

                    if (!HeroCompatibility.isV14) this._turns = null;
                    return this.update(resetPayload, { direction: -1 });
                }
            }

            const rewindProbeAbs = prevRoundCycle * 12 + prevSegment;
            const foundActors = allCombatants.filter((c) =>
                this._takesTurnInSegment(c, prevSegment, { queryAbs: rewindProbeAbs }),
            );
            if (foundActors.length > 0) {
                segmentActorsFound = true;
                break;
            }
        }

        if (!segmentActorsFound) return this;

        const prevAbs = prevRoundCycle * 12 + prevSegment;
        const combatantUpdates = [];
        this.combatants.forEach((combatant) => {
            combatantUpdates.push({
                _id: combatant.id,
                initiative: this.getInitiativePriority(combatant, prevSegment, { queryAbs: prevAbs }),
            });
        });
        for (const reset of this._rewindHoldFlagResets(prevAbs)) {
            const existing = combatantUpdates.find((u) => u._id === reset._id);
            if (existing) Object.assign(existing, reset);
            else combatantUpdates.push(reset);
        }

        const initiativeById = new Map(combatantUpdates.map((u) => [u._id, u]));
        const recompiledTurns = this.combatants.map((c) => {
            const match = initiativeById.get(c.id);
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

        recompiledTurns.sort((a, b) => {
            const aE = a.occupiesSegment?.(prevSegment) ?? false;
            const bE = b.occupiesSegment?.(prevSegment) ?? false;
            if (aE !== bE) return aE ? -1 : 1;
            return this._comparePriority(a, b, this, prevSegment, { queryAbs: prevAbs });
        });

        const finalTargetTurnsArray = HeroCompatibility.isV14
            ? recompiledTurns.filter((t) => t.occupiesSegment?.(prevSegment) ?? false)
            : recompiledTurns;

        let targetCombatantId = null;
        const targetActors = allCombatants.filter((c) =>
            this._takesTurnInSegment(c, prevSegment, { queryAbs: prevAbs }),
        );

        if (targetActors.length > 0) {
            targetActors.sort((a, b) => {
                return this._comparePriority(a, b, this, prevSegment, { queryAbs: prevAbs });
            });
            targetCombatantId = targetActors[targetActors.length - 1]?.id || null;
        }

        const absoluteTargetTurnIndex = finalTargetTurnsArray.findIndex((t) => t.id === targetCombatantId);

        updateData.round = prevRoundCycle;
        updateData.turn = absoluteTargetTurnIndex !== -1 ? absoluteTargetTurnIndex : 0;
        updateData[`flags.${game.system.id}.currentSegment`] = prevSegment;
        const rewindTarget = this.combatants.get(targetCombatantId);
        updateData[`flags.${game.system.id}.actingPriority`] = rewindTarget
            ? this.getInitiativePriority(rewindTarget, prevSegment, { queryAbs: prevAbs })
            : null;
        updateData[`flags.${game.system.id}.segmentHighWater`] = null;
        Object.assign(
            updateData,
            this.eventLogAppendPayload([this.buildEvent("rewind", { data: { targetAbs: prevAbs } })]),
        );

        const updateOptions = { direction: -1, previousCombatantId: this.combatant?.id };
        if (segmentDeltaCount < 0) {
            updateOptions.worldTime = { delta: segmentDeltaCount };
        }

        if (!HeroCompatibility.isV14) {
            this._turns = null;
        }

        // ✅ FIXED SIGNATURE: Injected "combatants" collection name parameter
        const result = await HeroCompatibility.updateEmbedded(
            this,
            "combatants",
            combatantUpdates,
            updateData,
            updateOptions,
        );

        if (!HeroCompatibility.isV14) {
            this._turns = null;
            this.setupTurns();
        }

        return result;
    }

    /**
     * Advance the tracker forward by an entire Turn Cycle (12 Segments / 12 Seconds).
     * @override
     */
    async nextRound() {
        if (!game.user.isGM) return this._requestGmTurnAction("nextRound");

        const updateData = {
            round: this.round + 1,
            turn: 0,
        };
        updateData[`flags.${game.system.id}.currentSegment`] = this.segment;
        updateData[`flags.${game.system.id}.actingPriority`] = null;
        updateData[`flags.${game.system.id}.segmentHighWater`] = null;

        // The landing position is a fresh absolute segment: roll its tie-breaks
        // (nextTurn's cross-segment block never runs on a full-Turn skip)
        const landingAbs = (this.round + 1) * 12 + this.segment;
        const roundRollsCache = this.getFlag(game.system.id, "segmentRolls") ?? {};
        if (!roundRollsCache[landingAbs]) {
            roundRollsCache[landingAbs] = this._buildSegmentRollMap();
            updateData[`flags.${game.system.id}.segmentRolls`] = roundRollsCache;
        }

        Object.assign(
            updateData,
            this.eventLogAppendPayload([
                this.buildEvent("round.start", {
                    abs: landingAbs,
                    data: { skippedTurn: true },
                }),
            ]),
        );

        // Skipping a full Turn crosses Post-Segment 12 exactly once
        if (this.started && this.round > 0) {
            await this._executePostSegment12Recovery(this.round);
        }

        const updateOptions = { direction: 1, turnAdvance: true };
        updateOptions.worldTime = { delta: 12 };

        // Clear internal turn caches before updating the database to prevent stale reads
        if (!HeroCompatibility.isV14) {
            this._turns = null;
        }

        // ✅ FIXED SIGNATURE: Injected "combatants" collection name parameter with empty updates array
        const result = await HeroCompatibility.updateEmbedded(this, "combatants", [], updateData, updateOptions);

        if (!HeroCompatibility.isV14) {
            this._turns = null;
            this.setupTurns();
        }

        return result;
    }

    /**
     * Rewind the tracker backward by an entire Turn Cycle (12 Segments / 12 Seconds).
     * @override
     */
    async previousRound() {
        if (!game.user.isGM) return this._requestGmTurnAction("previousRound");

        let targetRound = this.round - 1;
        if (targetRound < 1) targetRound = 1;

        const updateData = {
            round: targetRound,
            turn: 0,
        };
        updateData[`flags.${game.system.id}.actingPriority`] = null;
        updateData[`flags.${game.system.id}.segmentHighWater`] = null;
        Object.assign(
            updateData,
            this.eventLogAppendPayload([
                this.buildEvent("rewind", { data: { targetAbs: targetRound * 12 + this.segment } }),
            ]),
        );

        // Test 3 requires checking if resetting to turn 0 under an unstarted/rewound
        // boundary should forcefully clamp the timeline back to the initial segment threshold (12).
        const isUnstartedBoundary = targetRound === 1;
        updateData[`flags.${game.system.id}.currentSegment`] = isUnstartedBoundary ? 12 : this.segment;

        const updateOptions = { direction: -1 };
        updateOptions.worldTime = { delta: -12 };

        // Clear internal turn caches before updating the database to prevent stale reads
        if (!HeroCompatibility.isV14) {
            this._turns = null;
        }

        // ✅ FIXED SIGNATURE: Injected "combatants" collection name parameter with empty updates array
        const result = await HeroCompatibility.updateEmbedded(this, "combatants", [], updateData, updateOptions);

        if (!HeroCompatibility.isV14) {
            this._turns = null;
            this.setupTurns();
        }

        return result;
    }

    /**
     * Posts a combat-flow chat card, whispered to the GM for hidden combatants so
     * their names and tactical state don't leak to players.
     * @param {Combatant} combatant
     * @param {string} content
     * @private
     */
    _combatCard(combatant, content) {
        const data = { speaker: ChatMessage.getSpeaker({ actor: combatant.actor }), content };
        if (combatant.hidden) data.whisper = ChatMessage.getWhisperRecipients("GM");
        return ChatMessage.create(data);
    }

    /**
     * Combatant flag resets for a rewind. Slot-taken markers on LIVE holds at or
     * after the target position are cleared so replayed held slots come up again.
     * Spent-hold records are retained: spending deleted the holding effect, and
     * nothing can restore it — clearing the record would re-admit the holder for a
     * second action in the replayed segment. Undoing a spent hold is a manual GM
     * correction (re-declare the hold).
     * @param {number} targetAbs
     * @returns {object[]} Combatant update payloads keyed by _id
     * @private
     */
    _rewindHoldFlagResets(targetAbs, { targetPriority = null } = {}) {
        const resets = [];
        for (const combatant of this.combatants) {
            const update = {};
            if (
                combatant.heldAction?.mode === "position" &&
                (combatant.getFlag(game.system.id, "heldSlotTakenAbs") ?? -1) >= targetAbs
            ) {
                update[`flags.${game.system.id}.heldSlotTakenAbs`] = null;
            }
            // Declared LR elevations survive rewinds outright: the flag is bound to
            // its absolute segment, so a rewind to an earlier position simply leaves
            // it pending and the replay re-runs the stop when the count returns to
            // it. A completed stop within the rewind's own segment stays acted when
            // it happened BEFORE the rewind target; otherwise it un-acts and its
            // elevation comes back as pending.
            const spentLr = combatant.getFlag(game.system.id, "spentLrPosition");
            if (spentLr && spentLr.segmentAbs >= targetAbs) {
                const staysActed =
                    spentLr.segmentAbs === targetAbs && targetPriority !== null && spentLr.priority > targetPriority;
                if (!staysActed) {
                    update[`flags.${game.system.id}.spentLrPosition`] = null;
                    update[`flags.${game.system.id}.lrElevatedAbs`] = spentLr.segmentAbs;
                }
            }
            // A SPD change detected at or after the rewind target is un-detected: the
            // baseline reverts so the replay re-fires the lockout from its own position.
            // Lockouts recorded before the target stand — the change already happened.
            const lockout = combatant.getFlag(game.system.id, "spdLockout");
            if (lockout && (lockout.lockoutStartAbs ?? Infinity) >= targetAbs) {
                update[`flags.${game.system.id}.spdLockout`] = null;
                update[`flags.${game.system.id}.knownSpd`] = lockout.previousKnown ?? lockout.previousSpd;
            }
            // A deferred voluntary change declared at or after the target is re-detected on replay
            const pendingSpd = combatant.getFlag(game.system.id, "pendingSpd");
            if (pendingSpd && (pendingSpd.declaredAbs ?? Infinity) >= targetAbs) {
                update[`flags.${game.system.id}.pendingSpd`] = null;
            }
            // A Haymaker wound up at or after the target is undone by the rewind
            const haymaker = combatant.getFlag(game.system.id, "haymaker");
            if (haymaker && (haymaker.declaredAbs ?? Infinity) >= targetAbs) {
                update[`flags.${game.system.id}.haymaker`] = null;
            }
            // Likewise delayed actions declared at or after the target
            const delayed = combatant.getFlag(game.system.id, "delayedActions") ?? {};
            for (const [delayedId, record] of Object.entries(delayed)) {
                if ((record?.declaredAbs ?? Infinity) >= targetAbs) {
                    update[`flags.${game.system.id}.delayedActions.-=${delayedId}`] = null;
                }
            }
            if (Object.keys(update).length > 0) resets.push({ _id: combatant.id, ...update });
        }
        return resets;
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
                [`flags.${game.system.id}.heldSlotTakenAbs`]: null,
                [`flags.${game.system.id}.spentHoldPosition`]: null,
                [`flags.${game.system.id}.lrElevatedAbs`]: null,
                [`flags.${game.system.id}.spentLrPosition`]: null,
                // A fresh combat re-seeds the SPD baseline; out-of-combat changes are
                // free (6E2 17 only restricts mid-Turn changes) and stale lockouts
                // reference the previous run's absolute positions
                [`flags.${game.system.id}.spdLockout`]: null,
                [`flags.${game.system.id}.knownSpd`]: null,
                [`flags.${game.system.id}.pendingSpd`]: null,
                [`flags.${game.system.id}.haymaker`]: null,
                [`flags.${game.system.id}.delayedActions`]: null,
            });
        });

        // 2. Prepare the clean top-level metadata values
        const resetData = {
            started: false,
            round: 0,
            turn: null,
        };

        // 3. Purge dynamic system flags safely across V13/V14 via the compatibility bridge
        resetData[`flags.${game.system.id}`] = HeroCompatibility.forceDelete([
            "currentSegment",
            "segmentRolls",
            "recoveredRounds",
            "actingPriority",
            "segmentHighWater",
            "eventLog",
            "eventLogSeq",
        ]);

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
        // Runs inline on the single client that advances the tracker; non-GM
        // advances are relayed to a GM before reaching this point. Gating on the
        // active GM here would silently skip recovery for any other GM's advance.
        if (!game.user.isGM) return false;

        const recoveredRounds = this.getFlag(game.system.id, "recoveredRounds") ?? [];
        if (recoveredRounds.includes(roundToRecover)) {
            await ChatMessage.create({
                style: CONST.CHAT_MESSAGE_STYLES.OTHER,
                author: game.user._id,
                content: `Post-Segment 12 (Turn ${roundToRecover})
                <p>Skipping because this has already been performed on this turn during this combat.
                This typically occurs when rewinding combat.</p>`,
            });
            return false;
        }

        // Persist the guard before any actor is touched: if the caller's advance never
        // commits (no eligible combatant found), recovery must not re-apply on retry
        await this.setFlag(game.system.id, "recoveredRounds", [...recoveredRounds, roundToRecover]);
        await this.logEvent("recovery.post12", { data: { round: roundToRecover } });

        const automation = game.settings.get(game.system.id, "automation");

        let content = `Post-Segment 12 (Turn ${roundToRecover})<ul>`;
        let contentHidden = `Post-Segment 12 (Turn ${roundToRecover})<ul>`;
        let hasHidden = false;

        // Knocked out characters still take Post-Segment 12 Recoveries (that is how they
        // wake up); isDefeated here is core's (defeated toggle or dead), not isOutOfCombat
        for (const combatant of this.combatants.filter((c) => !c.isDefeated || c.hasPlayerOwner)) {
            const actor = combatant.actor;
            if (!actor) continue;

            if (
                automation === "all" ||
                (automation === "npcOnly" && actor.type === "npc") ||
                (automation === "pcEndOnly" && actor.type === "pc")
            ) {
                // TakeRecovery works on synthetic token actors (unlinked tokens) and applies the
                // recovery exclusions: KO'd below -10 STUN, holding breath, dead NPCs, bases,
                // negative REC (6E2 129; 5ER 368).
                let recoveryText =
                    (await actor.TakeRecovery({
                        asAction: false,
                        token: combatant.token,
                        preventRecoverFromStun: true,
                    })) || "";

                // END RESERVE recovers at its own REC rate
                for (const endReserveItem of actor.items.filter((o) => o.system.XMLID === "ENDURANCERESERVE")) {
                    const ENDURANCERESERVEREC = endReserveItem.findModsByXmlid("ENDURANCERESERVEREC");
                    if (ENDURANCERESERVEREC) {
                        const newValue = Math.min(
                            endReserveItem.system.LEVELS,
                            endReserveItem.system.value + parseInt(ENDURANCERESERVEREC.LEVELS),
                        );
                        if (newValue > endReserveItem.system.value) {
                            const delta = newValue - endReserveItem.system.value;
                            await endReserveItem.update({ "system.value": newValue });
                            recoveryText += `${recoveryText ? " " : ""}${endReserveItem.name} +${delta} END.`;
                        }
                    }
                }

                // A character recovered above 0 STUN is no longer knocked out (#4567)
                if (actor.statuses.has("knockedOut") && (actor.getCharacteristic("stun")?.value ?? 0) > 0) {
                    await actor.toggleStatusEffect(
                        HeroSystem6eActorActiveEffects.statusEffectsObj.knockedOutEffect.id,
                        {
                            active: false,
                        },
                    );
                    recoveryText += `${recoveryText ? " " : ""}${actor.name} regains consciousness.`;
                }

                if (recoveryText) {
                    const showToAll = !combatant.hidden && (combatant.hasPlayerOwner || actor.type === "pc");
                    if (showToAll) {
                        content += `<li>${recoveryText}</li>`;
                    } else {
                        hasHidden = true;
                        contentHidden += `<li>${recoveryText}</li>`;
                    }
                }
            }
        }
        content += "</ul>";
        contentHidden += "</ul>";

        const chatData = {
            style: CONST.CHAT_MESSAGE_STYLES.OTHER,
            author: game.user._id,
            content,
        };
        await ChatMessage.create(chatData);

        if (hasHidden) {
            await ChatMessage.create({
                ...chatData,
                content: contentHidden,
                whisper: ChatMessage.getWhisperRecipients("GM"),
            });
        }

        return true;
    }

    /**
     * Post-database update handler. Executes on all clients when combat values change.
     * @override
     */
    _onUpdate(changed, options, userId) {
        super._onUpdate(changed, options, userId);

        // Only the active GM runs side effects so multiple connected GMs don't double-fire them
        if (!game.users.activeGM?.isSelf) return;

        // Combat start/reset updates are not turn flow
        if (changed.started !== undefined) return;

        const turnChanged = changed.turn !== undefined;
        const roundChanged = changed.round !== undefined;
        const systemFlagKey = `flags.${game.system.id}`;
        const flagsChanged = foundry.utils.hasProperty(changed, systemFlagKey);

        // If neither the phase pointers nor the custom segment properties updated, exit early
        if (!turnChanged && !roundChanged && !flagsChanged) return;

        // Rewinding must not consume holds or expire effects
        const direction = foundry.utils.getProperty(options, "direction") ?? 1;
        if (direction < 0) return;

        const prevId = foundry.utils.getProperty(options, "previousCombatantId");

        // Segment-boundary maintenance. turnAdvance marks a full-Turn skip (nextRound), where
        // every SPD 1-12 has had a Phase; roundChanged covers the segment-12-to-segment-12
        // wrap, where the currentSegment flag value is unchanged.
        const turnAdvance = foundry.utils.getProperty(options, "turnAdvance") === true;
        const newSegment = foundry.utils.getProperty(changed, `${systemFlagKey}.currentSegment`);
        const boundary = newSegment !== undefined || roundChanged || turnAdvance;

        // Only pointer movement starts a new Phase: flag-only bookkeeping updates
        // (event-log appends, the recovery ledger) must not run turn side effects
        if (!turnChanged && !boundary) return;

        let elapsedSegments;
        if (boundary) {
            // Segments that just ended, oldest first; empty segments count because an
            // aborted combatant's spent Phase may fall in a segment nobody acted in
            const previousSegment = turnAdvance ? null : foundry.utils.getProperty(options, "previousSegment");
            if (turnAdvance) {
                elapsedSegments = null; // A full Turn elapsed: every SPD 1-12 had a Phase
            } else if (previousSegment !== undefined && previousSegment !== null) {
                const segmentsElapsed = foundry.utils.getProperty(options, "segmentsElapsed") ?? 1;
                if (segmentsElapsed >= 12) elapsedSegments = null;
                else
                    elapsedSegments = Array.fromRange(segmentsElapsed).map((i) => ((previousSegment - 1 + i) % 12) + 1);
            }
        }

        // One ordered chain so every step sees its predecessors' writes
        (async () => {
            if (boundary) {
                // SPD-change lockouts first so the hold/abort checks see updated phase
                // eligibility; passed-hold cleanup before the natural-turn clear so
                // spent positional holds are never re-carded
                await this._maintainSpdChanges();
                await this._clearSpentHoldPositions();
                await this._demotePassedPositionalHolds();
                if (turnAdvance) await this._consumeExpiredHeldActions(null);
                await this._clearExpiredAborts(elapsedSegments);
            }

            // Delayed actions can land mid-segment (Delayed Phase's half-DEX
            // position, Extra Phase's own-Phase activation), so this runs on
            // every pointer move, not just at boundaries
            await this._resolveDelayedActions();

            const previousCombatant = prevId ? this.combatants.get(prevId) : null;
            if (previousCombatant?.actor) {
                await this._expireCustomSystemEffects(previousCombatant.actor);

                // A positional hold is spent the moment its held turn ends within the
                // same segment — used if the pointer actually took the slot; passed
                // over unused it demotes to a generic hold (cross-segment endings go
                // through _demotePassedPositionalHolds). A hold declared THIS segment
                // hasn't had its slot yet (the ending turn was the declarer's natural
                // Phase), so declaredAbs === currentAbs is exempt unless the slot was
                // taken.
                const hold = previousCombatant.heldAction;
                if (hold?.mode === "position") {
                    const currentAbs = HeroSystem6eCombatantSingle.absoluteSegment(this.round, this.segment);
                    if (hold.segmentAbs === currentAbs) {
                        const slotTaken = previousCombatant.getFlag(game.system.id, "heldSlotTakenAbs") === currentAbs;
                        if (slotTaken) {
                            await this._spendHold(previousCombatant, { used: true });
                        } else if (hold.declaredAbs !== currentAbs) {
                            await this._demoteHold(previousCombatant);
                        }
                    }
                }
            }

            await this._consumeActiveCombatantHold(prevId);
            if (boundary) await this._segmentStartLightningReflexes();

            // Phase end/start work skips pure pointer resyncs — within-segment
            // updates that land back on the same combatant (LR preempts, mid-segment
            // re-sorts) are not a Phase transition
            const activeCombatant = this.combatant;
            const isResync = !boundary && prevId !== undefined && prevId === activeCombatant?.id;
            if (!isResync && previousCombatant?.actor) {
                await this._onPhaseEnd(previousCombatant, { segmentChanged: boundary });
            }

            // Backfill the slot-taken marker when the update that landed here couldn't
            // write it (player-initiated advances only persist combatants they own)
            const activeHold = activeCombatant?.heldAction;
            if (activeHold?.mode === "position") {
                const nowAbs = HeroSystem6eCombatantSingle.absoluteSegment(this.round, this.segment);
                if (
                    activeHold.segmentAbs === nowAbs &&
                    activeCombatant.getFlag(game.system.id, "heldSlotTakenAbs") !== nowAbs
                ) {
                    await activeCombatant.setFlag(game.system.id, "heldSlotTakenAbs", nowAbs);
                }
            }

            // The incoming combatant's Phase begins: maneuver effects that last "until
            // your next Phase" (Dodge, Block, Brace…) expire now. Effects created at
            // the current world time survive — they were declared this instant.
            // Because aborted Phases are skipped outright, an abort's modifiers
            // naturally persist to the Phase after the spent one (6E2 22).
            if (activeCombatant?.actor) {
                await expireManeuverNextPhaseEffects(activeCombatant.actor);
            }
            if (!isResync && activeCombatant?.actor) {
                await this._onPhaseStart(activeCombatant);
            }
        })().catch((e) => console.error(e));
    }

    /**
     * End-of-Phase work for the combatant whose turn just ended (port of the legacy
     * tracker's _onEndTurn): END-for-movement reporting, Stunned recovery at the end
     * of the character's own Phase (#4565), the KO'd per-Phase free Recovery that
     * wakes characters above STUN -10 (#4567), and — at segment boundaries — turning
     * off non-persistent constant items for Stunned/KO'd actors.
     * @param {Combatant} combatant
     * @param {object} [options]
     * @param {boolean} [options.segmentChanged]
     * @private
     */
    async _onPhaseEnd(combatant, { segmentChanged = false } = {}) {
        if (!this.started) return;
        const actor = combatant?.actor;
        if (!actor) return;

        // Show END spent for movement this Phase (spent realtime by the token's
        // movement recording); the counter resets at the next Phase start
        const endUsedForMovement = combatant.getFlag(game.system.id, "endUsedForMovement") || 0;
        if (endUsedForMovement > 0) {
            await ChatMessage.create({
                style: CONST.CHAT_MESSAGE_STYLES.OTHER,
                author: game.user._id,
                speaker: ChatMessage.getSpeaker({ actor, token: combatant.token }),
                content: `${combatant.name} spent ${endUsedForMovement} END for movement this Phase.`,
                whisper: whisperUserTargetsForActor(actor),
            });
        }

        // At the end of the Segment, non-Persistent powers and skill levels turn
        // off for Stunned/KO'd actors
        if (segmentChanged) {
            for (const other of this.combatants) {
                const otherActor = other.actor;
                if (!otherActor) continue;
                if (otherActor.statuses.has("stunned") || otherActor.statuses.has("knockedOut")) {
                    for (const item of otherActor.getActiveConstantItems?.() ?? []) {
                        if (item.isActivatable?.()) await item.turnOff();
                    }
                }
            }
        }

        // Stunned clears at the end of the character's own Phase (6E2 105); KO'd
        // characters take a free Recovery each of their Phases while STUN >= -10 —
        // that recovery (without preventRecoverFromStun) is what wakes them up
        if (actor.statuses.has("stunned")) {
            await actor.toggleStatusEffect(HeroSystem6eActorActiveEffects.statusEffectsObj.stunEffect.id, {
                active: false,
            });
            await this._combatCard(combatant, `${combatant.name} recovers from being stunned.`);
        } else if (actor.statuses.has("knockedOut")) {
            if ((actor.getCharacteristic("stun")?.value ?? 0) >= -10) {
                await actor.TakeRecovery({ asAction: false, token: combatant.token });
            }
        }
    }

    /**
     * Start-of-Phase work for the incoming combatant (port of the legacy tracker's
     * _onStartTurn): movement-history reset, turnStart effect expiry (adjustment
     * fades — without it drains never fade during combat), non-combat movement
     * shutoff, the resource-upkeep chat card with its Breakfall button (#4559),
     * next-Phase DCV-penalty cleanup, and the instant-AoE region prompt (#4554).
     * Idempotent across re-fires and rewind replays via the spentEndOn key.
     * @param {Combatant} combatant
     * @private
     */
    async _onPhaseStart(combatant) {
        if (!this.started) return;
        const actor = combatant?.actor;
        if (!actor) return;
        const segmentNumber = this.segment;

        // Clear movement history and the END-for-movement counter
        try {
            if (combatant.token?.clearMovementHistory) {
                await combatant.setFlag(game.system.id, "endUsedForMovement", 0);
                await combatant.token.clearMovementHistory();
            }
        } catch (e) {
            console.error(e);
        }

        // Effects that expire at the start of the character's own Phase
        try {
            await expireEffects(actor, "turnStart");
        } catch (e) {
            console.error(e);
        }

        // Stop nonCombatMovement
        if (actor.statuses.has("nonCombatMovement")) {
            await actor.toggleStatusEffect(HeroSystem6eActorActiveEffects.statusEffectsObj.nonCombatMovementEffect.id, {
                active: false,
            });
        }

        // Spend resources for all active powers — but only once per Phase (the key
        // survives rewind-and-replay)
        const roundSegmentKey = this.round + segmentNumber / 100;
        if ((combatant.getFlag(game.system.id, "spentEndOn") || 0) < roundSegmentKey) {
            await combatant.update({ [`flags.${game.system.id}.spentEndOn`]: roundSegmentKey });

            let content = "";
            let tempContent = "";
            let startContent = "";

            if (actor.statuses.size > 0) {
                startContent += `Has the following statuses: ${Array.from(actor.statuses).join(", ")}<br>`;
            }

            for (const ae of actor.temporaryEffects) {
                const remaining = ae._prepareDuration().remaining;
                const remainingText = remaining > 0 ? `in ${toHHMMSS(remaining)}` : "0s";
                tempContent += `<li>${ae.name} fades ${remainingText} ${ae.flags[game.system.id]?.expiresOn ?? ""}</li>`;
            }
            if (tempContent) {
                startContent += `Has the following temporary effects: <ul>${tempContent}</ul>`;
            }

            /**
             * @type {HeroSystemItemResourcesToUse}
             */
            const spentResources = {
                totalEnd: 0,
                totalReserveEnd: 0,
                totalCharges: 0,
            };

            for (const powerUsingResourcesToContinue of actor.items.filter(
                (item) =>
                    item.isActive === true && // Is the power active?
                    item.type !== "skill" && // Natural skills are always on, but only use resources when used/rolled
                    item.system.duration !== CONFIG.HERO.DURATION_TYPES.INSTANT && // Is the power non instant
                    (!item.system.MODIFIER?.find(
                        (o) =>
                            (o.XMLID === "COSTSEND" && o.OPTIONID === "ACTIVATE") ||
                            o.XMLID === "COSTSENDONLYTOACTIVATE",
                    ) || // Does the power use END continuously?
                        (item.system.chargeModifier && !item.system.chargeModifier.CONTINUING)), // Does the power use charges but is not continuous (as that is tracked by an effect when made active)?
            )) {
                const {
                    error,
                    warning,
                    resourcesUsedDescription,
                    resourcesUsedDescriptionRenderedRoll,
                    resourcesRequired,
                } = await userInteractiveVerifyOptionallyPromptThenSpendResources(powerUsingResourcesToContinue, {});

                if (error || warning) {
                    content += `<li>(${powerUsingResourcesToContinue.name} ${error || warning}: power turned off)</li>`;
                    await powerUsingResourcesToContinue.toggle();
                } else if (
                    !(
                        resourcesRequired.totalCharges === 0 &&
                        resourcesRequired.totalEnd === 0 &&
                        resourcesRequired.totalReserveEnd === 0
                    )
                ) {
                    content += resourcesUsedDescription
                        ? `<li>${powerUsingResourcesToContinue.detailedName()} spent ${resourcesUsedDescription}${resourcesUsedDescriptionRenderedRoll}</li>`
                        : "";

                    spentResources.totalEnd += resourcesRequired.totalEnd;
                    spentResources.totalReserveEnd += resourcesRequired.totalReserveEnd;
                    spentResources.totalCharges += resourcesRequired.totalCharges;
                }
            }

            // Encumbrance END upkeep
            const encumbered = actor.effects.find((effect) => effect.flags?.[game.system.id]?.encumbrance);
            if (encumbered) {
                const endCostPerTurn = Math.abs(parseInt(encumbered.flags?.[game.system.id]?.dcvDex)) - 1;
                if (endCostPerTurn > 0) {
                    spentResources.totalEnd += endCostPerTurn;
                    content += `<li>${encumbered.name} (${endCostPerTurn})</li>`;

                    const value = parseInt(actor.getCharacteristic("end").value);
                    await actor.updateCharacteristics([["end", { value: value - endCostPerTurn }]], {});
                }
            }

            if (
                startContent !== "" ||
                content !== "" ||
                spentResources.totalEnd > 0 ||
                spentResources.totalReserveEnd > 0 ||
                spentResources.totalCharges > 0
            ) {
                if (
                    spentResources.totalEnd > 0 ||
                    spentResources.totalReserveEnd > 0 ||
                    spentResources.totalCharges > 0
                ) {
                    content = `${startContent}Spent ${spentResources.totalEnd} END, ${spentResources.totalReserveEnd} reserve END, and ${
                        spentResources.totalCharges
                    } charge${spentResources.totalCharges > 1 ? "s" : ""} on turn ${
                        this.round
                    } segment ${segmentNumber}:<ul>${content}</ul>`;
                } else {
                    content = startContent;
                }

                // BREAKFALL from prone?
                if (actor.statuses.has("prone")) {
                    const breakFallItem = actor.items.find((o) => o.system.XMLID === "BREAKFALL" && o.isActive);
                    if (breakFallItem) {
                        content += `
                            <button class="roll-breakfall"
                                data-actor-uuid="${actor.uuid}"
                                data-target-token-id="${combatant.tokenId}"
                                title="You can use BREAKFALL to regain control from being prone without the need to take a Half Phase action.">
                                Roll Breakfall
                            </button>
                        `;
                    }
                }

                await ChatMessage.create({
                    author: game.user._id,
                    style: CONST.CHAT_MESSAGE_STYLES.OTHER,
                    content,
                    whisper: whisperUserTargetsForActor(actor),
                    speaker: ChatMessage.getSpeaker({ actor, token: combatant.token }),
                });
            }
        }

        // Some attacks include a DCV penalty applied as an ActiveEffect flagged
        // nextPhase; it goes away at the start of our Phase
        const removeOnNextPhase = actor.effects.filter(
            (o) => o.flags[game.system.id]?.nextPhase && o.duration.startTime < game.time.worldTime,
        );
        for (const ae of removeOnNextPhase) {
            await ae.delete();
        }

        // Instant AoE templates have done their work once the Phase moves on (#4554)
        try {
            await promptToDeleteAoeInstantRegions();
        } catch (e) {
            console.error(e);
        }
    }

    /* -------------------------------------------- */
    /*  Delayed actions (Extra Time, Haymaker)      */
    /* -------------------------------------------- */

    /**
     * Delayed actions are things declared now that land later: a Haymaker (end of
     * the next Segment, 6E2), or a power/attack with the Extra Time Limitation
     * (6E1 376-378; 5ER 290-291 — the two editions are word-for-word identical).
     * Stored on the combatant flag `delayedActions` keyed by id:
     *
     *   { kind: "haymaker"|"attack"|"activation",
     *     label, itemUuid, declaredAbs, resolveAbs,
     *     priority,          // marker position in the landing segment; null = very end
     *     commit,            // true = no other Actions until it resolves (Extra Phase)
     *     targetTokenIds? }
     *
     * The timeline shows a marker row in the landing segment; resolution happens in
     * the pointer-move maintenance chain; a chat Cancel button covers interruption
     * (GM-adjudicated — RAW makes interruption a judgment call, and END spent up
     * front stays spent).
     */

    /**
     * Classifies an item's Extra Time Limitation into a delayed-action plan, or
     * null when the item has none that needs scheduling (Full Phase is pure action
     * economy; durations resolve on the character's DEX N segments later).
     * Option semantics verified against 6E1 377-378 / 5ER 290-291.
     * @param {Actor} actor
     * @param {Item} item
     * @returns {{kind: string, label: string, resolveAbs: number, priority: number|null,
     *            commit: boolean}|null}
     */
    extraTimePlan(actor, item) {
        if (!this.started || !actor || !item) return null;
        const extraTime = item.findModsByXmlid?.("EXTRATIME");
        if (!extraTime) return null;
        const combatant = this.combatants.find((c) => c.actorId === actor.id);
        if (!combatant) return null;

        const currentAbs = HeroSystem6eCombatantSingle.absoluteSegment(this.round, this.segment);
        const characteristicKey = actor.system?.initiativeCharacteristic ?? "dex";
        const dex = actor.system?.characteristics?.[characteristicKey]?.value ?? 10;
        const optionId = extraTime.OPTIONID ?? "";
        const alias = extraTime.OPTION_ALIAS ?? extraTime.ALIAS ?? "";
        const matches = (needle) => optionId === needle.id || alias.toLowerCase().includes(needle.text);

        // Delayed Phase (-1/4): activates at HALF the character's DEX in the same
        // Phase (a Half Phase Action still happens at normal DEX)
        if (matches({ id: "DELAYEDPHASE", text: "delayed phase" })) {
            return {
                kind: "attack",
                label: `${item.name} (Delayed Phase)`,
                resolveAbs: currentAbs,
                priority: Math.floor(dex / 2),
                commit: false,
            };
        }
        // Extra Segment (-1/2): activates at the very end of the NEXT Segment,
        // multiple such powers in DEX order; a moved target is missed (adjudicated)
        if (matches({ id: "SEGMENT", text: "extra segment" })) {
            return {
                kind: "attack",
                label: `${item.name} (Extra Segment)`,
                resolveAbs: currentAbs + 1,
                priority: null,
                commit: false,
            };
        }
        // Full Phase (-1/2): activates on normal DEX; pure action economy — nothing
        // to schedule
        if (matches({ id: "FULL", text: "full phase" })) return null;
        // Extra Phase (-3/4): activates on the character's DEX in their SECOND
        // Phase; no other Actions in between or the power stops; END paid up front
        if (matches({ id: "EXTRA", text: "extra phase" })) {
            const spd = combatant.combatSpd;
            return {
                kind: "attack",
                label: `${item.name} (Extra Phase)`,
                resolveAbs: spd > 0 ? HeroSystem6eCombatantSingle.nextPhaseAbs(spd, currentAbs + 1) : currentAbs + 12,
                priority: dex,
                commit: true,
            };
        }
        // Durations: activates on the character's DEX N segments later (Andarra,
        // 6E1 377); they may act in the meantime unless the power needs an Attack
        // Roll — table-adjudicated, noted on the card
        const durations = [
            { id: "TURN", text: "1 turn", segments: 12 },
            { id: "MINUTE", text: "1 minute", segments: 60 },
            { id: "FIVEMINUTES", text: "5 minutes", segments: 300 },
            { id: "TWENTYMINUTES", text: "20 minutes", segments: 1200 },
            { id: "HOUR", text: "1 hour", segments: 3600 },
            { id: "SIXHOURS", text: "6 hours", segments: 21600 },
            { id: "DAY", text: "1 day", segments: 86400 },
        ];
        for (const duration of durations) {
            if (matches(duration)) {
                return {
                    kind: "attack",
                    label: `${item.name} (Extra Time: ${extraTime.OPTION_ALIAS ?? duration.text})`,
                    resolveAbs: currentAbs + duration.segments,
                    priority: dex,
                    commit: false,
                };
            }
        }
        // Longer periods (a week and up) cannot land inside a combat
        return null;
    }

    /**
     * Registers a delayed action for the actor's combatant and cards it with a
     * Cancel button. Owners write their own combatant flags, so no GM relay is
     * needed; the ledger append relays itself for players.
     * @param {Actor} actor
     * @param {object} plan - See {@link extraTimePlan}; itemUuid/targetTokenIds added here
     * @param {Item} [item]
     * @returns {Promise<string|null>} The delayed-action id, or null
     */
    async scheduleDelayedAction(actor, plan, item = null) {
        if (!this.started || !actor || !plan) return null;
        const combatant = this.combatants.find((c) => c.actorId === actor.id);
        if (!combatant) return null;
        const id = foundry.utils.randomID();
        const currentAbs = HeroSystem6eCombatantSingle.absoluteSegment(this.round, this.segment);
        const record = {
            kind: plan.kind,
            label: plan.label,
            itemUuid: item?.uuid ?? plan.itemUuid ?? null,
            declaredAbs: currentAbs,
            resolveAbs: plan.resolveAbs,
            priority: plan.priority ?? null,
            commit: !!plan.commit,
            targetTokenIds: Array.from(game.user.targets ?? []).map((t) => t.id),
        };
        // Roll-at-resolution attacks carry their declaration inputs for the replay
        if (plan.actionData) record.actionData = plan.actionData;
        await combatant.setFlag(game.system.id, `delayedActions.${id}`, record);

        const landing =
            record.priority !== null
                ? `at DEX ${record.priority} in ${HeroSystem6eCombatantSingle.phaseLabel(record.resolveAbs)}`
                : `at the very end of ${HeroSystem6eCombatantSingle.phaseLabel(record.resolveAbs)}`;
        const commitText = record.commit ? " They can take no other Actions until it does." : "";
        await this._combatCard(
            combatant,
            `${actor.name} begins ${record.label} — it goes off ${landing}.${commitText}
            <button type="button" class="hero-delayed-cancel" data-combat-id="${this.id}" data-combatant-id="${combatant.id}" data-delayed-id="${id}">Cancel (interrupted)</button>`,
        );
        await this.logEvent("delayed.declare", { combatant, data: { ...record, id } });
        return id;
    }

    /**
     * Schedules a declared Haymaker's delayed landing: the attack resolves at the
     * end of the NEXT Segment (6E2), with the -5 DCV effect persisting until then.
     * Called from the attack workflow instead of ending the maneuver immediately.
     * @param {Actor} actor
     * @param {Item} [item] - The attack the Haymaker boosts
     * @returns {Promise<boolean>} Whether a resolution was scheduled
     */
    async scheduleHaymaker(actor, item = null) {
        if (!this.started || !actor) return false;
        const currentAbs = HeroSystem6eCombatantSingle.absoluteSegment(this.round, this.segment);
        const id = await this.scheduleDelayedAction(
            actor,
            {
                kind: "haymaker",
                label: "their Haymaker",
                resolveAbs: currentAbs + 1,
                priority: null,
                commit: false,
            },
            item,
        );
        return id !== null;
    }

    /**
     * Whether the combatant has any scheduled delayed action, optionally of a kind.
     * Reads the legacy single haymaker flag from in-flight combats too.
     * @param {Combatant} combatant
     * @param {string} [kind]
     * @returns {boolean}
     */
    hasDelayedAction(combatant, kind = null) {
        return this.delayedActionsFor(combatant, kind).length > 0;
    }

    /**
     * The combatant's scheduled delayed actions as [id, record] pairs (legacy
     * haymaker flag included), optionally filtered by kind.
     * @param {Combatant} combatant
     * @param {string} [kind]
     * @returns {[string, object][]}
     */
    delayedActionsFor(combatant, kind = null) {
        const records = Object.entries(combatant?.getFlag(game.system.id, "delayedActions") ?? {});
        const legacy = combatant?.getFlag(game.system.id, "haymaker");
        if (legacy) {
            records.push(["legacy-haymaker", { kind: "haymaker", label: "their Haymaker", commit: false, ...legacy }]);
        }
        return records.filter(([, record]) => !kind || record.kind === kind);
    }

    /**
     * Cancels a scheduled delayed action (interruption: the character took damage,
     * was Stunned/Knocked Out, or the target moved — GM-adjudicated; END already
     * spent stays spent per RAW).
     * @param {string} combatantId
     * @param {string} [delayedId] - Defaults to the combatant's only/legacy record
     * @returns {Promise<void>}
     */
    async cancelDelayedAction(combatantId, delayedId = null) {
        const combatant = this.combatants.get(combatantId);
        if (!combatant?.isOwner) return;
        const records = this.delayedActionsFor(combatant);
        const entry = delayedId ? records.find(([id]) => id === delayedId) : records[0];
        if (!entry) return;
        await this._finishDelayedAction(combatant, entry[0], entry[1], { cancelled: true });
    }

    /**
     * Backward-compatible alias for in-flight Haymaker cancel buttons.
     * @param {string} combatantId
     * @returns {Promise<void>}
     */
    async cancelHaymaker(combatantId) {
        const combatant = this.combatants.get(combatantId);
        if (!combatant?.isOwner) return;
        const entry = this.delayedActionsFor(combatant, "haymaker")[0];
        if (entry) await this._finishDelayedAction(combatant, entry[0], entry[1], { cancelled: true });
    }

    /**
     * Resolves delayed actions whose moment has arrived. Runs on every pointer
     * move: a record lands when its segment has fully passed, when the count
     * passes below its declared position within the segment, or — for records
     * that activate on the character's own DEX — when their Phase begins.
     * @private
     */
    async _resolveDelayedActions() {
        if (!this.started) return;
        const currentAbs = HeroSystem6eCombatantSingle.absoluteSegment(this.round, this.segment);
        const actingPriority = this.getFlag(game.system.id, "actingPriority");
        const activeId = this.combatant?.id ?? null;
        for (const combatant of this.combatants) {
            for (const [id, record] of this.delayedActionsFor(combatant)) {
                const segmentPassed = currentAbs > record.resolveAbs;
                const countPassed =
                    currentAbs === record.resolveAbs &&
                    record.priority !== null &&
                    record.priority !== undefined &&
                    actingPriority !== null &&
                    actingPriority !== undefined &&
                    actingPriority < record.priority;
                const ownPhase = currentAbs === record.resolveAbs && combatant.id === activeId;
                if (segmentPassed || countPassed || ownPhase) {
                    await this._finishDelayedAction(combatant, id, record, { cancelled: false });
                }
            }
        }
    }

    /**
     * Shared teardown: clears the record, performs kind-specific work (Haymaker
     * effect/maneuver cleanup; deferred activations actually turn on), cards the
     * outcome, and ledgers it.
     * @param {Combatant} combatant
     * @param {string} id
     * @param {object} record
     * @param {object} options
     * @param {boolean} options.cancelled
     * @private
     */
    async _finishDelayedAction(combatant, id, record, { cancelled }) {
        const actor = combatant.actor;
        if (id === "legacy-haymaker") {
            await combatant.update({ [`flags.${game.system.id}.haymaker`]: null });
        } else {
            await combatant.update({ [`flags.${game.system.id}.delayedActions.-=${id}`]: null });
        }

        // A cancelled Haymaker (or a legacy declare-now record) ends the maneuver
        // here; a roll-at-landing Haymaker keeps it ACTIVE — its +4 DC / -5 DCV
        // must still apply to the roll, and the attack flow's own tail turns the
        // maneuver off once the attack has rolled
        if (record.kind === "haymaker" && (cancelled || !record.actionData)) {
            const haymakerEffect = actor?.effects.find((e) => e.statuses.has("haymaker"));
            if (haymakerEffect) await haymakerEffect.delete();
            const haymakerItem = actor?.items.find((i) => i.system?.XMLID === "HAYMAKER" && i.isActive);
            if (haymakerItem) await haymakerItem.toggle();
        }

        let outcome;
        if (cancelled) {
            outcome = `${actor?.name}'s ${record.label} is interrupted and lost${record.kind === "activation" ? " (resources already spent stay spent)" : ""}.`;
        } else if (record.kind === "activation") {
            const item = record.itemUuid ? fromUuidSync(record.itemUuid) : null;
            if (item && !item.isActive) {
                // Resources and rolls were paid when the activation began (RAW:
                // END up front); delayedResolution skips re-charging them
                await item.turnOn({ delayedResolution: true, token: combatant.token });
            }
            outcome = item?.isActive
                ? `${actor?.name}'s ${record.label} activates now (${HeroSystem6eCombatantSingle.phaseLabel(record.resolveAbs)}).`
                : `${actor?.name}'s ${record.label} finished its Extra Time but could not activate — adjudicate (interrupted? Stunned?).`;
        } else if ((record.kind === "attack" || record.kind === "haymaker") && record.actionData) {
            // The attack is ROLLED now (6E1 377 / 6E2 68: it happens when it goes
            // off); the stored declaration rides on the message flag
            outcome = null;
            const hint =
                record.kind === "haymaker"
                    ? "+4 Damage Classes; END is paid with this roll. If the target moved 1m+ or the attacker took Knockback, was Stunned, or Knocked Out, use Cancel on the wind-up card instead — the Phase is wasted."
                    : "A target that moved since the declaration is missed automatically; resources were already spent when the activation began.";
            const rollCard = {
                speaker: ChatMessage.getSpeaker({ actor }),
                content: `${actor?.name}'s ${record.label} ${record.kind === "haymaker" ? "lands" : "goes off"} now (${HeroSystem6eCombatantSingle.phaseLabel(record.resolveAbs)}) — roll the attack.
                    <button type="button" class="hero-delayed-roll">Roll the attack now</button>
                    <p class="hint">${hint}</p>`,
                flags: {
                    [game.system.id]: {
                        delayedAttack: { itemUuid: record.itemUuid, ...record.actionData },
                    },
                },
            };
            if (combatant.hidden) rollCard.whisper = ChatMessage.getWhisperRecipients("GM");
            await ChatMessage.create(rollCard);
        } else if (record.kind === "haymaker") {
            outcome = `${actor?.name}'s ${record.label} resolves now — apply its damage (${HeroSystem6eCombatantSingle.phaseLabel(record.resolveAbs)}).`;
        } else {
            outcome = `${actor?.name}'s ${record.label} goes off now (${HeroSystem6eCombatantSingle.phaseLabel(record.resolveAbs)}) — resolve its effect. A target that moved since the declaration is missed automatically.`;
        }
        if (outcome) await this._combatCard(combatant, outcome);
        await this.logEvent(cancelled ? "delayed.cancel" : "delayed.resolve", {
            combatant,
            data: { id, kind: record.kind, label: record.label, resolveAbs: record.resolveAbs ?? null },
        });
    }

    /* -------------------------------------------- */
    /*  Combatant add/delete reconciliation         */
    /* -------------------------------------------- */

    /** @override */
    _preCreateDescendantDocuments(parent, collection, data, options, userId) {
        super._preCreateDescendantDocuments(parent, collection, data, options, userId);
        if (collection === "combatants" && this.started) {
            // Captured before core re-sorts turns under the numeric index
            this._pointerBeforeCombatantChange = this.combatant?.id ?? null;
        }
    }

    /** @override */
    _onCreateDescendantDocuments(parent, collection, documents, data, options, userId) {
        super._onCreateDescendantDocuments(parent, collection, documents, data, options, userId);
        if (collection !== "combatants") return;
        const activeIdBefore = this._pointerBeforeCombatantChange ?? null;
        this._pointerBeforeCombatantChange = null;
        if (!game.users.activeGM?.isSelf || !this.started) return;
        this._reconcileCreatedCombatants(documents, activeIdBefore).catch((e) => console.error(e));
    }

    /** @override */
    _preDeleteDescendantDocuments(parent, collection, ids, options, userId) {
        super._preDeleteDescendantDocuments(parent, collection, ids, options, userId);
        if (collection === "combatants" && this.started) {
            // Snapshot while the combatants (and their priorities) still resolve;
            // only present on the initiating client — _onDelete falls back otherwise
            this._preDeleteCapture = {
                activeId: this.combatant?.id ?? null,
                events: ids
                    .map((id) => {
                        const combatant = this.combatants.get(id);
                        if (!combatant) return null;
                        return this.buildEvent("combatant.remove", {
                            combatant,
                            data: { snapshot: { tokenId: combatant.tokenId ?? null } },
                        });
                    })
                    .filter(Boolean),
            };
        }
    }

    /** @override */
    _onDeleteDescendantDocuments(parent, collection, documents, ids, options, userId) {
        super._onDeleteDescendantDocuments(parent, collection, documents, ids, options, userId);
        if (collection !== "combatants") return;
        const capture = this._preDeleteCapture ?? null;
        this._preDeleteCapture = null;
        if (!game.users.activeGM?.isSelf || !this.started) return;
        this._reconcileDeletedCombatants(capture, documents).catch((e) => console.error(e));
    }

    /**
     * Repairs combat state after combatants join mid-combat: duplicate adds are
     * removed, tie-break rolls are backfilled for every recorded position (a
     * newcomer otherwise sorts at the +0.50 default — #4566), initiative and the
     * SPD baseline are seeded, stale hold/abort effects bound to removed combatants
     * are cleared, and the turn index is re-pointed at the active combatant.
     * @param {Combatant[]} created
     * @param {string|null} activeIdBefore
     * @private
     */
    async _reconcileCreatedCombatants(created, activeIdBefore) {
        // 1. De-dupe: a token (or tokenless actor) fields exactly one combatant
        const deleteIds = new Set();
        let legacyDupes = false;
        for (const combatant of created) {
            if (!this.combatants.has(combatant.id)) continue;
            const key = combatant.tokenId || combatant.actorId;
            if (!key) continue;
            const dupes = this.combatants.filter((c) => (c.tokenId || c.actorId) === key);
            if (dupes.length <= 1) continue;
            if (dupes.length > 2) legacyDupes = true;
            const keeper = dupes.find((c) => !created.some((n) => n.id === c.id)) ?? dupes[0];
            for (const dupe of dupes) {
                if (dupe.id !== keeper.id && created.some((n) => n.id === dupe.id)) deleteIds.add(dupe.id);
            }
        }
        if (deleteIds.size > 0) {
            await this.deleteEmbeddedDocuments("Combatant", [...deleteIds]);
            ui.notifications.info(`Duplicate combatant(s) removed — one combatant per token.`);
        }
        if (legacyDupes) {
            ui.notifications.warn(
                `This combat has legacy per-Phase duplicate combatants. Run game.herosystem6e.migrateCombatsToSingleCombatantTracker() to collapse them.`,
            );
        }
        const survivors = created.filter((c) => this.combatants.has(c.id));
        if (survivors.length === 0) return;

        // 2. Backfill tie-break rolls (and member sub-rolls) for every recorded position
        const masterRollsCache = foundry.utils.deepClone(this.getFlag(game.system.id, "segmentRolls") ?? {});
        const rollsDirty = this._backfillTieRolls(masterRollsCache, survivors);

        // 3. Stale effect reconciliation: hold/abort records bound to a combatant
        // no longer in this combat are meaningless on re-add
        for (const combatant of survivors) {
            for (const effect of combatant.actor?.effects ?? []) {
                const isHold = effect.statuses.has("holding");
                const isAbort = effect.statuses.has("aborted");
                if (!isHold && !isAbort) continue;
                const record = effect.getFlag(game.system.id, isHold ? "hold" : "abort");
                if (record?.combatantId && !this.combatants.has(record.combatantId)) {
                    await effect.delete();
                    await this._combatCard(
                        combatant,
                        `${combatant.actor.name}'s stale ${isHold ? "Held Action" : "abort"} from a removed combatant was cleared.`,
                    );
                }
            }
        }

        // 4. Seed initiative and the SPD-change baseline
        await this.updateEmbeddedDocuments(
            "Combatant",
            survivors.map((c) => ({
                _id: c.id,
                initiative: this.getInitiativePriority(c, this.segment),
                [`flags.${game.system.id}.knownSpd`]: c.combatSpd,
            })),
        );

        // 5. Re-point the turn index at the active combatant (the index addresses a
        // freshly sorted array) and commit rolls + ledger in one update
        if (!HeroCompatibility.isV14) {
            this._turns = null;
            this.setupTurns();
        }
        const payload = {};
        if (rollsDirty) payload[`flags.${game.system.id}.segmentRolls`] = masterRollsCache;
        Object.assign(
            payload,
            this.eventLogAppendPayload(survivors.map((c) => this.buildEvent("combatant.add", { combatant: c }))),
        );
        const activeId = activeIdBefore ?? this.combatant?.id ?? null;
        if (activeId && this.combatants.has(activeId)) {
            const index = this.turns.findIndex((t) => t.id === activeId);
            if (index !== -1 && index !== this.turn) payload.turn = index;
        }
        await this.update(payload);
    }

    /**
     * Repairs combat state after combatants are removed mid-combat: the removal is
     * ledgered with a snapshot (history rows survive), and the turn index is
     * re-pointed — at the surviving active combatant, or at the next combatant by
     * the recorded acting-priority threshold when the active one was deleted.
     * @param {{activeId: string|null, events: object[]}|null} capture
     * @param {Combatant[]} documents - The deleted combatant documents (detached)
     * @private
     */
    async _reconcileDeletedCombatants(capture, documents) {
        // The initiating client snapshots in _preDelete; other clients (e.g. the GM
        // relaying a player deletion) reconstruct from the detached documents
        const events =
            capture?.events ??
            documents.map((combatant) =>
                this.buildEvent("combatant.remove", {
                    combatant,
                    priority: 0,
                    data: { snapshot: { tokenId: combatant.tokenId ?? null } },
                }),
            );
        const activeId = capture?.activeId ?? this.previous?.combatantId ?? null;

        if (!HeroCompatibility.isV14) {
            this._turns = null;
            this.setupTurns();
        }
        const payload = this.eventLogAppendPayload(events);

        if (activeId && this.combatants.has(activeId)) {
            const index = this.turns.findIndex((t) => t.id === activeId);
            if (index !== -1 && index !== this.turn) payload.turn = index;
        } else if (activeId) {
            // The active combatant was deleted: select the next actor below the
            // recorded acting position, exactly as nextTurn's threshold does
            const segment = this.segment;
            const currentAbs = HeroSystem6eCombatantSingle.absoluteSegment(this.round, segment);
            const priorPriority = this.getFlag(game.system.id, "actingPriority");
            const candidates = this.combatants.contents
                .filter((c) => {
                    if (!this._takesTurnInSegment(c, segment, { queryAbs: currentAbs })) return false;
                    const hold = c.heldAction;
                    const heldHere = hold?.mode === "position" && hold.segmentAbs === currentAbs;
                    if (heldHere && c.getFlag(game.system.id, "heldSlotTakenAbs") === currentAbs) return false;
                    if (priorPriority === null || priorPriority === undefined) return true;
                    return this.getInitiativePriority(c, segment) < priorPriority;
                })
                .sort((a, b) => this._comparePriority(a, b, this, segment));
            const target = candidates[0] ?? null;
            if (target) {
                const index = this.turns.findIndex((t) => t.id === target.id);
                if (index !== -1) {
                    payload.turn = index;
                    payload[`flags.${game.system.id}.actingPriority`] = this.getInitiativePriority(target, segment);
                }
            }
        }
        await this.update(payload);
    }

    /**
     * Clears an event/generic hold when the holder's natural turn comes around: the
     * arriving Phase replaces the banked one. Guarded against self-advance from the
     * declaring Phase itself (declaring a hold ends the turn, which would otherwise
     * consume the hold in the same breath). In sparse combats every advance leads
     * from the holder back to the holder, so the guard checks the recorded
     * declaration position rather than exempting all self-advances — otherwise a
     * solo holder banks an extra action forever. Bare-status holds carry no record
     * and stay GM-adjudicated. Positional holds are exempt; they expire with their
     * slot.
     * @param {string|undefined} previousCombatantId
     * @private
     */
    async _consumeActiveCombatantHold(previousCombatantId) {
        if (!this.started) return;
        const combatant = this.combatant;
        const actor = combatant?.actor;
        const hold = combatant?.heldAction;
        if (!actor || !hold) return;
        if (combatant.id === previousCombatantId) {
            const declaredAbs = hold.declaredAbs;
            const currentAbs = HeroSystem6eCombatantSingle.absoluteSegment(this.round, this.segment);
            if (declaredAbs === undefined || declaredAbs >= currentAbs) return;
        }
        if (!combatant.hasPhaseInSegment(this.segment)) return;
        // Positional holds expire with their slot, never at a natural Phase
        if (hold.mode === "position") return;

        const holdingEffect = combatant.heldActionEffect;
        if (!holdingEffect) return;
        await holdingEffect.delete();

        await this._combatCard(
            combatant,
            `${actor.name}'s Held Action was replaced by their natural Phase in ${this.currentPhaseLabel}.`,
        );
        await this.logEvent("hold.consume", { combatant, data: { mode: hold.mode } });
    }

    /**
     * Detects SPD changes (Aid/Drain, form switches) since the previous segment boundary and
     * applies the SPD-change lockout: the character cannot act until both the old and the new
     * SPD would have had a Phase (6E2 17; 5ER 357). Also clears lockouts once they have passed.
     * Detection polls at segment boundaries so ActiveEffect-driven changes are caught without
     * actor-update hooks; a change made and reverted within one segment is intentionally ignored.
     * @private
     */
    async _maintainSpdChanges() {
        if (!this.started) return;

        const currentAbs = HeroSystem6eCombatantSingle.absoluteSegment(this.round, this.segment);
        const combatantUpdates = [];

        for (const combatant of this.combatants) {
            const actor = combatant.actor;
            if (!actor) continue;

            // The baseline tracks both the effective SPD (with active effects) and
            // the sheet's source value: an effective-only change is adjustment-driven
            // (Aid/Drain — the mandatory lockout applies); a source change is a
            // voluntary edit, which only takes effect at Post-Segment 12
            const sourceSpd = Number(actor._source?.system?.characteristics?.spd?.value);
            const pending = combatant.getFlag(game.system.id, "pendingSpd");
            const rawKnown = combatant.getFlag(game.system.id, "knownSpd");
            const known =
                rawKnown === undefined || rawKnown === null
                    ? undefined
                    : typeof rawKnown === "object"
                      ? rawKnown
                      : { effective: rawKnown, source: rawKnown };
            const lockout = combatant.getFlag(game.system.id, "spdLockout");

            if (known === undefined) {
                combatantUpdates.push({
                    _id: combatant.id,
                    [`flags.${game.system.id}.knownSpd`]: { effective: combatant.combatSpd, source: sourceSpd },
                });
                continue;
            }

            // A deferred voluntary change applies once Post-Segment 12 has passed
            // since it was declared — the change is free at that point
            if (pending) {
                const declaredRound = HeroSystem6eCombatantSingle.roundOf(pending.declaredAbs ?? currentAbs);
                if (currentAbs > declaredRound * 12 + 12) {
                    combatantUpdates.push({
                        _id: combatant.id,
                        [`flags.${game.system.id}.pendingSpd`]: null,
                        [`flags.${game.system.id}.knownSpd`]: { effective: pending.newSpd, source: sourceSpd },
                    });
                    await this._combatCard(
                        combatant,
                        `${actor.name}'s SPD change to ${pending.newSpd} takes effect (Post-Segment 12 has passed).`,
                    );
                    await this.logEvent("spd.clear", {
                        combatant,
                        data: { previousSpd: known.effective, newSpd: pending.newSpd, deferred: true },
                    });
                }
                continue;
            }

            // combatant.combatSpd would report the OLD value while a pendingSpd flag
            // exists, so read the live effective SPD directly here
            const spd = combatant.combatSpd;

            if (spd !== known.effective || (Number.isFinite(sourceSpd) && sourceSpd !== known.source)) {
                const sourceChanged = Number.isFinite(sourceSpd) && sourceSpd !== known.source;
                const effectiveChanged = spd !== known.effective;

                // Purely voluntary (sheet edit): defer to Post-Segment 12 (6E2 17;
                // 5ER 357 — voluntary changes wait for the end of the Turn)
                if (sourceChanged && !effectiveChangedBeyondSource(spd, known, sourceSpd)) {
                    combatantUpdates.push({
                        _id: combatant.id,
                        [`flags.${game.system.id}.pendingSpd`]: { newSpd: spd, declaredAbs: currentAbs },
                    });
                    await this._combatCard(
                        combatant,
                        `${actor.name}'s SPD was changed from ${known.effective} to ${spd}. A voluntary SPD change takes effect at Post-Segment 12; until then they act at SPD ${known.effective}.`,
                    );
                    await this._whisperSpdOverridePrompt(combatant, known.effective, spd);
                    await this.logEvent("spd.deferred", {
                        combatant,
                        data: { previousSpd: known.effective, newSpd: spd },
                    });
                    continue;
                }

                // Adjustment-driven (or mixed): the mandatory lockout applies now
                const update = {
                    _id: combatant.id,
                    [`flags.${game.system.id}.knownSpd`]: { effective: spd, source: sourceSpd },
                };
                if (sourceChanged && effectiveChanged) {
                    // Both moved in one poll window: treat as adjustment, but tell the GM
                    await ChatMessage.create({
                        content: `<p>${actor.name}'s SPD changed in both sheet value and active effects at once; treating it as an adjustment-driven change (lockout applies). Use Cancel Abort/rewind tools if this was a voluntary edit.</p>`,
                        whisper: ChatMessage.getWhisperRecipients("GM"),
                    });
                }
                Object.assign(update, this._spdLockoutUpdate(combatant, known, spd, currentAbs));
                combatantUpdates.push(update);
                continue;
            }

            if (lockout?.lockoutEndAbs && currentAbs >= lockout.lockoutEndAbs) {
                await combatant.unsetFlag(game.system.id, "spdLockout");
                await this.logEvent("spd.clear", { combatant, data: { previousSpd: lockout.previousSpd } });
            }
        }

        if (combatantUpdates.length > 0) {
            await this.updateEmbeddedDocuments("Combatant", combatantUpdates);
        }

        // Helper hoisted for readability: a source-only change means the effective
        // SPD moved exactly with the sheet (no separate adjustment component)
        function effectiveChangedBeyondSource(spd, known, sourceSpd) {
            const sourceDelta = sourceSpd - (known.source ?? sourceSpd);
            return spd - known.effective !== sourceDelta;
        }
    }

    /**
     * Builds the spdLockout flag entry (and posts the card + ledger event) for an
     * adjustment-driven SPD change, using the edition-appropriate rule:
     * 6e (6E2 17) — cannot act until both SPDs would have had a Phase;
     * 5e (5ER 357) — cannot act until the next Segment that is a Phase for BOTH.
     * @param {Combatant} combatant
     * @param {{effective: number, source: number}} known
     * @param {number} newSpd
     * @param {number} currentAbs
     * @returns {object} Flag-path fragment for the combatant update
     * @private
     */
    _spdLockoutUpdate(combatant, known, newSpd, currentAbs) {
        const oldSpd = known.effective;
        // A change from or to SPD 0 has no pending old/new Phase to wait for
        if (!(oldSpd > 0 && newSpd > 0)) return {};

        const is5e = !!combatant.actor?.is5e;
        const lockoutEndAbs = is5e
            ? HeroSystem6eCombatantSingle.nextSharedPhaseAbs(oldSpd, newSpd, currentAbs)
            : Math.max(
                  HeroSystem6eCombatantSingle.nextPhaseAbs(oldSpd, currentAbs),
                  HeroSystem6eCombatantSingle.nextPhaseAbs(newSpd, currentAbs),
              );
        if (lockoutEndAbs <= currentAbs) return {};

        const ruleText = is5e
            ? `They cannot act until the next Segment that is a Phase for both SPDs`
            : `They cannot act until both SPDs would have had a Phase`;
        this._combatCard(
            combatant,
            `${combatant.actor.name}'s SPD changed from ${oldSpd} to ${newSpd}. ${ruleText} (${HeroSystem6eCombatantSingle.phaseLabel(lockoutEndAbs)}).`,
        ).catch((e) => console.error(e));
        this.logEvent("spd.lockout", {
            combatant,
            data: { previousSpd: oldSpd, newSpd, lockoutEndAbs, is5e },
        }).catch((e) => console.error(e));

        return {
            [`flags.${game.system.id}.spdLockout`]: {
                previousSpd: oldSpd,
                // Rewinds revert to the full pre-change baseline
                previousKnown: known,
                lockoutEndAbs,
                lockoutStartAbs: currentAbs,
            },
        };
    }

    /**
     * Whispers the GM an "apply immediately" escape hatch for a deferred voluntary
     * SPD change (GM fiat: treat it as an immediate change with the normal lockout).
     * @param {Combatant} combatant
     * @param {number} oldSpd
     * @param {number} newSpd
     * @private
     */
    async _whisperSpdOverridePrompt(combatant, oldSpd, newSpd) {
        const whisper = ChatMessage.getWhisperRecipients("GM");
        if (whisper.length === 0) return;
        await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: combatant.actor }),
            whisper,
            content: `<p>${combatant.actor.name}'s voluntary SPD change (${oldSpd} → ${newSpd}) is deferred to Post-Segment 12.</p>
                <button type="button" class="hero-spd-apply-now" data-combat-id="${this.id}" data-combatant-id="${combatant.id}">Apply immediately (with SPD-change lockout)</button>`,
        });
    }

    /**
     * GM fiat: applies a deferred voluntary SPD change right now, with the normal
     * adjustment-style lockout.
     * @param {string} combatantId
     * @returns {Promise<void>}
     */
    async applyPendingSpdNow(combatantId) {
        if (!game.user.isGM || !this.started) return;
        const combatant = this.combatants.get(combatantId);
        const pending = combatant?.getFlag(game.system.id, "pendingSpd");
        if (!pending) return;
        const rawKnown = combatant.getFlag(game.system.id, "knownSpd");
        const known =
            typeof rawKnown === "object" && rawKnown !== null ? rawKnown : { effective: rawKnown, source: rawKnown };
        const currentAbs = HeroSystem6eCombatantSingle.absoluteSegment(this.round, this.segment);
        const sourceSpd = Number(combatant.actor?._source?.system?.characteristics?.spd?.value);
        const update = {
            _id: combatant.id,
            [`flags.${game.system.id}.pendingSpd`]: null,
            [`flags.${game.system.id}.knownSpd`]: { effective: pending.newSpd, source: sourceSpd },
        };
        Object.assign(update, this._spdLockoutUpdate(combatant, known, pending.newSpd, currentAbs));
        await this.updateEmbeddedDocuments("Combatant", [update]);
    }

    /**
     * Handles positional Held Actions whose declared segment has been left behind.
     * A slot the pointer actually took is spent; a slot that passed UNUSED demotes
     * to a generic hold — the banked Phase persists until the null zone (6E2 20-21:
     * the hold is only lost when the segment of the holder's next natural Phase
     * begins, handled by _consumeActiveCombatantHold / _consumeExpiredHeldActions).
     * Within-segment passes are caught by the previous-combatant check in _onUpdate.
     * @private
     */
    async _demotePassedPositionalHolds() {
        if (!this.started) return;
        const currentAbs = HeroSystem6eCombatantSingle.absoluteSegment(this.round, this.segment);
        for (const combatant of this.combatants) {
            const hold = combatant.heldAction;
            if (hold?.mode !== "position" || hold.segmentAbs >= currentAbs) continue;
            const used = combatant.getFlag(game.system.id, "heldSlotTakenAbs") === hold.segmentAbs;
            if (used) {
                // The segment moved on, so there is no acted position left to display
                await this._spendHold(combatant, { used: true, retainPosition: false });
            } else {
                await this._demoteHold(combatant);
            }
        }
    }

    /**
     * Converts an unused positional hold into a generic one: the declared slot
     * passed, but the banked Phase survives to the null zone.
     * @param {Combatant} combatant
     * @private
     */
    async _demoteHold(combatant) {
        const effect = combatant.heldActionEffect;
        const hold = combatant.heldAction;
        if (!effect || hold?.mode !== "position") return;
        await effect.update({
            [`flags.${game.system.id}.hold`]: {
                mode: "generic",
                "-=segmentAbs": null,
                "-=dex": null,
                "-=fraction": null,
                demotedFrom: { segmentAbs: hold.segmentAbs, dex: hold.dex },
            },
        });
        await combatant.update({ [`flags.${game.system.id}.heldSlotTakenAbs`]: null });
        const actor = combatant.actor;
        await this._combatCard(
            combatant,
            `${actor?.name}'s held position (DEX ${hold.dex} in ${HeroSystem6eCombatantSingle.phaseLabel(hold.segmentAbs)}) passed without being used; the Held Action is banked until their next Phase.`,
        );
        await this.logEvent("hold.demote", {
            combatant,
            data: { segmentAbs: hold.segmentAbs, dex: hold.dex ?? null },
        });
    }

    /**
     * Drops display-position records once their segment has passed.
     * @private
     */
    async _clearSpentHoldPositions() {
        if (!this.started) return;
        const currentAbs = HeroSystem6eCombatantSingle.absoluteSegment(this.round, this.segment);
        for (const combatant of this.combatants) {
            const spent = combatant.spentHoldPosition;
            if (spent && spent.segmentAbs < currentAbs) {
                await combatant.unsetFlag(game.system.id, "spentHoldPosition");
            }
            // Lightning Reflexes elevation is likewise a single-segment record
            const lrAbs = combatant.lrElevatedAbs;
            if (lrAbs !== null && lrAbs < currentAbs) {
                await combatant.unsetFlag(game.system.id, "lrElevatedAbs");
            }
            const spentLr = combatant.getFlag(game.system.id, "spentLrPosition");
            if (spentLr && spentLr.segmentAbs < currentAbs) {
                await combatant.unsetFlag(game.system.id, "spentLrPosition");
            }
        }
    }

    /**
     * Consumes a positional hold at the end of its held turn: the effect (and status
     * icon) go away immediately, while a display-only combatant flag keeps the acted
     * position in the tracker until the segment ends.
     * @param {Combatant} combatant
     * @param {object} [options]
     * @param {boolean} [options.used] - The holder actually acted at their held slot
     * @param {boolean} [options.retainPosition] - Keep the acted position for display
     * @private
     */
    async _spendHold(combatant, { used = false, retainPosition = true } = {}) {
        const actor = combatant.actor;
        const effect = combatant.heldActionEffect;
        const hold = combatant.heldAction;
        if (!actor || !effect || !hold) return;
        await effect.delete();
        const spendUpdate = {
            // A stale slot-taken marker would spend the NEXT hold declared this segment
            [`flags.${game.system.id}.heldSlotTakenAbs`]: null,
        };
        if (retainPosition && hold.mode === "position") {
            spendUpdate[`flags.${game.system.id}.spentHoldPosition`] = {
                segmentAbs: hold.segmentAbs,
                dex: hold.dex,
                ...(hold.fraction !== undefined ? { fraction: hold.fraction } : {}),
            };
        }
        await combatant.update(spendUpdate);
        await this._combatCard(
            combatant,
            used
                ? `${actor.name} used their Held Action in ${this.currentPhaseLabel}.`
                : `${actor.name}'s held turn passed without being used; the Held Action is spent (${this.currentPhaseLabel}).`,
        );
        await this.logEvent(used ? "hold.use" : "hold.forfeit", {
            combatant,
            data: { mode: hold.mode, segmentAbs: hold.segmentAbs ?? null, dex: hold.dex ?? null },
        });
    }

    /**
     * Removes the held-action status from every combatant whose natural speed-chart
     * Phase falls in the segment that just began; their Phase replaces the hold.
     * Only invoked for full-Turn skips (segment === null); per-turn clearing lives in
     * _consumeActiveCombatantHold. The segment parameter is kept for the strict-RAW
     * null zone should it return as a setting.
     * @param {number|null} segment - Segment that just began, or null when a full Turn elapsed
     * @private
     */
    async _consumeExpiredHeldActions(segment) {
        for (const combatant of this.combatants) {
            const actor = combatant.actor;
            const hold = combatant.heldAction;
            if (!actor || !hold) continue;
            // segment === null: a full Turn elapsed, so every SPD 1-12 had a Phase
            if (segment !== null && !combatant.hasPhaseInSegment(segment)) continue;

            const holdingEffect = combatant.heldActionEffect;
            if (!holdingEffect) continue;

            // The hold is consumed by the rule, not by a duration, so delete it explicitly
            await holdingEffect.delete();

            await this._combatCard(
                combatant,
                `${actor.name}'s Held Action was consumed by their natural Phase${segment !== null ? ` in ${this.currentPhaseLabel}` : ""}.`,
            );
            await this.logEvent("hold.consume", { combatant, data: { mode: hold.mode ?? null } });
        }
    }

    /**
     * Clears the aborted status from combatants whose spent Phase has now passed.
     * Aborting uses the character's next full Phase; once the Segment containing that
     * Phase ends they may act again on their following Phase (6E2 22; 5ER 361).
     * @param {number[]|null|undefined} elapsedSegments - Segments that just ended, oldest
     *   first; null when a full Turn elapsed, undefined when unknown (skip)
     * @private
     */
    async _clearExpiredAborts(elapsedSegments) {
        if (elapsedSegments === undefined) return;

        const currentAbs = HeroSystem6eCombatantSingle.absoluteSegment(this.round, this.segment);
        for (const combatant of this.combatants) {
            const actor = combatant.actor;
            const abortedEffect = combatant.abortEffect;
            if (!actor || !abortedEffect) continue;
            const spentAbs = combatant.abortSpentAbs;
            if (spentAbs !== null) {
                // The spent Phase's segment must have fully passed
                if (currentAbs <= spentAbs) continue;
            } else if (elapsedSegments !== null && !elapsedSegments.some((s) => combatant.hasPhaseInSegment(s))) {
                continue;
            }

            await abortedEffect.delete();

            await this._combatCard(
                combatant,
                `${actor.name}'s aborted Phase has passed (now ${this.currentPhaseLabel}); they may act again on their next Phase.`,
            );
            await this.logEvent("abort.expire", { combatant, data: { spentAbs } });
        }
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

// Legacy combatant/combat bookkeeping keys the single-combatant model does not use,
// plus single-stack transients that must not survive a model conversion.
const LEGACY_COMBATANT_FLAG_KEYS = [
    "initiative",
    "initiativeCharacteristic",
    "segment",
    "spd",
    "initiativeTooltip",
    "lightningReflexes",
    "spentEndOn",
    "endUsedForMovement",
    "heroHistory",
    "heldSlotTakenAbs",
    "spentHoldPosition",
    "lrElevatedAbs",
    "spentLrPosition",
    "spdLockout",
    "knownSpd",
    "pendingSpd",
    "haymaker",
    "delayedActions",
    "soloTieRoll",
];
const LEGACY_COMBAT_FLAG_KEYS = [
    "segment",
    "postSegment12Round",
    "heroCurrent",
    "currentSegment",
    "segmentRolls",
    "recoveredRounds",
    "actingPriority",
    "segmentHighWater",
    "eventLog",
    "eventLogSeq",
];

/**
 * Console migration for existing combats into the single-combatant data model.
 * The legacy tracker keeps one combatant per Phase segment (doubled for Lightning
 * Reflexes); this collapses each token to a single combatant, purges legacy turn
 * bookkeeping, and resets every combat to its pre-start state — the segment
 * timeline is rebuilt when combat is begun again. Deliberately NOT wired to a
 * version gate; run it manually after enabling the single combatant tracker:
 *
 *   game.herosystem6e.migrateCombatsToSingleCombatantTracker()
 *   game.herosystem6e.migrateCombatsToSingleCombatantTracker({ dryRun: true })
 *
 * @param {object} [options]
 * @param {boolean} [options.dryRun] - Log the plan without writing anything
 * @param {boolean} [options.force] - Run even while the legacy tracker is active
 * @returns {Promise<object[]>} Per-combat report of what was (or would be) changed
 */
export async function migrateCombatsToSingleCombatantTracker({ dryRun = false, force = false } = {}) {
    if (!game.user.isGM) {
        ui.notifications.warn(`Only a GM can migrate combats.`);
        return [];
    }
    let singleTrackerActive = false;
    try {
        singleTrackerActive = game.settings.get(game.system.id, "singleCombatantTracker");
    } catch (e) {
        console.warn(`Unable to read the single combatant tracker settings`, e);
    }
    if (!singleTrackerActive && !force) {
        ui.notifications.warn(
            `Enable the Single Combatant Tracker (alpha) setting and reload before migrating, or pass { force: true }.`,
        );
        return [];
    }

    const report = [];
    for (const combat of game.combats) {
        // One combatant per token (or per actor for tokenless combatants); the
        // legacy per-segment and Lightning Reflexes duplicates are removed.
        // Keepers prefer a live actor so broken references are the ones culled.
        const keepers = new Map();
        const deleteIds = [];
        for (const combatant of combat.combatants) {
            const key = combatant.tokenId || combatant.actorId || combatant.id;
            const kept = keepers.get(key);
            if (!kept) {
                keepers.set(key, combatant);
            } else if (!kept.actor && combatant.actor) {
                deleteIds.push(kept.id);
                keepers.set(key, combatant);
            } else {
                deleteIds.push(combatant.id);
            }
        }

        const combatantUpdates = [];
        for (const combatant of keepers.values()) {
            const update = { _id: combatant.id };
            if (combatant.initiative !== null) update.initiative = null;

            const flagDeletes = {};
            const systemFlags = combatant.flags?.[game.system.id] ?? {};
            const staleKeys = LEGACY_COMBATANT_FLAG_KEYS.filter((key) => systemFlags[key] !== undefined);
            if (staleKeys.length > 0) flagDeletes[game.system.id] = HeroCompatibility.forceDelete(staleKeys);
            // The legacy hold marker lives outside the system scope
            if (combatant.flags?.holdingAnAction !== undefined) {
                Object.assign(flagDeletes, HeroCompatibility.forceDelete(["holdingAnAction"]));
            }
            if (Object.keys(flagDeletes).length > 0) update.flags = flagDeletes;

            if (Object.keys(update).length > 1) combatantUpdates.push(update);
        }

        const combatFlags = combat.flags?.[game.system.id] ?? {};
        const staleCombatKeys = LEGACY_COMBAT_FLAG_KEYS.filter((key) => combatFlags[key] !== undefined);
        const needsReset = combat.started || combat.round !== 0 || staleCombatKeys.length > 0;
        const resetPayload = { started: false, round: 0, turn: null };
        if (staleCombatKeys.length > 0) {
            resetPayload[`flags.${game.system.id}`] = HeroCompatibility.forceDelete(staleCombatKeys);
        }

        const entry = {
            combat: combat.id,
            scene: combat.scene?.name ?? null,
            wasStarted: combat.started,
            combatantsRemoved: deleteIds.length,
            combatantsKept: keepers.size,
            combatantsCleaned: combatantUpdates.length,
            combatFlagsPurged: staleCombatKeys,
            reset: needsReset,
        };
        report.push(entry);

        if (dryRun) continue;
        if (deleteIds.length > 0) await combat.deleteEmbeddedDocuments("Combatant", deleteIds);
        if (combatantUpdates.length > 0) await combat.updateEmbeddedDocuments("Combatant", combatantUpdates);
        if (needsReset) await combat.update(resetPayload);
    }

    console.table(report);
    const touched = report.filter((r) => r.combatantsRemoved || r.combatantsCleaned || r.reset);
    ui.notifications.info(
        dryRun
            ? `Single tracker migration dry run: ${touched.length} of ${report.length} combat(s) would change (see console).`
            : `Single tracker migration: ${touched.length} of ${report.length} combat(s) converted; begin combat again to rebuild the timeline.`,
    );
    return report;
}
