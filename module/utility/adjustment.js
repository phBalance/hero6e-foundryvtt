import { getPowerInfo } from "../utility/util.js";

export function AdjustmentSources(actor) {
    let choices = {};

    let powers = CONFIG.HERO.powers.filter(
        (o) =>
            (o.powerType?.includes("characteristic") ||
                o.powerType?.includes("movement")) &&
            !o.ignoreFor?.includes(actor.type) &&
            !o.ignoreFor?.includes(actor.system.is5e ? "5e" : "6e") &&
            (!o.onlyFor || o.onlyFor.includes(actor.type)),
    );

    // Attack powers
    for (const item of actor.items.filter(
        (o) => o.type === "power" && o.system.XMLID != "MULTIPOWER",
    )) {
        powers.push({ key: item.name });
    }

    for (const power of powers) {
        let key = power.key;
        choices[key.toUpperCase()] = key.toUpperCase();
    }

    // const powers = (!actor || actor.system.is5e)  ? CONFIG.HERO.powers5e : CONFIG.HERO.powers
    // for (const key in powers) {
    //     if (
    //         !powers[key].powerType?.includes("skill") &&
    //         !powers[key].powerType?.includes("talent") &&
    //         !powers[key].powerType?.includes("framework")
    //     ) {
    //         choices[key.toUpperCase()] = key.toUpperCase();
    //     }

    // }

    // Add * to defensive powers
    for (let key of Object.keys(choices)) {
        if (AdjustmentMultiplier(key, actor) > 1) {
            choices[key] += "*";
        }
    }

    choices[""] = "<none>";
    choices = Object.keys(choices)
        .sort()
        .reduce((obj, key) => {
            obj[key] = choices[key];
            return obj;
        }, {});

    return choices;
}

export function AdjustmentMultiplier(XMLID, actor) {
    if (!XMLID) return 1;
    let configPowerInfo = getPowerInfo({ xmlid: XMLID, actor: actor });
    if (!configPowerInfo) {
        if (actor) {
            configPowerInfo = getPowerInfo({
                xmlid: actor.items.find((o) => o.name.toUpperCase() === XMLID)
                    ?.system?.XMLID,
                actor: actor,
            });
        }
        if (!configPowerInfo) return 1;
    }
    if (
        [
            "CON",
            "DCV",
            "DMCV",
            "PD",
            "ED",
            "REC",
            "END",
            "BODY",
            "STUN",
        ].includes(XMLID)
    )
        return 2;
    if (configPowerInfo.powerType?.includes("defense")) return 2;
    return 1;
}
