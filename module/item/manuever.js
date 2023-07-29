import { HEROSYS } from "../herosystem6e.js";

export async function enforceManeuverLimits(actor, itemId, itemName) {
    const exceptions = ["Set", "Brace"]

    const maneuverItems = actor.items.filter((e) => e.type === "maneuver")

    const relevantItem = actor.items.get(itemId)

    await relevantItem.update({ "system.active": !relevantItem.system.active });

    if (relevantItem.system.active) {

        if (relevantItem.name === "Block" && relevantItem.system.active) {
            for (const maneuver of maneuverItems) {
                if (maneuver.system.active && maneuver.name != "Block") {
                    await maneuver.update({ "system.active": false });
                }
            }
        } else {
            let block = maneuverItems.find(o => o.name === "Block");
            if (block && block?.system?.active) {
                await block.update({ "system.active": false });
            }
        }
    }

    return;

    if (relevantItem.name.toLowerCase().includes("move") || relevantItem.name.toLowerCase().includes("dodge") || relevantItem.name.toLowerCase().includes("abort")) {
        // Manuevers with a a move step should clear all other maneuvers
        for (const maneuver of maneuverItems) {
            if (maneuver === relevantItem) {
                await maneuver.update({ "system.active": !relevantItem.system.active })
            } else {
                await maneuver.update({ "system.active": false })
            }
        }
    } else {
        // For manuevers that don't include a move step don't toggle Set or Brace
        for (const maneuver of maneuverItems) {
            if (maneuver === relevantItem) {
                await maneuver.update({ "system.active": !relevantItem.system.active })
            } else if (!exceptions.includes(maneuver.name)) {
                await maneuver.update({ "system.active": false })
            }
        }
    }
}