import { HeroSystem6eItem } from "./item/item.mjs";
import { determineCostPerActivePoint } from "./utility/adjustment.mjs";
import { RoundFavorPlayerUp } from "./utility/round.mjs";
import { HeroProgressBar } from "./utility/progress-bar.mjs";
import { HeroSystem6eActor } from "./actor/actor.mjs";

function getAllActorsInGame() {
    return [
        ...game.actors.contents,
        ...game.scenes.contents
            .map((scene) => scene.tokens)
            .map((token) => token.actorLink)
            .filter((actorLink) => actorLink),
    ];
}

let skippedBecauseOld = 0;

async function migrateToVersion(
    migratesToVersion,
    lastMigration,
    queue,
    queueType,
    asyncFn,
) {
    if (
        !lastMigration ||
        foundry.utils.isNewerVersion(migratesToVersion, lastMigration)
    ) {
        const originalTotal = queue.length;
        const migrationProgressBar = new HeroProgressBar(
            `Migrating ${originalTotal} ${queueType} to ${migratesToVersion}`,
            originalTotal + 1,
        );

        while (queue.length > 0) {
            const queueElement = queue.pop();

            migrationProgressBar.advance(
                `Migrating ${queueType} ${
                    originalTotal - queue.length
                } of ${originalTotal} to ${migratesToVersion}`,
            );

            // Skip super old actors without versionHeroSystem6eUpload
            if (queueElement instanceof HeroSystem6eActor) {
                if (!queueElement.system?.versionHeroSystem6eUpload) {
                    skippedBecauseOld++;

                    if (skippedBecauseOld < 3) {
                        ui.notifications.warn(
                            `The Actor "${queueElement.name}" was uploaded with an older HeroSystem version and is no longer supported.  Please re-upload from HDC.`,
                        );
                    } else {
                        if (skippedBecauseOld === 3) {
                            ui.notifications.warn(
                                `Several additional actors are no longer supported.  Please re-upload them from their HDCs.`,
                            );
                        }
                        console.warn(
                            `The Actor "${queueElement.name}" was uploaded with an older HeroSystem version and is no longer supported.  Please re-upload from HDC.`,
                        );
                    }
                    continue;
                }
            }

            await asyncFn(queueElement);
        }

        migrationProgressBar.close(
            `Done migrating ${originalTotal} ${queueType} to ${migratesToVersion}`,
        );
    }
}

export async function migrateWorld() {
    const lastMigration = game.settings.get(game.system.id, "lastMigration");

    // Don't bother trying to migrate an world with no actors or items
    if (game.actors.size === 0 && game.items.size === 0) return;

    // if lastMigration < 2.2.0-alpha
    if (foundry.utils.isNewerVersion("2.2.0", lastMigration)) {
        await ui.notifications.info(`Migrating actor data 2.2.0`);
        //migrateActorTypes()
        migrateKnockback();
        migrateRemoveDuplicateDefenseMovementItems();
    }

    // if lastMigration < 3.0.0-alpha
    if (foundry.utils.isNewerVersion("3.0.0", lastMigration)) {
        await ui.notifications.info(`Migrating actor data 3.0.0`);
        for (let actor of game.actors.contents) {
            await migrationOnlyUpdateItemSubTypes(actor, true);
        }
    }

    // if lastMigration < 3.0.4
    // Remove all transferred effects
    if (foundry.utils.isNewerVersion("3.0.4", lastMigration)) {
        await ui.notifications.info(`Migrating actor data 3.0.4`);
        for (let actor of game.actors.contents) {
            for (let effect of actor.effects.filter((o) => o.origin)) {
                await effect.delete();
            }
        }
    }

    // if lastMigration < 3.0.9
    // Charges
    if (foundry.utils.isNewerVersion("3.0.9", lastMigration)) {
        await ui.notifications.info(`Migrating actor data 3.0.9`);
        for (let actor of game.actors.contents) {
            for (let item of actor.items.filter(
                (o) => (o.system.end || "").toString().indexOf("[") === 0,
            )) {
                let _end = item.system.end;
                let _charges = parseInt(_end.match(/\d+/) || 0);
                if (_charges) {
                    const charges = {
                        value: _charges,
                        max: _charges,
                        recoverable: _end.indexOf("rc") > -1 ? true : false,
                    };
                    await item.update({
                        "system.end": 0,
                        "system.charges": charges,
                    });
                }
            }
        }
    }

    // if lastMigration < 3.0.15
    // Martial Arts and missing XMLID
    if (foundry.utils.isNewerVersion("3.0.15", lastMigration)) {
        await ui.notifications.info(`Migrating actor data  3.0.15`);
        for (let actor of game.actors.contents) {
            try {
                for (let item of actor.items) {
                    let changes = {};

                    // Martial Arts
                    if (item.type === "maneuver" && !item.system.XMLID) {
                        let entry = migrationOnly_combatManeuvers[item.name];
                        if (entry) {
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
                            };

                            if (attack) {
                                await item.makeAttack();
                            }
                            changes["system"] = item.system;
                        }
                    }

                    // Missing XMLID
                    if (!item.system.XMLID) {
                        if (
                            item.type === "skill" &&
                            item.name === "Perception"
                        ) {
                            item.system.XMLID = "PERCEPTION";
                            item.system.adders ??= [];
                            item.system.modifiers ??= [];
                            item.system.powers ??= [];
                            item.system.description = "";
                            changes["system"] = item.system;
                        } else if (item.type === "movement") {
                            item.system.XMLID = (
                                item.system.type || item.system.class
                            ).toUpperCase();
                            changes["system.XMLID"] = item.system.XMLID;
                        } else if (item.system.rules) {
                            item.system.XMLID = item.system.rules;
                            changes["system.XMLID"] = item.system.XMLID;
                        } else if (item.type === "attack") {
                            // Has been empty for quite some time. Presumably nothing to migrate
                            // and want to intentionally do nothing.
                        } else {
                            let fakeItem = {
                                system: foundry.utils.deepClone(item.system),
                            };
                            fakeItem.system.XMLID = item.name.toUpperCase();
                            let configPowerInfo =
                                migrationOnly_Pre3_0_61_getPowerInfo({
                                    item: fakeItem,
                                });
                            if (!configPowerInfo) {
                                fakeItem.system.XMLID =
                                    fakeItem.system.XMLID.replace(/ /g, "_")
                                        .replace("(", "")
                                        .replace(")", "");
                                configPowerInfo =
                                    migrationOnly_Pre3_0_61_getPowerInfo({
                                        item: fakeItem,
                                    });
                            }
                            if (!configPowerInfo) {
                                fakeItem.system.XMLID =
                                    fakeItem.system.XMLID.replace("SKILL_", "");
                                configPowerInfo =
                                    migrationOnly_Pre3_0_61_getPowerInfo({
                                        item: fakeItem,
                                    });
                            }
                            if (!configPowerInfo) {
                                if (fakeItem.system.XMLID === "TF")
                                    fakeItem.system.XMLID =
                                        "TRANSPORT_FAMILIARITY";
                                if (fakeItem.system.XMLID === "WF")
                                    fakeItem.system.XMLID =
                                        "WEAPON_FAMILIARITY";
                                configPowerInfo =
                                    migrationOnly_Pre3_0_61_getPowerInfo({
                                        item: fakeItem,
                                    });
                            }
                            if (
                                configPowerInfo &&
                                configPowerInfo.powerType.includes(item.type)
                            ) {
                                item.system.XMLID = configPowerInfo.xmlid;
                                changes["system.XMLID"] = item.system.XMLID;
                            } else {
                                // Not enough info to make a good guess
                                //console.log(item.name, fakeItem.system.XMLID, item.system);
                            }
                        }
                    }

                    if (Object.keys(changes).length > 0) {
                        await item.update(changes, { hideChatMessage: true });
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
    }

    // Fix any invalid actor types
    for (let invalidId of game.actors.invalidDocumentIds) {
        let invalidActor = game.actors.getInvalid(invalidId);

        const validType = Actor.TYPES.filter(
            (o) => o != "character" && o != "base",
        ).map((o) => o.replace("2", ""));

        if (!validType.includes(invalidActor.type)) {
            await invalidActor.update({ type: "npc" });
            await ui.notifications.error(
                `${invalidActor.name} had an invalid actor type.  It was changed to 'npc'.  Reload world to access token.`,
            );
        }
    }

    // if lastMigration < 3.0.35
    // Overhaul of data structure.  Raw HDC upload (all uppercase props)
    if (foundry.utils.isNewerVersion("3.0.35", lastMigration)) {
        let d = new Date();
        let queue = [];

        ui.notifications.info(`Migrating actor data 3.0.35`);
        for (const actor of game.actors.contents) {
            queue.push(actor);
        }

        for (const scene of game.scenes.contents) {
            for (const token of scene.tokens) {
                if (!token.actorLink) {
                    queue.push(token.actor);
                }
            }
        }

        while (queue.length > 0) {
            if (new Date() - d > 4000) {
                ui.notifications.info(
                    `Migrating actor data 3.0.35 (${queue.length} remaining)`,
                );
                d = new Date();
            }
            const actor = queue.pop();
            await migrateActor_3_0_35(actor);
        }
    }

    // if lastMigration < 3.0.42
    // Overhaul of data structure.  Raw HDC upload (all uppercase props)
    if (foundry.utils.isNewerVersion("3.0.42", lastMigration)) {
        let d = new Date();
        let queue = [];

        ui.notifications.info(`Migrating actor data 3.0.42`);
        for (const actor of game.actors.contents) {
            queue.push(actor);
        }

        for (const scene of game.scenes.contents) {
            for (const token of scene.tokens) {
                if (!token.actorLink) {
                    queue.push(token.actor);
                }
            }
        }

        while (queue.length > 0) {
            if (new Date() - d > 4000) {
                ui.notifications.info(
                    `Migrating actor data 3.0.35 (${queue.length} remaining)`,
                );
                d = new Date();
            }
            const actor = queue.pop();
            await migrateActor_3_0_42(actor);
        }
    }

    // if lastMigration < 3.0.49
    // 5e maneuvers with velocity are half of 6e
    if (foundry.utils.isNewerVersion("3.0.49", lastMigration)) {
        let d = new Date();
        let queue = [];

        ui.notifications.info(`Migrating actor data 3.0.49`);
        for (const actor of game.actors.contents) {
            queue.push(actor);
        }

        for (const scene of game.scenes.contents) {
            for (const token of scene.tokens) {
                if (!token.actorLink) {
                    queue.push(token.actor);
                }
            }
        }

        while (queue.length > 0) {
            if (new Date() - d > 4000) {
                ui.notifications.info(
                    `Migrating actor data 3.0.49 (${queue.length} remaining)`,
                );
                d = new Date();
            }
            const actor = queue.pop();
            await migrateActor_3_0_49(actor);
        }
    }

    // if lastMigration < 3.0.53
    // Default bar3 to TRUE for existing worlds
    // All item's system.characteristic replaced with system.CHARACTERISTIC
    if (foundry.utils.isNewerVersion("3.0.53", lastMigration)) {
        if (!game.settings.get(game.system.id, "bar3")) {
            game.settings.set(game.system.id, "bar3", true);
            // Refresh tokens to make sure they show the 3rd bar
            for (const token of game.scenes.current?.tokens || []) {
                token.object.refresh();
            }
        }

        const queue = getAllActorsInGame();
        let dateNow = new Date();

        for (const [index, actor] of queue.entries()) {
            if (new Date() - dateNow > 4000) {
                ui.notifications.info(
                    `Migrating actor's items to 3.0.53: (${
                        queue.length - index
                    } actors remaining)`,
                );
                dateNow = new Date();
            }

            await migrate_actor_items_to_3_0_53(actor);
        }
    }

    // if lastMigration < 3.0.54
    // Update item.system.class from specific adjustment powers to the general adjustment
    // Active Effects for adjustments changed format
    if (foundry.utils.isNewerVersion("3.0.54", lastMigration)) {
        const queue = getAllActorsInGame();
        let dateNow = new Date();

        for (const [index, actor] of queue.entries()) {
            if (new Date() - dateNow > 4000) {
                ui.notifications.info(
                    `Migrating actor's items and active effects to 3.0.54: (${
                        queue.length - index
                    } actors remaining)`,
                );
                dateNow = new Date();
            }

            await migrate_actor_items_to_3_0_54(actor);
            await migrate_actor_active_effects_to_3_0_54(actor);
        }
    }

    // if lastMigration < 3.0.59
    // Active Effects for adjustments changed format
    // d6-1 and 1/2d6 are now distinctly different extra dice
    if (foundry.utils.isNewerVersion("3.0.59", lastMigration)) {
        const queue = getAllActorsInGame();
        let dateNow = new Date();

        for (const [index, actor] of queue.entries()) {
            if (new Date() - dateNow > 4000) {
                ui.notifications.info(
                    `Migrating actor's active effects to 3.0.59: (${
                        queue.length - index
                    } actors remaining)`,
                );
                dateNow = new Date();
            }

            await migrate_actor_active_effects_to_3_0_59(actor);
            await migrate_actor_items_to_3_0_59(actor);
        }
    }

    // if lastMigration < 3.0.62
    // Correct maneuvers for 5e and 6e.
    await migrateToVersion(
        "3.0.62",
        lastMigration,
        getAllActorsInGame(),
        "actors' maneuvers",
        async (actor) => await migrate_actor_maneuvers_to_3_0_62(actor),
    );

    // if lastMigration < 3.0.63
    // move to new item.system.range values
    await migrateToVersion(
        "3.0.63",
        lastMigration,
        getAllActorsInGame(),
        "actors' items' range",
        async (actor) => await migrate_actor_items_to_3_0_63(actor),
    );

    // Reparse all items (description, cost, etc) on every migration
    await migrateToVersion(
        game.system.version,
        undefined,
        getAllActorsInGame(),
        "actors' items' cost and description",
        async (actor) => await migrateActorCostDescription(actor),
    );

    await ui.notifications.info(`Migration complete to ${game.system.version}`);
}

async function migrateActorCostDescription(actor) {
    try {
        if (!actor) return false;

        let itemsChanged = false;
        for (let item of actor.items) {
            await item._postUpload();
        }

        if (itemsChanged || !actor.system.pointsDetail) {
            const oldPointsDetail = actor.system.pointsDetail;
            await actor.CalcActorRealAndActivePoints();
            if (oldPointsDetail != actor.system.pointsDetail) {
                await actor.update(
                    {
                        "system.points": actor.system.points,
                        "system.activePoints": actor.system.activePoints,
                        "system.pointsDetail": actor.system.pointsDetail,
                    },
                    { render: false },
                    { hideChatMessage: true },
                );
            }
        }
    } catch (e) {
        console.log(e);
        if (
            game.user.isGM &&
            game.settings.get(game.system.id, "alphaTesting")
        ) {
            await ui.notifications.warn(
                `Migration failed for ${actor?.name}. Recommend re-uploading from HDC.`,
            );
        }
    }
}

/**
 * items now have an item.system.range property
 * @param {Object} actor
 */
async function migrate_actor_items_to_3_0_63(actor) {
    for (const item of actor.items) {
        const configPowerInfo = migrationOnly_Pre_XXX_getPowerInfo({
            item: item,
        });
        if (configPowerInfo) {
            item.system.range = configPowerInfo.range;
        } else {
            continue;
        }

        const noRange = item.findModsByXmlid("NORANGE");
        const limitedRange = item.findModsByXmlid("LIMITEDRANGE");
        const rangeBasedOnStrength = item.findModsByXmlid("RANGEBASEDONSTR");
        const los = item.findModsByXmlid("LOS");
        const normalRange = item.findModsByXmlid("NORMALRANGE");
        const noRangeModifiers = item.findModsByXmlid("NORANGEMODIFIER");
        const usableOnOthers = item.findModsByXmlid("UOO");

        // Based on EGO combat value gets line of sight by default
        const boecv = item.findModsByXmlid("BOECV");
        if (boecv) {
            item.system.range = "los";
        }

        // Self only powers cannot be bought to have range unless they become usable on others at which point
        // they gain no range.
        if (item.system.range === "self") {
            if (usableOnOthers) {
                item.system.range = "no range";
            }
        }

        // No range can be bought to have range.
        if (item.system.range === "no range") {
            const ranged = item.findModsByXmlid("RANGED");
            if (ranged) {
                item.system.range = "standard";
            }
        }

        // Standard range can be bought up or bought down.
        if (item.system.range === "standard") {
            if (noRange) {
                item.system.range = "no range";
            } else if (los) {
                item.system.range = "los";
            } else if (limitedRange) {
                item.system.range = "limited range";
            } else if (rangeBasedOnStrength) {
                item.system.range = "range based on str";
            } else if (noRangeModifiers) {
                item.system.range = "no range modifiers";
            }
        }

        // Line of sight can be bought down
        if (item.system.range === "los") {
            if (normalRange) {
                item.system.range = "limited normal range";
            } else if (rangeBasedOnStrength) {
                item.system.range = "range based on str";
            } else if (noRange) {
                item.system.range = "no range";
            }
        }

        await item.update({
            "system.range": item.system.range,
        });
    }
}

async function migrate_actor_maneuvers_to_3_0_62(actor) {
    // Delete a previous maneuvers then add all maneuvers again for the system version for this actor.
    const deletePromises = actor.items
        .filter((item) => item.type === "maneuver")
        .map(async (maneuver) => {
            return maneuver.delete();
        });
    await Promise.all(deletePromises);

    // Add all maneuvers for this actor's system version.
    const powerList = actor.system.is5e
        ? CONFIG.HERO.powers5e
        : CONFIG.HERO.powers6e;

    powerList
        .filter((power) => power.type.includes("maneuver"))
        .forEach(async (maneuver) => {
            const name = maneuver.name;
            const XMLID = maneuver.key;

            const maneuverDetails = maneuver.maneuverDesc;
            const PHASE = maneuverDetails.phase;
            const OCV = maneuverDetails.ocv;
            const DCV = maneuverDetails.dcv;
            const EFFECT = maneuverDetails.effects;

            const itemData = {
                name,
                type: "maneuver",
                system: {
                    PHASE,
                    OCV,
                    DCV,
                    EFFECT,
                    active: false, // TODO: This is probably not always true. It should, however, be generated in other means.
                    description: EFFECT,
                    XMLID,
                },
            };

            // Skip if temporary actor (Quench)
            if (actor.id) {
                const item = await HeroSystem6eItem.create(itemData, {
                    parent: actor,
                });
                if (maneuverDetails.attack) {
                    await item.makeAttack();
                }
                await item._postUpload();
            }
        });
}

// 1/2 d6 and 1d6-1 are not the same roll but are the same DC - make them distinct
async function migrate_actor_items_to_3_0_59(actor) {
    for (const item of actor.items) {
        let newValue;
        if (item.findModsByXmlid("PLUSONEHALFDIE")) {
            newValue = "half";
        } else if (item.findModsByXmlid("MINUSONEPIP")) {
            // +1d6-1 is equal to +1/2 d6 DC-wise but is uncommon.
            newValue = "one-pip";
        }

        if (item.system.extraDice && newValue) {
            await item.update({
                "system.extraDice": newValue,
            });
        }
    }
}

async function migrate_actor_active_effects_to_3_0_59(actor) {
    for (const activeEffect of actor.temporaryEffects) {
        if (
            activeEffect.flags?.type === "adjustment" &&
            activeEffect.flags.version === 2
        ) {
            const newFormatAdjustmentActiveEffect =
                foundry.utils.deepClone(activeEffect);

            // Rename property.
            newFormatAdjustmentActiveEffect.flags.adjustmentActivePoints =
                activeEffect.flags.activePoints;
            delete newFormatAdjustmentActiveEffect.flags.activePoints;

            // New property
            let activePointsThatShouldBeAffected = 0;
            const nameMatch = newFormatAdjustmentActiveEffect.name.match(
                /^.+ ([0-9]+) .+ \([0-9]+ AP\) \[.*\]/,
            );
            if (nameMatch) {
                activePointsThatShouldBeAffected =
                    parseInt(nameMatch[1]) *
                    Math.sign(
                        newFormatAdjustmentActiveEffect.flags
                            .adjustmentActivePoints,
                    );
            }

            newFormatAdjustmentActiveEffect.flags.affectedPoints =
                activePointsThatShouldBeAffected;

            // Delete old active effect and create the new one
            await activeEffect.delete();
            await actor.addActiveEffect(newFormatAdjustmentActiveEffect);
        }
    }
}

async function migrate_actor_active_effects_to_3_0_54(actor) {
    for (const activeEffect of actor.temporaryEffects) {
        // Is it possibly an old style adjustment effect?
        if (activeEffect.changes.length > 0 && activeEffect.flags.target) {
            const origin = await fromUuid(activeEffect.origin);
            const item = origin instanceof HeroSystem6eItem ? origin : null;

            const powerInfo = migrationOnly_Pre3_0_61_getPowerInfo({
                actor: actor,
                xmlid: activeEffect.flags?.XMLID,
                item: item,
            });

            // Confirm the power associated with is an adjustment power type
            if (!powerInfo || !powerInfo.powerType.includes("adjustment")) {
                continue;
            }

            // Make sure it's not a new style adjustment active effect already (just a dev possibility)
            if (activeEffect.flags.type === "adjustment") {
                continue;
            }

            const presentAdjustmentActiveEffect = activeEffect;
            const potentialCharacteristic =
                presentAdjustmentActiveEffect.flags.keyX;

            const costPerActivePoint = determineCostPerActivePoint(
                potentialCharacteristic,
                null, // TODO: Correct, as we don't support powers right now?
                actor,
            );
            const activePointsThatShouldBeAffected = Math.trunc(
                presentAdjustmentActiveEffect.flags.activePoints /
                    costPerActivePoint,
            );

            // The new format differentiates between beneficial adjustments as negative activePoints whereas
            // the old format considers this value to always be >= 0.
            const activePoints =
                activeEffect.flags.XMLID === "ABSORPTION" ||
                activeEffect.flags.XMLID === "AID" ||
                activeEffect.flags.XMLID === "HEALING" ||
                (activeEffect.flags.XMLID === "TRANSFER" &&
                    activeEffect.flags.target ===
                        presentAdjustmentActiveEffect.flags.keyY)
                    ? -presentAdjustmentActiveEffect.flags.activePoints
                    : presentAdjustmentActiveEffect.flags.activePoints;

            const newFormatAdjustmentActiveEffect = {
                name: `${presentAdjustmentActiveEffect.flags.XMLID} ${Math.abs(
                    activePointsThatShouldBeAffected,
                )} ${presentAdjustmentActiveEffect.flags.target.toUpperCase()} (${Math.abs(
                    presentAdjustmentActiveEffect.flags.activePoints,
                )} AP) [by ${presentAdjustmentActiveEffect.flags.source}]`,
                id: presentAdjustmentActiveEffect.id, // No change
                icon: presentAdjustmentActiveEffect.icon, // No change
                changes: presentAdjustmentActiveEffect.changes, // No change but for 5e there may be additional indices (see below)
                duration: presentAdjustmentActiveEffect.duration, // No change even though it might be wrong for transfer it's too complicated to try to figure it out
                flags: {
                    type: "adjustment", // New
                    version: 2, // New

                    activePoints: activePoints, // Differentiate between negative and positive adjustments
                    XMLID: presentAdjustmentActiveEffect.flags.XMLID, // No change
                    source: presentAdjustmentActiveEffect.flags.source, // No change
                    target: [presentAdjustmentActiveEffect.flags.target], // Now an array
                    key: presentAdjustmentActiveEffect.flags.keyX, // Name change
                    // NOTE: Dropping keyY
                },
                origin: presentAdjustmentActiveEffect.origin, // No change
            };

            // If 5e we may have additional changes
            if (
                actor.system.is5e &&
                actor.system.characteristics?.[potentialCharacteristic]
            ) {
                if (potentialCharacteristic === "dex") {
                    const charValue =
                        actor.system.characteristics[potentialCharacteristic]
                            .value;
                    const lift = RoundFavorPlayerUp(
                        (charValue -
                            actor.system.characteristics[
                                potentialCharacteristic
                            ].core) /
                            3,
                    );

                    newFormatAdjustmentActiveEffect.changes.push({
                        key: actor.system.characteristics[
                            potentialCharacteristic
                        ]
                            ? `system.characteristics.ocv.max`
                            : "system.value",
                        value: lift,
                        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    });
                    newFormatAdjustmentActiveEffect.flags.target.push("ocv");

                    newFormatAdjustmentActiveEffect.changes.push({
                        key: actor.system.characteristics[
                            potentialCharacteristic
                        ]
                            ? `system.characteristics.dcv.max`
                            : "system.value",
                        value: lift,
                        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    });
                    newFormatAdjustmentActiveEffect.flags.target.push("dcv");

                    const changes = {
                        [`system.characteristics.${newFormatAdjustmentActiveEffect.flags.target[1]}.value`]:
                            actor.system.characteristics.ocv.value + lift,
                        [`system.characteristics.${newFormatAdjustmentActiveEffect.flags.target[2]}.value`]:
                            actor.system.characteristics.dcv.value + lift,
                    };

                    await actor.update(changes);
                } else if (potentialCharacteristic === "ego") {
                    const charValue =
                        actor.system.characteristics[potentialCharacteristic]
                            .value;
                    const lift = RoundFavorPlayerUp(
                        (charValue -
                            actor.system.characteristics[
                                potentialCharacteristic
                            ].core) /
                            3,
                    );

                    newFormatAdjustmentActiveEffect.changes.push({
                        key: actor.system.characteristics[
                            potentialCharacteristic
                        ]
                            ? `system.characteristics.omcv.max`
                            : "system.value",
                        value: lift,
                        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    });
                    newFormatAdjustmentActiveEffect.flags.target.push("omcv");

                    newFormatAdjustmentActiveEffect.changes.push({
                        key: actor.system.characteristics[
                            potentialCharacteristic
                        ]
                            ? `system.characteristics.dmcv.max`
                            : "system.value",
                        value: lift,
                        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    });
                    newFormatAdjustmentActiveEffect.flags.target.push("dmcv");

                    const changes = {
                        [`system.characteristics.${newFormatAdjustmentActiveEffect.flags.target[1]}.value`]:
                            actor.system.characteristics.omcv.value + lift,
                        [`system.characteristics.${newFormatAdjustmentActiveEffect.flags.target[2]}.value`]:
                            actor.system.characteristics.dmcv.value + lift,
                    };

                    await actor.update(changes);
                }
            }

            // Delete old active effect and create the new one
            await presentAdjustmentActiveEffect.delete();
            await actor.addActiveEffect(newFormatAdjustmentActiveEffect);
        }
    }
}

async function migrate_actor_items_to_3_0_54(actor) {
    for (const item of actor.items) {
        // Give all adjustment powers the new "adjustment" class for simplicity.
        if (
            item.system.XMLID === "ABSORPTION" ||
            item.system.XMLID === "AID" ||
            item.system.XMLID === "DISPEL" ||
            item.system.XMLID === "DRAIN" ||
            item.system.XMLID === "HEALING" ||
            item.system.XMLID === "TRANSFER" ||
            item.system.XMLID === "SUPPRESS"
        ) {
            await item.update({
                "system.class": "adjustment",
            });
        }
    }
}

async function migrate_actor_items_to_3_0_53(actor) {
    for (const item of actor.items) {
        // Get rid of item.system.characteristic and replace with
        // item.system.CHARACTERISTIC
        if (!item.system.CHARACTERISTIC && item.system.characteristic) {
            await item.update({
                "system.CHARACTERISTIC":
                    item.system.characteristic.toUpperCase(),
            });
        }

        if (item.system.characteristic) {
            await item.update({
                "system.-=characteristic": null,
            });
        }

        // In the past, we filled in item.system.NAME based on item.system.ALIAS.
        // We no longer need this as our visualizations should be decoupled from data.
        if (
            item.system.NAME?.toUpperCase().trim() ===
                item.system.ALIAS?.toUpperCase().trim() &&
            item.name.toUpperCase().trim() ===
                item.system.ALIAS?.toUpperCase().trim()
        ) {
            await item.update({
                "system.NAME": "",
            });
        }
    }
}

async function migrateActor_3_0_35(actor) {
    try {
        if (!actor) return;
        for (let item of actor.items) {
            let changes = {};

            // LEVELS is now the raw number from HDC file and value/max are working numbers
            if (item.system.LEVELS?.value || item.system.LEVELS?.value === 0) {
                changes["system.value"] = item.system.LEVELS.value;
                changes["system.max"] = item.system.LEVELS.max;
                changes["system.LEVELS"] = item.system.LEVELS.max;
            }

            // POWER, MODIFIER, ADDER
            if (item.system.powers) {
                for (const m of item.system.powers) {
                    if (m.modifiers) {
                        m.MODIFIER = m.modifiers;
                    }
                    if (m.adders) {
                        m.ADDER = m.adders;
                    }
                }
                changes["system.POWER"] = item.system.powers;
            }
            if (item.system.modifiers) {
                for (const m of item.system.modifiers) {
                    if (m.modifiers) {
                        m.MODIFIER = m.modifiers;
                    }
                    if (m.adders) {
                        m.ADDER = m.adders;
                    }
                }
                changes["system.MODIFIER"] = item.system.modifiers;
            }
            if (item.system.adders) {
                for (const m of item.system.adders) {
                    if (m.modifiers) {
                        m.MODIFIER = m.modifiers;
                    }
                    if (m.adders) {
                        m.ADDER = m.adders;
                    }
                }
                changes["system.ADDER"] = item.system.adders;
            }

            await item.update(changes, { hideChatMessage: true });
        }
    } catch (e) {
        console.log(e);
        if (
            game.user.isGM &&
            game.settings.get(game.system.id, "alphaTesting")
        ) {
            await ui.notifications.warn(
                `Migration failed for ${actor?.name}. Recommend re-uploading from HDC.`,
            );
        }
    }
}

async function migrateActor_3_0_42(actor) {
    try {
        if (!actor) return;

        for (let item of actor.items) {
            let changes = {};

            // LEVELS is now the raw number from HDC file and value/max are working numbers
            if (typeof item.system.LEVELS === "object") {
                changes["system.value"] = parseInt(item.system.LEVELS.value);
                changes["system.max"] = parseInt(item.system.LEVELS.max);
                changes["system.LEVELS"] = item.system.LEVELS.max;
            }

            // POWER, MODIFIER, ADDER
            if (item.system.powers && !item.system.POWER) {
                for (const m of item.system.powers) {
                    if (m.modifiers) {
                        m.MODIFIER = m.modifiers;
                    }
                    if (m.adders) {
                        m.ADDER = m.adders;
                    }
                }
                changes["system.POWER"] = item.system.powers;
            }
            if (item.system.modifiers && !item.system.MODIFIER) {
                for (const m of item.system.modifiers) {
                    if (m.modifiers) {
                        m.MODIFIER = m.modifiers;
                    }
                    if (m.adders) {
                        m.ADDER = m.adders;
                    }
                }
                changes["system.MODIFIER"] = item.system.modifiers;
            }
            if (item.system.adders && !item.system.ADDER) {
                for (const m of item.system.adders) {
                    if (m.modifiers) {
                        m.MODIFIER = m.modifiers;
                    }
                    if (m.adders) {
                        m.ADDER = m.adders;
                    }
                }
                changes["system.ADDER"] = item.system.adders;
            }

            if (changes.length > 0) {
                await item.update(changes, { hideChatMessage: true });
            }
        }
    } catch (e) {
        console.error(e);
        if (
            game.user.isGM &&
            game.settings.get(game.system.id, "alphaTesting")
        ) {
            await ui.notifications.warn(
                `Migration failed for ${actor?.name}. Recommend re-uploading from HDC.`,
            );
        }
    }
}

async function migrateActor_3_0_49(actor) {
    try {
        if (!actor) return;
        if (!actor.system.is5e) return;

        for (let item of actor.items.filter((o) => o.type === "maneuver")) {
            let entry = migrationOnly_combatManeuvers[item.name];
            if (!entry) {
                for (let key of Object.keys(migrationOnly_combatManeuvers)) {
                    if (
                        key.toUpperCase().replace(" ", "") ===
                        item.name.toUpperCase().replace(" ", "")
                    ) {
                        entry = migrationOnly_combatManeuvers[key];
                        await item.update({ name: key });
                        break;
                    }
                }
            }
            if (entry) {
                const EFFECT = entry[3];
                let newEffect = EFFECT;
                if (EFFECT.match(/v\/(\d+)/)) {
                    let divisor = EFFECT.match(/v\/(\d+)/)[1];
                    newEffect = EFFECT.replace(
                        `v/${divisor}`,
                        `v/${divisor / 2}`,
                    );
                }
                if (item.system.EFFECT != newEffect) {
                    await item.update({ "system.EFFECT": newEffect });
                }
                const attack = entry[4];
                if (attack && item.system.subType != "attack") {
                    await item.makeAttack();
                }
            } else {
                if (["Multiple Attack", "Other Attacks"].includes(item.name)) {
                    await item.delete();
                } else {
                    if (
                        game.user.isGM &&
                        game.settings.get(game.system.id, "alphaTesting")
                    ) {
                        await ui.notifications.warn(
                            `Migration failed for ${actor?.name}. ${item.name} not recognized.`,
                        );
                    }
                }
            }
        }
    } catch (e) {
        console.error(e);
        if (
            game.user.isGM &&
            game.settings.get(game.system.id, "alphaTesting")
        ) {
            await ui.notifications.warn(
                `Migration failed for ${actor?.name}. Recommend re-uploading from HDC.`,
            );
        }
    }
}

async function migrateRemoveDuplicateDefenseMovementItems() {
    ui.notifications.info(`Migrating actor data.`);

    let count = 0;
    for (let actor of game.actors.contents) {
        if (await migrateActorDefenseMovementData(actor)) count++;
    }

    ui.notifications.info(`${count} actors migrated.`);
}

async function migrateActorDefenseMovementData(actor) {
    let itemsToDelete = [];

    // Place a migrationTag in the actor with today's date.
    // This allows us to skip this migration in the future.
    // Specifically it allows custom defenses to be manually added
    // without deleting it every time the world loads.
    //if (actor.system.migrationTag != migrationTag) {
    for (let item of actor.items.filter(
        (o) => o.type == "defense" || o.type == "movement",
    )) {
        // Try not to delete items that have been manually created.
        // We can make an educated guess by looking for XMLID
        if (
            item.system.xmlid ||
            item.system.XMLID ||
            item.system.rules == "COMBAT_LUCK" ||
            item.type == "movement"
        ) {
            itemsToDelete.push(item.id);
        }
    }

    // Apply AE to movement items
    let itemsToCreate = [];
    for (let item of actor.items) {
        const configPowerInfo = migrationOnly_Pre3_0_61_getPowerInfo({
            item: item,
        });
        if (configPowerInfo && configPowerInfo.powerType.includes("movement")) {
            // You can't just add AE to items owned by actor. A flaw in Foundry v10.
            // So we will create a new item with proper AE, then delete the old item.
            let itemData = item.toJSON();
            itemData.system.active = true;
            await migrationCreateEffects(itemData, actor);
            itemsToCreate.push(itemData);
            itemsToDelete.push(item.id);
        }
    }

    await actor.deleteEmbeddedDocuments("Item", itemsToDelete);
    await HeroSystem6eItem.create(itemsToCreate, { parent: actor });

    return itemsToDelete.length > 0;
}

// Change Attack knockback to knockbackMultiplier
async function migrateKnockback() {
    let updates = [];
    for (let actor of game.actors) {
        for (let item of actor.items) {
            if (item.type === "attack") {
                if (
                    item.system.knockback &&
                    parseInt(item.system.knockbackMultiplier) == 0
                ) {
                    updates.push({
                        _id: item.id,
                        system: { knockbackMultiplier: 1, knockback: null },
                    });
                }
            }
        }
        if (updates.length > 0) {
            await Item.updateDocuments(updates, { parent: actor });
            ui.notifications.info(
                `${updates.length} attacks migrated for ${actor.name}.`,
            );
            updates = [];
        }
    }
}

async function migrationOnlyMakeAttack(item) {
    const xmlid = item.system.XMLID || item.system.xmlid || item.system.rules;

    // Confirm this is an attack
    const configPowerInfo = migrationOnly_Pre3_0_61_getPowerInfo({
        xmlid: xmlid,
        actor: item.actor,
    });

    let changes = {};

    // Name
    let description = item.system.ALIAS;
    let name =
        item.system.NAME ||
        description ||
        configPowerInfo?.xmlid ||
        item.system.name ||
        item.name;
    changes[`name`] = name;

    let levels =
        parseInt(item.system.LEVELS?.value) || parseInt(item.system.DC) || 0;
    const input = item.system.INPUT;

    const ocv =
        parseInt(item.system.ocv) ||
        parseInt(item.system.OCV) ||
        item.system.OCV ||
        0;
    const dcv =
        parseInt(item.system.dcv) ||
        parseInt(item.system.DCV) ||
        item.system.DCV ||
        0;

    // Check if this is a MARTIAL attack.  If so then EXTRA DC's may be present
    if (item.system.XMLID == "MANEUVER") {
        let EXTRADC = null;

        // HTH
        if (item.system.CATEGORY == "Hand To Hand") {
            EXTRADC = item.actor.items.find(
                (o) =>
                    o.system.XMLID == "EXTRADC" &&
                    o.system.ALIAS.indexOf("HTH") > -1,
            );
        }
        // Ranged is not implemented yet

        // Extract +2 HTH Damage Class(es)
        if (EXTRADC) {
            let match = EXTRADC.system.ALIAS.match(/\+\d+/);
            if (match) {
                levels += parseInt(match[0]);
            }
        }
    }

    // Check if TELEKINESIS + WeaponElement (BAREHAND) + EXTRADC  (WillForce)
    if (item.system.XMLID == "TELEKINESIS") {
        if (
            item.actor.items.find(
                (o) =>
                    o.system.XMLID == "WEAPON_ELEMENT" &&
                    o.system.adders.find((o) => o.XMLID == "BAREHAND"),
            )
        ) {
            let EXTRADC = item.actor.items.find(
                (o) =>
                    o.system.XMLID == "EXTRADC" &&
                    o.system.ALIAS.indexOf("HTH") > -1,
            );
            // Extract +2 HTH Damage Class(es)
            if (EXTRADC) {
                let match = EXTRADC.system.ALIAS.match(/\+\d+/);
                if (match) {
                    levels += parseInt(match[0]) * 5; // Below we take these levels (as STR) and determine dice
                }
            }
        }
    }

    // Active cost is required for endurance calculation.
    // It should include all advantages (which we don't handle very well at the moment)
    // However this should be calculated during power upload (not here)
    // let activeCost = (levels * 5)
    // let end = Math.round(activeCost / 10 - 0.01);
    //changes[`system.activeCost`] = activeCost

    changes[`system.subType`] = "attack";
    changes[`system.class`] = input === "ED" ? "energy" : "physical";
    changes[`system.dice`] = levels;
    changes[`system.extraDice`] = "zero";
    changes[`system.killing`] = false;
    changes[`system.knockbackMultiplier`] = 1;
    changes[`system.targets`] = "dcv";
    changes[`system.uses`] = "ocv";
    changes[`system.usesStrength`] = true;
    changes[`system.areaOfEffect`] = { type: "none", value: 0 };
    changes[`system.piercing`] = 0;
    changes[`system.penetrating`] = 0;
    changes[`system.ocv`] = ocv;
    changes[`system.dcv`] = dcv;
    changes["system.stunBodyDamage"] = "stunbody";

    // BLOCK and DODGE typically do not use STR
    if (["maneuver", "martialart"].includes(item.type)) {
        if (
            item.system.EFFECT?.toLowerCase().indexOf("block") > -1 ||
            item.system.EFFECT?.toLowerCase().indexOf("dodge") > -1
        ) {
            changes[`system.usesStrength`] = false;
        }
    }

    // ENTANGLE (not implemented)
    if (xmlid == "ENTANGLE") {
        changes[`system.class`] = "entangle";
        changes[`system.usesStrength`] = false;
        changes[`system.noHitLocations`] = true;
        changes[`system.knockbackMultiplier`] = 0;
    }

    // DARKNESS (not implemented)
    if (xmlid == "DARKNESS") {
        changes[`system.class`] = "darkness";
        changes[`system.usesStrength`] = false;
        changes[`system.noHitLocations`] = true;
    }

    // IMAGES (not implemented)
    if (xmlid == "IMAGES") {
        changes[`system.class`] = "images";
        changes[`system.usesStrength`] = false;
        changes[`system.noHitLocations`] = true;
    }

    // DRAIN (not implemented)
    if (xmlid == "DRAIN") {
        changes[`system.class`] = "drain";
        changes[`system.usesStrength`] = false;
        changes[`system.noHitLocations`] = true;
    }

    // AID (not implemented)
    if (xmlid == "AID") {
        changes[`system.class`] = "aid";
        changes[`system.usesStrength`] = false;
        changes[`system.noHitLocations`] = true;
    }

    // TRANSFER
    if (xmlid == "TRANSFER") {
        changes[`system.class`] = "transfer";
        changes[`system.usesStrength`] = false;
        changes[`system.noHitLocations`] = true;
    }

    // MINDSCAN
    if (xmlid == "MINDSCAN") {
        changes[`system.class`] = "mindscan";
        changes[`system.usesStrength`] = false;
        changes[`system.noHitLocations`] = true;
    }

    // DISPEL
    if (xmlid == "DISPEL") {
        changes[`system.class`] = "dispel";
        changes[`system.usesStrength`] = false;
        changes[`system.noHitLocations`] = true;
    }

    // MENTALBLAST
    if (xmlid == "EGOATTACK") {
        changes[`system.class`] = "mental";
        changes[`system.targets`] = "dmcv";
        changes[`system.uses`] = "omcv";
        changes[`system.knockbackMultiplier`] = 0;
        changes[`system.usesStrength`] = false;
        changes["system.stunBodyDamage"] = "stunonly";
        changes["system.noHitLocations"] = true;
    }

    // MINDCONTROL
    if (xmlid == "MINDCONTROL") {
        changes[`system.class`] = "mindcontrol";
        changes[`system.targets`] = "dmcv";
        changes[`system.uses`] = "omcv";
        changes[`system.knockbackMultiplier`] = 0;
        changes[`system.usesStrength`] = false;
        changes["system.stunBodyDamage"] = "stunonly";
        changes["system.noHitLocations"] = true;
    }

    // CHANGEENVIRONMENT
    if (xmlid == "CHANGEENVIRONMENT") {
        changes[`system.class`] = "change enviro";
        changes[`system.usesStrength`] = false;
        changes[`system.noHitLocations`] = true;
    }

    // FLASH
    if (xmlid == "FLASH") {
        changes[`system.class`] = "flash";
        changes[`system.usesStrength`] = false;
        changes[`system.noHitLocations`] = true;
    }

    // AVAD
    const avad = item.system?.modifiers
        ? item.system.modifiers.find((o) => o.XMLID === "AVAD")
        : null;
    if (avad) {
        changes[`system.class`] = "avad";
    }

    // Armor Piercing
    let ARMORPIERCING = item.system.modifiers.find(
        (o) => o.XMLID == "ARMORPIERCING",
    );
    if (ARMORPIERCING) {
        changes[`system.piercing`] = parseInt(ARMORPIERCING.LEVELS);
    }

    // Penetrating
    let PENETRATING = item.system.modifiers.find(
        (o) => o.XMLID == "PENETRATING",
    );
    if (PENETRATING) {
        changes[`system.penetrating`] = parseInt(PENETRATING.LEVELS);
    }

    // No Knockback
    let NOKB = item.system.modifiers.find((o) => o.XMLID == "NOKB");
    if (NOKB) {
        changes[`system.knockbackMultiplier`] = 0;
    }

    // Double Knockback
    let DOUBLEKB = item.system.modifiers.find((o) => o.XMLID == "DOUBLEKB");
    if (DOUBLEKB) {
        changes[`system.knockbackMultiplier`] = 2;
    }

    // Explosion
    let EXPLOSION = item.system.modifiers.find((o) => o.XMLID == "EXPLOSION");
    if (EXPLOSION) {
        if (game.settings.get(game.system.id, "alphaTesting")) {
            ui.notifications.warn(
                `EXPLOSION not implemented during HDC upload of ${item.actor.name}`,
            );
        }
    }

    // Alternate Combat Value (uses OMCV against DCV)
    let ACV = item.system.modifiers.find((o) => o.XMLID == "ACV");
    if (ACV) {
        if (ACV.OPTION_ALIAS === "uses OMCV against DCV") {
            changes[`system.uses`] = "omcv";
            changes[`system.targets`] = "dcv";
        }
        if (ACV.OPTION_ALIAS === "uses OCV against DMCV") {
            changes[`system.uses`] = "ocv";
            changes[`system.targets`] = "dmcv";
        }
        if (ACV.OPTION_ALIAS === "uses OMCV against DCV") {
            changes[`system.uses`] = "omcv";
            changes[`system.targets`] = "dcv";
        }
    }

    if (
        item.system.adders &&
        item.system.adders.find((o) => o.XMLID == "PLUSONEPIP")
    ) {
        changes[`system.extraDice`] = "pip";
    }

    if (
        item.system.adders &&
        item.system.adders.find((o) => o.XMLID == "PLUSONEHALFDIE")
    ) {
        changes[`system.extraDice`] = "half";
    }

    if (
        item.system.adders &&
        item.system.adders.find((o) => o.XMLID == "MINUSONEPIP")
    ) {
        // Typically only allowed for killing attacks.
        //  Appears that +1d6-1 is roughly equal to +1/2 d6
        changes[`system.extraDice`] = "half";
    }

    const aoe = item.system.modifiers.find((o) => o.XMLID == "AOE");
    if (aoe) {
        changes[`system.areaOfEffect`] = {
            type: aoe.OPTION_ALIAS.toLowerCase(),
            value: parseInt(aoe.LEVELS),
        };
    }

    if (xmlid === "HKA" || item.system.EFFECT?.indexOf("KILLING") > -1) {
        changes[`system.killing`] = true;

        // Killing Strike uses DC=2 which is +1/2d6.
        // For now just recalculate that, but ideally rework this function to use DC instead of dice.
        let pips = parseInt(item.system.DC || item.system.LEVELS.value * 3);
        changes["system.dice"] = Math.floor(pips / 3);
        if (pips % 3 == 1) {
            changes["system.extraDice"] = "pip";
        }
        if (pips % 3 == 2) {
            changes["system.extraDice"] = "half";
        }
    }

    if (xmlid === "TELEKINESIS") {
        // levels is the equivalent strength
        changes[`system.extraDice`] = "zero";
        changes[`system.dice`] = 0;
        changes[`system.extraDice`] = "zero";
        changes[`name`] = name + " (TK strike)";
        changes[`system.usesStrength`] = false;
        changes[`system.usesTk`] = true;
    }

    if (xmlid === "ENERGYBLAST") {
        changes[`system.usesStrength`] = false;
    }

    if (xmlid === "RKA") {
        changes[`system.killing`] = true;
        changes[`system.usesStrength`] = false;
    }

    const noStrBonus = item.system.modifiers.find(
        (o) => o.XMLID == "NOSTRBONUS",
    );
    if (noStrBonus) {
        changes[`system.usesStrength`] = false;
    }

    const stunOnly = item.system.modifiers.find((o) => o.XMLID == "STUNONLY");
    if (stunOnly) {
        changes["system.stunBodyDamage"] = "stunonly";
    }

    if (item._id) {
        await item.update(changes, { hideChatMessage: true });
    }

    // Possibly a QUENCH test
    for (let change of Object.keys(changes).filter((o) => o != "_id")) {
        let target = item;
        for (let key of change.split(".")) {
            if (typeof target[key] == "object") {
                target = target[key];
            } else {
                target[key] = changes[change];
            }
        }
    }
}

async function migrationCreateEffects(itemData, actor) {
    const configPowerInfo = migrationOnly_Pre3_0_61_getPowerInfo({
        xmlid: itemData.system.XMLID || itemData.system.rules,
        actor: actor || this?.actor,
    });

    // Not every powers will have effects
    if (!configPowerInfo) return;
    if (!configPowerInfo?.powerType) return;

    const xmlid = configPowerInfo.xmlid;
    const key = xmlid.toLowerCase();

    // Characteristics (via ActiveEffects)
    if (configPowerInfo?.powerType?.includes("characteristic")) {
        let levels = itemData.system.LEVELS?.value;
        // Add LEVELS to MAX
        let activeEffect = {
            name: `${key.toUpperCase()}+${levels}`,
            origin: itemData.uuid,
            //id: newPower.system.rules,
            icon: "icons/svg/upgrade.svg",
            changes: [
                {
                    key: "system.characteristics." + key + ".max",
                    value: parseInt(levels),
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                },
            ],
            flags: {
                XMLID: xmlid.toUpperCase() || itemData.system.XMLID,
            },
            disabled: !itemData.system.AFFECTS_TOTAL,
            transfer: true,
        };
        if (
            activeEffect.name
                .toLowerCase()
                .indexOf(itemData.name.toLowerCase()) == -1
        ) {
            activeEffect.name = itemData.name + " " + activeEffect.name;
        }

        itemData.effects = [activeEffect];
        return;
    }

    // Movement Powers
    if (configPowerInfo?.powerType?.includes("movement")) {
        const key = itemData.system.XMLID.toLowerCase();
        let levels = itemData.system.LEVELS?.value;

        let activeEffect = {
            name: `${key.toUpperCase()}+${levels}`,
            icon: "icons/svg/upgrade.svg",
            changes: [
                {
                    key: `system.characteristics.${key}.max`,
                    value: parseInt(itemData.system.LEVELS?.value),
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                },
            ],
            transfer: true,
        };
        if (
            activeEffect.name
                .toLowerCase()
                .indexOf(itemData.name.toLowerCase()) == -1
        ) {
            activeEffect.name = itemData.name + " " + activeEffect.name;
        }

        itemData.effects = [activeEffect];
        return;
    }

    if (xmlid === "DENSITYINCREASE") {
        const levels = parseInt(parseInt(itemData.system.LEVELS?.value));

        const strAdd = Math.floor(levels) * 5;
        const pdAdd = Math.floor(levels);
        const edAdd = Math.floor(levels);

        let activeEffect = {
            name: itemData.name,
            icon: "icons/svg/upgrade.svg",
            changes: [
                {
                    key: "system.characteristics.str.max",
                    value: strAdd,
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                },
                {
                    key: "system.characteristics.pd.max",
                    value: pdAdd,
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                },
                {
                    key: "system.characteristics.ed.max",
                    value: edAdd,
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                },
            ],
            transfer: true,
        };

        itemData.effects = [activeEffect];
        return;
    }
}

async function migrationOnlyUpdateItemSubTypes(actor, removeDups) {
    // Update Item SubType
    for (const item of actor.items) {
        const configPowerInfo = migrationOnly_Pre3_0_61_getPowerInfo({
            item: item,
        });

        // Defenses
        if (configPowerInfo && configPowerInfo.powerType?.includes("defense")) {
            await item.update(
                { "system.subType": "defense", "system.showToggle": true },
                { hideChatMessage: true },
            );
        }

        // Is this a movement power?
        if (
            configPowerInfo &&
            configPowerInfo.powerType?.includes("movement")
        ) {
            await item.update(
                { "system.subType": "movement", "system.showToggle": true },
                { hideChatMessage: true },
            );
        }

        // Is this an attack power?
        if (configPowerInfo && configPowerInfo.powerType?.includes("attack")) {
            if (item.system.subType != "attack" || !item.system.dice) {
                await migrationOnlyMakeAttack(item);
                await item.update(
                    { "system.subType": "attack", "system.showToggle": true },
                    { hideChatMessage: true },
                );
            }
        }

        // Remove duplicate attacks
        if (removeDups && item.type == "attack") {
            const power = actor.items.find(
                (o) => o.name == item.name && o.system.subType == "attack",
            );
            if (power) {
                await item.delete();
            }
        }

        // Skills
        if (configPowerInfo && configPowerInfo.powerType?.includes("skill")) {
            await item.update(
                { "system.subType": "skill" },
                { hideChatMessage: true },
            );
        }
    }
}

function migrationOnly_Pre3_0_61_getPowerInfo(options) {
    const xmlid =
        options.xmlid ||
        options.item?.system?.XMLID ||
        options.item?.system?.xmlid ||
        options.item?.system?.id;

    const actor = options?.actor || options?.item?.actor;
    if (!actor) {
        // This has a problem if we're passed in an XMLID for a power as we don't know the actor so we don't know if it's 5e or 6e
        console.warn(
            `${xmlid} for ${options.item?.name} has no actor provided. Assuming 6e.`,
        );
    }

    const powerList = actor?.system.is5e
        ? CONFIG.HERO.powers5e
        : CONFIG.HERO.powers6e;
    let powerInfo = powerList.find((o) => o.key === xmlid);

    if (!powerInfo && options?.item?.type == "maneuver") {
        powerInfo = {
            type: ["maneuver"],
            perceivability: "obvious",
            duration: "instant",
            costEnd: false,
            target: "target's dcv",
        };
    }

    // TODO: Why are we modifying the power entries from config here?
    if (powerInfo) {
        powerInfo.xmlid = xmlid;
        powerInfo.XMLID = xmlid;
    }

    // LowerCase
    if (powerInfo?.duration)
        powerInfo.duration = powerInfo.duration.toLowerCase();

    return powerInfo;
}

// This is good enough for everything for the time being. Added to migration
// in 3.0.63.
export function migrationOnly_Pre_XXX_getPowerInfo(options) {
    const xmlid =
        options.xmlid ||
        options.item?.system?.XMLID ||
        options.item?.system?.xmlid ||
        options.item?.system?.id;

    const actor = options?.actor || options?.item?.actor;
    if (!actor) {
        // This has a problem if we're passed in an XMLID for a power as we don't know the actor so we don't know if it's 5e or 6e
        console.warn(
            `${xmlid} for ${options.item?.name} has no actor provided. Assuming 6e.`,
        );
    }

    const powerList = actor?.system.is5e
        ? CONFIG.HERO.powers5e
        : CONFIG.HERO.powers6e;
    let powerInfo = powerList.find((o) => o.key === xmlid);

    // TODO: Why are we modifying the power entries from config here?
    if (powerInfo) {
        powerInfo.xmlid = xmlid;
        powerInfo.XMLID = xmlid;
    }

    // LowerCase
    // TODO: Make powers correct and remove this
    if (powerInfo?.duration)
        powerInfo.duration = powerInfo.duration.toLowerCase();

    return powerInfo;
}

const migrationOnly_combatManeuvers = {
    // Maneuver : [phase, OCV, DCV, Effects, Attack]
    Block: ["1/2", "+0", "+0", "Blocks HTH attacks, Abort", true],
    Brace: ["0", "+2", "1/2", "+2 OCV only to offset the Range Modifier"],
    Disarm: [
        "1/2",
        "-2",
        "+0",
        "Disarm target, requires STR vs. STR Roll",
        true,
    ],
    Dodge: ["1/2", "--", "+3", "Dodge all attacks, Abort", true],
    Grab: [
        "1/2",
        "-1",
        "-2",
        "Grab Two Limbs; can Squeeze, Slam, or Throw",
        true,
    ],
    "Grab By": [
        "1/2 †",
        "-3",
        "-4",
        "Move and Grab object, +(v/10) to STR",
        true,
    ],
    Haymaker: ["1/2*", "+0", "-5", "+4 Damage Classes to any attack"],
    "Move By": [
        "1/2 †",
        "-2",
        "-2",
        "((STR/2) + (v/10))d6; attacker takes 1/3 damage",
        true,
    ],
    "Move Through": [
        "1/2 †",
        "-v/10",
        "-3",
        "(STR + (v/6))d6; attacker takes 1/2 or full damage",
        true,
    ],
    //"Multiple Attack": ["1", "var", "1/2", "Attack one or more targets multiple times"],
    Set: [
        "1",
        "+1",
        "+0",
        "Take extra time to aim a Ranged attack at a target",
    ],
    Shove: ["1/2", "-1", "-1", "Push target back 1m per 5 STR used", true],
    Strike: ["1/2", "+0", "+0", "STR damage or by weapon type", true],
    Throw: [
        "1/2",
        "+0",
        "+0",
        "Throw object or character, does STR damage",
        true,
    ],
    Trip: [
        "1/2",
        "-1",
        "-2",
        "Knock a target to the ground, making him Prone",
        true,
    ],
    //"Other Attacks": ["1/2", "+0", "+0", ""],
};
