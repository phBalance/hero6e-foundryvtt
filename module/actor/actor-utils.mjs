/**
 * Get the bonus to DCV against Hand-To-Hand attacks.
 *
 * In 5e this defense is given by the Weapon Familiarity: Off Hand skill
 * In 6e this defense is given by the Off Hand Defense talent
 *
 * @param {HeroSystem6eActor} defendingActor
 *
 * @returns {number} - Bonus to DCV against Hand-To-Hand attacks
 */
export function getOffHandDefenseDcv(defendingActor) {
    let offHandDcvBonus = 0;

    if (defendingActor) {
        if (defendingActor.is5e) {
            // Weapon Familiarity off hand can only be bought once
            const activeWeaponFamiliarityItems = defendingActor.items.filter(
                (item) => item.system.XMLID === "WEAPON_FAMILIARITY" && item.isActive,
            );
            for (const wfItem of activeWeaponFamiliarityItems) {
                // Weapon Familiarity off hand can only be bought one.
                // NOTE: This assumes that someone doesn't buy it multiple times in different WFs
                const offHandWfItem = wfItem.adders.find((adder) => adder.XMLID === "OFFHAND");
                if (offHandWfItem) {
                    offHandDcvBonus += 1;
                }
            }
        } else {
            // It's possible for the skill to be purchased multiple times with GM permission so just support it.
            const activeOffHandDefenseItems = defendingActor.items.filter(
                (item) => item.system.XMLID === "OFFHANDDEFENSE" && item.isActive,
            );
            offHandDcvBonus += activeOffHandDefenseItems.length;
        }
    }

    return offHandDcvBonus;
}
