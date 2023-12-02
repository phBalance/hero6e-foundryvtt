export async function enforceManeuverLimits(actor, itemId) {
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
}