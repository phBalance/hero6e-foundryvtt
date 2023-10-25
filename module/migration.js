import { calcItemPoints, updateItemDescription, CalcActorRealAndActivePoints } from "./utility/upload_hdc.js"
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
                                await item.makeAttack()
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


    // if lastMigration < 3.0.35
    // Overhaul of data structure.  Raw HDC upload (all uppercase props)
    if (foundry.utils.isNewerVersion('3.0.35', lastMigration)) {
        let d = new Date()
        let queue = []

        ui.notifications.info(`Migragrating actor data 3.0.35`)
        for (const actor of game.actors.contents) {
            queue.push(actor)
        }

        for (const scene of game.scenes.contents) {
            for (const token of scene.tokens) {
                if (!token.actorLink) {
                    queue.push(token.actor)
                }
            }
        }

        while (queue.length > 0) {
            if ((new Date() - d) > 4000) {
                ui.notifications.info(`Migragrating actor data 3.0.35 (${queue.length} remaining)`)
                d = new Date()
            }
            const actor = queue.pop()
            await migrateActor_3_0_35(actor)
        }
    }

    // if lastMigration < 3.0.42
    // Overhaul of data structure.  Raw HDC upload (all uppercase props)
    if (foundry.utils.isNewerVersion('3.0.42', lastMigration)) {
        let d = new Date()
        let queue = []

        ui.notifications.info(`Migragrating actor data 3.0.42`)
        for (const actor of game.actors.contents) {
            queue.push(actor)
        }

        for (const scene of game.scenes.contents) {
            for (const token of scene.tokens) {
                if (!token.actorLink) {
                    queue.push(token.actor)
                }
            }
        }

        while (queue.length > 0) {
            if ((new Date() - d) > 4000) {
                ui.notifications.info(`Migragrating actor data 3.0.35 (${queue.length} remaining)`)
                d = new Date()
            }
            const actor = queue.pop()
            await migrateActor_3_0_42(actor)
        }
    }


    // if lastMigration < 3.0.49
    // 5e maneuvers with velocity are half of 6e
    if (foundry.utils.isNewerVersion('3.0.49', lastMigration)) {
        let d = new Date()
        let queue = []

        ui.notifications.info(`Migragrating actor data 3.0.49`)
        for (const actor of game.actors.contents) {
            queue.push(actor)
        }

        for (const scene of game.scenes.contents) {
            for (const token of scene.tokens) {
                if (!token.actorLink) {
                    queue.push(token.actor)
                }
            }
        }

        while (queue.length > 0) {
            if ((new Date() - d) > 4000) {
                ui.notifications.info(`Migragrating actor data 3.0.49 (${queue.length} remaining)`)
                d = new Date()
            }
            const actor = queue.pop()
            await migrateActor_3_0_49(actor)
        }
    }



    // Reparse all items (description, cost, etc) on every migration
    if (true) {
        let d = new Date()
        let queue = []

        ui.notifications.info(`Migragrating actor data`)
        for (const actor of game.actors.contents) {
            queue.push(actor)
        }

        for (const scene of game.scenes.contents) {
            for (const token of scene.tokens) {
                if (!token.actorLink) {
                    queue.push(token.actor)
                }
            }
        }

        while (queue.length > 0) {
            if ((new Date() - d) > 4000) {
                ui.notifications.info(`Migragrating actor data (${queue.length} remaining)`)
                d = new Date()
            }
            const actor = queue.pop()
            await migrateActorCostDescription(actor)
        }

    }
    await ui.notifications.info(`Migragtion complete.`)
}

async function migrateActorCostDescription(actor) {
    try {
        if (!actor) return false;

        if (actor.name === `Jack "Iron Shin" Daniels`)
            console.log.apply(actor.name)

        let itemsChanged = false;
        for (let item of actor.items) {

            let changes = {};

            let _oldDescription = item.system.description;
            let _oldEnd = parseInt(item.system.end || 0);
            let _oldActivePoints = item.system.activePoints

            await item._postUpload()

        }


        if (itemsChanged || !actor.system.pointsDetail) {
            const oldPointsDetail = actor.system.pointsDetail
            await actor.CalcActorRealAndActivePoints();
            if (oldPointsDetail != actor.system.pointsDetail) {
                await actor.update({
                    'system.points': actor.system.points,
                    'system.activePoints': actor.system.activePoints,
                    'system.pointsDetail': actor.system.pointsDetail,
                }, { render: false }, { hideChatMessage: true });
            }
        }


    } catch (e) {
        console.log(e);
        if (game.user.isGM && game.settings.get(game.system.id, 'alphaTesting')) {
            await ui.notifications.warn(`Migragtion failed for ${actor?.name}. Recommend re-uploading from HDC.`)
        }
    }
}


async function migrateActor_3_0_35(actor) {
    try {
        if (!actor) return
        for (let item of actor.items) {

            let changes = {};

            // LEVELS is now the raw number from HDC file and value/max are working numbers
            if (item.system.LEVELS?.value || item.system.LEVELS?.value === 0) {
                changes['system.value'] = item.system.LEVELS.value
                changes['system.max'] = item.system.LEVELS.max
                changes['system.LEVELS'] = item.system.LEVELS.max
            }

            // POWER, MODIFIER, ADDER
            if (item.system.powers) {
                for (const m of item.system.powers) {
                    if (m.modifiers) {
                        m.MODIFIER = m.modifiers
                    }
                    if (m.adders) {
                        m.ADDER = m.adders
                    }
                }
                changes['system.POWER'] = item.system.powers
            }
            if (item.system.modifiers) {
                for (const m of item.system.modifiers) {
                    if (m.modifiers) {
                        m.MODIFIER = m.modifiers
                    }
                    if (m.adders) {
                        m.ADDER = m.adders
                    }
                }
                changes['system.MODIFIER'] = item.system.modifiers
            }
            if (item.system.adders) {
                for (const m of item.system.adders) {
                    if (m.modifiers) {
                        m.MODIFIER = m.modifiers
                    }
                    if (m.adders) {
                        m.ADDER = m.adders
                    }
                }
                changes['system.ADDER'] = item.system.adders
            }

            await item.update(changes, { hideChatMessage: true })
        }
    }
    catch (e) {
        console.log(e);
        if (game.user.isGM && game.settings.get(game.system.id, 'alphaTesting')) {
            await ui.notifications.warn(`Migragtion failed for ${actor?.name}. Recommend re-uploading from HDC.`)
        }
    }
}

async function migrateActor_3_0_42(actor) {
    try {
        if (!actor) return

        for (let item of actor.items) {

            let changes = {};

            // LEVELS is now the raw number from HDC file and value/max are working numbers
            if (typeof item.system.LEVELS === "object") {
                changes['system.value'] = parseInt(item.system.LEVELS.value)
                changes['system.max'] = parseInt(item.system.LEVELS.max)
                changes['system.LEVELS'] = item.system.LEVELS.max
            }

            // POWER, MODIFIER, ADDER
            if (item.system.powers && !item.system.POWER) {
                for (const m of item.system.powers) {
                    if (m.modifiers) {
                        m.MODIFIER = m.modifiers
                    }
                    if (m.adders) {
                        m.ADDER = m.adders
                    }
                }
                changes['system.POWER'] = item.system.powers
            }
            if (item.system.modifiers && !item.system.MODIFIER) {
                for (const m of item.system.modifiers) {
                    if (m.modifiers) {
                        m.MODIFIER = m.modifiers
                    }
                    if (m.adders) {
                        m.ADDER = m.adders
                    }
                }
                changes['system.MODIFIER'] = item.system.modifiers
            }
            if (item.system.adders && !item.system.ADDER) {
                for (const m of item.system.adders) {
                    if (m.modifiers) {
                        m.MODIFIER = m.modifiers
                    }
                    if (m.adders) {
                        m.ADDER = m.adders
                    }
                }
                changes['system.ADDER'] = item.system.adders
            }

            if (changes.length > 0) {
                await item.update(changes, { hideChatMessage: true })
            }

        }
    }
    catch (e) {
        console.log(e);
        if (game.user.isGM && game.settings.get(game.system.id, 'alphaTesting')) {
            await ui.notifications.warn(`Migragtion failed for ${actor?.name}. Recommend re-uploading from HDC.`)
        }
    }
}


async function migrateActor_3_0_49(actor) {
    try {
        if (!actor) return
        if (!actor.system.is5e) return

        for (let item of actor.items.filter(o => o.type === 'maneuver')) {

            let entry = CONFIG.HERO.combatManeuvers[item.name];
            if (!entry) {
                for (let key of Object.keys(CONFIG.HERO.combatManeuvers)) {
                    if (key.toUpperCase().replace(" ", "") === item.name.toUpperCase().replace(" ", "")) {
                        entry = CONFIG.HERO.combatManeuvers[key]
                        await item.update({ 'name': key })
                        break
                    }
                }
            }
            if (entry) {
                const EFFECT = entry[3];
                let newEffect = EFFECT
                if (EFFECT.match(/v\/(\d+)/)) {
                    let divisor = EFFECT.match(/v\/(\d+)/)[1]
                    newEffect = EFFECT.replace(`v/${divisor}`, `v/${divisor / 2}`)
                }
                if (item.system.EFFECT != newEffect) {
                    await item.update({ 'system.EFFECT': newEffect })
                }
                const attack = entry[4];
                if (attack && item.system.subType != 'attack') {
                    await item.makeAttack()
                }


            } else {
                if (["Multiple Attack", "Other Attacks"].includes(item.name)) {
                    await item.delete()
                } else {
                    if (game.user.isGM && game.settings.get(game.system.id, 'alphaTesting')) {
                        await ui.notifications.warn(`Migragtion failed for ${actor?.name}. ${item.name} not recognized.`)
                    }
                }

            }
        }
    }
    catch (e) {
        console.log(e);
        if (game.user.isGM && game.settings.get(game.system.id, 'alphaTesting')) {
            await ui.notifications.warn(`Migragtion failed for ${actor?.name}. Recommend re-uploading from HDC.`)
        }
    }
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