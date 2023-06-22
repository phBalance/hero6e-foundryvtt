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

export function simplifyDamageRoll(damageRoll) {
    // Extract all occurrences of <NUMBER>d6 and <NUMBER>d3
    const matches = damageRoll.match(/\d+d6|\d+d3/g) || null;

    if (!matches) { return ""; }

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

    if (d3Count === 0) {
        return d6Count.toString()  + "d6";
    }

    if (d6Count === 0) {
        return  d3Count.toString() + "d3";
    }

    return d6Count.toString() + "d6 + " + d3Count.toString() + "d3";
}