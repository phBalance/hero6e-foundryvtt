/**
 * A temporary method to be used during the transition to make it easy to find bits of code
 * that are dependent on v11 or v12 checks.
 *
 * @returns boolean
 */
export function isGameV12OrLater() {
    return foundry.utils.isNewerVersion(game.version, "11.315");
}

/**
 * FoundryVTT overloads Math to add the clamped or clamp method depending on the version.
 * Just provide a straight implementation.
 *
 * @returns number
 */
export function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}
