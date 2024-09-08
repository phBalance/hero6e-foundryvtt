import { getRoundedDownDistanceInSystemUnits } from "./units.mjs";

/**
 * Calculate range based on a provided distance in metres. Range penalties are essentially
 * the same in 5e and 6e, but there is a difference in the rounding of the distance.
 *
 * @param {number} distanceInMetres
 * @param {object} actor
 *
 * @returns {number} rangePenalty
 */
export function calculateRangePenaltyFromDistanceInMetres(distanceInMetres, actor) {
    const is5e = actor?.system?.is5e;
    const roundedDistanceInMetres = getRoundedDownDistanceInSystemUnits(distanceInMetres, actor) * (is5e ? 2 : 1);
    const basicRangePenalty = Math.ceil(Math.log2(roundedDistanceInMetres / 8)) * 2;
    const rangePenalty = Math.max(0, basicRangePenalty);

    return rangePenalty;
}

/**
 * Calculate the distance between 2 tokens
 *
 * @param {object} origin MeasuredTemplate or Token
 * @param {object} target MeasuredTemplate or Token
 *
 * @returns {number} distanceInMetres
 */
export function calculateDistanceBetween(origin, target) {
    return canvas.grid.measureDistance(origin, target, {
        gridSpaces: true,
    });
}
