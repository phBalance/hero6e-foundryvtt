// Rounding rules for cost calculations. We do not limit rounding to 1 because something
// may or may not be used for a cost calculation. That minimum cost is handled elsewhere.
//
// See FRed. pg 7 and 6e Vol 1 pg 12. Both require rounding to 1 decimal point.
// NOTE: Fraction rounding for advantages/limitations does not follow these rules.

// PH: FIXME: These functions assume positive numbers and don't work with negative numbers.
// PH: FIXME: The Round* functions don't follow our naming convention.

export function numberToOneDecimalPlace(number) {
    return Math.trunc(number * 10) / 10;
}

export function roundFavorPlayerDown(number) {
    // ROUND-OFFS AND MINIMUM COST
    // Whenever something in the rules requires multiplication or
    // division, handle round-offs as follows: results ending in .1 to .4
    // round down to the next whole number, results ending in .6 to
    // .9 round up to the next whole number, and results ending in .5
    // round up or down, whichever is to the advantage of the Player
    // Character. For example, when calculating the cost of a Power,
    // it’s to the character’s advantage if the Power costs fewer CP, so a
    // .5 in a cost would round down; if a Combat Maneuver halves a
    // character’s DCV, it’s to the character’s advantage for their DCV to
    // be as high as possible, so a .5 in that calculation would round
    // up.
    // const fraction = Math.floor((number % 1) * 10) / 10
    // (12 / 1.25) % 1 = 0.5999999999999996
    // if ((number % 1) < 0.6) return Math.floor(number)

    // Worked most of the time (but doesn't work for 8 / 1.75), a pre-round to 1 decimal place is likely wrong.
    //if (Math.round((number % 1) * 10) / 10 < 0.6) return Math.floor(number);
    const epsilon = 0.0001;
    if (number % 1 < 0.6 - epsilon) return Math.floor(number);
    return Math.ceil(number);
}

export function roundFavorPlayerUp(number) {
    // ROUND-OFFS AND MINIMUM COST
    // Whenever something in the rules requires multiplication or
    // division, handle round-offs as follows: results ending in .1 to .4
    // round down to the next whole number, results ending in .6 to
    // .9 round up to the next whole number, and results ending in .5
    // round up or down, whichever is to the advantage of the Player
    // Character. For example, when calculating the cost of a Power,
    // it’s to the character’s advantage if the Power costs fewer CP, so a
    // .5 in a cost would round down; if a Combat Maneuver halves a
    // character’s DCV, it’s to the character’s advantage for their DCV to
    // be as high as possible, so a .5 in that calculation would round
    // up.
    if (number % 1 < 0.5) return Math.floor(number);
    return Math.ceil(number);
}
