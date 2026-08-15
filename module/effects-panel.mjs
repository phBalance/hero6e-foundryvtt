const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class EffectsPanel extends HandlebarsApplicationMixin(ApplicationV2) {
    // 1. ApplicationV2 uses static DEFAULT_OPTIONS instead of a defaultOptions getter
    static DEFAULT_OPTIONS = {
        id: "hero-effects-panel",
        // In AppV2, window configuration dictates if it pops out (has a frame)
        window: {
            frame: false, // Replaces popOut: false
            resizable: false,
        },
        // HandlebarsApplicationMixin looks for a 'templates' array or a single template path
        tagName: "div",
        classes: ["hero-effects-panel-container"],
    };

    static get PARTS() {
        return {
            body: {
                template: `systems/${game.system.id}/templates/system/effects-panel.hbs`,
                scrollable: [""],
            },
        };
    }

    get token() {
        return canvas.tokens.controlled.at(0)?.document ?? null;
    }

    get actor() {
        return this.token?.actor ?? null; // ?? game.user?.character ?? null;
    }

    /**
     * Debounce and slightly delayed request to re-render this panel.
     */
    refresh = foundry.utils.debounce(this.render, 100);

    async _prepareContext(options) {
        // Fallback safely if there is no active actor
        if (!this.actor) return { effects: [], gameSystemId: game.system.id };

        // HandlebarsApplicationMixin's base context setup
        const context = await super._prepareContext(options);
        context.gameSystemId = game.system.id;
        context.effects = [];

        // Loop through the actor's applied effects
        // Note: activeEffects schemas contain deep getter targets; avoid deepCloning
        // the whole document. Instead, map the data or clone carefully.
        for (const ae of this.actor.appliedEffects) {
            // Get the duration data safely via the V12+ ActiveEffect method
            const d = ae._prepareDuration();
            const effectData = ae.toObject(); // Converts to raw safe data object for HBS

            // Add reference properties back into our plain HBS data object
            effectData.statuses = ae.statuses;
            effectData.origin = ae.origin;

            if (ae.parent instanceof HeroSystem6eItem) {
                // Only show items that have a duration (temporary), or are perceivable
                if (!d.seconds && !ae.parent.isPerceivable()) {
                    continue;
                }
                if (d.seconds) {
                    effectData.flags[game.system.id] ??= {};
                    effectData.flags[game.system.id].label = d.label;
                }
            } else {
                if (d.seconds) {
                    effectData.flags[game.system.id] ??= {};
                    effectData.flags[game.system.id].label = d.label;
                    effectData.flags[game.system.id].targetDisplay ??= effectData.flags[game.system.id]?.target;
                } else if (!ae.statuses || ae.statuses.size === 0) {
                    continue;
                }
            }

            // Sync description fallback
            if (!effectData.description) {
                effectData.description = undefined;
            }
            effectData.description ??= fromUuidSync(ae.origin)?.system.description;
            effectData.description ??= ae.parent?.system.description;

            context.effects.push(effectData);
        }

        return context;
    }
}
