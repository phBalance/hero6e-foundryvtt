const scrollIntoViewOptions = { block: "center" };

export class HeroSystem6eCombatTracker extends CombatTracker {
    static get defaultOptions() {
        var path =
            "systems/hero6efoundryvttv2/templates/combat/combat-tracker.hbs";
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: path,
        });
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find(".segment-hasItems").click((ev) =>
            this._onSegmentToggleContent(ev),
        );
    }

    async _onCombatControl(event) {
        const target = event.target;
        if (
            ["fas fa-step-backward", "fas fa-step-forward"].includes(
                target.className,
            ) &&
            !event.shiftKey
        ) {
            return await ui.notifications.warn(
                `Changing turns is unusual. Hold SHIFT to change turn.`,
            );
        }

        await super._onCombatControl(event);
    }

    _onSegmentToggleContent(event) {
        event.preventDefault();

        const header = event.currentTarget;
        const segment = header.closest(".segment-container");
        const content = segment.querySelector(".segment-content");
        content.style.display =
            content.style.display === "none" ? "block" : "none";
    }

    async getData(options) {
        const context = await super.getData(options);

        // Initialize segments
        context.segments = [];
        for (let s = 1; s <= 12; s++) {
            context.segments[s] = [];
        }

        if (context.combat?.turns) {
            // Add segment to context.turns
            let t = 0;
            for (const combatant of context.combat.turns) {
                if (!combatant.visible) continue;
                context.turns[t].flags = combatant.flags;
                const s = parseInt(context.turns[t].flags.segment) || 12;
                context.segments[s].push(context.turns[t]);
                t++;
            }
        }

        if (context.combat) {
            // Active Segment is expanded, all others are collapsed
            context.activeSegments = [];
            for (let i = 1; i <= 12; i++) {
                const active =
                    i === context.combat.combatant?.flags?.segment ||
                    (!context.combat.combatant && i === 12);

                context.activeSegments[i] = active;
                if (active) {
                    context.combat.segment = i;
                }
            }
        }

        return context;
    }

    /**
     * Scroll the combat log container to ensure the current Combatant turn is centered vertically
     */
    scrollToTurn() {
        //console.log("scrollToTurn");
        const combat = this.viewed;
        if (!combat || combat.turn === null) {
            return;
        }

        const active = this.element.find(".active")[0];
        if (!active) {
            return;
        }

        const container = active.closest("ol.directory-list");

        // Collapse all segments except for the one with the active combatant.
        // Scroll to segment header because it would be nice if it was in view.
        const segment = combat.turns[combat.turn].segment;
        for (let s = 1; s <= 12; s++) {
            let el = container.querySelector(`[data-segment-id="${s}"]`);
            if (el) {
                if (s === segment) {
                    el.style.display = "block";
                    el.parentElement
                        .querySelector("h3")
                        .scrollIntoView(scrollIntoViewOptions);
                } else {
                    el.style.display = "none";
                }
            }
        }

        // Scroll active combatant into view.
        let el = container.querySelector(`[data-turn-id="${combat.turn}"]`);
        if (el) {
            el.scrollIntoView(scrollIntoViewOptions);
        }
    }
}
