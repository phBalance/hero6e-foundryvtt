export function RoundFavorPlayerDown(number) {
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
    if (Math.round((number % 1) * 10) / 10 < 0.6) return Math.floor(number);
    return Math.ceil(number);
}

export function RoundFavorPlayerUp(number) {
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

export function RoundDc(number) {
    return Math.round(number * 10) / 10;
    //return number.toFixed(1);  // 10.29999 = 10.2

    // 13DC from STR
    // 1/4 Adv due to Armor Piercing
    // How may DC or Dice should we roll?
    // 10.3 === 10.2
    // 0.2 === +1 PIP
}
