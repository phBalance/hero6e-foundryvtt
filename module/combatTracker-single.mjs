const { CombatTracker } = foundry.applications.sidebar.tabs;
const { HeroCompatibility } = await import("./utility/compatibility.mjs");

export class HeroSystem6eCombatTrackerSingle extends CombatTracker {
    static {
        /**
         * Updates the header and handles real-time active row highlighting fixes.
         * Enforces complete null guards to accommodate unlinked V14 Quench test models.
         */
        const onRenderTracker = (app, html) => {
            // Exit out immediately if combat hasn't formally begun, if the instance is missing,
            // or if core tracking parameters haven't finished compiling yet.
            if (!app?.viewed || !app.viewed.started) return;

            const element = html instanceof HTMLElement ? html : html;
            if (!element) return;

            // Update header titles using standard Hero System nomenclature variables
            const encounterTitle = element.querySelector(".combat-tracker-header .encounter-title");
            if (encounterTitle) {
                encounterTitle.textContent = `Turn=${app.viewed.round} Segment=${app.viewed.segment}.${app.viewed.turn}`;
            }

            // Strip any false active highlights that the core template engine miscalculated
            element.querySelectorAll(".combatant.active").forEach((el) => {
                el.classList.remove("active");
            });

            // Safely check the true active combatant ID string straight from the source database
            const activeId = app.viewed.combatant?.id;
            if (activeId) {
                const activeRow = element.querySelector(`[data-combatant-id="${activeId}"], [data-id="${activeId}"]`);
                if (activeRow) {
                    activeRow.classList.add("active");
                }
            }
        };

        Hooks.on("renderCombatTracker", onRenderTracker);
    }

    /**
     * Overrides the modern ApplicationV2 rendering lifecycle handler.
     * ✅ FIX: Enforces deep object sanitation on options to stop the 'turn in undefined' core crash.
     * @override
     * @protected
     */
    async _onRender(context, options) {
        let safeContext = context || {};
        let safeOptions = options;

        // Direct fix for 'Cannot use in operator to search for turn in undefined' inside programmatic tests
        if (!safeOptions || typeof safeOptions !== "object" || Array.isArray(safeOptions)) {
            safeOptions = {};
        }
        if (!safeOptions.renderContext || typeof safeOptions.renderContext !== "object") {
            safeOptions.renderContext = {};
        }

        // Inoculate mandatory core property objects scanned by the core engine with the 'in' operator
        const mandatoryKeys = ["turn", "round", "activity", "history", "combatant"];
        mandatoryKeys.forEach((key) => {
            if (!safeOptions.renderContext[key] || typeof safeOptions.renderContext[key] !== "object") {
                safeOptions.renderContext[key] = { update: [] };
            }
        });

        // Pass the safely fortified parameter dictionaries down to the native parent framework
        await super._onRender(safeContext, safeOptions);
    }

    /** @override */
    async _prepareTrackerContext(context, options) {
        // 1. Let Foundry assemble the core combatant turns layout dataset natively
        await super._prepareTrackerContext(context, options);
        if (!this.viewed) return context;

        const currentSegment = this.viewed.segment;
        const masterTurns = context.turns || [];
        const activeCombatantId = this.viewed.combatant?.id || null;
        const timelineTurns = [];

        // ─── PART A: INJECT TOP-SLOT ACTIVE SEGMENT BANNER ───
        const activeHeaderId = `seg-header-active-${currentSegment}`;
        const activeHeaderTurn = {
            id: activeHeaderId,
            _id: activeHeaderId,
            name: `Current Segment: ${currentSegment}`,
            img: "icons/svg/clockwork.svg",
            css: "hero-timeline-header-row active-segment-header-slot",
            hasRolled: true, // Header is marked true, but its HTML container is display: none
            initiative: 999,
            isFakeHeader: true,
            active: false,
        };

        Object.defineProperty(activeHeaderTurn, "token", { get: () => null, configurable: true, enumerable: true });
        Object.defineProperty(activeHeaderTurn, "actor", { get: () => null, configurable: true, enumerable: true });

        timelineTurns.push(activeHeaderTurn);

        // ─── PART B: PROCESS CURRENT ACTORS ───
        const currentActors = masterTurns.filter((t) => {
            const combatant = this.viewed.combatants.get(t.id);
            const isHolding = combatant?.actor?.statuses.has("holding") ?? false;
            const hasPhase = combatant ? combatant.hasPhaseInSegment(currentSegment) : false;
            return hasPhase || isHolding;
        });

        currentActors.forEach((t) => {
            const combatant = this.viewed.combatants.get(t.id);

            // ✅ FORCE ACCURATE INITIATIVE VALUES ONTO FRONT-ENDPresentation LAYOUT OBJECTS
            // Pull the calculated priority score directly from your source-of-truth document method
            const truePriority = this.viewed.getInitiativePriority(combatant, currentSegment);

            // Fix: Overwrite context keys to force Handlebars to draw the number instead of the d20 roll button
            t.initiative = truePriority.toFixed(2); // Formats beautifully to two decimal points (e.g., 18.04)
            t.hasRolled = true;

            if (combatant?.actor?.statuses.has("holding")) {
                t.css = t.css ? `${t.css} is-holding-action` : "is-holding-action";
                t.name = `⏳ [HELD] ${t.name}`;
            }

            if (t.id === activeCombatantId) {
                t.active = true;
                t.css = t.css ? `${t.css} active` : "active";
            } else {
                t.active = false;
                if (t.css) t.css = t.css.replace(/\bactive\b/g, "").trim();
            }
        });

        timelineTurns.push(...currentActors);

        // ─── PART C: CALCULATE FUTURE SEGMENTS ROADMAP ───
        let lookupSegment = currentSegment;
        let lookaheadStepsCount = 0;

        for (let check = 1; check <= 12; check++) {
            lookupSegment++;
            if (lookupSegment > 12) lookupSegment = 1;

            const futureActors = masterTurns.filter((t) => {
                const combatant = this.viewed.combatants.get(t.id);
                return combatant ? combatant.hasPhaseInSegment(lookupSegment) : false;
            });

            if (futureActors.length > 0) {
                lookaheadStepsCount++;
                const fakeId = `seg-header-${lookupSegment}`;

                const futureHeaderTurn = {
                    id: fakeId,
                    _id: fakeId,
                    name: `Segment ${lookupSegment}`,
                    img: "icons/svg/clockwork.svg",
                    css: "hero-timeline-header-row future-segment-header-slot",
                    hasRolled: true,
                    initiative: futureActors.length,
                    isFakeHeader: true,
                    active: false,
                };

                Object.defineProperty(futureHeaderTurn, "token", {
                    get: () => null,
                    configurable: true,
                    enumerable: true,
                });
                Object.defineProperty(futureHeaderTurn, "actor", {
                    get: () => null,
                    configurable: true,
                    enumerable: true,
                });

                timelineTurns.push(futureHeaderTurn);

                futureActors.forEach((t) => {
                    const clone = { ...t };
                    const futureCombatant = this.viewed.combatants.get(clone.id);

                    // ✅ FORCE INITIATIVE ON FUTURE PREVIEWS TOO
                    const futurePriority = this.viewed.getInitiativePriority(futureCombatant, lookupSegment);
                    clone.initiative = futurePriority.toFixed(2);
                    clone.hasRolled = true;
                    clone.active = false;

                    if (clone.css) {
                        clone.css = clone.css.replace(/\bactive\b/g, "").trim();
                        clone.css = clone.css ? `${clone.css} future-segment-preview` : "future-segment-preview";
                    } else {
                        clone.css = "future-segment-preview";
                    }
                    timelineTurns.push(clone);
                });
            }
            if (lookaheadStepsCount >= 2) break;
        }

        context.turns = timelineTurns;
        return context;
    }

    /**
     * Universal safety guard for combatant interactions.
     * Ensures that if the row doesn't correspond to a real, instantiated
     * database combatant, core handlers are short-circuited before they crash.
     * @param {Event} event - The native DOM/jQuery interaction event
     * @returns {boolean} True if the target row represents a real combatant
     * @private
     */
    _isValidCombatantRow(event) {
        const li = event.currentTarget;
        if (!li) return false;

        // Cover both V14/V13 dataset naming differences safely
        const cId = li.dataset.combatantId || li.getAttribute("data-combatant-id");
        if (!cId) return false;

        // Check the active encounter instance to verify this combatant actually exists
        return !!this.viewed?.combatants?.has(cId);
    }

    /** @override */
    _onCombatantHoverIn(event) {
        // GUARD: Short-circuit if it's a fake lookup row or a missing document reference
        if (!this._isValidCombatantRow(event)) return;
        return super._onCombatantHoverIn(event);
    }

    /** @override */
    _onCombatantHoverOut(event) {
        // GUARD: Short-circuit to avoid secondary lookup issues
        if (!this._isValidCombatantRow(event)) return;
        return super._onCombatantHoverOut(event);
    }

    /** @override */
    _onCombatantMouseDown(event) {
        // GUARD: Prevent clicking, panning, or pinging our custom layout headers
        if (!this._isValidCombatantRow(event)) return;
        return super._onCombatantMouseDown(event);
    }
}
