import { RoundFavorPlayerDown } from "./utility/round.mjs";

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
                    "-=getCostFunction": null, // default Foundry jump cost was "cost * 2"
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

    _getSegmentStyle(waypoint) {
        const style = super._getSegmentStyle(waypoint);
        this.#speedValueStyle(style, waypoint);
        return style;
    }

    _getGridHighlightStyle(waypoint, offset) {
        const style = super._getGridHighlightStyle(waypoint, offset);
        this.#speedValueStyle(style, waypoint);
        return style;
    }

    /// Adjusts the grid or segment style based on the token's movement characteristics
    #speedValueStyle(style, waypoint) {
        const colors = [0x33bc4e, 0xf1d836, 0x334ebc, 0xe72124];

        // Technically should use RoundFavorPlayerDown,
        // however in square grids the diagonals can make it hard to move so
        // using Math.floor to provide a larger margin of rounding
        const movementCost = RoundFavorPlayerDown(waypoint.measurement.cost);
        let speed = waypoint.actionConfig.speed?.(this.token) ?? Infinity;

        if (speed % 2 !== 0) {
            speed += 1;
        }

        // Exceeds non-combat (red)
        let index = 3;

        // NOTE: Comparing movementCost vs Speed works fine when there is
        // a single movement type.  But dones't work well for a mix of movement types.

        // Noncombat (blue)
        if (movementCost <= speed * 2) {
            index = 2;
        }

        // Full Move (yellow)
        // diagonal moves with 1 (or super low) speed are tricky, a min of one square.
        // Show it as full move instead of invalid
        if (movementCost <= speed || movementCost <= 3) {
            index = 1;
        }

        // Half Move (green)
        if (movementCost <= speed / 2) {
            index = 0;
        }

        style.color = colors[index];
    }
}
