import { HEROSYS } from "../herosystem6e.js";

export function AdjustmentSources(actor) {
    const characteristics = actor.system.is5e ? CONFIG.HERO.characteristics5e : CONFIG.HERO.characteristics

    let choices = {}
    //let choices = {"Choice A": "a", "Choice B": "b"};

    for (const key in characteristics) {
        choices[key.toUpperCase()] = key.toUpperCase();
    }

    // let aidSources = []
    // for (const key in actor.system.characteristics) {
    //     if (actor.system.characteristics[key].hasOwnProperty('value')) {
    //         aidSources.push(key.toUpperCase())
    //     }
    // }
    // aidSources.sort()
    // aidSources = ["none", ...aidSources]
    // data.aidSources = {}
    // for (let key of aidSources) {
    //     data.aidSources[key] = key
    //     }

    choices.sort( a, b => a.localcompare
    return choices;
}