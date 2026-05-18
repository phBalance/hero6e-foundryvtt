import { HEROSYS } from "../herosystem6e.mjs";

import { overrideCanAct } from "../settings/settings-helpers.mjs";

import { HeroRoll, HeroRoller } from "../heroRoller/dice.mjs";
import { calculateDicePartsForItem } from "../utility/damage.mjs";
import { roundFavorPlayerTowardsZero } from "../utility/round.mjs";
import { tokenEducatedGuess, whisperUserTargetsForActor } from "../utility/util.mjs";

const backgroundSkillKeys = Object.freeze({
    KS: "KNOWLEDGE_SKILL",
    SS: "SCIENCE_SKILL",
    PS: "PROFESSIONAL_SKILL",
});

const backgroundSkillXmlids = Object.freeze({
    KNOWLEDGE_SKILL: "KS",
    SCIENCE_SKILL: "SS",
    PROFESSIONAL_SKILL: "PS",
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

function matchRequiredSkillRoll(item, rar, rarOptionIsBackground) {
    const rarAliasDisplay = rar.ALIAS?.toUpperCase() || ""; // From the "Display" field. ex: "Requires A Magic Roll"
    // OPTION_ALIAS is different in 5e: it is entered in the Type field
    const rarOptionsAlias = rar.OPTION_ALIAS?.toUpperCase() || ""; // From the "Options" field. ex: "Magic Roll, -1 per 5 Active Points modifier"
    const rarComments = rar.COMMENTS?.toUpperCase() || ""; // From Comments, begins blank, common use would be to enter just the skill name
    const rarRollAlias = rar.ROLLALIAS?.toUpperCase() || ""; // From the 5e "Roll" field. ex: "STR", "Acrobatics"

    const rar_AliasDisplay = rarAliasDisplay.replaceAll(" ", "_");
    const rar_OptionsAlias = rarOptionsAlias.replaceAll(" ", "_");
    const rar_Comments = rarComments.replaceAll(" ", "_");
    const rar_RollAlias = rarRollAlias.replaceAll(" ", "_");

    // TODO
    // it might be worthwhile to also try with underscores in the XMLID '_' replaced with spaces ' ' to match better
    // or vice versa, put underscores in the stable RaR strings and search with underscores present
    // this is IN ADDITION to what's here now; don't replace this
    const xmlIdMatch =
        rarAliasDisplay.includes(item.system.XMLID) ||
        rarOptionsAlias.includes(item.system.XMLID) ||
        rarRollAlias.includes(item.system.XMLID) ||
        rarComments.includes(item.system.XMLID);
    if (xmlIdMatch) {
        return true;
    }

    const nameUpper = item.name?.toUpperCase() ?? "";
    const nameMatch =
        nameUpper &&
        rarOptionIsBackground !== nameUpper &&
        (rarAliasDisplay.includes(nameUpper) ||
            rarOptionsAlias.includes(nameUpper) ||
            rarRollAlias.includes(nameUpper) ||
            rarComments.includes(nameUpper));
    if (nameMatch) {
        return true;
    }

    const aliasUpper = item.system.ALIAS?.toUpperCase() ?? "";
    const aliasMatch =
        aliasUpper &&
        rarOptionIsBackground !== aliasUpper &&
        (rarAliasDisplay.includes(aliasUpper) ||
            rarOptionsAlias.includes(aliasUpper) ||
            rarRollAlias.includes(aliasUpper) ||
            rarComments.includes(aliasUpper));
    if (aliasMatch) {
        return true;
    }

    // Some skills have an underscore in them; the user might not have the name matched exactly
    // so if there is an underscore (as in SLEIGHT_OF_HAND), we check for that here
    const xml_Id_Match =
        /_/.test(item.system.XMLID) &&
        (rar_AliasDisplay.includes(item.system.XMLID) ||
            rar_OptionsAlias.includes(item.system.XMLID) ||
            rar_RollAlias.includes(item.system.XMLID) ||
            rar_Comments.includes(item.system.XMLID));
    if (xml_Id_Match) {
        return true;
    }

    // TODO check 'Text'?
    // TODO check 'Type'?
    return false;
}

function isBackgroundSkillType(rar, rarOptionIsBackground) {
    return rar.OPTIONID === "BASICRSR" || Object.keys(backgroundSkillKeys).includes(rarOptionIsBackground);
}

function matchBackgroundSkillType(o, rar, rarOptionIsBackground) {
    return rar.OPTIONID === "BASICRSR" || backgroundSkillKeys[rarOptionIsBackground] === o.system.XMLID;
}

function matchBackgroundSkillRoll(o, rar, item, rarOptionIsBackground) {
    if (!matchBackgroundSkillType(o, rar, rarOptionIsBackground)) {
        return false;
    }

    // PH: FIXME: This is not correctly looking at ROLLALIAS or ROLLALIAS2 based on which we're dealing with.
    const rarAliasDisplay = rar.ALIAS?.toUpperCase() || "";
    const rarOptionsAlias = rar.OPTION_ALIAS?.toUpperCase() || "";
    const rarComments = rar.COMMENTS?.toUpperCase() || "";
    const inputUpper = o.system.INPUT?.toUpperCase() ?? "";
    const inputMatch =
        inputUpper &&
        rarOptionIsBackground !== inputUpper &&
        (rarAliasDisplay.includes(inputUpper) ||
            rarOptionsAlias.includes(inputUpper) ||
            rarComments.includes(inputUpper));
    if (inputMatch) {
        return true;
    }

    return matchRequiredSkillRoll(o, rar, rarOptionIsBackground);
}

function findSkillRoll(rar, item, rarOptionIsBackground) {
    // PH: FIXME: For at least 5e this can be simplified
    if (isBackgroundSkillType(rar, rarOptionIsBackground)) {
        return item.actor.items
            .filter(filterOutNonSkillRollItems)
            .find((o) => matchBackgroundSkillRoll(o, rar, item, rarOptionIsBackground));
    }

    return item.actor.items
        .filter(filterOutNonSkillRollItems)
        .find((o) => matchRequiredSkillRoll(o, rar, rarOptionIsBackground));
}

function FIXMEisBackgroundSkillType(item) {
    const isBackgroundSkill = !!backgroundSkillXmlids[item.system.XMLID];
    return isBackgroundSkill;
}

function FIXMEmatchSkillRoll(item, rollAlias) {
    return item.name.includes(rollAlias);
}

// PH: FIXME: Kludge for experimentation in simplification
function FIXMEfindSkillRoll(actor, rollAlias) {
    const skillsToMatchAgainst = actor.items.filter(filterOutNonSkillRollItems);

    return skillsToMatchAgainst.find((potentialMatchingSkillItem) =>
        FIXMEmatchSkillRoll(potentialMatchingSkillItem, rollAlias),
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

        // PH: FIXME: Where is no penalty per level?

        // activation rolls have no minuses due to active points
        if (!isNaN(parseInt(rar.OPTIONID, 10))) {
            return NaN;
        }

        return 10;
    }
}

function calculateRollMinus(item, rar) {
    const divisor = findRollDivisor(rar);
    if (divisor === 0 || isNaN(divisor)) {
        return 0;
    }

    return roundFavorPlayerTowardsZero(item.activePoints / divisor);
}

function getRequiredCharacteristicKey(item, rar) {
    // PH: FIXME: This doesn't look like the right way to confirm the existance of the characteristic for the actor type
    const characteristicKeys = Object.keys(item.actor.system.characteristics).filter(
        (charKey) => item.actor.system.characteristics[charKey].roll != null,
    );
    const rarDisplayMaybeHasCharKey = rar.ALIAS?.toLowerCase() || "";
    const rarOptionMaybeHasCharKey = rar.OPTION_ALIAS?.toLowerCase() || "";
    const rarCommentMaybeHasCharKey = rar.COMMENTS?.toLowerCase() || ""; // pre or presence, STR or Strength
    const rarRollAliasMaybeHasCharKey = rar.ROLLALIAS?.toLowerCase() || "";
    // The \b ensures the match is at the start of a word
    const characteristicKeyRegex = characteristicKeys.reduce((accumulator, currentKey) => {
        // For each key, create the RegExp object
        const regex = new RegExp(`\\b${currentKey}`, "i");
        accumulator[currentKey] = regex;
        return accumulator;
    }, {});

    // exact match in comments
    if (characteristicKeys.includes(rarCommentMaybeHasCharKey)) {
        // finds pre, not presence
        return rarCommentMaybeHasCharKey;
    }

    // comment would be Strength, Intelligence, Presence etc.
    const matchedKeyInComment = characteristicKeys.find((key) =>
        characteristicKeyRegex[key].test(rarCommentMaybeHasCharKey),
    );
    if (matchedKeyInComment) {
        return matchedKeyInComment;
    }

    const matchedKeyInName = characteristicKeys.find((key) =>
        characteristicKeyRegex[key].test(rarDisplayMaybeHasCharKey),
    );
    if (matchedKeyInName) {
        return matchedKeyInName;
    }

    const matchedKeyInRollAlias = characteristicKeys.find((key) =>
        characteristicKeyRegex[key].test(rarRollAliasMaybeHasCharKey),
    );
    if (matchedKeyInRollAlias) {
        return matchedKeyInRollAlias;
    }

    const matchedKeyInOption = characteristicKeys.find((key) =>
        characteristicKeyRegex[key].test(rarOptionMaybeHasCharKey),
    );
    return matchedKeyInOption ?? "";
}

export const RSR_ROLL_TYPE = Object.freeze({
    ACTIVATION_ROLL: "activation roll",
    CHARACTERISTIC_ROLL: "characteristic roll",
    LUCK_ROLL: "luck roll",
    ITEM_ROLL: "item roll", // Skill, background skill, power
    ATTACK_ROLL: "attack roll",
});

const RSR_ROLL_CATEGORY = Object.freeze({
    SKILL: "skill category",
    BACKGROUNDSKILL: "background category",
    CHAR: "characteristic category",
    PER: "perception category",
});

const TYPE_TO_ROLL_TYPE = Object.freeze({
    0: RSR_ROLL_CATEGORY.SKILL,
    1: RSR_ROLL_CATEGORY.BACKGROUNDSKILL,
    2: RSR_ROLL_CATEGORY.CHAR,
    3: RSR_ROLL_CATEGORY.PER,
});

function normalizeTypeAndRollTarget(type, skillOrCharacteristic) {
    return {
        type: TYPE_TO_ROLL_TYPE[type] ?? `type ${type} not translated properly`,
        target: skillOrCharacteristic,
    };
}

/**
 * Given a rar, extract out all the bits and pieces required to make 1 or more activation rolls.
 *
 * @param {*} params
 * @returns
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
            rollsToGenerate.push({ type: RSR_ROLL_CATEGORY.BACKGROUNDSKILL, target: rar.COMMENTS });
        }

        // 6e Characteristics
        else if (rar.OPTIONID === "CHAR") {
            rollsToGenerate.push({ type: RSR_ROLL_CATEGORY.CHAR, target: rar.COMMENTS });
        }

        // 6e perception
        else if (rar.OPTIONID === "PER" || rar.OPTIONID === "PER1PER5" || rar.OPTIONID === "PER1PER20") {
            rollsToGenerate.push({ type: RSR_ROLL_CATEGORY.PER, target: null });
        }

        // 6e unknown OPTIONID
        else {
            // PH: FIXME: OPTIONID= attack roll?
            // PH: FIXME: 6e. Don't know how to deal with it yet
            debugger;
            // rollsToGenerate.push({ type: rar.OPTIONID, target: rar.ROLLALIAS || rar.CHARACTERISTIC });
        }
    }

    return rollsToGenerate.map((rollToGenerate) => {
        switch (rollToGenerate.type) {
            case RSR_ROLL_CATEGORY.CHAR:
                // const charKey = getRequiredCharacteristicKey(item, rar); // PH: FIXME: Is this not required as we have it already?

                return {
                    type: RSR_ROLL_TYPE.CHARACTERISTIC_ROLL,
                    characteristicKey: rollToGenerate.target,
                };

            case RSR_ROLL_CATEGORY.SKILL:
            case RSR_ROLL_CATEGORY.BACKGROUNDSKILL: {
                const skill = FIXMEfindSkillRoll(item.actor, rollToGenerate.target); // PH: FIXME: Is toUpperCase required?

                return {
                    type: RSR_ROLL_TYPE.ITEM_ROLL,
                    name: rollToGenerate.target,
                    activeItems: skill ? [skill].filter((skill) => skill.isActive) : [],
                    items: skill ? [skill] : [],
                };
            }

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
    // Low shots (special hit location) can generate a hit location of 19. This is supposed to be treated as
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

    // PH: FIXME: Need to pay the cost of this skill/etc

    // Perform the rolls. Because a roll might consume resources we must perform all rolls (i.e. invoke all skills etc)
    // and then evaluate if there was success.
    // PH: FIXME: Need to use the resources from the skills/powers etc
    const actor = item.actor;
    const token = options.token ?? tokenEducatedGuess({ actor });
    const speaker = ChatMessage.getSpeaker({ actor, token });

    const rollPromises = activationRolls.map(async (activationRoll) => {
        const roller = new HeroRoller({}, rollClass);
        let succeeded = false;
        let flavor;

        if (activationRoll.type === RSR_ROLL_TYPE.ACTIVATION_ROLL) {
            // Sectional Defense overrides a standard activation roll.
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

            // Regular random activation roll
            const successValue = activationRoll.rollValue;

            roller.makeSuccessRoll(true, successValue).addDice(3);

            await roller.roll();

            // PH: FIXME: Any way of combining the success checks?
            succeeded = roller.getSuccess();
            const autoSuccess = roller.getAutoSuccess();
            const total = roller.getSuccessTotal();
            const margin = successValue - total;

            flavor = `${item.name} (${successValue}-) activation ${
                succeeded ? "succeeded" : "failed"
            } by ${autoSuccess === undefined ? `${Math.abs(margin)}` : `rolling ${total}`}`;
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
            const characteristics = actor.system.characteristics[charKey];
            const value = characteristics.roll;
            const apMinus = calculateRollMinus(item, rar);
            const successValue = value - apMinus;

            // PH: FIXME: what about additional skill levels used to influence the activation roll?
            // PH: FIXME: not including penalties in an obvious way ... should also include the tags for them
            roller.makeSuccessRoll(true, successValue).addDice(3);

            await roller.roll();

            // PH: FIXME: Any way of combining the success checks?
            succeeded = roller.getSuccess();
            const autoSuccess = roller.getAutoSuccess();
            const total = roller.getSuccessTotal();
            const margin = successValue - total;

            const targetRoll = `${rar.OPTION_ALIAS}:${successValue}-`;
            const divisor = findRollDivisor(rar);
            const penalty = isNaN(divisor) ? "" : `, -1 per ${divisor} active points`;

            const penaltyString = penalty ? `${penalty}: -${apMinus}` : "";

            flavor = `${item.name} (${targetRoll}${penaltyString}) activation ${
                succeeded ? "succeeded" : "failed"
            } by ${autoSuccess === undefined ? `${Math.abs(margin)}` : `rolling ${total}`}`;
        } else if (activationRoll.type === RSR_ROLL_TYPE.ITEM_ROLL) {
            const skill = activationRoll.activeItems[0]; // PH: FIXME: Kludge
            const value = parseInt(skill.system.roll);

            const apMinus = calculateRollMinus(item, rar);
            const successValue = value - apMinus;

            // PH: FIXME: what about additional skill levels used to influence the activation roll? Can they apply to this?
            roller.makeSuccessRoll(true, successValue).addDice(3);

            await roller.roll();

            succeeded = roller.getSuccess();
            const autoSuccess = roller.getAutoSuccess();
            const total = roller.getSuccessTotal();
            const margin = successValue - total;

            const targetRoll = skill.system.roll;
            const divisor = findRollDivisor(rar);
            const penalty = isNaN(divisor) ? "" : `, -1 per ${divisor} active points`;

            const penaltyString = penalty ? `${penalty}: -${apMinus}` : "";

            flavor = `${item.name} (${targetRoll}${penaltyString}) activation ${
                succeeded ? "succeeded" : "failed"
            } by ${autoSuccess === undefined ? `${Math.abs(margin)}` : `rolling ${total}`}`;
        } else {
            console.error(`${item.detailedName()} has unknown type ${activationRoll.type} for requires roll modifier`);
        }

        let cardHtml = await roller.render(flavor);

        // FORCE success
        if (!succeeded && overrideCanAct) {
            const overrideKeyText = game.keybindings.get(HEROSYS.module, "OverrideCanAct")?.[0].key;
            ui.notifications.info(`${actor.name} succeeded roll because override key.`);
            succeeded = true;
            cardHtml += `<p>Succeeded roll because ${game.user.name} used <b>${overrideKeyText}</b> key to override.</p>`;
        }

        if (!succeeded && options.resourcesUsedDescription) {
            cardHtml += `Spent ${options.resourcesUsedDescription}.`;
        }

        const chatData = {
            style: CONFIG.HERO.CHAT_MESSAGE_DEFAULT_STYLE,
            rolls: roller.rawRolls(),
            author: game.user._id,
            content: cardHtml,
            speaker: speaker,
        };

        await ChatMessage.create(chatData);

        if (!succeeded && options.showUi) {
            ui.notifications.warn(cardHtml);
        }

        return succeeded;
    });

    const results = await Promise.all(rollPromises);

    // One failure is an overall failure
    return results.reduce((accum, result) => {
        return accum && result;
    });
}
