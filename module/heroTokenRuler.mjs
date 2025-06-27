class HeroNullClass {}

const FoundryTokenRuler = foundry.canvas.placeables?.tokens.TokenRuler || HeroNullClass;

export class HeroTokenRuler extends FoundryTokenRuler {
    static applyHeroMovementConfig() {
        // Adjusting `Blink (Teleport)` to just be Teleport and maintain its use elsewhere
        const teleport = {
            ...CONFIG.Token.movement.actions.blink,
            label: "TOKEN.MOVEMENT.ACTIONS.teleport.label",
            canSelect: (token) => parseInt(token.actor?.system.characteristics.teleportation?.value) > 0,
        };

        foundry.utils.mergeObject(
            CONFIG.Token.movement.actions,
            {
                "-=blink": null,
                burrow: {
                    canSelect: (token) => parseInt(token.actor?.system.characteristics.tunneling?.value) > 0,
                    speed: (token) => parseInt(token.actor?.system.characteristics.tunneling?.value) || 0,
                },
                "-=crawl": null,

                fly: {
                    canSelect: (token) => parseInt(token.actor?.system.characteristics.flight?.value) > 0,
                    speed: (token) => parseInt(token.actor?.system.characteristics.flight?.value) || 0,
                },
                jump: {
                    canSelect: (token) => parseInt(token.actor?.system.characteristics.leaping?.value) > 0,
                    speed: (token) => parseInt(token.actor?.system.characteristics.leaping?.value) || 0,
                },
                swim: {
                    canSelect: (token) => parseInt(token.actor?.system.characteristics.swimming?.value) > 0,
                    speed: (token) => parseInt(token.actor?.system.characteristics.swimming?.value) || 0,
                },
                teleport,
                // Swinging
                walk: {
                    speed: (token) => parseInt(token.actor?.system.characteristics.running?.value) || 0,
                },
            },
            { performDeletions: true },
        );
    }

    _getGridHighlightStyle(waypoint, offset) {
        const style = super._getGridHighlightStyle(waypoint, offset);
        this.#speedValueStyle(style, waypoint);
        return style;
    }

    /// Adjusts the grid or segment style based on the token's movement characteristics
    #speedValueStyle(style, waypoint) {
        const colors = [0x33bc4e, 0xf1d836, 0xe72124];

        const movementCost = Math.floor(waypoint.measurement.cost);

        let speed = waypoint.actionConfig.speed?.(this.token) ?? Infinity;
        if (speed % 2 !== 2) {
            speed += 1;
        }
        let index = 2;

        if (movementCost <= speed) {
            index = 1;
        }
        if (movementCost <= speed / 2) {
            index = 0;
        }

        style.color = colors[index];
    }
}
