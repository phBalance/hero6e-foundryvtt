import { HERO } from "../config.js";
import { HEROSYS } from "../herosystem6e.js";
import { RoundFavorPlayerDown } from "./round.js";
import { HeroRuler } from "../ruler.js";



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

export function determineStrengthDamage(item, effectiveStr) {
    if (!item.system.usesStrength && !item.system.usesTk) { return null; }

    const strDamage = Math.floor(Math.max(0, parseInt(effectiveStr)) / 5) || 0;

    if (strDamage === 0) { return null; }

    if (!item.system.killing) {
        return strDamage.toString() + "d6";
    }

    const strDice = Math.floor(strDamage / 3);

    const pip = strDamage % 3

    let strTag = (strDice > 0) ? strDice + "d6" : "";

    switch (pip) {
        case 1:
            strTag += "+1";
            break;
        case 2:
            strTag += "+1d3";
            break;
    }

    return strTag
}

export function determineExtraDiceDamage(item) {
    switch (item.system.extraDice) {
        case 'zero':
            return "";
        case 'pip':
            return "+1";
        case 'half':
            return "+1d3";
        default:
            HEROSYS.log(false, "Failed to get extra dice")
            break;
    }
}

export function getNumberOfEachDice(roll) {
    const matches = roll.match(/\d+d6|\d+d3/g) || null;

    const constant = parseInt(roll.match(/(?<![a-zA-Z])\b\d+\b(?![a-zA-Z])/g)) || 0;

    if (!matches) { return [0, 0, constant]; }

    let d6Count = 0;
    let d3Count = 0;

    matches.forEach((current) => {
        const [numDice, diceType] = current.split('d');

        if (diceType == '6') {
            d6Count += parseInt(numDice);
        } else if (diceType == '3') {
            d3Count += parseInt(numDice);
        }
    });

    d6Count += Math.floor(d3Count / 2)
    d3Count = d3Count % 2

    return [d6Count, d3Count, constant]
}

export function simplifyDamageRoll(damageRoll) {
    const [d6Count, d3Count, constant] = getNumberOfEachDice(damageRoll)

    let output = "";

    if (d6Count !== 0) { output = addTerms(output, d6Count.toString() + "d6"); }

    if (d3Count !== 0) { output = addTerms(output, d3Count.toString() + "d3"); }

    if (constant !== 0) { output = addTerms(output, constant); }

    return output;
}

export function convertToDC(item, formula) {

    const [d6Count, d3Count, constant] = getNumberOfEachDice(formula);

    if (!item.system.killing) { return d6Count; }

    const pip = (constant > 0) ? 1 : 0

    return parseInt(3 * d6Count + 2 * d3Count + pip || 0)
}


// Determine DC soley from item/attack
export function convertToDcFromItem(item, options) {

    let actor = item.actor;
    let dc = 0;
    let tags = [];
    let end = 0;

    // Killing Attack
    if (item.system.killing) {
        dc += parseInt(item.system.dice) * 3;
        switch (item.system.extraDice) {
            case 'pip':
                dc += 1;
                break
            case 'half':
                dc += 2;
                break
        }
        tags.push({ value: `${dc}DC`, name: item.name })
    } else

    // Normal Attack
    {
        dc += parseInt(item.system.dice);
        let _tag = `${dc}DC`
        switch (item.system.extraDice) {
            case 'pip':
                dc += 0.2;
                _tag += " plus 1";
                break
            case 'half':
                dc += 0.5;
                _tag += " plus 1d3";
                break
        }
        tags.push({ value: _tag, name: item.name })
    }

    // Combat Skill Levels
    const csl = CombatSkillLevelsForAttack(item)
    if (csl && csl.dc > 0) {

        // Simple +1 DC for now (checking on discord to found out rules for use AP ratio)
        dc += csl.dc;

        // Each DC should roughtly be 5 active points
        // let dcPerAp =  ((dc * 5) / (item.system.activePointsDc || item.system.activePoints)) || 1;
        // let ratio = (dcPerAp || 5) / 5;  // Typically 1 to 1 radio
        // dc += (csl.dc * dcPerAp);
        // console.log(dcPerAp, dc, csl.dc)

        tags.push({ value: `${csl.dc}DC`, name: csl.item.name })
    }

    // Move By (add in velocity)
    // ((STR/2) + (v/10))d6; attacker takes 1/3 damage
    //
    // A character can accelerate at a rate of 5m per meter, up to his
    // maximum normal Combat Movement in meters per Phase. Thus
    // a character with 50m of Flight would be moving at a velocity of
    // 5m after traveling one meter, 10m after traveling two meters,
    // 15m after traveling three meters, and so on, up to 50m after
    // traveling ten meters.
    //
    // Currently assuming token starts at 0 velocity and ends at 0 velocity.
    // Under this assumption the max velocity is half the speed.
    let velocityDC = 0;
    if (["MOVEBY", "MOVETHROUGH"].includes(item.system.XMLID)) {
        if (!options) {
            options = {};
        }
        options.velocity = parseInt(options?.velocity || 0);
        let divisor = 10;
        if (item.system.XMLID === "MOVETHROUGH") {
            divisor = 6;
        }
        velocityDC = Math.floor(options.velocity / divisor);
        if (velocityDC > 0) {
            dc += velocityDC;
            tags.push({ value: `${velocityDC}DC`, name: 'Velocity', title: `Velocity (${options.velocity}) / ${divisor}` })
        }
    }

    // Add in STR
    if (item.system.usesStrength) {
        let str = actor.system.characteristics.str.value

        // MOVEBY halves STR
        if (item.system.XMLID === "MOVEBY") {
            str = str / 2;
        }

        let str5 = Math.floor(str / 5)
        dc += str5
        end += Math.max(1, Math.round(str / 10))
        tags.push({ value: `${str5}DC`, name: 'STR', title: (item.system.XMLID === "MOVEBY") ? 'MoveBy is half STR' : ''  })

    }

    // Add in TK
    if (item.system.usesTk) {

        let tkItems = actor.items.filter(o => o.system.rules == "TELEKINESIS");
        let str = 0
        for (const item of tkItems) {
            str += parseInt(item.system.LEVELS.value) || 0
        }
        let str5 = Math.floor(str / 5)
        dc += str5
        end += Math.max(1, Math.round(str / 10))
        tags.push({ value: `${str5}DC`, name: 'TK' })
    }


    // Add in Haymaker to any non-maneuver attack DCV based attack
    const haymakerManeuver = item.actor.items.find(o => o.type == 'maneuver' && o.name === 'Haymaker' && o.system.active)
    if (haymakerManeuver) // && item.type != 'maneuver' && item.system.targets == 'dcv')
    {
        if (item.name == "Strike" || item.type != 'maneuver') {
            if (item.system.targets == 'dcv') {
                dc += 4;
                tags.push({ value: `4DC`, name: 'Haymaker' });
            } else {
                if (options?.isAction) ui.notifications.warn("Haymaker can only be used with attacks targeting DCV.", { localize: true });
            }
        } else {
            if (options?.isAction) ui.notifications.warn("Haymaker cannot be combined with another maneuver (except for Strike).", { localize: true });
        }

    }






    return { dc: dc, tags: tags, end: end };
}

export function convertFromDC(item, DC) {
    if (DC === 0) { return ""; }

    let output = "";
    let d6Count = 0;
    let d3Count = 0;
    let constant = 0;

    // Normal Attack
    if (!item.system.killing) {
        d6Count = Math.floor(DC)
        d3Count = DC % 1 >= 0.5 ? 1 : 0
        constant = (DC % 1 >= 0.2 && DC % 1 < 0.5) ? 1 : 0
        //return DC.toString() + "d6"; 
    } else

    // Killing Attack
    {
        d6Count = Math.floor(DC / 3)
        d3Count = Math.floor(DC % 3 / 2)
        constant = Math.floor(DC % 3 % 2)
    }

    if (d6Count !== 0) { output = addTerms(output, d6Count.toString() + "d6"); }

    if (d3Count !== 0) { output = addTerms(output, d3Count.toString() + "d3"); }

    if (constant !== 0) { output = addTerms(output, constant); }

    return output;
}

export function addTerms(term1, term2) {
    function isValid(term) {
        return (term !== "") && (term !== null)
    }

    let output = (isValid(term1)) ? term1 : "";

    if (isValid(term1) && isValid(term2)) { output += " + "; }

    if (isValid(term2)) { output += term2; }

    return output;
}


export async function handleDamageNegation(item, damageResult, options) {
    if (!options?.damageNegationValue) { return damageResult; }

    async function newDamageRoll(formula, oldDamageResult) {
        let newRoll = new HeroRoll(formula);
        await newRoll.evaluate({ async: true });

        const difference = formula.split('d')[0] - oldDamageResult.terms[0].results.length

        newRoll.terms[0].results = oldDamageResult.terms[0].results

        if (difference !== 0) {
            newRoll.terms[0].results = newRoll.terms[0].results.slice(0, difference);
        }

        let newTotal = 0
        let nextSign = "+"
        for (let term of newRoll.terms) {
            if (term instanceof OperatorTerm) {
                nextSign = term.operator
            }
            else if (term instanceof NumericTerm) {
                switch (nextSign) {
                    case ("+"): {
                        newTotal += term.number
                        break;
                    }

                    case ("-"): {
                        newTotal -= term.number
                        break;
                    }

                    default: {
                        console.warn("Uhandled Damage Negation");
                        break;
                    }
                }
            }
            else {
                // Quench tests don't necessarily specify DiceTerms
                for (let result of term.results) {
                    newTotal += result.result
                }
            }
        }

        newRoll.setTotal(newTotal);

        return newRoll;
    }

    if (!item.system.killing) {
        const formula = (damageResult.terms[0].results.length - options.damageNegationValue) + "d6"

        return await newDamageRoll(formula, damageResult)
    }

    if (options.damageNegationValue >= 3) {
        damageResult.terms[0].results = damageResult.terms[0].results.slice(0, -Math.floor(options.damageNegationValue / 3));
    }

    const remainder = options.damageNegationValue % 3

    switch (remainder) {
        case (2): {
            const formula = damageResult.terms[0].results.length - 1 + "d6 + 1"
            return await newDamageRoll(formula, damageResult)
        }

        case (1): {
            const formula = damageResult.terms[0].results.length + "d6 - 1"
            return await newDamageRoll(formula, damageResult)
        }

        case (0): {
            return await newDamageRoll(damageResult.terms[0].results.length + "d6", damageResult)
        }

        default: {
            console.warn("Uhandled Damage Negation");
            return damageResult;
        }
    }
}

export class HeroRoll extends Roll {
    setFormula(newFormula) {
        this._formula = newFormula;
    }

    setTotal(newTotal) {
        this._total = newTotal;
    }
}

export function CombatSkillLevelsForAttack(item) {
    let result = {
        ocv: 0,
        omcv: 0,
        dcv: 0,
        dmcv: 0,
        omcv: 0,
        dc: 0,
    }

    // Guard
    if (!item.actor) return result;

    let csl = item.actor.items.find(o => ["MENTAL_COMBAT_LEVELS", "COMBAT_LEVELS"].includes(o.system.XMLID) && o.system.attacks && o.system.attacks[item.id])
    if (csl && csl.system.csl) {
        for (let i = 0; i < parseInt(csl.system.LEVELS.value); i++) {
            result[csl.system.csl[i]] = (result[csl.system.csl[i]] || 0) + 1;
        }
        result.item = csl;
    }

    // Takes 2 CLS for +1 DC
    result.dc = Math.floor(result.dc / 2);

    return result;
}