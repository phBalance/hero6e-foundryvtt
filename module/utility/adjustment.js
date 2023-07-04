import { HEROSYS } from "../herosystem6e.js";

export function AdjustmentSources(actor) {

    let choices = {}
    const characteristics = (!actor || actor.system.is5e) ? CONFIG.HERO.characteristics5e : CONFIG.HERO.characteristics
    for (const key in characteristics) {
        choices[key.toUpperCase()] = key.toUpperCase();
    }

    const powers = (!actor || actor.system.is5e)  ? CONFIG.HERO.powers5e : CONFIG.HERO.powers
    for (const key in powers) {
        if (
            !powers[key].powerType.includes("skill") &&
            !powers[key].powerType.includes("talent") &&
            !powers[key].powerType.includes("framework")
        ) {
            choices[key.toUpperCase()] = key.toUpperCase();
        }

    }

    // Add * to defensive powers
    for(let key of Object.keys(choices))
    {
        if (AdjustmentMultiplier(key) > 1) {
            choices[key] += "*"
        }
    }

    choices[""] = "<none>"
    choices = Object.keys(choices).sort().reduce(
        (obj, key) => {
            obj[key] = choices[key];
            return obj;
        },
        {}
    );

    //choices = ["none", ...choices]

    return choices;
}

export function AdjustmentMultiplier(XMLID) {
    if (["CON", "DCV", "DMCV", "PD", "ED", "REC", "END", "BODY", "STUN"].includes(XMLID)) return 2;
    if (CONFIG.HERO.powers5e[XMLID].powerType.includes("defense")) return 2;
    return 1;
}