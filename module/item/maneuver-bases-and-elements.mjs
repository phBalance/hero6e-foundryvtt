/**
 * Maneuver Bases And Elements.
 *
 * Per Ultimate Martial Artist a maneuver's effect is a list of BASES (the core action) and
 * ELEMENTS (flavour for the action) (e.g. "Block", "Abort", "Target Falls", "Grab Two Limbs"), not free prose.
 *
 */

/**
 * Every maneuver element the automation recognizes, defined exactly once.
 *
 *   includes — case-insensitive substring(s) marking the element present. An
 *              array means "any of".
 *   excludes — case-insensitive substrings that disqualify an otherwise match
 *   regex    — used instead of `includes` when the element isn't a fixed phrase
 *
 **/
const MANEUVER_BASES_AND_ELEMENTS = Object.freeze({
    abort: { includes: "ABORT" },
    // MMA element "You Fall" — the attacker goes prone
    attackerFalls: { includes: "YOU FALL" },
    attackerTakes: { includes: "ATTACKER TAKES" },
    bind: { includes: "BIND" },
    block: { includes: "BLOCK", excludes: ["FOLLOW BLOCK"] },
    crush: { includes: "CRUSH" },
    disable: { includes: "DISABLE" },
    disarm: { includes: "DISARM" },
    dodge: { includes: "DODGE" },
    exert: { includes: "[STRDC]" },
    flashDc: { includes: "[FLASHDC]" },
    fmove: { includes: "FMOVE" },
    grab: { includes: "GRAB", excludes: ["GRAB WEAPON", "MUST", "VS. GRAB", "VERSUS GRAB"] },
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
    shove: { includes: "SHOVE", excludes: ["TO RESIST SHOVE"] },
    strike: { includes: "STRIKE" },
    takeFullDmg: { includes: "TAKE FULL DMG" },
    takeHalfDmg: { includes: "TAKE HALF DMG" },
    throw: { includes: ["TARGET FALLS", "HE FALLS", "OPPONENT FALLS"] },
    velocity: { regex: /v\/(\d+)/i },
    weaponDc: { includes: "[WEAPONDC]" },
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
 * are bases and/or elements written with either "," or ";" as separators.
 *
 * @param {string} text
 *
 * @returns {string[]}
 */
function splitBasesAndElementsFromEffectField(item) {
    const effectText = getManeuverEffect(item);
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
 * @param {string} element - Element to search for. String must be a key of MANEUVER_BASES_AND_ELEMENTS
 *
 * @returns {boolean}
 */
export function maneuverHasBasisOrElement(item, element) {
    const elementDefinition = MANEUVER_BASES_AND_ELEMENTS[element];
    if (!elementDefinition) {
        console.error(`Unknown maneuver element "${element}"`, item.detailedName());
        return false;
    }
    const markers = elementDefinition.includes
        ? [elementDefinition.includes].flat().map((marker) => marker.toUpperCase())
        : [];

    // Get a capitalize array of bases and elements
    const basesAndElementsArray = splitBasesAndElementsFromEffectField(item).map((element) => element.toUpperCase());
    if (basesAndElementsArray.length === 0) {
        return false;
    }

    return basesAndElementsArray.some((presentElement) => {
        const matched = elementDefinition.regex
            ? elementDefinition.regex.test(presentElement)
            : markers.some((marker) => presentElement.includes(marker));
        if (!matched) {
            return false;
        }

        return !(elementDefinition.excludes ?? []).some((exclusion) =>
            presentElement.includes(exclusion.toUpperCase()),
        );
    });
}
