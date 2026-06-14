import { HEROSYS } from "../herosystem6e.mjs";

import { HeroRoll, HeroRoller } from "../heroRoller/dice.mjs";
import { calculateDicePartsForItem } from "../utility/damage.mjs";
import { roundFavorPlayerTowardsZero } from "../utility/round.mjs";
import { doSuccessRoll, generateSuccessChatCard } from "../utility/success-card.mjs";
import { tokenEducatedGuess, whisperUserTargetsForActor } from "../utility/util.mjs";

const backgroundSkillKeys = Object.freeze({
    KS: "KNOWLEDGE_SKILL",
    PS: "PROFESSIONAL_SKILL",
    SS: "SCIENCE_SKILL",
});

export const RSR_ROLL_TYPE = Object.freeze({
    ACTIVATION_ROLL: "activation roll",
    ATTACK_ROLL: "attack roll",
    CHARACTERISTIC_ROLL: "characteristic roll",
    LUCK_ROLL: "luck roll",
    ITEM_ROLL: "item roll", // Skill, background skill, power
});

const RSR_ROLL_CATEGORY = Object.freeze({
    ATTACK: "attack category",
    BACKGROUNDSKILL: "background category",
    CHAR: "characteristic category",
    PER: "perception category",
    SKILL: "skill category",
});

const TYPE_TO_ROLL_TYPE = Object.freeze({
    0: RSR_ROLL_CATEGORY.SKILL,
    1: RSR_ROLL_CATEGORY.BACKGROUNDSKILL,
    2: RSR_ROLL_CATEGORY.CHAR,
    3: RSR_ROLL_CATEGORY.PER,
});

function filterOutNonSkillRollItems(item) {
    if (!item.isRollable()) {
        return false;
    }

    return (
        item.baseInfo?.type?.includes("skill") && // is a skill
        !item.baseInfo?.type?.includes("enhancer") && // is not an enhancer (scholar, scientist, etc.)
        item.system.XMLID !== "SKILL_LEVELS" && // is not a bonus to skills
        item.system.XMLID !== "COMBAT_LEVELS" // is not a bonus to combat
    );
}

function matchSkillRoll(item, rollAlias) {
    return item.name.includes(rollAlias);
}

function findSkillRoll(actor, rollAlias) {
    const skillsToMatchAgainst = actor.items.filter(filterOutNonSkillRollItems);

    return skillsToMatchAgainst.find((potentialMatchingSkillItem) =>
        matchSkillRoll(potentialMatchingSkillItem, rollAlias),
    );
}

/**
 * What is the penalty divisor? -1 per X AP.
 *
 * NOTE: Do not call unless it is appropriate for the type of roll (i.e. don't call for activation roll)
 *
 * @param {HeroModifierModel } rar
 *
 * @returns {number}
 */
export function findRollDivisor(rar) {
    // modifiers are different based on 5e or 6e
    if (rar.parent.is5e) {
        const divisorOption = rar.adders.find((adder) => {
            return adder.XMLID === "MINUS1PER20" || adder.XMLID === "MINUS1PER5" || adder.XMLID === "NOAPPENALTY";
        });

        if (divisorOption?.XMLID === "MINUS1PER20") {
            return 20;
        } else if (divisorOption?.XMLID === "MINUS1PER5") {
            return 5;
        } else if (divisorOption?.XMLID === "NOAPPENALTY") {
            return 0;
        }

        // No AP penalty option means -1 per 10 AP
        return 10;
    } else {
        // item.activePoints is a number
        if (rar.OPTIONID.includes("1PER5")) {
            return 5;
        } else if (rar.OPTIONID.includes("1PER20")) {
            return 20;
        }

        // activation rolls have no minuses due to active points
        if (!isNaN(parseInt(rar.OPTIONID, 10))) {
            return 0;
        }

        // No AP penalty option means -1 per 10 AP
        return 10;
    }
}

function calculateRollApPenalty(item, rar) {
    const divisor = findRollDivisor(rar);
    if (divisor === 0) {
        return 0;
    }

    return roundFavorPlayerTowardsZero(item.activePoints / divisor);
}

function normalizeTypeAndRollTarget(type, skillOrCharacteristic) {
    return {
        type: TYPE_TO_ROLL_TYPE[type] ?? `type ${type} not translated properly`,
        target: skillOrCharacteristic,
    };
}

/**
 * Given a rar, extract out all the bits and pieces required to make 1 or more activation rolls. This transforms
 * 5e ACTIVATIONROLL and REQUIRESASKILLROLL XMLIDs and 6e REQUIRESASKILLROLL into an intermediate format that
 * avoids HDC's completely different approach to expressing the modifier.
 *
 * @param {HeroSystem6eItem} item
 * @param {HeroModifierModel} rar
 *
 * @returns {Object[]}
 */
export function getRollsForRar(item, rar) {
    const rollsToGenerate = [];

    if (item.is5e) {
        // 5e ACTIVATIONROLL or flat number 6e REQUIRESASKILLROLL?
        if (rar.XMLID === "ACTIVATIONROLL") {
            return [
                {
                    type: RSR_ROLL_TYPE.ACTIVATION_ROLL,
                    rollValue: parseInt(rar.OPTIONID),
                },
            ];
        }
        // 5e Luck roll?
        else if (rar.OPTIONID === "ONELUCK" || rar.OPTIONID === "TWOLUCK" || rar.OPTIONID === "THREELUCK") {
            const numSuccessesRequired = rar.OPTIONID === "ONELUCK" ? 1 : rar.OPTIONID === "TWOLUCK" ? 2 : 3;
            return [
                {
                    type: RSR_ROLL_TYPE.LUCK_ROLL,
                    successesRequired: numSuccessesRequired,
                    activeItems: item.actor.items.filter((item) => item.system.XMLID === "LUCK" && item.isActive),
                    items: item.actor.items.filter((item) => item.system.XMLID === "LUCK"),
                },
            ];
        }

        // 5e 2 rolls
        else if (rar.OPTIONID === "TWOROLLS") {
            // PH: FIXME: This does not handle variable roll where the user gets to decide between 2 provided rolls. See rar.adder.XMLID === "VARIABLERSR".
            rollsToGenerate.push(normalizeTypeAndRollTarget(rar.TYPE, rar.ROLLALIAS || rar.CHARACTERISTIC));
            rollsToGenerate.push(normalizeTypeAndRollTarget(rar.TYPE2, rar.ROLLALIAS2 || rar.CHARACTERISTIC2));
        }

        // 5e 1 roll
        else if (rar.OPTIONID === "BASICRSR") {
            // PH: FIXME: This does not handle variable roll where the user gets to decide between 2 provided rolls. See rar.adder.XMLID === "VARIABLERSR".
            rollsToGenerate.push(normalizeTypeAndRollTarget(rar.TYPE, rar.ROLLALIAS || rar.CHARACTERISTIC));
        }

        // PH: FIXME: OPTIONID= attack roll?

        // 5e Unknown OPTIONID
        else {
            console.error(`Unknown 5e RSR ${rar.OPTIONID}`);
        }
    }

    // 6e
    else {
        // 6e activation roll
        const isOnlyDigits = /^\d+$/.test(rar.OPTIONID);
        if (isOnlyDigits) {
            return [
                {
                    type: RSR_ROLL_TYPE.ACTIVATION_ROLL,
                    rollValue: parseInt(rar.OPTIONID),
                },
            ];
        }

        // 6e Skills and background skills
        else if (rar.OPTIONID === "SKILL" || rar.OPTIONID === "SKILL1PER5" || rar.OPTIONID === "SKILL1PER20") {
            rollsToGenerate.push({ type: RSR_ROLL_CATEGORY.SKILL, target: rar.COMMENTS });
        } else if (
            rar.OPTIONID === "KS" ||
            rar.OPTIONID === "KS1PER5" ||
            rar.OPTIONID === "KS1PER20" ||
            rar.OPTIONID === "PS" ||
            rar.OPTIONID === "PS1PER5" ||
            rar.OPTIONID === "PS1PER20" ||
            rar.OPTIONID === "SS" ||
            rar.OPTIONID === "SS1PER5" ||
            rar.OPTIONID === "SS1PER20"
        ) {
            const backgroundSkillSubtype = backgroundSkillKeys[rar.OPTIONID.substring(0, 2)];

            rollsToGenerate.push({
                type: RSR_ROLL_CATEGORY.BACKGROUNDSKILL,
                subType: backgroundSkillSubtype,
                target: rar.COMMENTS,
            });
        }

        // 6e Characteristics
        else if (rar.OPTIONID === "CHAR") {
            rollsToGenerate.push({ type: RSR_ROLL_CATEGORY.CHAR, target: rar.COMMENTS });
        }

        // 6e perception
        else if (rar.OPTIONID === "PER" || rar.OPTIONID === "PER1PER5" || rar.OPTIONID === "PER1PER20") {
            rollsToGenerate.push({ type: RSR_ROLL_CATEGORY.PER, target: null });
        }

        // 6e attack roll
        else if (rar.OPTIONID === "ATTACK" || rar.OPTIONID === "ATTACK1PER5" || rar.OPTIONID === "ATTACK1PER20") {
            rollsToGenerate.push({ type: RSR_ROLL_CATEGORY.ATTACK, target: null });
        }

        // 6e unknown OPTIONID
        else {
            console.error(`Unknown 6e RSR ${rar.OPTIONID}`);
        }
    }

    return rollsToGenerate.map((rollToGenerate) => {
        switch (rollToGenerate.type) {
            case RSR_ROLL_CATEGORY.ATTACK: {
                // PH: FIXME: Nothing required?
                return {
                    type: RSR_ROLL_TYPE.ATTACK_ROLL,
                };
            }

            case RSR_ROLL_CATEGORY.BACKGROUNDSKILL:
            case RSR_ROLL_CATEGORY.SKILL: {
                const skill = findSkillRoll(item.actor, rollToGenerate.target);

                // Make sure background skill type matches the proclaimed background skill type (i.e. they asked for a PS but specified KS: xxx)
                const skillItemsOfCorrectSubType = skill
                    ? [skill].filter(
                          (skill) => !rollToGenerate.subType || skill.system.XMLID === rollToGenerate.subType,
                      )
                    : [];

                return {
                    type: RSR_ROLL_TYPE.ITEM_ROLL,
                    name: rollToGenerate.target,
                    activeItems: skillItemsOfCorrectSubType.filter((skill) => skill.isActive),
                    items: skillItemsOfCorrectSubType,
                };
            }

            case RSR_ROLL_CATEGORY.CHAR:
                // const charKey = getRequiredCharacteristicKey(item, rar); // PH: FIXME: Is this not required as we have it already?

                return {
                    type: RSR_ROLL_TYPE.CHARACTERISTIC_ROLL,
                    characteristicKey: rollToGenerate.target,
                };

            case RSR_ROLL_CATEGORY.PER: {
                return {
                    type: RSR_ROLL_TYPE.ITEM_ROLL,
                    name: "PERCEPTION",
                    activeItems: item.actor.items.filter((item) => item.system.XMLID === "PERCEPTION" && item.isActive),
                    items: item.actor.items.filter((item) => item.system.XMLID === "PERCEPTION"),
                };
            }

            default: {
                const error = `${item.detailedName()} has unhandled RSR for OPTIONID ${rar.OPTIONID} -> ${rollToGenerate.type}`;
                console.error(error);
                return {
                    type: RSR_ROLL_TYPE.ITEM_ROLL,
                    name: error,
                    activeItems: [],
                    items: [],
                };
            }
        }
    });
}

export const VALIDATE_SECTION_DEFENSE_ERROR_REASON = Object.freeze({
    NO_COMMENT: "no comment",
    NOT_DECLARATION: "not sectional defense declaration",
    INVALID_RANGE: "sectional defense declaration range invalid",
});

/**
 *
 * @param {HeroSystem6eItem} item
 * @param {string} potentialSectionalComment
 *
 * @returns {{ valid: boolean, reason?: string, sectionalDefenseLocationsSet?: Set }} - returns validation result with location Set on success or error reason on failure
 */
export function validateSectionalComments(item, potentialSectionalComment) {
    // Are there comments that could be sectional instructions?
    if (!potentialSectionalComment) {
        return { valid: false, reason: VALIDATE_SECTION_DEFENSE_ERROR_REASON.NO_COMMENT };
    }

    // Are there sectional instructions that we understand?
    const sectionalRangeComment = potentialSectionalComment.trim().match(/^locations? (.*)$/i);
    if (!sectionalRangeComment) {
        return { valid: false, reason: VALIDATE_SECTION_DEFENSE_ERROR_REASON.NOT_DECLARATION };
    }

    // Are the locations provided reasonable (i.e. is it composed of digits, commas, dashes, and whitespace)?
    const sectionalLocationString = sectionalRangeComment[1].replaceAll("and", "");
    if (sectionalLocationString.search(/[^0-9,\-\s]/) !== -1) {
        return { valid: false, reason: VALIDATE_SECTION_DEFENSE_ERROR_REASON.INVALID_RANGE };
    }

    // Do the ranges appear to be within the 3-18 hit location range?
    const sectionalDefenseLocationsSet = new Set();
    const splitSectionalRanges = sectionalLocationString.split(",");
    for (const rangeChunk of splitSectionalRanges) {
        // rangeChunk can be a single value or a range separated by "-". If a single value, then startEndRange will be length 1.
        const startEndRange = rangeChunk.trim().split("-");
        const first = startEndRange[0] ? parseInt(startEndRange[0]) : null;
        const second = startEndRange[1] ? parseInt(startEndRange[1]) : null;

        if (startEndRange.length === 1) {
            // Is it a valid range declaration chunk
            if (first >= 3 && first <= 18) {
                sectionalDefenseLocationsSet.add(first);
                continue;
            }
        } else if (startEndRange.length === 2) {
            // First index of range doesn't have to be start.
            const start = first < second ? first : second;
            const end = first < second ? second : first;

            // Is it a valid range declaration chunk
            if (start >= 3 && end <= 18) {
                for (let i = start; i <= end; ++i) {
                    sectionalDefenseLocationsSet.add(i);
                }
                continue;
            }
        }

        return { valid: false, reason: VALIDATE_SECTION_DEFENSE_ERROR_REASON.INVALID_RANGE };
    }

    return { valid: true, sectionalDefenseLocationsSet };
}

/**
 *
 * @param {Set} sectionalDefenseLocationsSet - A set of all hit locations which provide a defense
 * @param {number} hitLocationNum
 *
 * @returns {boolean} - boolean value indicating the hitLocationNum is within the sectionalDefenseRanges
 */
function doSectionalDefensesApply(sectionalDefenseLocationsSet, hitLocationNum) {
    // PH: FIXME: Low shots (special hit location) can generate a hit location of 19. This is supposed to be treated as
    // a hit of foot. However, we don't have a dialog that allows this translation so it's possible we'll
    // have a hit location of 19 carried through to here. Translate it to 18 (feet).
    const locationNum = hitLocationNum === 19 ? 18 : hitLocationNum;

    if (sectionalDefenseLocationsSet.has(locationNum)) {
        return true;
    }

    return false;
}

/**
 *
 * @param {HeroSystem6eItem} item
 * @param {Object} options
 * @returns {Boolean} - success
 *
 * The RaR is the Requires A Roll including Activation roll from 5e.
 * If the Activation roll is a simple throw then it is quite easily done.
 * If it is connected to a Skill or Characteristic then the correct roll must be discovered.
 * There are several places a player might put information to tie the RaR to an existing skill/characteristic.
 *
 * 1) ALIAS/Display: RaR has a Display in HD which is ALIAS here: an editable field which users are likely to change to indicate their selected roll, as it shows naturally on the sheet.
 * 2) OPTION/Options: the Options field in RaR that can also be edited.
 * 2--a ) OPTIONID/Options: the same drop-down gives and uneditable flag that indicates things like
 *    - Activation roll
 *    - Skill roll
 *    - Characteristic roll
 *    - PER roll
 *    - KS, PS, SS roll (Background skills)
 *    - and the difficulty -1/10 (default), -1/5 (hard), -1/20 (easy)
 * 3) COMMENTS/Comments: is an editable field that users might use to indicate the roll required.
 * 4) ROLLALIAS: is a 5e only editable field that users might use to indicate the roll required.
 *
 * the Skills to be matched will be generally be referenced as 'o' as they are considered in anonymous find functions.
 * ex: filterOutNonSkillRollItems which filters out skill items from skill enhancers and skill level bonuses.
 * Skills that are to be matched will be 'rollable' skills.
 * Most skills are only taken once, the user is warned if they purchase multiple copies of the same skill.
 * One exception is the POWERSKILL which is expected to be customized per power and purchased multiple times.
 * Likewise with the Background skills (KS, PS, SS) are a special case as they can be purchased multiple times with different INPUTs.
 * The Background skills are only matched when the RaR is looking for one of those specifically.
 * The RaR will have an OPTIONID of KS, PS, or SS which must match the skill's XMLID.
 *
 * 1) o.name/Name
 * 2) o.system.ALIAS/Display
 * 3) o.system.XMLID/XMLID
 * 4) o.system.INPUT/(Science/Knowledge/ (Background skills only)
 *
 *
 */
export async function isActivatedForThisUse(item, options) {
    // PH: FIXME: options to be removed.
    return isActivatedForThisUseInternal(item, HeroRoll, options);
}

export async function isActivatedForThisUse_TestingOnly(item, rollClass, options) {
    return isActivatedForThisUseInternal(item, rollClass, options);
}

async function isActivatedForThisUseInternal(item, rollClass, options) {
    // if(!item.isActive) {
    //     return false;
    // }

    const rar = item.modifiers.find((o) => o.XMLID === "REQUIRESASKILLROLL" || o.XMLID === "ACTIVATIONROLL");
    if (!rar) {
        return true;
    }

    // An item with an activation roll/requires a skill roll/requires a roll can take up to 2 consecutive rolls. Figure
    // out what we're actually rolling for.
    const activationRolls = getRollsForRar(item, rar);

    // Make sure all skill items require for the activation roll(s) exist on this character and are active before attempting
    // any rolls.
    for (const activationRoll of activationRolls) {
        // Only ACTIVATION_ROLL and CHARACTERISTIC_ROLL can be without active skills
        // PH: FIXME: ATTACK_ROLL needs to be considered
        if (
            activationRoll.type !== RSR_ROLL_TYPE.ACTIVATION_ROLL &&
            activationRoll.type !== RSR_ROLL_TYPE.CHARACTERISTIC_ROLL &&
            activationRoll.activeItems.length === 0
        ) {
            // PH: FIXME: This needs appropriate message
            return false;
        } else if (
            activationRoll.type === RSR_ROLL_TYPE.CHARACTERISTIC_ROLL &&
            !item.actor.hasCharacteristic(activationRoll.characteristicKey)
        ) {
            // PH: FIXME: This needs appropriate message
            return false;
        }
    }

    // PH: FIXME: Need to pay the resource cost of this skill/etc

    const actor = item.actor;
    const token = options.token ?? tokenEducatedGuess({ actor });
    const speaker = ChatMessage.getSpeaker({ actor, token });

    // Perform the rolls. Because a roll might consume resources we must perform all rolls (i.e. invoke all skills etc)
    // and then evaluate if there was success.
    const rollPromises = activationRolls.map(async (activationRoll) => {
        const roller = new HeroRoller({}, rollClass);
        let succeeded = false;
        let flavor;

        if (activationRoll.type === RSR_ROLL_TYPE.ACTIVATION_ROLL) {
            // Sectional Defense takes precedence over a standard activation roll.
            const sectionalDefenseActivationRollModifier =
                item.modifiers.find((o) => o.XMLID === "ACTIVATIONROLL") ?? item.findModsByXmlid("EVERYPHASE")?.parent;
            if (options.hitLocationNum && sectionalDefenseActivationRollModifier) {
                const { valid: validSectionalComment, sectionalDefenseLocationsSet } = validateSectionalComments(
                    item,
                    sectionalDefenseActivationRollModifier.COMMENTS,
                );

                // Do we have valid ranges defined and are hit locations turned on? If not, then sectional defense don't make sense to consider.
                if (validSectionalComment && game.settings.get(HEROSYS.module, "hit locations")) {
                    const sectionalDefenseApply = doSectionalDefensesApply(
                        sectionalDefenseLocationsSet,
                        options.hitLocationNum,
                    );

                    // PH: FIXME: The chat message should not be burried down in here.
                    // Success or failure message
                    const chatData = {
                        style: CONFIG.HERO.CHAT_MESSAGE_DEFAULT_STYLE,
                        author: game.user._id,
                        content: `The sectional defense from <b>${item.name}</b> ${sectionalDefenseApply ? "successfully applied" : "failed to apply"}`,
                        speaker: speaker,
                        whisper: whisperUserTargetsForActor(actor),
                    };
                    await ChatMessage.create(chatData);

                    return sectionalDefenseApply;
                }
            }

            // Regular plain activation roll
            roller.makeSuccessRoll(true, activationRoll.rollValue).addDice(3);

            const { succeeded: succeed, flavor: updatedFlavor } = await doSuccessRoll(
                roller,
                `${item.name} activation`,
            );
            succeeded = succeed;
            flavor = updatedFlavor;
        } else if (activationRoll.type === RSR_ROLL_TYPE.LUCK_ROLL) {
            const luckPower = activationRoll.activeItems[0]; // PH: FIXME: Kludge
            const { diceParts } = calculateDicePartsForItem(luckPower, {});

            roller
                .modifyTo5e(actor.system.is5e)
                .makeLuckRoll()
                .addDice(diceParts.d6Count >= 1 ? diceParts.d6Count : 0);

            await roller.roll();

            const luckTotal = roller.getLuckTotal();
            const luckOption = rar.OPTIONID;
            if (luckOption === "ONELUCK") {
                succeeded = luckTotal >= 1;
            } else if (luckOption === "TWOLUCK") {
                succeeded = luckTotal >= 2;
            } else if (luckOption === "THREELUCK") {
                succeeded = luckTotal >= 3;
            } else {
                console.error(`${item.detailedName()} has unknown luck option ${luckOption}`);
                succeeded = false;
            }

            flavor = `${item.name} (rolled ${luckTotal} points) activation ${succeeded ? "succeeded" : "failed"} `;
        } else if (activationRoll.type === RSR_ROLL_TYPE.CHARACTERISTIC_ROLL) {
            const charKey = activationRoll.characteristicKey.toLowerCase();
            const characteristic = actor.system.characteristics[charKey];
            const baseResult = characteristic.roll;
            const apPenalty = -calculateRollApPenalty(item, rar);
            const divisor = findRollDivisor(rar);

            // PH: FIXME: what about additional skill levels used to influence the activation roll?
            // PH: FIXME: not including penalties in an obvious way ... should also include the tags for them
            roller
                .makeSuccessRoll(true, baseResult - apPenalty) // PH: FIXME: Hmm. Add tags to this?
                .addNumber(baseResult, `${charKey}`)
                .addNumber(-apPenalty, `AP penalty`, `${item.activePoints} AP / ${divisor} -> ${-apPenalty}`)
                .addDice(3);

            const { succeeded: succeed, flavor: updatedFlavor } = await doSuccessRoll(
                roller,
                `${item.name} activation`,
            );
            succeeded = succeed;
            flavor = updatedFlavor;
        } else if (activationRoll.type === RSR_ROLL_TYPE.ITEM_ROLL) {
            const skill = activationRoll.activeItems[0]; // PH: FIXME: Kludge
            const value = parseInt(skill.system.roll);
            const minusDueToAp = -calculateRollApPenalty(item, rar);
            const divisor = findRollDivisor(rar);

            // PH: FIXME: what about additional skill levels used to influence the activation roll? Can they apply to this?
            roller
                .makeSuccessRoll(true, value)
                .addDice(3)
                .addNumber(minusDueToAp, `AP Penalty`, `-1 per ${divisor} active points. ${item.activePoints}`);

            const { succeeded: succeed, flavor: updatedFlavor } = await doSuccessRoll(
                roller,
                `${item.name} activation`,
            );
            succeeded = succeed;
            flavor = updatedFlavor;
        } else {
            console.error(`${item.detailedName()} has unknown type ${activationRoll.type} for requires roll modifier`);
        }

        // PH: FIXME: Bunch of functionality ripped out of this function. See below to get it into the flavor.
        // PH: FIXME: resource usage string should be built in here as this is what's consuming. Create functions so it can be done in a fixed way.
        await generateSuccessChatCard(
            actor,
            token,
            speaker,
            item,
            roller,
            flavor,
            `Spent ${options.resourcesUsedDescription}`,
        );

        // PH: FIXME: Get rid of options fields where possible. These decisions should be part of the flavor text and not burried in generating a chat card.
        // // FORCE success
        // if (!succeeded && overrideCanAct) {
        //     const overrideKeyText = game.keybindings.get(HEROSYS.module, "OverrideCanAct")?.[0].key;
        //     ui.notifications.info(`${actor.name} succeeded roll because override key.`);
        //     succeeded = true;
        //     cardHtml += `<p>Succeeded roll because ${game.user.name} used <b>${overrideKeyText}</b> key to override.</p>`;
        // }

        // if (!succeeded && options.resourcesUsedDescription) {
        //     cardHtml += `Spent ${options.resourcesUsedDescription}.`;
        // }

        // const chatData = {
        //     style: CONFIG.HERO.CHAT_MESSAGE_DEFAULT_STYLE,
        //     rolls: roller.rawRolls(),
        //     author: game.user._id,
        //     content: cardHtml,
        //     speaker: speaker,
        // };

        // await ChatMessage.create(chatData);

        // if (!succeeded && options.showUi) {
        //     ui.notifications.warn(cardHtml);
        // }

        return succeeded;
    });

    const results = await Promise.all(rollPromises);

    // One failure is an overall failure
    return results.reduce((accum, result) => {
        return accum && result;
    });
}

// Probability, in %, of that number on 3d6
const HIT_LOCATION_PROBABILITY = Object.freeze({
    3: 0.46,
    4: 1.38,
    5: 2.77,
    6: 4.62,
    7: 6.94,
    8: 9.72,
    9: 11.57,
    10: 12.5,
    11: 12.5,
    12: 11.57,
    13: 9.72,
    14: 6.94,
    15: 4.62,
    16: 2.77,
    17: 1.38,
    18: 0.46,
});

// Probability, in %, of that number or less on 3d6
const DICE_CUMULATIVE_PROBABILITY = Object.freeze({
    3: 0.46,
    4: 1.85,
    5: 4.62,
    6: 9.25,
    7: 16.2,
    8: 25.92,
    9: 37.5,
    10: 50.0,
    11: 62.5,
    12: 74.07,
    13: 83.79,
    14: 90.74,
    15: 95.37,
    16: 98.14,
    17: 99.53,
    18: 100,
});

export function activationRollHeroValidation(modifier, item) {
    const validations = [];

    // Since sectional defenses are optional we can only check a subset of errors
    const sectionalDefenseRanges = validateSectionalComments(item, modifier.COMMENTS);
    if (!sectionalDefenseRanges.valid) {
        if (sectionalDefenseRanges.reason === VALIDATE_SECTION_DEFENSE_ERROR_REASON.INVALID_RANGE) {
            validations.push({
                property: "COMMENTS",
                message: sectionalDefenseRanges.reason,
                example: "locations 4-6, 8, and 10-12",
                severity: CONFIG.HERO.VALIDATION_SEVERITY.ERROR,
                modifierID: modifier.ID,
            });
        }
    } else {
        // A sectional defense only makes sense for a defense
        if (!item.baseInfo?.type.includes("defense")) {
            validations.push({
                property: undefined,
                message: `${item.detailedName()} should not have a sectional defense declaration as it is not a defensive power`,
                example: "Armor could be a sectional defense with locations 4-6, 8, and 10-12",
                severity: CONFIG.HERO.VALIDATION_SEVERITY.ERROR,
                modifierID: modifier.ID,
            });
        }

        // Check that the sectional defense description roughly matches the expected probability based on the limitation taken
        const activationRollLimitation = modifier.OPTIONID;
        const activationRollCumulativeProbability = DICE_CUMULATIVE_PROBABILITY[activationRollLimitation];
        let hitLocationCumulativeProbability = 0;
        for (const hitLocation of sectionalDefenseRanges.sectionalDefenseLocationsSet.values()) {
            hitLocationCumulativeProbability += HIT_LOCATION_PROBABILITY[hitLocation];
        }

        // If cumulative probability of hit locations is larger than the probability at the activation roll (with a 1% fuzz)
        // then this is "cheating" and the limitation should probably be bought down.
        if (hitLocationCumulativeProbability > activationRollCumulativeProbability + 1) {
            // What is a more reasonable activation roll number?
            let shouldBeLessThanValue = 18;
            for (let cumulativeValue = shouldBeLessThanValue - 1; cumulativeValue >= 3; --cumulativeValue) {
                if (DICE_CUMULATIVE_PROBABILITY[cumulativeValue] < hitLocationCumulativeProbability) {
                    break;
                }

                shouldBeLessThanValue = cumulativeValue;
            }

            validations.push({
                property: undefined,
                message: `${item.detailedName()}'s sectional defense declaration cumulative probability is ${hitLocationCumulativeProbability}% vs the matching limitation value's cumulative probability value of ${activationRollCumulativeProbability}%. This limitation should most likely be bought to ${shouldBeLessThanValue}-`,
                example: "A 14- activation roll should reflect a section defense declaration like: 3-5, 7-14, 16-18",
                severity: CONFIG.HERO.VALIDATION_SEVERITY.WARNING,
                modifierID: modifier.ID,
            });
        }
    }

    return validations;
}
