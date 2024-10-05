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
        return context;
    }
}
