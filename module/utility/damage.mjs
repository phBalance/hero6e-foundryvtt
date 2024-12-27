// DAMAGE CLASS (DC)
//
// Different dice of damage are not the same – 2d6 of Killing
// Damage is much more likely to injure a target than a 2d6
// Normal Damage attack. For comparisons between damage
// types, Champions uses Damage Classes (“DC”).
//
// An attack’s DC is based on the number of Active Points in
// it divided by 5. Thus, a Blast 6d6 and an HKA 2d6 (each with
// 30 Active Points) each have 6 DCs; if added STR increases that
// HKA to 3d6+1, it counts as 10 DCs; and so on.
//
// For attacks with Advantages, determine the DCs by
// making a special Active Point calculation that only counts
// Advantages that directly affect how the victim takes damage.
// The GM makes the final call on which Advantages this includes,
// but typically, the following Advantages qualify: Area Of
// Effect, Armor Piercing, AVAD, Autofire, Charges (Boostable),
// Constant, Cumulative, Damage Over Time, Does BODY, Does
// Knockback, Double Knockback, Increased STUN Multiplier,
// MegaScale in some instances, Penetrating, Sticky, Time Limit,
// Transdimensional, Trigger, Uncontrolled, Usable As Attack,
// Variable Advantage, and Variable Special Effects.

import { RoundFavorPlayerUp } from "./round.mjs";

// PH: TODO: see if we can do anything about this - add to other methods like it?
export function convertToDiceParts(value) {
    const dice = Math.floor(value / 5);
    const halfDice = value % 5 >= 2.5 ? 1 : 0;
    const plus1 = value % 5 < 2.5 && value % 5 > 0 ? 1 : 0;
    return { dice, halfDice, plus1 };
}

/**
 * Calculate the base DC. The base DC concept is only useful for 5e where there is a base DC doubling rule.
 * Consequently, no 6e specific rules should be in here.
 * @param {HeroSystem6eItem} item
 * @param {Object} options
 * @returns
 */
function calculateBaseDcFromItem(item, options) {
    // MartialArts & Maneuvers have DC. Others have active points with some advantages that contribute to DC.
    // PH: FIXME: Either everything has a DC function or nothing has one.
    let itemBaseDc =
        typeof item.baseInfo?.dc === "function"
            ? item.baseInfo.dc(item, options)
            : parseInt(item.system.DC) || Math.floor(item.system.activePointsDc / 5);

    // FRed pg. 406: 5e maneuver/martial arts DCs are halved for killing attacks this applies to the base DC
    // of the maneuver/martial art as well. As always, no partial DCs allowed.
    if (item.is5e && ["maneuver", "martialart"].includes(item.type) && item.system.killing) {
        itemBaseDc = Math.floor(itemBaseDc / 2);
    }

    // PH: FIXME: For hand to hand attacks the strength bonus counts as base damage.

    const baseDc = {
        dc: itemBaseDc,
        tags: [
            {
                value: `${itemBaseDc.signedString()}DC`,
                name: item.name,
                title: `${itemBaseDc.signedString()}DC`,
            },
        ],
    };

    // PH: FIXME: This is not correct as it does not account for only unarmed attacks.
    // 5e martial arts EXTRADC
    if (item.is5e && item.type === "martialart") {
        // PH: FIXME: Is it possible to have multiple EXTRADCs purchased? If so, this doesn't work.
        const extraDc = item.actor.items.find((item) => item.system.XMLID === "EXTRADC");
        if (extraDc) {
            let extraDcLevels = parseInt(extraDc.system.LEVELS);

            // 5E extraDCLevels are halved for killing attacks
            // PH: FIXME: 5E EXTRADC for unarmed killing attacks count at half DCs but count towards the base DC. As usual there are no 1/2 DCs.
            if (item.system.killing) {
                extraDcLevels = Math.floor(extraDcLevels / 2);
            }

            if (extraDcLevels > 0) {
                baseDc.dc += extraDcLevels;
                baseDc.tags.push({
                    value: `${extraDcLevels}`,
                    name: extraDc.name.replace(/\+\d+ HTH/, "").trim(),
                    title: `${extraDcLevels.signedString()}DC`,
                });
            }
        }
    }

    return {
        itemBaseDc,
        baseDc,
    };
}

/**
 * Determine DC solely from item/attack. A DC is NOT a die of damage.
 *
 * @param {HeroSystem6eItem} item
 * @param {Object} options
 */
export function calculateDcFromItem(item, options) {
    const { itemBaseDc, baseDc } = calculateBaseDcFromItem(item, options);

    const addedDc = {
        dc: 0,
        tags: [],
    };

    // PH: FIXME: I don't think that this is right.
    // Add in STR
    if (item.system.usesStrength) {
        // STRMINIMUM
        // A character using a weapon only adds damage for every full 5 points of STR he has above the weapon’s STR Minimum
        const STRMINIMUM = item.findModsByXmlid("STRMINIMUM");
        if (STRMINIMUM) {
            const strMinimum = parseInt(STRMINIMUM.OPTION_ALIAS.match(/\d+/)?.[0] || 0);
            const strMinDc = Math.ceil(strMinimum / 5);
            addedDc.dc -= strMinDc;
            addedDc.tags.push({
                value: `-${strMinDc}DC`,
                name: "STR Minimum",
                title: `${STRMINIMUM.OPTION_ALIAS} ${STRMINIMUM.ALIAS}`,
            });
        }

        let str = parseInt(
            options?.effectivestr != undefined
                ? options?.effectivestr
                : item.actor?.system.characteristics.str.value || 0,
        );

        // MOVEBY halves STR
        // PH: FIXME: Missing move through...
        // PH: FIXME: Is this the best way to do it? Shouldn't we have a generic way of handling maneuvers rather than 1 off?
        //            This would allow us to make a tag and then do things like subtract off strength minimums.
        if (item.system.XMLID === "MOVEBY") {
            str = RoundFavorPlayerUp(str / 2);
        }

        // PH: FIXME: Can we have negative DC contributions from strength?
        // +1 DC per 5 strength. No partial DCs.
        const str5Dc = Math.floor(str / 5);
        if (str5Dc !== 0) {
            addedDc.dc += str5Dc;
            addedDc.tags.push({
                value: `${str5Dc}DC`,
                name: "STR",
                title: `${str5Dc.signedString()}DC${item.system.XMLID === "MOVEBY" ? "\nMoveBy is half STR" : ""}`,
            });
        }
    }

    // EXTRADCs
    // PH: TODO: 5e EXTRADC for armed killing attacks count at full DCs but do NOT count towards the base DC.
    // PH: TODO: 6e EXTRADC are additional DC because there is no doubling rule.

    // Boostable Charges
    if (options?.boostableCharges) {
        // Each used boostable charge, to a max of 4, increases the damage class by 1.
        const boostCharges = parseInt(options.boostableCharges);
        addedDc.dc += 1 * boostCharges;
        addedDc.tags.push({
            value: `${boostCharges}DC`,
            name: "boostable charges",
            title: `${boostCharges.signedString()}DC`,
        });
    }

    // Combat Skill Levels
    // PH: TODO: 5E Superheroic: Each 2 CSLs modify the killing attack BODY roll by +1 (cannot exceed the max possible roll). Obviously no +1/2 BODY.
    // PH: TODO: 5E Superheroic: Each 2 CSLs modify the normal attack STUN roll by +3 (cannot exceed the max possible roll). Obviously no +1 1/2 STUN.
    // PH: TODO: THE ABOVE 2 NEED NEW HERO ROLLER FUNCTIONALITY.
    // PH: TODO: 5E Heroic: Each 2 CSLs add to the DC by +1 and follow the doubling rule as it is not base DC. Obviously no +1/2 DC.
    // PH: DONE: 6E: Each 2 CSLs add to the DC by +1. Obviously no +1/2 DC.
    for (const csl of combatSkillLevelsForAttack(item)) {
        if (csl && csl.dc > 0) {
            addedDc.dc += csl.dc;
            addedDc.tags.push({
                value: `${csl.dc}DC`,
                name: csl.item.name,
                title: `${csl.dc.signedString()}DC`,
            });
        }
    }

    // PH: FIXME: velocity from maneuvers does not apply towards the 5e doubling DC limit rule for normal attacks (only).

    // Move By, Move By, etc - Maneuvers that add in velocity
    // ((STR/2) + (v/10))d6; attacker takes 1/3 damage
    //
    // A character can accelerate at a rate of 5m per meter, up to their
    // maximum normal Combat Movement in meters per Phase. Thus
    // a character with 50m of Flight would be moving at a velocity of
    // 5m after traveling one meter, 10m after traveling two meters,
    // 15m after traveling three meters, and so on, up to 50m after
    // traveling ten meters.
    //
    // Currently assuming token starts at 0 velocity and ends at 0 velocity.
    // Under this assumption the max velocity is half the speed.

    // [NORMALDC] +v/5 Strike, FMove
    // ((STR/2) + (v/10))d6; attacker takes 1/3 damage
    if ((item.system.EFFECT || "").match(/v\/\d/)) {
        const velocity = parseInt(options?.velocity || 0);
        const divisor = parseInt(item.system.EFFECT.match(/v\/(\d+)/)[1]);
        const velocityDC = Math.floor(velocity / divisor);

        if (velocityDC > 0) {
            addedDc.dc += velocityDC;
            addedDc.tags.push({
                value: `${velocityDC}DC`,
                name: "Velocity",
                title: `Velocity (${velocity}) / ${divisor}`,
            });
        }
    }

    // ActiveEffects
    if (item.actor) {
        for (const ae of item.actor.appliedEffects.filter((o) => !o.disabled && o.flags?.target === item.uuid)) {
            for (const change of ae.changes.filter((o) => o.key === "system.value" && o.value != 0 && o.mode === 2)) {
                const _value = parseInt(change.value);
                addedDc.dc += _value;
                addedDc.tags.push({
                    value: `${_value.signedString()}DC`,
                    name: ae.name,
                    title: `${_value.signedString()}DC`,
                });
            }
        }
    }

    // Add in Haymaker to any non-maneuver attack DCV based attack
    if (item.actor) {
        const haymakerManeuver = item.actor.items.find(
            (item) => item.type.includes("maneuver") && item.name === "Haymaker" && item.system.active,
        );
        if (haymakerManeuver) {
            if (item.name == "Strike" || !item.type.includes("maneuver")) {
                if (item.system.targets == "dcv") {
                    const haymakerDc = 4;

                    addedDc.dc += haymakerDc;
                    addedDc.tags.push({
                        value: `${haymakerDc}DC`,
                        name: "Haymaker",
                        title: `${haymakerDc}DC`,
                    });
                } else {
                    // PH: FIXME: This is a poor location for this. Better off in the to hit code and reject immediately.
                    if (options?.isAction)
                        ui.notifications.warn("Haymaker can only be used with attacks targeting DCV.", {
                            localize: true,
                        });
                }
            } else {
                // PH: FIXME: This is a poor location for this. Better off in the to hit code and reject immediately.
                if (options?.isAction)
                    ui.notifications.warn("Haymaker cannot be combined with another maneuver (except for Strike).", {
                        localize: true,
                    });
            }
        }
    }

    // WEAPON MASTER (also check that item is present as a custom ADDER)
    if (item.actor) {
        const weaponMaster = item.actor.items.find((item) => item.system.XMLID === "WEAPON_MASTER");
        if (weaponMaster) {
            const weaponMatch = (weaponMaster.system.ADDER || []).find(
                (o) => o.XMLID === "ADDER" && o.ALIAS === item.name,
            );
            if (weaponMatch) {
                const dcPlus = 3 * Math.max(1, parseInt(weaponMaster.system.LEVELS) || 1);
                addedDc.dc += dcPlus;
                addedDc.tags.push({
                    value: `${dcPlus}DC`,
                    name: "WeaponMaster",
                    title: `${dcPlus.signedString()}DC`,
                });
            }
        }
    }

    // DEADLYBLOW
    // Only check if it has been turned off
    // FIXME: This function should not be changing the item.system. Please fix me.
    // const deadlyBlow = item.actor?.items.find((o) => o.system.XMLID === "DEADLYBLOW");
    // if (deadlyBlow) {
    //     item.system.conditionalAttacks ??= {};
    //     item.system.conditionalAttacks[deadlyBlow.id] = deadlyBlow;
    //     item.system.conditionalAttacks[deadlyBlow.id].system.checked ??= true;
    // }

    // if (item.actor) {
    //     for (const key in item.system.conditionalAttacks) {
    //         const conditionalAttack = item.actor.items.find((o) => o.id === key);
    //         if (!conditionalAttack) {
    //             // FIXME: This is the wrong place to be playing with the database. Should be done at the
    //             //            to hit phase.
    //             // Quench and other edge cases where item.id is null
    //             if (item.id) {
    //                 console.warn("conditionalAttack is empty");
    //                 delete item.system.conditionalAttacks[key];
    //                 // NOTE: typically we await here, but this isn't an async function.
    //                 // Shouldn't be a problem.
    //                 item.update({
    //                     [`system.conditionalAttacks`]: item.system.conditionalAttacks,
    //                 });
    //             }
    //             continue;
    //         }

    //         // If unchecked or missing then assume it is enabled
    //         if (!conditionalAttack.system.checked) continue;

    //         // Make sure conditionalAttack applies (only for DEADLYBLOW at the moment)
    //         if (typeof conditionalAttack.baseInfo?.appliesTo === "function") {
    //             if (!conditionalAttack.baseInfo.appliesTo(item)) continue;
    //         }

    //         switch (conditionalAttack.system.XMLID) {
    //             case "DEADLYBLOW": {
    //                 if (!options?.ignoreDeadlyBlow) {
    //                     const dcPlus = 3 * Math.max(1, parseInt(conditionalAttack.system.LEVELS) || 1);
    //                     const deadlyDc = RoundDc(dcPlus * apRatio);
    //                     dc += deadlyDc;
    //                     tags.push({
    //                         value: `${getDiceFormulaFromItemDC(item, deadlyDc)}`,
    //                         name: "DeadlyBlow",
    //                         title:
    //                             conditionalAttack.system.OPTION_ALIAS +
    //                             `${
    //                                 deadlyDc != dcPlus
    //                                     ? `\n${getDiceFormulaFromItemDC(
    //                                           item,
    //                                           dcPlus,
    //                                       )} reduced to ${getDiceFormulaFromItemDC(item, deadlyDc)} due to advantages`
    //                                     : ""
    //                             }`,
    //                     });
    //                 }

    //                 break;
    //             }

    //             default:
    //                 console.warn("Unhandled conditionalAttack", conditionalAttack);
    //         }
    //     }
    // }

    if (item.actor?.statuses?.has("underwater")) {
        addedDc.dc -= 2;
        addedDc.tags.push({
            value: `-2DC`,
            name: "Underwater",
            title: `-2DC`,
        });
    }

    // Max Killing Doubling Damage
    // A character cannot more than
    // double the Damage Classes of his base attack, no
    // matter how many different methods he uses to add
    // damage.

    // PH: FIXME: Need to work this through. Not sure it's right and there are some exceptions in 5e (heroic vs superheroic).
    // const DoubleDamageLimit = game.settings.get(HEROSYS.module, "DoubleDamageLimit");
    // if (DoubleDamageLimit) {
    //     // BaseDC
    //     let baseDC = baseDcParts.str;
    //     if (["HA", "HKA"].includes(item.system.XMLID) || item.system.CATEGORY === "Hand To Hand") {
    //         baseDC = baseDcParts.item;
    //     }
    //     if (item.system.XMLID === "MANEUVER" && !item.type.USEWEAPON) {
    //         baseDC += extraDcLevels;
    //     }

    //     // NOTE: baseDC > 0 is not great - need to consider things with effect rolls like mind scan and illusions
    //     if (baseDC > 0 && dc > baseDC * 2) {
    //         const backOutDc = Math.floor(baseDC * 2 - dc);
    //         tags.push({
    //             value: `${backOutDc}DC`,
    //             name: "DoubleDamageLimit",
    //             title: `BASEDC=${baseDC}. DC=${dc}. ${game.i18n.localize("Settings.DoubleDamageLimit.Hint")}`,
    //         });
    //         dc = Math.max(0, dc + backOutDc);
    //     }
    // }

    // PH: FIXME: Is this the place to limit the DC to 0? Seems like it should be at the end.
    const finalUnmodifiedDc = baseDc.dc + addedDc.dc;
    const finalDc = Math.max(0, finalUnmodifiedDc);

    return {
        itemBaseDc,
        dc: finalDc,
        tags: [...baseDc.tags, ...addedDc.tags],
    };
}

/**
 * Given a number of DCs, return the dice formula parts for this item
 *
 * NOTE: This is ugly because with floating point calculations we need to use epsilon comparisons (see https://randomascii.wordpress.com/2012/02/25/comparing-floating-point-numbers-2012-edition/ for instance)
 *       To work around the need for epsilon comparison we just multiply by a large enough number that we're just doing integer math and ignoring the mantissa.
 *
 * A 3AP/die attack: +1 pip is 1 point, +1/2d6 is 2 points, and +1d6 is 3 points.
 * This makes 3 possible breakpoints x.0, x.3333, x.6666 for any whole number x >=0 when we divide by the AP/3 to get the num of dice.
 *
 * A 5AP/die normal attack like energy blast: +1 pip is 2 points, +1/2d6 is 3 points, and +1d6 is 5 points.
 * This makes 3 possible breakpoints x.0, x.4, x.6 for any whole number x >=0 when we divide by the AP/5 to get the num of dice.
 *
 * A 10AP/die normal attack like ego attack: +1 pip is 3 points, +1/2d6 is 5 points, and +1d6 is 10 points.
 * This makes 3 possible breakpoints x.0, x.3, x.5 for any whole number x >=0 when we divide by the AP/10 to get the num of dice.
 *
 * A 15 AP/die killing attack: +1 pip is 5 points, +1/2d6 or +1d6-1 is 10 points, and +1d6 is 15 points.
 * This makes 3 possible breakpoints x.0, x.3333, x.6666 for any whole number x >=0 when we divide by the AP/15 to get the num of dice.
 *
 * Overall there are 3 possible sets of calculations based on the basic AP per die of damage.
 *
 * Rather than use floating point math and Epsilon, we'll just multiply to shift values into large integers
 *
 * @param {HeroSystem6eItem} item
 * @param {number} dc
 * @returns
 */
export function calculateDicePartsFromDcForItem(item, dc) {
    const isMartialOrManeuver = ["maneuver", "martialart"].includes(item.type);
    let martialOrManeuverEquivalentApPerDice = 0;
    if (isMartialOrManeuver) {
        const effect = item.system.EFFECT;
        if (effect.search("NORMALDC") !== -1) {
            martialOrManeuverEquivalentApPerDice = 5;
        } else if (effect.search("NNDDC") !== -1) {
            martialOrManeuverEquivalentApPerDice = 10;
        } else if (effect.search("KILLINGDC") !== -1) {
            martialOrManeuverEquivalentApPerDice = 15;
        } else {
            // FIXME: We shouldn't be calculating damage dice for things that don't do damage
            // Most maneuvers don't do damage. Pretend they are NORMALDC so we don't spew errors below.
            martialOrManeuverEquivalentApPerDice = 5;
        }
    }

    const baseApPerDie = martialOrManeuverEquivalentApPerDice || item.baseInfo.costPerLevel(item);
    const apPerDie = baseApPerDie * (1 + item.system._advantagesDc);
    const multiplierToAvoidEpsilon = 100000;
    let halfDieValue;
    let pipValue;
    if (baseApPerDie === 3) {
        halfDieValue = Math.floor((multiplierToAvoidEpsilon * 2) / 3);
        pipValue = Math.floor((multiplierToAvoidEpsilon * 1) / 3);
    } else if (baseApPerDie === 5) {
        halfDieValue = Math.floor((multiplierToAvoidEpsilon * 3) / 5);
        pipValue = Math.floor((multiplierToAvoidEpsilon * 2) / 5);
    } else if (baseApPerDie === 10) {
        halfDieValue = Math.floor((multiplierToAvoidEpsilon * 5) / 10);
        pipValue = Math.floor((multiplierToAvoidEpsilon * 3) / 10);
    } else if (baseApPerDie === 15) {
        halfDieValue = Math.floor((multiplierToAvoidEpsilon * 10) / 15);
        pipValue = Math.floor((multiplierToAvoidEpsilon * 5) / 15);
    } else {
        console.error(`Unhandled die of damage cost ${baseApPerDie} for ${item.name}/${item.system.XMLID}`);
    }

    // MartialArts & Maneuvers have DC and no advantages. Others have active points with some advantages that contribute to DC.
    // See FRed pp 403, 404 6e vol 2 pp 96, 97
    const shiftedDiceOfDamage = multiplierToAvoidEpsilon * (dc * (5 / apPerDie));

    const d6Count = Math.floor(shiftedDiceOfDamage / multiplierToAvoidEpsilon);
    const halfDieCount = shiftedDiceOfDamage % multiplierToAvoidEpsilon >= halfDieValue ? 1 : 0;
    const constant = shiftedDiceOfDamage % multiplierToAvoidEpsilon >= pipValue && !halfDieCount ? 1 : 0;

    // PH: FIXME: Need to do up a big table of checks for this it would seem
    // PH: FIXME: Note that the 6e vol 2 p.97 hints that 1/2d6 < 1d6-1

    return {
        d6Count,
        halfDieCount: halfDieCount,

        // PH: FIXME: Note that the 6e vol 2 p.97 shows that 1/2d6 < 1d6-1
        d6Less1DieCount: 0,
        constant,
    };
}

/**
 * @typedef {Object} HeroSystemFormulaDiceParts
 * @property {number} d6Count - number of whole dice (e.g. 73d6)
 * @property {number} d6Less1DieCount - 1 or 0 1d6-1 terms (e.g. 1d6-1)
 * @property {number} halfDieCount - 1 or 0 half dice terms (e.g. ½d6)
 * @property {number} constant - 1 or 0 reflecting a +1 (e.g. 2d6 + 1)
 */
/**
 * Add two dice parts together by steps and not straight math. For example: 1/2d6 + 1/2d6 = 1d6+1
 * @param {HeroSystemFormulaDiceParts} firstDiceParts
 * @param {HeroSystemFormulaDiceParts} secondDiceParts
 * @param {boolean} useDieMinusOne
 * @returns
 */
export function addDiceParts(firstDiceParts, secondDiceParts, useDieMinusOne) {
    const firstSum =
        3 * firstDiceParts.d6Count +
        2 * (firstDiceParts.d6Less1DieCount + firstDiceParts.halfDieCount) +
        firstDiceParts.constant;
    const secondSum =
        3 * secondDiceParts.d6Count +
        2 * (secondDiceParts.d6Less1DieCount + secondDiceParts.halfDieCount) +
        secondDiceParts.constant;
    const totalSum = firstSum + secondSum;

    const result = {
        d6Count: Math.floor(totalSum / 3),
        d6Less1DieCount: useDieMinusOne ? (totalSum % 3 >= 2 ? 1 : 0) : 0,
        halfDieCount: !useDieMinusOne ? (totalSum % 3 >= 2 ? 1 : 0) : 0,
        constant: totalSum % 3 === 1 ? 1 : 0,
    };
    return result;
}

/**
 * Calculate the damage dice for an item
 *
 * @param {HeroSystem6eItem} item
 * @param {Object} options
 * @returns {HeroSystemFormulaDiceParts}
 */
export function calculateDicePartsForItem(item, options) {
    // Get base DCs (with a breakout for actual fundamental DC contribution to the extra DCs) and added DCs
    // Figure extra DCs based on base DCs
    // Figure out how many extra dice are caused by the extra DCs
    const { itemBaseDc, dc: totalDc } = calculateDcFromItem(item, options);
    const extraDcs = totalDc - itemBaseDc;
    const extraDcsDiceParts = calculateDicePartsFromDcForItem(item, extraDcs);

    // Get basic damage based on base DC (for maneuvers/martialarts) or the item's dice
    const baseDiceParts = ["maneuver", "martialart"].includes(item.type)
        ? calculateDicePartsFromDcForItem(item, itemBaseDc)
        : {
              d6Count: parseInt(item.system.LEVELS || 0),
              d6Less1DieCount: item.findModsByXmlid("MINUSONEPIP") ? 1 : 0,
              halfDieCount: item.findModsByXmlid("PLUSONEHALFDIE") ? 1 : 0,
              constant: item.findModsByXmlid("PLUSONEPIP") ? 1 : 0,
          };

    // Add the basic dice with the added dice
    const useDieMinusOne = !!item.findModsByXmlid("MINUSONEPIP");
    const sum = addDiceParts(baseDiceParts, extraDcsDiceParts, useDieMinusOne);
    return sum;
}

export function getDiceFormulaFromItem(item, options) {
    // PH: FIXME: Need to stop looking at end returned from other functions.
    const formulaParts = calculateDicePartsForItem(item, options);

    return `${
        formulaParts.d6Count + formulaParts.d6Less1DieCount + formulaParts.halfDieCount > 0
            ? `${
                  formulaParts.d6Count + formulaParts.d6Less1DieCount
                      ? `${formulaParts.d6Count + formulaParts.d6Less1DieCount}`
                      : ""
              }${formulaParts.halfDieCount ? `½` : ""}d6`
            : ""
    }${
        formulaParts.constant
            ? formulaParts.d6Count + formulaParts.d6Less1DieCount + formulaParts.halfDieCount > 0
                ? "+1"
                : "1"
            : formulaParts.d6Count + formulaParts.d6Less1DieCount + formulaParts.halfDieCount > 0
              ? `${formulaParts.d6Less1DieCount > 0 ? "-1" : ""}`
              : "0"
    }`;
}

export function getFullyQualifiedDiceFormulaFromItem(item, options) {
    return `${getDiceFormulaFromItem(item, options)}${item.system.killing ? "K" : ""}`;
}

export function combatSkillLevelsForAttack(item) {
    const results = [];

    if (!item.actor) return results;

    const cslSkills = item.actor.items.filter(
        (o) =>
            ["MENTAL_COMBAT_LEVELS", "COMBAT_LEVELS"].includes(o.system.XMLID) &&
            (o.system.ADDER || []).find((p) => p.ALIAS === item.system.ALIAS || p.ALIAS === item.name) &&
            o.isActive != false,
    );

    for (const cslSkill of cslSkills) {
        const result = {
            ocv: 0,
            dcv: 0,
            dmcv: 0,
            omcv: 0,
            dc: 0,
            skill: cslSkill,
        };

        if (result.skill && result.skill.system.csl) {
            for (let i = 0; i < parseInt(result.skill.system.LEVELS || 0); i++) {
                result[result.skill.system.csl[i]] = (result[result.skill.system.csl[i]] || 0) + 1;
            }
            result.item = result.skill;

            // Takes 2 CLS for +1 DC
            result.dc = Math.floor(result.dc / 2);

            results.push(result);
        }
    }

    return results;
}

export function penaltySkillLevelsForAttack(item) {
    if (!item.actor) return [];

    const psls = item.actor.items.filter(
        (o) =>
            ["PENALTY_SKILL_LEVELS"].includes(o.system.XMLID) &&
            (o.system.ADDER || []).find((p) => p.ALIAS === item.system.ALIAS || p.ALIAS === item.name) &&
            o.isActive != false,
    );

    return psls;
}
