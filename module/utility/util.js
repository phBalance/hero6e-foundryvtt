export function modifyRollEquation(equation, value) {
    if (!value) { return equation; }

    if (value != 0) {
        let sign = " + ";
        if (value < 0) {
            sign = " - ";
        }
        equation = equation + sign + Math.abs(value);
    }

    return equation
}

export function getTokenChar(token, char, data) {
    let baseActor = game.actors.get(token.data.actorId);

    try {
        return token.data.actorData.system.characteristics[`${char}`][`${data}`];
    } catch (TypeError) {
        return baseActor.system.characteristics[`${char}`][`${data}`];
    }
}

export function getPowerInfo(options) {
    const xmlid = options.xmlid || options.item?.system?.XMLID || options.item?.system?.xmlid || options.item?.system?.id
    const actor = options?.item?.actor || options?.actor
    let powerInfo = CONFIG.HERO.powers[xmlid] || CONFIG.HERO.powers5e[xmlid]
    let characteristicInfo = CONFIG.HERO.characteristicCosts[xmlid.toLowerCase()] || CONFIG.HERO.characteristicCosts5e[xmlid.toLowerCase()]
    if (actor?.system?.is5e) {
        powerInfo = CONFIG.HERO.powers5e[xmlid] || powerInfo
    }

    if (!powerInfo && characteristicInfo) {
        if (actor?.system?.is5e) {
            characteristicInfo = CONFIG.HERO.characteristicCosts5e[xmlid.toLowerCase()];
        }
        powerInfo = {
            cost: characteristicInfo,
            duration: "persistent"
        }
    }

    if (powerInfo) {
        powerInfo.xmlid = xmlid;
    }
    return powerInfo
}



export function getModifierInfo(options) {
    const xmlid = options.xmlid || options.item?.system?.XMLID || options.item?.system?.xmlid || options.item?.system?.id
    const actor = options?.item?.actor || options?.actor
    return CONFIG.HERO.ModifierOverride[xmlid]
}
