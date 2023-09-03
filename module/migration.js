import { calcItemPoints, updateItemDescription, CalcActorRealAndActivePoints} from "./utility/upload_hdc.js"
import { RoundFavorPlayerDown } from "./utility/round.js"

export async function migrateWorld() {
    const lastMigration = game.settings.get(game.system.id, 'lastMigration')

    // Don't bother trying to migrate an world with no actors or items
    if (game.actors.size === 0 && game.items.size === 0) return;

    // if lastMigration < 2.2.0-alpha
    if (foundry.utils.isNewerVersion('2.2.0', lastMigration)) {
        await ui.notifications.info(`Migragrating actor data 2.2.0`)
        //migrateActorTypes()
        migrateKnockback()
        migrateRemoveDuplicateDefenseMovementItems()
    }

    // if lastMigration < 3.0.0-alpha
    if (foundry.utils.isNewerVersion('3.0.0', lastMigration)) {
        await ui.notifications.info(`Migragrating actor data 3.0.0`)
        for (let actor of game.actors.contents) {
            await updateItemSubTypes(actor, true)
        }
    }

    // if lastMigration < 3.0.4
    // Remove all tranferred effects
    if (foundry.utils.isNewerVersion('3.0.4', lastMigration)) {
        await ui.notifications.info(`Migragrating actor data 3.0.4`)
        for (let actor of game.actors.contents) {
            for (let effect of actor.effects.filter(o => o.origin)) {
                await effect.delete();
            }
        }
    }

    // if lastMigration < 3.0.9
    // Charges
    if (foundry.utils.isNewerVersion('3.0.9', lastMigration)) {
        await ui.notifications.info(`Migragrating actor data 3.0.9`)
        for (let actor of game.actors.contents) {
            for (let item of actor.items.filter(o => (o.system.end || "").toString().indexOf("[") === 0)) {
                let _end = item.system.end;
                let _charges = parseInt(_end.match(/\d+/) || 0)
                if (_charges) {
                    const charges = {
                        value: _charges,
                        max: _charges,
                        recoverable: _end.indexOf("rc") > -1 ? true : false
                    }
                    await item.update({ 'system.end': 0, 'system.charges': charges })
                }
            }
        }
    }

    // if lastMigration < 3.0.15
    // Martial Arts and missing XMLID
    if (foundry.utils.isNewerVersion('3.0.15', lastMigration)) {
        await ui.notifications.info(`Migragrating actor data  3.0.15`)
        for (let actor of game.actors.contents) {
            try {

                for (let item of actor.items) {

                    let changes = {};

                    // Martial Arts
                    if (item.type === 'maneuver' && !item.system.XMLID) {

                        let entry = CONFIG.HERO.combatManeuvers[item.name];
                        //if (!entry) entry = CONFIG.HERO.combatManeuversOptional[item.name];
                        if (entry) {


                            //const name = entry[0];
                            const v = entry;
                            const PHASE = v[0];
                            const OCV = v[1];
                            const DCV = v[2];
                            const EFFECT = v[3];
                            const attack = v[4];

                            item.system = {
                                ...item.system,
                                PHASE,
                                OCV,
                                DCV,
                                EFFECT,
                                active: false,
                                description: EFFECT,
                                XMLID: item.name.toUpperCase().replace(" ", ""), // A fake XMLID
                                adders: [],
                                modifiers: [],
                                powers: [],
                            }

                            if (attack) {
                                await makeAttack(item)
                            }
                            changes['system'] = item.system;

                        }

                    }

                    // Missing XMLID
                    if (!item.system.XMLID) {
                        if (item.type === 'skill' && item.name === 'Perception') {
                            item.system.XMLID = "PERCEPTION";
                            item.system.adders ??= [];
                            item.system.modifiers ??= [];
                            item.system.powers ??= [];
                            item.system.description = "";
                            changes['system'] = item.system;
                        } else if (item.type === 'movement') {
                            item.system.XMLID = (item.system.type || item.system.class).toUpperCase();
                            changes['system.XMLID'] = item.system.XMLID;
                        } else if (item.system.rules) {
                            item.system.XMLID = item.system.rules;
                            changes['system.XMLID'] = item.system.XMLID;
                        } else if (item.type === 'attack') {
                        } else {
                            let fakeItem = { system: foundry.utils.deepClone(item.system) };
                            fakeItem.system.XMLID = item.name.toUpperCase();
                            // switch (fakeItem.system.XMLID) {
                            //     case "Combat Skill Levels": fakeItem.system.XMLID = "COMBAT_LEVELS"; break;
                            //     case "Forensic Medicine": fakeItem.system.XMLID = "FORENSIC_MEDICINE"; break;
                            //     FORENSIC_MEDICINE
                            // }
                            let configPowerInfo = getPowerInfo({ item: fakeItem })
                            if (!configPowerInfo) {
                                fakeItem.system.XMLID = fakeItem.system.XMLID.replace(/ /g, "_").replace("(", "").replace(")", "");
                                configPowerInfo = getPowerInfo({ item: fakeItem })
                            }
                            if (!configPowerInfo) {
                                fakeItem.system.XMLID = fakeItem.system.XMLID.replace("SKILL_", "");
                                configPowerInfo = getPowerInfo({ item: fakeItem })
                            }
                            if (!configPowerInfo) {
                                if (fakeItem.system.XMLID === "TF") fakeItem.system.XMLID = "TRANSPORT_FAMILIARITY";
                                if (fakeItem.system.XMLID === "WF") fakeItem.system.XMLID = "WEAPON_FAMILIARITY";
                                configPowerInfo = getPowerInfo({ item: fakeItem })
                            }
                            if (configPowerInfo && configPowerInfo.powerType.includes(item.type)) {
                                item.system.XMLID = configPowerInfo.xmlid;
                                changes['system.XMLID'] = item.system.XMLID;
                            } else {
                                // Not enough info to make a good guess
                                //console.log(item.name, fakeItem.system.XMLID, item.system);
                            }

                        }
                    }

                    if (Object.keys(changes).length > 0) {
                        await item.update(changes, { hideChatMessage: true })
                    }
                }

            } catch (e) {
                console.log(e);
            }

        }
    }

    // Fix any invalid actor types
    for (let invalidId of game.actors.invalidDocumentIds) {
        let invalidActor = game.actors.getInvalid(invalidId);

        const validType = Actor.TYPES.filter(o => o != 'character' && o != 'base').map(o => o.replace("2", ""));


        if (!validType.includes(invalidActor.type)) {
            await invalidActor.update({ type: "npc" });
            await ui.notifications.error(`${invalidActor.name} had an invalid actor type.  It was changed to 'npc'.  Reload world to access token.`);
        }
    }


    // Reparse all items (description, cost, etc) on every migration


    if (true) {
        await ui.notifications.info(`Migragrating actor data (Updating costs, END, and descriptions)`)
        for (let actor of game.actors.contents) {
            try {
                let itemsChanged = false;
                for (let item of actor.items) {
                        let changes = {};

                    // Calculate RealCost, ActivePoints, and END
                    if (await calcItemPoints(item)) {
                        if (parseInt(item.system.activePoints) > 0) { // Some items like Perception have NaN for cost (TODO: fix)
                            changes['system.basePointsPlusAdders'] = RoundFavorPlayerDown(item.system.basePointsPlusAdders);
                            changes['system.activePoints'] = RoundFavorPlayerDown(item.system.activePoints);
                            changes['system.realCost'] = item.system.realCost;
                        }
                    }

                    if (parseInt(item.system.activePoints) > 0) {
                        let _oldDescription = item.system.description;
                        let _oldEnd = parseInt(item.system.end || 0);
                        updateItemDescription(item);
                        if (_oldDescription != item.system.description) {
                            changes['system.description'] = item.system.description;
                        }
                        if (_oldEnd != parseInt(item.system.end)) {
                            changes['system.end'] = item.system.end;
                        }
                    }

                    if (Object.keys(changes).length > 0) {
                        await item.update(changes, { hideChatMessage: true })
                        itemsChanged = true;
                    }
                }

                if (itemsChanged) {
                    await CalcActorRealAndActivePoints(actor);
                }


            } catch (e) {
                console.log(e);
            }

        }
        
    }
    await ui.notifications.info(`Migragtion complete.`)
}

async function migrateRemoveDuplicateDefenseMovementItems() {

    ui.notifications.info(`Migragrating actor data.`)

    let count = 0
    for (let actor of game.actors.contents) {
        if (await migrateActorDefenseMovementData(actor)) count++
    }

    ui.notifications.info(`${count} actors migrated.`)

}

async function migrateActorDefenseMovementData(actor) {
    let itemsToDelete = []

    // Place a migrationTag in the actor with today's date.
    // This allows us to skip this migration in the future.
    // Specifically it allows custom defenses to be manually added
    // without deleting it eveytime world loads.
    //if (actor.system.migrationTag != migrationTag) {
    for (let item of actor.items.filter(o => o.type == 'defense' || o.type == 'movement')) {

        // Try not to delete items that have been manually created.
        // We can make an educated guess by looking for XMLID
        if (item.system.xmlid || item.system.XMLID || item.system.rules == "COMBAT_LUCK" || item.type == 'movement') {
            itemsToDelete.push(item.id)
        }
    }

    // Apply AE to movement items
    let itemsToCreate = []
    for (let item of actor.items) {
        const configPowerInfo = getPowerInfo({ item: item })
        if (configPowerInfo && configPowerInfo.powerType.includes("movement")) {

            // You can't just add AE to items owned by actor. A flaw in Foundry v10.
            // So we will create a new item with proper AE, then delete the old item.
            let itemData = item.toJSON()
            itemData.system.active = true
            createEffects(itemData, actor)
            itemsToCreate.push(itemData)
            itemsToDelete.push(item.id)
        }
    }

    await actor.deleteEmbeddedDocuments("Item", itemsToDelete)
    await HeroSystem6eItem.create(itemsToCreate, { parent: actor })

    return (itemsToDelete.length > 0)
}


// Change Attack knockback to knockbackMultiplier
async function migrateKnockback() {
    let updates = [];
    for (let actor of game.actors) {
        for (let item of actor.items) {
            if (item.type === 'attack') {
                if (item.system.knockback && parseInt(item.system.knockbackMultiplier) == 0) {
                    updates.push({ _id: item.id, system: { knockbackMultiplier: 1, knockback: null } });
                }
            }
        }
        if (updates.length > 0) {
            await Item.updateDocuments(updates, { parent: actor });
            ui.notifications.info(`${updates.length} attacks migrated for ${actor.name}.`)
            updates = []
        }
    }

}