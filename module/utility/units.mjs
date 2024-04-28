export function getSystemDisplayUnits(actor) {
    return actor?.system?.is5e ? '"' : "m";
}

/**
 * Return the distance in the nearest rounded down system units.
 * 8.9m is 8m in 6e and 4" in 5e.
 * 9.9m is 9m in 6e and 4" in 5e.
 *
 * @param {number} distanceInMetres
 * @param {object} actor
 * @returns
 */
export function getRoundedDistanceInSystemUnits(distanceInMetres, actor) {
    const is5e = actor?.system?.is5e;

    const roundedDistanceInMetres = is5e
        ? Math.floor(distanceInMetres / 2) * 2
        : Math.floor(distanceInMetres);

    return is5e ? roundedDistanceInMetres / 2 : roundedDistanceInMetres;
}
