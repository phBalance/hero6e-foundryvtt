export function getSystemDisplayUnits(actor) {
    return actor?.system?.is5e ? '"' : "m";
}
