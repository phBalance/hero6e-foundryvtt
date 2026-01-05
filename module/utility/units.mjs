import { roundFavorPlayerTowardsZero } from "./round.mjs";
import { squelch } from "./util.mjs";

/**
 * A note about units
 *
 * Hero System and the FoundryVTT system force us to use a number of different units for measurements.
 *
 * Hero System 5e uses 2m hexes (1 hex = 1")
 * Hero System 6e uses metres (no hexes)
 * Internally, we typically use system units (" or m) depending on the system of the actor/item.
 *
 * FoundryVTT uses grid units of any dimension (defined on a per scene basis) or pixels if we're dealing with canvas.
 */

export function getSystemDisplayUnits(is5e) {
    if (is5e !== false && is5e !== true && is5e !== undefined) {
        console.error(`bad is5e paramater`, is5e);
    }

    return is5e ? '"' : "m";
}

/**
 *
 * @param {number} distanceInSystemUnits
 * @param {boolean} is5e
 * @returns number
 */
export function convertSystemUnitsToMetres(distanceInSystemUnits, is5e) {
    if (is5e !== false && is5e !== true && is5e !== undefined) {
        console.error(`bad is5e paramater`, is5e);
    }

    return distanceInSystemUnits * (is5e ? 2 : 1);
}

/**
 *
 * @param {number} distanceInHexes
 * @param {boolean} is5e
 * @returns number - number of system units of the hex (same for 5e and double for 6e)
 */
export function convertHexesToSystemUnits(distanceInHexes, is5e) {
    if (is5e !== false && is5e !== true && is5e !== undefined) {
        console.error(`bad is5e paramater`, is5e);
    }

    return distanceInHexes * (is5e ? 1 : 2);
}

export function hexDistanceToSystemDisplayString(distanceInHexes, is5e) {
    if (is5e !== false && is5e !== true && is5e !== undefined) {
        console.error(`bad is5e paramater`, is5e);
    }

    return `${convertHexesToSystemUnits(distanceInHexes, is5e)}${getSystemDisplayUnits(is5e)}`;
}

/**
 * Return the distance in the nearest rounded down system units.
 * 8.9m is 8m in 6e and 4" in 5e.
 * 9.9m is 9m in 6e and 4" in 5e.
 *
 * @param {number} distanceInMetres
 * @param {boolean} is5e
 * @returns number
 */
export function getRoundedDownDistanceInSystemUnits(distanceInMetres, is5e) {
    if (is5e !== false && is5e !== true && is5e !== undefined) {
        console.error(`bad is5e paramater`, is5e);
    }

    const roundedDistanceInMetres = is5e ? Math.floor(distanceInMetres / 2) : Math.floor(distanceInMetres);

    return roundedDistanceInMetres;
}

/**
 * Return the distance in system units rounded off in Player Favor
 * 8.1m is 8m in 6e and 4" in 5e.
 * 8.5m is 8m in 6e and 4" in 5e.
 * 8.9m is 9m in 6e and 4" in 5e.
 * 9.1m is 9m in 6e and 4" in 5e.
 * 9.5m is 10m in 6e and 5" in 5e.
 * 9.9m is 10m in 6e and 5" in 5e.
 *
 * @param {number} distanceInMetres
 * @param {boolean} is5e
 * @returns number
 */
export function getRoundedFavorPlayerDownDistanceInSystemUnits(distanceInMetres, is5e) {
    if (is5e !== false && is5e !== true && is5e !== undefined) {
        console.error(`bad is5e paramater`, is5e);
    }

    const roundedDistanceInMetres = is5e
        ? roundFavorPlayerTowardsZero(distanceInMetres / 2)
        : roundFavorPlayerTowardsZero(distanceInMetres);

    return roundedDistanceInMetres;
}

/**
 * Return the distance in the nearest rounded up system units.
 * 8.9m is 9m in 6e and 5" in 5e.
 * 9.9m is 10m in 6e and 5" in 5e.
 *
 * @param {number} distanceInMetres
 * @param {boolean} is5e
 * @returns number
 */
export function getRoundedUpDistanceInSystemUnits(distanceInMetres, is5e) {
    if (is5e !== false && is5e !== true && is5e !== undefined) {
        console.error(`bad is5e paramater`, is5e);
    }

    const roundedDistanceInMetres = is5e ? Math.ceil(distanceInMetres / 2) : Math.ceil(distanceInMetres);

    return roundedDistanceInMetres;
}

/**
 *  Get a multiplier that tries to translates from grid units, which are freeform text, to meters
 */
export function gridUnitsToMeters() {
    const units = game.canvas.grid.units;
    let distanceMultiplier;

    if (units === "m") {
        distanceMultiplier = 1;
    } else if (units === '"') {
        distanceMultiplier = 2;
    } else if (units === "km") {
        distanceMultiplier = 1000;
    } else if (units === "ft") {
        distanceMultiplier = 0.3048;
    } else if (units === "miles") {
        distanceMultiplier = 1609.34;
    } else {
        // Not sure what the units might be. Guess meters.
        if (!squelch(game.scenes?.current?.name || "scene")) {
            ui.notifications.error(
                `Scene "${game.scenes?.current?.name}" has unknown grid units (${units}). Fix your scene grid to be m, ", km, ft, or miles.`,
            );
        }
        distanceMultiplier = 1;
    }

    return distanceMultiplier;
}

/**
 * Try to translate the grid into meters (i.e. m/grid unit)
 *
 * @returns number
 */
export function getGridSizeInMeters() {
    const distance = game.canvas.grid.distance || 1;
    const distanceMultiplier = gridUnitsToMeters();

    return distance * distanceMultiplier;
}

/**
 * Given a distance in meters, translate that into rounded up number of grids
 *
 * @param {number} distanceInMeters
 * @returns number
 */
export function roundDistanceInMetersUpToNumberOfGridUnits(distanceInMeters) {
    const gridSizeInMeters = getGridSizeInMeters();

    if (distanceInMeters % gridSizeInMeters !== 0) {
        distanceInMeters += gridSizeInMeters - (distanceInMeters % gridSizeInMeters);
    }

    return distanceInMeters;
}
