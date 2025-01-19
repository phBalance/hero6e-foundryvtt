/**
 * Manuevers have some rules of their own that should be considered.
 *
 * @param {*} actor
 * @param {*} item
 */
export async function enforceManeuverLimits(actor, item) {
    // const maneuverItems = actor.items.filter((e) => ["maneuver", "martialart"].includes(e.type));

    await item.update({ "system.active": !item.system.active });

    // PH: FIXME: Not sure this is correct
    //     if (item.system.active) {
    //         if (item.name === "Block") {
    //             for (const maneuver of maneuverItems) {
    //                 if (maneuver.system.active && maneuver.name !== "Block") {
    //                     await maneuver.update({ "system.active": false });
    //                 }
    //             }
    //         } else {
    //             const block = maneuverItems.find((maneuver) => maneuver.name === "Block");
    //             if (block && block?.system?.active) {
    //                 await block.update({ "system.active": false });
    //             }
    //         }
    //     }
}
