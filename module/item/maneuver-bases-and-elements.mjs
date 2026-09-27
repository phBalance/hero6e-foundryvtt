/**
 * Maneuver Bases And Elements.
 *
 * Per Ultimate Martial Artist a maneuver's effect is a LIST OF BASES AND ELEMENTS
 * ("Block", "Abort", "Target Falls", "Grab Two Limbs"), not free prose.
 *
 */

/**
 * Every maneuver element the automation recognizes, defined exactly once.
 *
 *   includes — case-insensitive substring(s) marking the element present. An
 *              array means "any of".
 *   not      — case-insensitive substrings that disqualify an otherwise match
 *   regex    — used instead of `includes` when the element isn't a fixed phrase
 *
 * The `not:` guards exist only because of open bug #2: "Must Follow Block" and
 * "Grab Weapon" are different ELEMENTS from "Block" and "Grab", but while we
 * match against the whole string they read as false positives.
 *
 **/
const MANEUVER_BASES_AND_ELEMENTS = Object.freeze({
    abort: { includes: "ABORT" },
    attackerFalls: { includes: "YOU FALL" },
    attackerTakes: { includes: "ATTACKER TAKES" },
    bind: { includes: "BIND" },
    block: { includes: "BLOCK", not: ["FOLLOW BLOCK"] },
    crush: { includes: "CRUSH" },
    disable: { includes: "DISABLE" },
    disarm: { includes: "DISARM" },
    dodge: { includes: "DODGE" },
    escape: { includes: "ESCAPE" },
    flashDc: { includes: "[FLASHDC]" },
    fmove: { includes: "FMOVE" },
    grab: { includes: "GRAB", not: ["GRAB WEAPON", "MUST"] },
    grabWeapon: { includes: "GRAB WEAPON" },
    halfMoveRequired: { includes: "HALF MOVE REQUIRED" },
    killingDc: { includes: ["[KILLINGDC]", "[WEAPONKILLINGDC]"] },
    lastingRestriction: { includes: "LASTING RESTRICTION" },
    mustFollow: { includes: "MUST FOLLOW" },
    nndDc: { includes: ["[NNDDC]", "[WEAPONNNDDC]"] },
    normalDc: { includes: ["[NORMALDC]", "[WEAPONDC]"] },
    prone: { includes: "PRONE" },
    requiresBothHands: { includes: "BOTH HANDS" },
    response: { includes: "CAN ONLY BE USED AFTER" },
    root: { includes: "TO RESIST SHOVE" },
    shove: { includes: "SHOVE", not: ["TO RESIST SHOVE"] },
    strAny: { includes: "STR" },
    strDc: { includes: "[STRDC]" },
    strike: { includes: "STRIKE" },
    takeFullDmg: { includes: "TAKE FULL DMG" },
    takeHalfDmg: { includes: "TAKE HALF DMG" },
    throw: { includes: ["TARGET FALLS", "HE FALLS", "OPPONENT FALLS"] },
    velocity: { regex: /v\/(\d+)/i },
    weaponDc: { includes: "[WEAPONDC]" },
    youFall: { includes: "YOU FALL" },
});

/**
 * The maneuver's effect text, upper-cased, so element matching can be done
 * without worrying about case.
 *
 * @param {HeroSystem6eItem} item The maneuver (or attack) item to read.
 * @returns {string} The upper-cased effect text, or "" if the item has none.
 */
export function getManeuverEffect(item) {
    // PH: FIXME: Should be picking WEAPONEFFECT only if it's a weapon based usage. There is presently
    //            no good way to do that as USEWEAPON seems to be always "No".
    return item.system.EFFECT || item.system.WEAPONEFFECT || "";
}

/**
 * The maneuver's effect text, upper-cased, so element matching can be done
 * without worrying about case.
 *
 * @param {HeroSystem6eItem} item The maneuver (or attack) item to read.
 * @returns {string} The upper-cased effect text, or "" if the item has none.
 */
export function getManeuverEffectCapitalized(item) {
    return getManeuverEffect(item).toUpperCase();
}

/**
 * Split effect text into its constituent elements. HD files EFFECT/WEAPONEFFECT
 * are elements written with either "," or ";" as separators.
 *
 * @param {string} text
 *
 * @returns {string[]}
 */
function splitBasesAndElementsFromEffectField(item) {
    const effectText = getManeuverEffectCapitalized(item);
    if (!effectText) {
        return [];
    }

    return effectText
        .split(/[,;]/)
        .map((element) => element.trim())
        .filter(Boolean);
}

/**
 * Does this item's effect include the given element?
 *
 * @param {HeroSystem6eItem} item
 * @param {string} element - Element to search for. String must be a key of MANEUVER_ELEMENTS
 *
 * @returns {boolean}
 */
export function maneuverHasBasisOrElement(item, element) {
    const elementDefinition = MANEUVER_BASES_AND_ELEMENTS[element];
    if (!elementDefinition) {
        console.error(`Unknown maneuver element "${element}"`, item.detailedName());
        return false;
    }

    const presentElements = splitBasesAndElementsFromEffectField(item);
    if (presentElements.length === 0) {
        return false;
    }

    const markers = elementDefinition.includes
        ? [elementDefinition.includes].flat().map((marker) => marker.toUpperCase())
        : [];

    return presentElements.some((presentElement) => {
        const matched = elementDefinition.regex
            ? elementDefinition.regex.test(presentElement)
            : markers.some((marker) => presentElement.includes(marker));
        if (!matched) {
            return false;
        }

        return !(elementDefinition.not ?? []).some((exclusion) => presentElement.includes(exclusion.toUpperCase()));
    });
}
