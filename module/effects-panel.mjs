import { HEROSYS } from "./herosystem6e.mjs";

export class EffectsPanel extends Application {
    static get defaultOptions() {
        return {
            ...super.defaultOptions,
            id: "hero-effects-panel",
            popOut: false,
            template: `systems/${HEROSYS.module}/templates/system/effects-panel.hbs`,
        };
    }

    // Addlistners
    // effect-item
    activateListeners(html) {
        super.activateListeners(html);
        html.find(".effect-item").click(this._onEffectClick.bind(this));
        html.find(".effect-item").mouseover(this._onEffectClick.bind(this));
    }

    _onEffectClick(event) {
        console.log(event);
    }

    get token() {
        return canvas.tokens.controlled.at(0)?.document ?? null;
    }

    get actor() {
        return this.token?.actor ?? null; // ?? game.user?.character ?? null;
    }

    /**
     * Some PF2E code that looks useful.
     * Debounce and slightly delayed request to re-render this panel. Necessary for situations where it is not possible
     * to properly wait for promises to resolve before refreshing the UI.
     */
    refresh = foundry.utils.debounce(this.render, 100);

    async getData(options) {
        const context = await super.getData(options);
        context.effects = this.actor?.appliedEffects; //effects;

        if (context.effects) {
            for (const ae of context.effects) {
                // Sometimes ae.parent?.system.active  is false, but the power is active, unclear why.
                // Consider making active a getter (looking for the AE) instead of using system.actor.
                if (ae.parent instanceof HeroSystem6eItem && ae.duration.seconds) {
                    ae.flags.label = `${ae.flags.startTime + ae.duration.seconds - game.time.worldTime} seconds`;
                } else {
                    const d = ae._prepareDuration();
                    ae.flags.label = d.label;
                }
            }
        }

        return context;
    }
}
