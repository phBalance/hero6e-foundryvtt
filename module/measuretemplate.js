export default class HeroSystem6eMeasuredTemplate extends MeasuredTemplate {
    // const token = combatant.token?.object;
    // if ( token?.isVisible ) {
    //   if ( !token.controlled ) token._onHoverIn(event, {hoverOutOthers: true});
    //   this._highlighted = token;
    // }

    async _onClickLeft(event) {
        await super._onClickLeft(event);
        if (game.user.id != this.document.user.id) return;
        await this.selectObjects({ checkPositions: true })
    }

    async _onUpdate(data, options, userId) {
        await super._onUpdate(data, options, userId);
        if (userId != this.document.user.id) return;
        await this.selectObjects({ checkPositions: true, templateData: data })
    }

    // async _onDragLeftDrop(...args) {
    //     console.log("_refre_onDragLeftDropshTemplate");
    //     await super._onDragLeftDrop(...args);
    //     await this.selectObjects({ checkPositions: true}); //, templateData: data })
    // }

    async _refreshTemplate(...args) {
        await super._refreshTemplate(...args);
        await this.selectObjects({ checkPositions: true})
    }

    // Tokens within template
    getTokensInTempalte(options) {
        let tokens = [];
        for (let token of this.scene.tokens) {
            if (this.isTokenInside(token, options)) {
                tokens.push(token);
            }
        }
        return tokens;
    }

    isTokenInside(token, options ) {
        options = { checkShape: true, checkPositions: true, ...options }
        // Use Shape (but there are rorunding issues; specifically if token and MeasuredTemplate have same hex origin)
        if (options.checkShape) {
            const obj = token?.object;
            const _x = obj.center.x - (options?.templateData?.x || this.x);
            const _y = obj.center.y - (options?.templateData?.y || this.y);
            if (this.shape.contains(_x, _y)) return true;
        }

        // Use positions (but some tokens may not be exctly centered on a 1 hex)
        if (options.checkPositions) {
            if (this._getGridHighlightPositions().find(o => o.x === token.x && o.y === token.y)) return true;
        }

        return false;
    }

    // Update user.targets based on which tokens are in the template
    async selectObjects(options) {
        let targets = [];

        for (let token of this.getTokensInTempalte(options)) {
            if (!token?.hidden) {
                targets.push(token.id);
            }
        }

        if (JSON.stringify(targets) != JSON.stringify(Array.from(game.user.targets).map(o => o.id))) {
            await game.user.updateTokenTargets(targets);
        }

    }

}