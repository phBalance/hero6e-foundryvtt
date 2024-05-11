export default class HeroSystem6eMeasuredTemplate extends MeasuredTemplate {
    async _onClickLeft(event) {
        await super._onClickLeft(event);
        //if (game.user.id != this.document.user.id) return;
        await this.selectObjects();
        await game.user.broadcastActivity({
            targets: Array.from(game.user.targets.map((o) => o.id)),
        });
    }

    async _onUpdate(data, options, userId) {
        await super._onUpdate(data, options, userId);
        if (game.user.id != userId) return; //this.document.user.id) return;
        this._computeShape();
        this.selectObjects({ checkPositions: true, templateData: data });
        game.user.broadcastActivity({
            targets: Array.from(game.user.targets.map((o) => o.id)),
        });
    }

    _onRelease(...args) {
        console.log("_onRelease", ...args);
        super._onRelease(...args);
    }

    async _refreshTemplate(...args) {
        await super._refreshTemplate(...args);

        // A tad hacky here.  When template is first rendered we don't want to selectObjects
        if (game.user.id != this.document.user.id) return;

        await this.selectObjects();

        if (!this.isPreview) {
            await game.user.broadcastActivity({
                targets: Array.from(game.user.targets.map((o) => o.id)),
            });
        }
    }

    // Tokens within template
    getTokensInTemplate(options) {
        // PERSONALIMMUNITY
        const PERSONALIMMUNITY = (
            this.document.flags?.item?.system?.MODIFIER || []
        ).find((o) => o.XMLID === "PERSONALIMMUNITY");

        let tokens = [];
        for (let token of this.scene.tokens) {
            // For some reason the only the base ITEM and ACTOR props pass into this class, so we aren't using the typical functions like actor.id instead use actor._id.
            if (this.isTokenInside(token, options)) {
                if (
                    PERSONALIMMUNITY &&
                    token.actor?.id != this.document.flags?.actor?._id
                ) {
                    tokens.push(token);
                }
            }
        }
        return tokens;
    }

    isTokenInside(token, options) {
        options = { checkShape: true, checkPositions: true, ...options };
        // Use Shape (but there are rounding issues; specifically if token and MeasuredTemplate have same hex origin)
        if (options.checkShape) {
            const obj = token?.object;
            const _x = obj.center.x - (options?.templateData?.x || this.x);
            const _y = obj.center.y - (options?.templateData?.y || this.y);
            if (this.shape.contains(_x, _y)) return true;
        }

        // Use positions (but some tokens may not be exctly centered on a 1 hex)
        if (options.checkPositions) {
            if (
                this._getGridHighlightPositions().find(
                    (o) => o.x === token.x && o.y === token.y,
                )
            )
                return true;
        }

        return false;
    }

    // Update user.targets based on which tokens are in the template
    async selectObjects(options) {
        let targets = [];

        for (let token of this.getTokensInTemplate(options)) {
            if (!token?.hidden) {
                targets.push(token.id);
            }
        }

        if (
            JSON.stringify(targets) !=
            JSON.stringify(Array.from(game.user.targets).map((o) => o.id))
        ) {
            await game.user.updateTokenTargets(targets);
        }
    }
}
