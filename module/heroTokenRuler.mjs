import { RoundFavorPlayerDown } from "./utility/round.mjs";

class HeroNullClass {}

const FoundryTokenRuler = foundry.canvas.placeables?.tokens.TokenRuler || HeroNullClass;

export class HeroTokenRuler extends FoundryTokenRuler {
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

        // const movementActions = [];
        // let _wayPoint = waypoint;
        // for (let i = 0; i < 99; i++) {
        //     if (!_wayPoint) break;
        //     movementActions[_wayPoint.action] = movementActions[_wayPoint.action] || 0 + _wayPoint.cost;
        //     _wayPoint = _wayPoint.previous;
        // }

        // console.log(movementActions);

        // foreach(const wp of movementActions)

        // Technically should use RoundFavorPlayerDown,
        // however in square grids the diagonals can make it hard to move so
        // using Math.floor to provide a larger margin of rounding
        const movementCost = RoundFavorPlayerDown(waypoint.measurement.cost);
        if (movementCost > 0) {
            console.debug(waypoint);
        }

        const gridSize = Math.floor(game.canvas.grid.distance || 1);

        if (movementCost === 0) {
            style.color = 0xffffff;
            return;
        }
        let maxCombatDistanceMeters = waypoint.actionConfig.maxCombatDistanceMeters?.(this.token) ?? Infinity;

        if (maxCombatDistanceMeters % gridSize !== 0) {
            maxCombatDistanceMeters += gridSize - (maxCombatDistanceMeters % gridSize);
        }

        // Exceeds non-combat (red)
        let index = 3;

        // NOTE: Comparing movementCost vs Speed works fine when there is
        // a single movement type.  But does not work well for a mix of movement types.

        // Noncombat (blue)
        if (movementCost <= maxCombatDistanceMeters / 2) {
            index = gridSize;
        }

        // Full Move (yellow)
        // diagonal moves with 1 (or super low) maxCombatDistances are tricky, a min of one square is a GM house rule.
        if (movementCost <= maxCombatDistanceMeters) {
            index = 1;
        }

        // Half Move (green)
        if (movementCost <= maxCombatDistanceMeters / gridSize) {
            index = 0;
        }

        style.color = colors[index];
    }
}
