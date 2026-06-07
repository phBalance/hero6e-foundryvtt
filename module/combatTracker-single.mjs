const { CombatTracker } = foundry.applications.sidebar.tabs;

export class HeroSystem6eCombatTrackerSingle extends CombatTracker {
    /**
     * Overrides the modern ApplicationV2 rendering lifecycle handler.
     * Defensive validation guards shield it from primitive string parameters passed during mock tests.
     * @override
     * @protected
     */
    async _onRender(context, options) {
        // ✅ CANONICAL V14 UPSTREAM PROTECTION SHIELD:
        // If 'options' arrives as a primitive string (e.g., "createCombat"), null, or an incomplete layout object,
        // intercept it and re-bind it to a structurally valid configuration dictionary.
        // This explicitly prevents the upstream parent 'super._onRender' call from throwing an exception.
        let safeOptions = options;
        if (!safeOptions || typeof safeOptions !== "object" || Array.isArray(safeOptions)) {
            safeOptions = {};
        }

        // Ensure renderContext exists and features the nested properties the core framework expects
        if (!safeOptions.renderContext || typeof safeOptions.renderContext !== "object") {
            safeOptions.renderContext = {};
        }
        if (!safeOptions.renderContext.activity || typeof safeOptions.renderContext.activity !== "object") {
            safeOptions.renderContext.activity = { update: [{}] };
        }
        if (!safeOptions.renderContext.history || typeof safeOptions.renderContext.history !== "object") {
            safeOptions.renderContext.history = { update: [{}] };
        }

        // 1. Hand execution to the native prototype chain passing our fully synchronized safeOptions
        await super._onRender(context, safeOptions);

        // 2. VISUAL TRACKER MODIFICATIONS: Update header text nodes dynamically
        if (!this.viewed || !this.viewed.started) return;

        const element = this.element;
        if (!element) return;

        const encounterTitle = element.querySelector(".combat-tracker-header .encounter-title");
        if (encounterTitle) {
            encounterTitle.textContent = `Turn=${this.viewed.round} Segment=${this.viewed.segment}.${this.viewed.turn}`;
        }

        // Clean up incorrect active highlights that the core framework template miscalculated
        element.querySelectorAll(".combatant.active").forEach((el) => {
            el.classList.remove("active");
        });

        // Explicitly lock focus highlight parameters by active document ID
        const activeId = this.viewed.combatant?.id;
        if (activeId) {
            const activeRow = element.querySelector(`[data-combatant-id="${activeId}"], [data-id="${activeId}"]`);
            if (activeRow) {
                activeRow.classList.add("active");
            }
        }
    }

    /** @override */
    _prepareTrackerContext(context) {
        // 1. Let Foundry assemble the core combatant turns natively (Synchronous in V14/V15 ApplicationV2)
        super._prepareTrackerContext(context);

        // ✅ CANONICAL V14 CONTEXT PROTECTION:
        // If no active combat is viewed or if the instance is a transient mockup,
        // normalize the layout context completely to guarantee template layers do not crash.
        if (!this.viewed) {
            context.turns = [];
            context.combat = null;
            return context;
        }

        const currentSegment = this.segment;
        const masterTurns = context.turns || [];
        const timelineTurns = [];

        // ─── PART A: INJECT TOP-SLOT ACTIVE SEGMENT BANNER ───
        const activeHeaderId = `seg-header-active-${currentSegment}`;
        const activeHeaderTurn = {
            id: activeHeaderId,
            _id: activeHeaderId,
            name: `Current Segment: ${currentSegment}`,
            img: "icons/svg/clockwork.svg",
            css: "hero-timeline-header-row active-segment-header-slot",
            hasRolled: true,
            initiative: 999,
            isFakeHeader: true,
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
            const truePriority = this.viewed.getInitiativePriority(combatant, currentSegment);
            t.initiative = truePriority.toFixed(2);
            t.hasRolled = true;

            if (combatant?.actor?.statuses.has("holding")) {
                t.css = t.css ? `${t.css} is-holding-action` : "is-holding-action";
                t.name = `⏳ [HELD] ${t.name}`;
            }
        });

        timelineTurns.push(...currentActors);
        context.turns = timelineTurns;

        // ✅ CRITICAL REPAIR: Must return the context back to ApplicationV2 template processors
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
