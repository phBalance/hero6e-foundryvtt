import { gridUnitsToMeters, roundDistanceInMetersUpToNumberOfGridUnits } from "./utility/units.mjs";

class HeroNullClass {}

const FoundryTokenRuler = foundry.canvas.placeables?.tokens.TokenRuler || HeroNullClass;

export class HeroTokenRuler extends FoundryTokenRuler {
    static colors = Object.freeze([0x33bc4e, 0xf1d836, 0x334ebc, 0xe72124]); // green, yellow, red, blue

    _getSegmentStyle(waypoint) {
        const style = super._getSegmentStyle(waypoint);
        this.#setSpeedColor(style, waypoint);
        return style;
    }

    _getGridHighlightStyle(waypoint, offset) {
        const style = super._getGridHighlightStyle(waypoint, offset);
        this.#setSpeedColor(style, waypoint);
        return style;
    }

    /**
     *  Adjusts the grid or segment style based on the token's movement characteristics.
     */
    #setSpeedColor(style, waypoint) {
        const gridToMeterMultiplier = gridUnitsToMeters();
        const movementCostInMeters = waypoint.measurement.cost * gridToMeterMultiplier;

        if (movementCostInMeters === 0) {
            style.color = 0xffffff;
            return;
        }

        // NOTE: Comparing movementCost vs Speed works fine when there is
        // a single movement type but does not work well for a mix of movement types.

        const maxCombatDistanceMeters = waypoint.actionConfig.maxCombatDistanceMeters(this.token);
        const maxNonCombatDistanceMeters = waypoint.actionConfig.maxNonCombatDistanceMeters(this.token);

        let colorIndex;

        // Half Move (green)
        if (movementCostInMeters <= roundDistanceInMetersUpToNumberOfGridUnits(maxCombatDistanceMeters / 2)) {
            colorIndex = 0;
        }

        // Full Move (yellow)
        // diagonal moves with 1 (or super low) maxCombatDistances are tricky, a min of one square is a GM house rule.
        else if (movementCostInMeters <= roundDistanceInMetersUpToNumberOfGridUnits(maxCombatDistanceMeters)) {
            colorIndex = 1;
        }

        // Noncombat (blue)
        else if (movementCostInMeters <= roundDistanceInMetersUpToNumberOfGridUnits(maxNonCombatDistanceMeters)) {
            colorIndex = 2;
        }

        // Exceeds non-combat (red)
        else {
            colorIndex = 3;
        }

        style.color = HeroTokenRuler.colors[colorIndex];
    }
}
