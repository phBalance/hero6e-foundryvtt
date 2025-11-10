import { RoundFavorPlayerDown } from "./utility/round.mjs";

class HeroNullClass {}

const FoundryTokenRuler = foundry.canvas.placeables?.tokens.TokenRuler || HeroNullClass;

export class HeroTokenRuler extends FoundryTokenRuler {
    static colors = Object.freeze([0x33bc4e, 0xf1d836, 0x334ebc, 0xe72124]); // green, yellow, red, blue

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
        // Technically should use RoundFavorPlayerDown,
        // however in square grids the diagonals can make it hard to move so
        // using Math.floor to provide a larger margin of rounding
        const movementCost = RoundFavorPlayerDown(waypoint.measurement.cost);
        if (movementCost > 0) {
            console.debug(waypoint);
        }

        // PH: FIXME: Makes the assumption that units of the grid are in meters.
        const gridSize = Math.floor(game.canvas.grid.distance || 1);

        if (movementCost === 0) {
            style.color = 0xffffff;
            return;
        }

        // NOTE: Comparing movementCost vs Speed works fine when there is
        // a single movement type but does not work well for a mix of movement types.

        let distanceInMeters = waypoint.actionConfig.maxCombatDistanceMeters(this.token);
        const maxNonCombatDistanceMeters = waypoint.actionConfig.maxNonCombatDistanceMeters(this.token);

        function roundDistanceUpToGridSize(distanceInMeters, gridSize) {
            if (distanceInMeters % gridSize !== 0) {
                distanceInMeters += gridSize - (distanceInMeters % gridSize);
            }

            return distanceInMeters;
        }

        let colorIndex;

        // Half Move (green)
        if (movementCost <= roundDistanceUpToGridSize(distanceInMeters / 2, gridSize)) {
            colorIndex = 0;
        }

        // Full Move (yellow)
        // diagonal moves with 1 (or super low) maxCombatDistances are tricky, a min of one square is a GM house rule.
        else if (movementCost <= roundDistanceUpToGridSize(distanceInMeters, gridSize)) {
            colorIndex = 1;
        }

        // Noncombat (blue)
        else if (movementCost <= roundDistanceUpToGridSize(maxNonCombatDistanceMeters, gridSize)) {
            colorIndex = 2;
        }

        // Exceeds non-combat (red)
        else {
            colorIndex = 3;
        }

        style.color = HeroTokenRuler.colors[colorIndex];
    }
}
