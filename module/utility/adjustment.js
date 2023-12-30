import { getPowerInfo } from "./util.js";
import { determineExtraDiceDamage } from "./damage.js";
import { RoundFavorPlayerUp } from "./round.js";

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

function _determineCostPerActivePoint(
    potentialCharacteristic,
    powerTargetX,
    targetActor,
) {
    // TODO: Not sure we need to use the characteristic here...
    const powerInfo = getPowerInfo({
        xmlid: potentialCharacteristic.toUpperCase(),
        actor: targetActor,
    });
    return (
        (powerTargetX
            ? parseFloat(
                  powerTargetX.system.activePoints / powerTargetX.system.value,
              )
            : parseFloat(powerInfo?.cost || powerInfo?.costPerLevel)) *
        defensivePowerAdjustmentMultiplier(
            potentialCharacteristic.toUpperCase(),
            targetActor,
        )
    );
}

function _findExistingMatchingEffect(
    item,
    potentialCharacteristic,
    powerTargetName,
    targetActor,
) {
    // TODO: Variable Effect may result in multiple changes on same AE.
    return targetActor.effects.find(
        (effect) =>
            effect.origin === item.uuid &&
            effect.flags.target[0] ===
                (powerTargetName?.uuid || potentialCharacteristic),
    );
}

function _createCharacteristicAEChangeBlock(
    potentialCharacteristic,
    targetActor,
) {
    return {
        // TODO: Why is this only characteristics for the key? What about powers?
        // system.value is transferred to the actor, so not very useful,
        // but we can enumerate via item.effects when determining value.
        key: targetActor.system.characteristics?.[potentialCharacteristic]
            ? `system.characteristics.${potentialCharacteristic}.max`
            : "system.value",
        value: 0,
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
    };
}

async function _createNewAdjustmentEffect(
    item,
    potentialCharacteristic,
    powerTargetName,
    rawActivePointsDamage,
    targetActor,
) {
    // Create new ActiveEffect
    const activeEffect = {
        name: `${item.system.XMLID} 0 ${
            powerTargetName?.name || potentialCharacteristic
        } (0 AP) [by ${item.actor.name}]`,
        id: `${item.system.XMLID}.${item.id}.${
            powerTargetName?.name || potentialCharacteristic
        }`,
        icon: item.img,
        changes: [
            _createCharacteristicAEChangeBlock(
                potentialCharacteristic,
                targetActor,
            ),
        ],
        duration: {
            seconds: 12,
        },
        flags: {
            type: "adjustment",
            activePoints: 0,
            XMLID: item.system.XMLID,
            source: targetActor.name,
            target: [powerTargetName?.uuid || potentialCharacteristic],
            key: potentialCharacteristic,
        },
        origin: item.uuid,
    };

    // If this is 5e then some characteristics are entirely calculated based on
    // those. We only need to worry about 2 (DEX -> OCV & DCV and EGO -> OMCV & DMCV)
    // as figured characteristics aren't adjusted.
    if (targetActor.system.is5e) {
        if (potentialCharacteristic === "dex") {
            activeEffect.changes.push(
                _createCharacteristicAEChangeBlock("ocv", targetActor),
            );
            activeEffect.flags.target.push("ocv");

            activeEffect.changes.push(
                _createCharacteristicAEChangeBlock("dcv", targetActor),
            );
            activeEffect.flags.target.push("dcv");
        } else if (potentialCharacteristic === "ego") {
            activeEffect.changes.push(
                _createCharacteristicAEChangeBlock("omcv", targetActor),
            );
            activeEffect.flags.target.push("omcv");

            activeEffect.changes.push(
                _createCharacteristicAEChangeBlock("dmcv", targetActor),
            );
            activeEffect.flags.target.push("dmcv");
        }
    }

    // DELAYEDRETURNRATE (loss for TRANSFER and all other adjustments) and DELAYEDRETURNRATE2 (gain for TRANSFER)
    const dRR = item.findModsByXmlid("DELAYEDRETURNRATE");
    const dRR2 = item.findModsByXmlid("DELAYEDRETURNRATE2");
    const delayedReturnRate =
        rawActivePointsDamage > 0
            ? dRR
            : item.system.XMLID === "TRANSFER"
              ? dRR2
              : dRR;
    if (delayedReturnRate) {
        switch (delayedReturnRate.OPTIONID) {
            case "MINUTE":
                activeEffect.duration.seconds = 60;
                break;
            case "FIVEMINUTES":
                activeEffect.duration.seconds = 60 * 5;
                break;
            case "20MINUTES":
                activeEffect.duration.seconds = 60 * 20;
                break;
            case "HOUR":
                activeEffect.duration.seconds = 60 * 60;
                break;
            case "6HOURS":
                activeEffect.duration.seconds = 60 * 60 * 6;
                break;
            case "DAY":
                activeEffect.duration.seconds = 60 * 60 * 24;
                break;
            case "WEEK":
                activeEffect.duration.seconds = 604800;
                break;
            case "MONTH":
                activeEffect.duration.seconds = 2.628e6;
                break;
            case "SEASON":
                activeEffect.duration.seconds = 2.628e6 * 3;
                break;
            case "YEAR":
                activeEffect.duration.seconds = 3.154e7;
                break;
            case "FIVEYEARS":
                activeEffect.duration.seconds = 3.154e7 * 5;
                break;
            case "TWENTYFIVEYEARS":
                activeEffect.duration.seconds = 3.154e7 * 25;
                break;
            case "CENTURY":
                activeEffect.duration.seconds = 3.154e7 * 100;
                break;
            default:
                await ui.notifications.error(
                    `DELAYEDRETURNRATE has unhandled option ${delayedReturnRate?.OPTIONID}`,
                );
        }
    }

    await targetActor.addActiveEffect(activeEffect);

    return _findExistingMatchingEffect(
        item,
        potentialCharacteristic,
        powerTargetName,
        targetActor,
    );
}

export async function performAdjustment(
    item,
    targetedPower,
    rawActivePointsDamage,
    activePointDamage,
    defenseDescription,
    isFade,
    targetActor,
) {
    const targetName = targetedPower.toUpperCase();

    // TODO: Not sure this should be o.name as would be the name of the power? Should it be using XMLID?
    // TODO: Do we need to trim name? Presumably we shrink them when adding?
    const powerTargetName = targetActor.items.find(
        (o) => o.name.toUpperCase().trim() === targetName,
    );
    const potentialCharacteristic = powerTargetName
        ? powerTargetName.system.XMLID
        : targetName.toLowerCase();
    const characteristicTarget =
        targetActor.system.characteristics?.[potentialCharacteristic];

    // A target we understand?
    if (!characteristicTarget && !powerTargetName) {
        // Can't find anything to link this against...meh. Might be caught by the validity check above.
        return;
    }

    // Check for previous adjustment (i.e ActiveEffect) from same power against this target
    // and calculate the total effect
    const existingEffect = _findExistingMatchingEffect(
        item,
        potentialCharacteristic,
        powerTargetName,
        targetActor,
    );
    const activeEffect =
        existingEffect ||
        (await _createNewAdjustmentEffect(
            item,
            potentialCharacteristic,
            powerTargetName,
            rawActivePointsDamage,
            targetActor,
        ));
    let totalNewActivePoints =
        activePointDamage + activeEffect.flags.activePoints;
    let activePointEffectLostDueToMax = 0;

    // Clamp max change to the max allowed by the power.
    // TODO: Combined effects may not exceed the largest source's maximum for a single target.
    if (totalNewActivePoints < 0) {
        const max = Math.max(
            totalNewActivePoints,
            -determineMaxAdjustment(item),
        );
        activePointEffectLostDueToMax = totalNewActivePoints - max;
        totalNewActivePoints = max;
    } else {
        const min = Math.min(
            totalNewActivePoints,
            determineMaxAdjustment(item),
        );
        activePointEffectLostDueToMax = totalNewActivePoints - min;
        totalNewActivePoints = min;
    }

    // Determine how many points of effect there are based on the cost
    const costPerActivePoint = _determineCostPerActivePoint(
        potentialCharacteristic,
        powerTargetName,
        targetActor,
    );
    const activePointsThatShouldBeAffected = Math.trunc(
        totalNewActivePoints / costPerActivePoint,
    );
    const activePointAffectedDifference =
        activePointsThatShouldBeAffected -
        Math.trunc(activeEffect.flags.activePoints / costPerActivePoint);

    activeEffect.changes[0].value =
        activeEffect.changes[0].value - activePointAffectedDifference;

    // If this is 5e then some characteristics are calculated (not figured) based on
    // those. We only need to worry about 2: DEX -> OCV & DCV and EGO -> OMCV & DMCV.
    // These 2 characteristics are always at indices 2 and 3
    if (activeEffect.changes[1]) {
        activeEffect.changes[1].value = Math.trunc(
            activeEffect.changes[0].value / 3,
        );
    }
    if (activeEffect.changes[2]) {
        activeEffect.changes[2].value = Math.trunc(
            activeEffect.changes[0].value / 3,
        );
    }

    // Update the effect value(s)
    activeEffect.name = `${item.system.XMLID} ${Math.abs(
        activePointsThatShouldBeAffected,
    )} ${powerTargetName?.name || potentialCharacteristic} (${Math.abs(
        totalNewActivePoints,
    )} AP) [by ${item.actor.name}]`;

    activeEffect.flags.activePoints = totalNewActivePoints;

    const updatePromises = [];

    const isEffectFinished = activeEffect.flags.activePoints === 0 && isFade;
    if (isEffectFinished) {
        updatePromises.push(activeEffect.delete());
    } else {
        updatePromises.push(
            activeEffect.update({
                name: activeEffect.name,
                changes: activeEffect.changes,
                flags: activeEffect.flags,
            }),
        );
    }

    // TODO: Pretty sure recovery isn't working as expected for defensive items
    // TODO: Pretty sure recovery isn't working as expected for expended characteristics (need separate category keeping: value, max, boost)

    // TODO: Only needed for characteristics? How will this work for powers?
    if (targetActor.system.characteristics?.[potentialCharacteristic]) {
        const newValue =
            targetActor.system.characteristics[potentialCharacteristic].value -
            activePointAffectedDifference;
        const changes = {
            [`system.characteristics.${potentialCharacteristic}.value`]:
                newValue,
        };

        if (targetActor.system.is5e && activeEffect.flags.target[1]) {
            changes[
                `system.characteristics.${activeEffect.flags.target[1]}.value`
            ] = RoundFavorPlayerUp(newValue / 3);
            changes[
                `system.characteristics.${activeEffect.flags.target[2]}.value`
            ] = RoundFavorPlayerUp(newValue / 3);
        }

        updatePromises.push(targetActor.update(changes));
    }

    await Promise.all(updatePromises);

    return _generateAdjustmentChatCard(
        item,
        activePointDamage,
        activePointAffectedDifference,
        totalNewActivePoints,
        activePointEffectLostDueToMax,
        defenseDescription,
        potentialCharacteristic,
        isFade,
        isEffectFinished,
        targetActor,
    );
}

function _generateAdjustmentChatCard(
    item,
    activePointDamage,
    activePointAffectedDifference,
    totalActivePointEffect,
    activePointEffectLostDueToMax,
    defenseDescription,
    potentialCharacteristic, // TODO: Power?
    isFade,
    isEffectFinished,
    targetActor,
) {
    const cardData = {
        item: item,

        adjustmentDamageRaw: activePointDamage,
        adjustmentTotalActivePointEffect: totalActivePointEffect,
        defenseDescription: defenseDescription,

        adjustment: {
            adjustmentDamageThisApplication: activePointAffectedDifference,
            adjustmentTarget: potentialCharacteristic.toUpperCase(),
            activePointEffectLostDueToMax,
        },

        isFade,
        isEffectFinished,

        targetActor: targetActor,
    };

    return cardData;
}

/**
 *
 * Renders and creates a number of related adjustment chat messages for the same target
 *
 * @param {*} cardOrCards
 * @returns void
 */
export async function renderAdjustmentChatCards(cardOrCards) {
    if (!Array.isArray(cardOrCards)) {
        cardOrCards = [cardOrCards];
    }

    const cardData = {
        item: cardOrCards[0].item,

        adjustmentDamageRaw: cardOrCards[0].adjustmentDamageRaw,
        adjustmentTotalActivePointEffect:
            cardOrCards[0].adjustmentTotalActivePointEffect,
        defenseDescription: cardOrCards[0].defenseDescription,

        adjustments: cardOrCards.map((card) => {
            return card.adjustment;
        }),

        isFade: cardOrCards[0].isFade,
        isEffectFinished: cardOrCards[0].isEffectFinished,

        targetActor: cardOrCards[0].targetActor,
    };

    // render card
    const template =
        "systems/hero6efoundryvttv2/templates/chat/apply-adjustment-card.hbs";
    const cardHtml = await renderTemplate(template, cardData);
    const speaker = ChatMessage.getSpeaker({
        actor: cardOrCards[0].targetActor,
    });

    const chatData = {
        user: game.user._id,
        content: cardHtml,
        speaker: speaker,
    };

    return ChatMessage.create(chatData);
}
