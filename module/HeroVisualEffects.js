// Inspiration from https://bitbucket.org/Fyorl/token-auras

export class HeroVisualEffects {
    static initialize() {
        Hooks.once("ready", function () {
            // setHeroRulerLabel()

            // if (!game.modules.get("drag-ruler")) {
            //     ui.notifications.warn(game.i18n.localize("Warning.DragRuler.Install"));
            //     return
            // }

            // if (!game.modules.get("drag-ruler")?.active) {
            //     ui.notifications.warn(game.i18n.localize("Warning.DragRuler.Active"));
            // }

            // Hooks.on('renderTokenConfig', Auras.onConfigRender);
            //Hooks.on('drawToken', HeroVisualEffects.drawVisualEffect);
            // Hooks.on('refreshToken', Auras.onRefreshToken);
            // Hooks.on('updateToken', Auras.onUpdateToken);
            // Hooks.on('drawGridLayer', layer => {
            //     layer.tokenEffects = layer.addChildAt(new PIXI.Container(), layer.getChildIndex(layer.borders));
            // });
            // Hooks.on('destroyToken', token => token.tokenAuras?.destroy());


        });
    }

    static drawVisualEffect(token) {

        if ( token.heroVisualEffects?.removeChildren ) token.heroVisualEffects.removeChildren().forEach(c => c.destroy());

        // if (!canvas.grid.heroVisualEffects) {
        //     canvas.grid.heroVisualEffects = canvas.grid.addChildAt(new PIXI.Container(), canvas.grid.getChildIndex(canvas.grid.borders));
        // }

        token.heroVisualEffects ??= token.addChild(new PIXI.Container()); //canvas.grid.heroVisualEffects.addChild(new PIXI.Container())
        const gfx = token.heroVisualEffects.addChild(new PIXI.Graphics());

        const [cx, cy] = [token.getBounds().x, token.getBounds().y]
        const w = token.w * 2;
        const h = token.h * 2;
        
        gfx.beginFill(0x000000, 0.5);
        gfx.drawEllipse(cx, cy, w, h);
        gfx.endFill()
    }
}