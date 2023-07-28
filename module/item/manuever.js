import { HEROSYS } from "../herosystem6e.js";

export async function enforceManeuverLimits(actor, itemId, itemName) {
    const exceptions = ["Set", "Brace"]

    const maneuverItems = actor.items.filter((e) => e.type === "maneuver")

    const relevantItem = actor.items.get(itemId)

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