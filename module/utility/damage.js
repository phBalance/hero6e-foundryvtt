export function modifyForStrength(damageRoll, effectiveStr, item, actor) {
    if (!item.system.usesStrength) { return damageRoll; }

    const pips = (item.system.killing)? Math.floor(effectiveStr / 10) : Math.floor(effectiveStr / 5)  

    if (pips === 0) { return damageRoll; }

    const strContribution = pips.toString() + "D6"

    return damageRoll + " + " + strContribution
}