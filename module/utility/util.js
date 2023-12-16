export function modifyRollEquation(equation, value) {
    if (!value) {
        return equation;
    }

    if (value != 0) {
        let sign = " + ";
        if (value < 0) {
            sign = " - ";
        }
        equation = equation + sign + Math.abs(value);
    }

    return equation;
}

export function getTokenChar(token, char, data) {
    let baseActor = game.actors.get(token.data.actorId);

    try {
        return token.data.actorData.system.characteristics[`${char}`][
            `${data}`
        ];
    } catch (TypeError) {
        return baseActor.system.characteristics[`${char}`][`${data}`];
    }
}

export function getPowerInfo(options) {
    const xmlid =
        options.xmlid ||
        options.item?.system?.XMLID ||
        options.item?.system?.xmlid ||
        options.item?.system?.id;

    const actor = options?.item?.actor || options?.actor;
    if (!actor) {
        // This has a problem if we're passed in an XMLID for a power as we don't know the actor so we don't know if it's 5e or 6e
        console.error(
            `${xmlid} for ${options.item?.name} has no actor provided. Assuming 6e.`,
        );
    }

    let powerInfo = CONFIG.HERO.powers.find((o) => o.key === xmlid);
    if (!powerInfo || actor?.system?.is5e) {
        powerInfo = {
            ...powerInfo,
            ...CONFIG.HERO.powers5e.find((o) => o.key === xmlid),
        };
    }

    if (!powerInfo && options?.item?.type == "maneuver") {
        powerInfo = {
            powerType: ["maneuver"],
            perceivability: "obvious",
            duration: "instant",
            costEnd: false,
            target: "target's dcv",
        };
    }

    if (powerInfo) {
        powerInfo.xmlid = xmlid;
        powerInfo.XMLID = xmlid;
    }

    // LowerCase
    if (powerInfo?.duration)
        powerInfo.duration = powerInfo.duration.toLowerCase();

    return powerInfo;
}

export function getModifierInfo(options) {
    const xmlid =
        options.xmlid ||
        options.item?.system?.XMLID ||
        options.item?.system?.xmlid ||
        options.item?.system?.id;

    const actor = options?.item?.actor || options?.actor;
    if (!actor) {
        // This has a problem if we're passed in an XMLID for a power as we don't know the actor so we don't know if it's 5e or 6e
        console.error(
            `${xmlid} for ${options.item?.name} has no actor provided. Assuming 6e.`,
        );
    }

    let modifierOverrideInfo = CONFIG.HERO.ModifierOverride[xmlid];
    if (!modifierOverrideInfo || actor?.system?.is5e) {
        modifierOverrideInfo = {
            ...modifierOverrideInfo,
            ...CONFIG.HERO.ModifierOverride5e[xmlid],
        };
    }

    return modifierOverrideInfo;
}

export function getCharacteristicInfoArrayForActor(actor) {
    let powers = CONFIG.HERO.powers.filter(
        (o) =>
            (o.powerType?.includes("characteristic") ||
                o.powerType?.includes("movement")) &&
            !o.ignoreFor?.includes(actor.type) &&
            !o.ignoreFor?.includes(actor.system.is5e ? "5e" : "6e") &&
            (!o.onlyFor || o.onlyFor.includes(actor.type)),
    );

    if (actor.system.is5e) {
        for (const power5e of CONFIG.HERO.powers5e) {
            let idx = powers.findIndex((o) => o.key === power5e.key);
            if (idx > -1) {
                powers[idx] = { ...powers[idx], ...power5e };
            }
        }
    }

    return powers;
}
