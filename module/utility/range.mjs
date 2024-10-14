import { getRoundedDownDistanceInSystemUnits } from "./units.mjs";
import HeroSystem6eMeasuredTemplate from "../measuretemplate.mjs";

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

export function measure3DDistance(origin, target) {
    console.log("measure3DDistance", origin, target);
    const dx = target.x - origin.x;
    const dy = target.y - origin.y;
    const dz = target.z - origin.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
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
    const originalMeasureDistance = canvas.grid.measureDistance(origin, target, {
        gridSpaces: true,
    });

    // We don't yet support measuring 3D distance between a token and a template volume, so we
    // return the original distance
    const templateInvolved =
        origin._object instanceof HeroSystem6eMeasuredTemplate ||
        target._object instanceof HeroSystem6eMeasuredTemplate;
    if (templateInvolved) {
        return originalMeasureDistance;
    }

    // Past this point, both origin and target are tokens, so we can access their elevation via the document
    const originElevation = origin.document.elevation || 0;
    const targetElevation = target.document.elevation || 0;
    if (originElevation === targetElevation) {
        return originalMeasureDistance;
    }

    // We need to decide on an actor to use for the system units. Since both objects being measured are tokens,
    // we can use the origin token's actor.
    const rulesActor = origin.actor;
    const threeDDistance = Math.sqrt(
        Math.pow(originElevation - targetElevation, 2) + Math.pow(originalMeasureDistance, 2),
    );
    return getRoundedDownDistanceInSystemUnits(threeDDistance, rulesActor);
}
