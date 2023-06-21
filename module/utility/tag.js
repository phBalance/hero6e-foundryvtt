import { HEROSYS } from "../herosystem6e.js";

export function damageRollToTag(damageRoll) {
    return damageRoll.replace("1d3", "½");
}