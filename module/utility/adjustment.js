import { getPowerInfo } from "./util.js";
import { determineExtraDiceDamage } from "./damage.js";

export function adjustmentSources(actor) {
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

    // Add * to defensive powers
    for (let key of Object.keys(choices)) {
        if (defensivePowerAdjustmentMultiplier(key, actor) > 1) {
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

// 5e (pg 114) indicates PD, ED, and defensive powers
const defensiveCharacteristics5e = ["PD", "ED"];

// 6e (V1 pg 135)
const defensiveCharacteristics6e = [
    "CON",
    "DCV",
    "DMCV",
    "PD",
    "ED",
    "REC",
    "END",
    "BODY",
    "STUN",
];

export function defensivePowerAdjustmentMultiplier(XMLID, actor) {
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

    const defenseCharacteristics = actor.system.is5e
        ? defensiveCharacteristics5e
        : defensiveCharacteristics6e;
    if (defenseCharacteristics.includes(XMLID)) {
        return 2;
    }

    if (configPowerInfo.powerType?.includes("defense")) return 2;

    return 1;
}

export function determineMaxAdjustment(item) {
    const reallyBigInteger = 1000000;

    // Certain adjustment powers have no fixed limit. Give them a large integer.
    if (
        item.system.XMLID !== "ABSORPTION" &&
        item.system.XMLID !== "AID" &&
        item.system.XMLID !== "TRANSFER"
    ) {
        return reallyBigInteger;
    }

    if (item.actor.system.is5e) {
        // Max pips in a roll is starting max base.
        let maxAdjustment = item.system.dice * 6;

        const extraDice = determineExtraDiceDamage(item);
        switch (extraDice) {
            case "+1":
                maxAdjustment = maxAdjustment + 1;
                break;
            case "1d3":
                maxAdjustment = maxAdjustment + 3;
                break;
            default:
                break;
        }

        // Add INCREASEDMAX if available.
        const increaseMax = item.system.ADDER?.find(
            (adder) => adder.XMLID === "INCREASEDMAX",
        );
        maxAdjustment = maxAdjustment + (parseInt(increaseMax?.LEVELS) || 0);

        return maxAdjustment;
    } else {
        if (item.system.XMLID === "ABSORPTION") {
            let maxAdjustment = item.system.LEVELS * 2;

            const increasedMax = item.system.MODIFIER?.find(
                (mod) => mod.XMLID === "INCREASEDMAX",
            );
            if (increasedMax) {
                // Each level is 2x
                maxAdjustment =
                    maxAdjustment * Math.pow(2, parseInt(increasedMax.LEVELS));
            }
            return maxAdjustment;
        }

        let maxAdjustment = item.system.dice * 6;

        const extraDice = determineExtraDiceDamage(item);
        switch (extraDice) {
            case "+1":
                maxAdjustment = maxAdjustment + 1;
                break;
            case "1d3":
                maxAdjustment = maxAdjustment + 3;
                break;
            default:
                break;
        }
        return maxAdjustment;
    }
}
