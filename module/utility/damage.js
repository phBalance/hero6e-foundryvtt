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

function addTerms(term1, term2) {
    let output = (term1 !== "")? term1 : "";

    if (term1 !== "" && term2 !== "") { output += " + "; }

    if (term2 !== "") { output += term2; }

    return output;
}