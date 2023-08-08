export default class HeroSystem6eMeasuredTemplate extends MeasuredTemplate {
    // const token = combatant.token?.object;
    // if ( token?.isVisible ) {
    //   if ( !token.controlled ) token._onHoverIn(event, {hoverOutOthers: true});
    //   this._highlighted = token;
    // }


    async _onUpdate(...args) {
        await super._onUpdate(...args);
        await this.updateTargets()
    }

    async _refreshTemplate(...args) {
        await super._refreshTemplate(...args);
        await this.updateTargets()
    }

    // Tokens within template
    getTokensInTempalte() {
        let tokens = [];
        for (let token of this.scene.tokens) {
            if (this.isTokenInside(token)) {
                tokens.push(token);
            }
        }
        return tokens;
    }

    isTokenInside(token) {
        const obj = token?.object;
        const _x = obj.center.x - this.x;
        const _y = obj.center.y - this.y;
        return this.shape.contains(_x, _y)
    }

    // Update user.targets based on which tokens are in the template
    async updateTargets() {
        let targets = [];

        for (let token of this.getTokensInTempalte()) {
            if (token?.visible) {
                targets.push(token.id);
            }
        }

        if (JSON.stringify(targets) != JSON.stringify(Array.from(game.user.targets).map(o => o.id))) {
            await game.user.updateTokenTargets(targets);
        }

    }

}