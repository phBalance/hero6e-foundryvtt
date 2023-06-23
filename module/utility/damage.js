import { HERO } from "../config.js";
import { HEROSYS } from "../herosystem6e.js";

export function determineStrengthDamage(item, effectiveStr) {
    if (!item.system.usesStrength && !item.system.usesTk) { return null; }

    const strDamage = Math.floor(Math.max(0, parseInt(effectiveStr)) / 5) || 0;

    if (strDamage === 0) { return null; }

    if (!item.system.killing) {
        return strDamage.toString() + "d6";
    }

    const strDice = Math.floor(strDamage / 3);

    const pip = strDamage % 3
    
    let strTag = (strDice > 0 )? strDice + "d6" : ""; 

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

        if(diceType == '6') {
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

    if (d6Count !== 0) { output = addTerms(output, d6Count.toString()  + "d6"); }

    if (d3Count !== 0) { output = addTerms(output, d3Count.toString() + "d3"); }

    if (constant !== 0) { output = addTerms(output, constant); }

    return output;
}

export function convertToDC(item, formula) {
    const [d6Count, d3Count, constant] = getNumberOfEachDice(formula);

    if (!item.system.killing) { return d6Count; }

    const pip = (constant > 0)? 1 : 0

    return parseInt(3 * d6Count + 2 * d3Count + pip || 0)
}

export function convertFromDC(item, DC) {
    if (DC === 0) { return ""; }

    if (!item.system.killing) { return DC.toString() + "d6"; }

    const d6Count = Math.floor(DC / 3)
    const d3Count = Math.floor(DC % 3 / 2)
    const constant = Math.floor(DC % 3 % 2)

    let output = "";

    if (d6Count !== 0) { output = addTerms(output, d6Count.toString()  + "d6"); }

    if (d3Count !== 0) { output = addTerms(output, d3Count.toString() + "d3"); }

    if (constant !== 0) { output = addTerms(output, constant); }

    return output;
}

export function addTerms(term1, term2) {
    function isValid(term) {
        return (term !== "") && (term !== null)
    }

    let output = (isValid(term1))? term1 : "";

    if (isValid(term1) && isValid(term2)) { output += " + "; }

    if (isValid(term2)) { output += term2; }

    return output;
}


export async function handleDamageNegation(item, damageResult, options) {
    if (!options?.damageNegationValue) { return damageResult; }

    let fullDiceDr = (item.system.killing)? Math.floor(options.damageNegationValue / 3) :
        options.damageNegationValue

    let pipDr = (item.system.killing)? options.damageNegationValue % 3 : 0

    // Remove full dice
    for (let i = 0; i < fullDiceDr; i++) {
        // terms[0] are the full d6 dice
        if (damageResult.terms[0].results.length > 0) {
            // remove 1st dice
            damageResult.terms[0].results = damageResult.terms[0].results.slice(1)
        }
        else {
            pipDr += 3
        }
    }

    // Remove pipDr
    for (let i = 0; i < pipDr; i++) {
        // full dice are at terms[0]
        // plus operator is terms[1]
        // pips are at terms [2]

        // Convert full dice to a pip
        if (damageResult.terms[0].results.length > 0 && damageResult.terms.length == 1) {
            let _fullDice = damageResult.terms[0].results[0]
            _fullDice.results = Math.ceil(_fullDice.result / 2) // convert to half dice (2 pips)
            damageResult.terms[0].results = damageResult.terms[0].results.slice(1)
            damageResult.terms.push(new OperatorTerm({ operator: "+" }));
            let _halfDie = new Die({ number: _fullDice.results, faces: 3 })
            damageResult.terms.push(_halfDie)
            continue
        }

        // Convert half dice to +1
        if (damageResult.terms.length == 3 && damageResult.terms[2] instanceof Die) {
            damageResult.terms[2] = new NumericTerm({ number: 1 });
            continue
        }

        console.warn("Uhandled Damage Negation")
    }

    return damageResult
}