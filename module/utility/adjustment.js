import { getPowerInfo } from "./util.js";
import { determineExtraDiceDamage } from "./damage.js";
import { RoundFavorPlayerUp } from "./round.js";

/**
 * Return the full list of possible powers and characteristics. No skills, talents, or perks.
 */
export function adjustmentSourcesPermissive(actor) {
    let choices = {};

    const powers = CONFIG.HERO.powers.filter(
        (power) =>
            !power.powerType?.includes("skill") &&
            !power.powerType?.includes("perk") &&
            !power.powerType?.includes("talent"),
    );

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

export function adjustmentSourcesStrict(actor) {
    let choices = {};

    const powers = CONFIG.HERO.powers.filter(
        (power) =>
            (power.powerType?.includes("characteristic") ||
                power.powerType?.includes("movement")) &&
            !power.ignoreFor?.includes(actor.type) &&
            !power.ignoreFor?.includes(actor.system.is5e ? "5e" : "6e") &&
            (!power.onlyFor || power.onlyFor.includes(actor.type)),
    );

    // Attack powers
    for (const item of actor.items.filter(
        (item) => item.type === "power" && item.system.XMLID != "MULTIPOWER",
    )) {
        powers.push({ key: item.system.XMLID });
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

export function determineCostPerActivePoint(
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
    targetSystem,
) {
    // TODO: Variable Effect may result in multiple changes on same AE.
    return targetSystem.effects.find(
        (effect) =>
            effect.origin === item.uuid &&
            effect.flags.target[0] ===
                (powerTargetName?.uuid || potentialCharacteristic),
    );
}

function _createCharacteristicAEChangeBlock(
    potentialCharacteristic,
    targetSystem,
) {
    // TODO: Calculate this earlier so we don't have the logic in here
    return {
        key:
            targetSystem.system.characteristics?.[potentialCharacteristic] !=
            null
                ? `system.characteristics.${potentialCharacteristic}.max`
                : "system.max",
        value: 0,
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
    };
}

async function _createNewAdjustmentEffect(
    item,
    potentialCharacteristic, // TODO: By this point we should know which it is.
    powerTargetName,
    rawActivePointsDamage,
    targetActor,
    targetSystem,
) {
    // Create new ActiveEffect
    // TODO: Add a document field
    const activeEffect = {
        name: `${item.system.XMLID} 0 ${
            powerTargetName?.name || potentialCharacteristic // TODO: This will need to change for multiple effects
        } (0 AP) [by ${item.actor.name}]`,
        id: `${item.system.XMLID}.${item.id}.${
            powerTargetName?.name || potentialCharacteristic // TODO: This will need to change for multiple effects
        }`,
        icon: item.img,
        changes: [
            _createCharacteristicAEChangeBlock(
                potentialCharacteristic,
                targetSystem,
            ),
        ],
        duration: {
            seconds: 12,
        },
        flags: {
            type: "adjustment",
            version: 2,
            activePoints: 0,
            XMLID: item.system.XMLID,
            source: targetActor.name,
            target: [powerTargetName?.uuid || potentialCharacteristic],
            key: potentialCharacteristic,
        },
        origin: item.uuid,

        transfer: true,
        disabled: false,
    };

    // If this is 5e then some characteristics are entirely calculated based on
    // those. We only need to worry about 2 (DEX -> OCV & DCV and EGO -> OMCV & DMCV)
    // as figured characteristics aren't adjusted.
    if (targetActor.system.is5e) {
        if (potentialCharacteristic === "dex") {
            activeEffect.changes.push(
                _createCharacteristicAEChangeBlock("ocv", targetSystem),
            );
            activeEffect.flags.target.push("ocv");

            activeEffect.changes.push(
                _createCharacteristicAEChangeBlock("dcv", targetSystem),
            );
            activeEffect.flags.target.push("dcv");
        } else if (potentialCharacteristic === "ego") {
            activeEffect.changes.push(
                _createCharacteristicAEChangeBlock("omcv", targetSystem),
            );
            activeEffect.flags.target.push("omcv");

            activeEffect.changes.push(
                _createCharacteristicAEChangeBlock("dmcv", targetSystem),
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

    return activeEffect;
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

    // Search the target for this power.
    // TODO: will return first matching power. How can we distinguish without making users
    //       setup the item for a specific? Will likely need to provide a dialog. That gets
    //       us into the thorny question of what powers have been discovered.
    const targetPower = targetActor.items.find(
        (item) => item.system.XMLID === targetName,
    );
    const potentialCharacteristic = targetPower
        ? targetPower.system.XMLID
        : targetName.toLowerCase();
    const targetCharacteristic =
        targetActor.system.characteristics?.[potentialCharacteristic];

    // A target we understand?
    // TODO: Targeting a movement power that the targetActor doesn't have will still succeed. This seems wrong.
    //       Why are flying, teleportation, etc characteristics?
    if (!targetCharacteristic && !targetPower) {
        // Can't find anything to link this against...meh. Might be caught by the validity check above.
        return;
    }

    // Characteristics target an actor, and powers target an item
    const targetSystem =
        targetActor.system.characteristics?.[potentialCharacteristic] != null
            ? targetActor
            : targetPower;
    const targetValuePath =
        targetSystem.system.characteristics?.[potentialCharacteristic] != null
            ? `system.characteristics.${potentialCharacteristic}.value`
            : `system.value`;
    const targetValue =
        targetActor.system.characteristics?.[potentialCharacteristic] != null
            ? targetActor.system.characteristics?.[potentialCharacteristic]
                  .value
            : targetPower.system.value;
    const targetMax =
        targetActor.system.characteristics?.[potentialCharacteristic] != null
            ? targetActor.system.characteristics?.[potentialCharacteristic].max
            : targetPower.system.max;

    // Check for previous adjustment (i.e ActiveEffect) from same power against this target
    // and calculate the total effect
    const existingEffect = _findExistingMatchingEffect(
        item,
        potentialCharacteristic,
        targetPower,
        targetSystem,
    );

    // Shortcut here in case we have no existing effect and 0 damage is done.
    if (!existingEffect && activePointDamage === 0) {
        return _generateAdjustmentChatCard(
            item,
            activePointDamage,
            0,
            0,
            0,
            defenseDescription,
            potentialCharacteristic,
            isFade,
            false,
            targetActor,
        );
    }

    const activeEffect =
        existingEffect ||
        (await _createNewAdjustmentEffect(
            item,
            potentialCharacteristic,
            targetPower,
            rawActivePointsDamage,
            targetActor,
            targetSystem,
        ));
    let totalNewActivePoints =
        activePointDamage + activeEffect.flags.activePoints;
    let activePointEffectLostDueToMax = 0;

    // Clamp max change to the max allowed by the power.
    // TODO: Healing may not raise max or value above max.
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
    const costPerActivePoint = determineCostPerActivePoint(
        potentialCharacteristic,
        targetPower,
        targetActor,
    );
    const activePointsThatShouldBeAffected = Math.trunc(
        totalNewActivePoints / costPerActivePoint,
    );
    const activePointAffectedDifference =
        activePointsThatShouldBeAffected -
        Math.trunc(activeEffect.flags.activePoints / costPerActivePoint);

    // Calculate the effect's max value(s)
    activeEffect.changes[0].value =
        activeEffect.changes[0].value - activePointAffectedDifference;

    // If this is 5e then some characteristics are calculated (not figured) based on
    // those. We only need to worry about 2: DEX -> OCV & DCV and EGO -> OMCV & DMCV.
    // These 2 characteristics are always at indices 2 and 3

    // TODO: This really only works when there is 1 effect happening to the characteristic.
    //       To fix would require separate boost tracking along with fractional boosts or
    //       not tracking the changes to OCV and DCV as active effects but have them recalculated
    //       as the characteristic max and value are changing.
    if (targetActor.system.is5e && activeEffect.changes[1]) {
        const newCalculatedValue = RoundFavorPlayerUp(
            (targetMax - activePointAffectedDifference) / 3,
        );
        const oldCalculatedValue = RoundFavorPlayerUp(targetMax / 3);

        activeEffect.changes[1].value =
            parseInt(activeEffect.changes[1].value) +
            (newCalculatedValue - oldCalculatedValue);

        activeEffect.changes[2].value =
            parseInt(activeEffect.changes[2].value) +
            (newCalculatedValue - oldCalculatedValue);
    }

    // Update the effect max value(s)
    activeEffect.name = `${item.system.XMLID} ${Math.abs(
        activePointsThatShouldBeAffected,
    )} ${targetPower?.name || potentialCharacteristic} (${Math.abs(
        totalNewActivePoints,
    )} AP) [by ${item.actor.name}]`;

    activeEffect.flags.activePoints = totalNewActivePoints;

    const isEffectFinished = activeEffect.flags.activePoints === 0 && isFade;
    if (isEffectFinished) {
        await activeEffect.delete();
    } else if (!existingEffect) {
        await targetSystem.addActiveEffect(activeEffect);
    } else {
        await activeEffect.update({
            name: activeEffect.name,
            changes: activeEffect.changes,
            flags: activeEffect.flags,
        });
    }

    // Calculate the effect value(s)
    // TODO: Pretty sure recovery isn't working as expected for defensive items
    // TODO: Pretty sure recovery isn't working as expected for expended characteristics (need separate category keeping: value, max, boost)
    const newValue = targetValue - activePointAffectedDifference;
    const changes = {
        [targetValuePath]: newValue,
    };

    if (targetActor.system.is5e && activeEffect.flags.target[1]) {
        const newCalculatedValue = RoundFavorPlayerUp(
            (targetMax - activePointAffectedDifference) / 3,
        );
        const oldCalculatedValue = RoundFavorPlayerUp(targetMax / 3);
        const char1Value =
            targetActor.system.characteristics[activeEffect.flags.target[1]]
                .value;
        const char2Value =
            targetActor.system.characteristics[activeEffect.flags.target[2]]
                .value;

        changes[
            `system.characteristics.${activeEffect.flags.target[1]}.value`
        ] = char1Value + (newCalculatedValue - oldCalculatedValue);
        changes[
            `system.characteristics.${activeEffect.flags.target[2]}.value`
        ] = char2Value + (newCalculatedValue - oldCalculatedValue);
    }

    // Update the effect value(s)
    await targetSystem.update(changes);

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

    // Filter out any invalid cards
    cardOrCards = cardOrCards.filter((card) => card);

    if (cardOrCards.length === 0) return;

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
