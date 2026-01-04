// Rounding rules for cost calculations. We do not limit rounding to 1 because something
// may or may not be used for a cost calculation. That minimum cost is handled elsewhere.
//
// Whenever something in the rules requires multiplication or
// division, handle round-offs as follows: results ending in .1 to .4
// round down to the next whole number, results ending in .6 to
// .9 round up to the next whole number, and results ending in .5
// round up or down, whichever is to the advantage of the Player Character.
//
// See FRed. pg 7 and 6e Vol 1 pg 12. Both require rounding to 1 decimal point.
// NOTE: Fraction rounding for advantages/limitations does not follow these rules.

// PH: FIXME: These functions assume positive numbers and don't work with negative numbers.

export function numberToOneDecimalPlace(number) {
    return truncatedNumber10TimesLarger(number) / 10;
}

function truncatedNumber10TimesLarger(number) {
    return Math.trunc(number * 10);
}

/**
 * Truncate number to 1 decimal place and then round towards 0 if the decimal is 0.0 to 0.5 or awway if 0.6 - 0.9.
 *
 * @param {number} number
 * @returns number
 */
export function roundFavorPlayerTowardsZero(number) {
    // Since we only work with 1 decimal place, we'll try to avoid floating point comparisons
    // by working with a number that is 10 times larger. The hero system never works with numbers
    // that are large enough that we have to worry about overflowing.
    const adjustedNumber10TimesLarger = truncatedNumber10TimesLarger(number);
    const decimalPart = adjustedNumber10TimesLarger % 10;

    // Round towards 0
    if (decimalPart <= 5) {
        return Math.trunc(adjustedNumber10TimesLarger / 10);
    }

    // Round away from 0
    return Math.round(adjustedNumber10TimesLarger / 10);
}

/**
 * Truncate number to 1 decimal place and then round towards 0 if the decimal is 0.0 to 0.4 or away if 0.5 - 0.9.
 *
 * @param {number} number
 * @returns number
 */
export function roundFavorPlayerAwayFromZero(number) {
    // Since we only work with 1 decimal place, we'll try to avoid floating point comparisons
    // by working with a number that is 10 times larger. The hero system never works with numbers
    // that are large enough that we have to worry about overflowing.
    const adjustedNumber10TimesLarger = truncatedNumber10TimesLarger(number);
    const decimalPart = adjustedNumber10TimesLarger % 10;

    // Round towards 0
    if (decimalPart <= 4) {
        return Math.trunc(adjustedNumber10TimesLarger / 10);
    }

    // Round away from 0
    return Math.round(adjustedNumber10TimesLarger / 10);
}
