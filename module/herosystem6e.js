// Import Modules
import { HERO } from "./config.js";
import { POWERS } from "./powers/powers-rules.js";
import { HeroSystem6eActor } from "./actor/actor.js";
import { HeroSystem6eActorSidebarSheet } from "./actor/actor-sidebar-sheet.js";
import { HeroSystem6eToken, HeroSystem6eTokenDocument } from "./actor/actor-token.js";
import { HeroSystem6eItem } from "./item/item.js";
import { HeroSystem6eItemSheet } from "./item/item-sheet.js";
import * as chat from "./chat.js";
import * as macros from "./macros.js";
import { HeroSystem6eCardHelpers } from "./card/card-helpers.js";
import { HeroSystem6eActorActiveEffects } from "./actor/actor-active-effects.js";
import HeroSystem6eTemplate from "./template.js";
import { HeroSystem6eCombat } from "./combat.js";
import { HeroSystem6eCombatTracker } from "./combatTracker.js"
import SettingsHelpers from "./settings/settings-helpers.js";
import { HeroSystem6eTokenHud } from "./bar3/tokenHud.js";
import { extendTokenConfig } from "./bar3/extendTokenConfig.js";
import { HeroRuler } from "./ruler.js";
import { initializeHandlebarsHelpers } from "./handlebars-helpers.js";
import { getPowerInfo } from './utility/util.js'
import { createEffects, updateItemDescription, updateItemSubTypes } from "./utility/upload_hdc.js"
import { AdjustmentMultiplier } from "./utility/adjustment.js";

Hooks.once('init', async function () {

    game.herosystem6e = {
        applications: {
            // HeroSystem6eActorSheet,
            HeroSystem6eItemSheet,
        },
        entities: {
            HeroSystem6eActor,
            HeroSystem6eItem,
            HeroSystem6eTokenDocument,
            HeroSystem6eToken
        },
        canvas: {
            HeroSystem6eTemplate
        },
        macros: macros,
        rollItemMacro: rollItemMacro,
        CreateCustomAttack: CreateCustomAttack,
        config: HERO
    };

    CONFIG.HERO = HERO;

    CONFIG.POWERS = POWERS;

    CONFIG.Combat.documentClass = HeroSystem6eCombat;
    CONFIG.Combat.defeatedStatusId = "dead";

    // V11 now support ActiveEffects on items without
    // the need to transfer the effect to the actor.
    CONFIG.ActiveEffect.legacyTransferral = false;

    /**
    * Set an initiative formula for the system
    * @type {String}
    */
    CONFIG.Combat.initiative = {
        formula: "@characteristics.dex.value + (@characteristics.int.value / 100)",
        decimals: 2
    };

    // debug
    // CONFIG.debug.hooks = true;

    // Define custom Entity classes
    CONFIG.Actor.documentClass = HeroSystem6eActor;
    CONFIG.Item.documentClass = HeroSystem6eItem;
    CONFIG.Token.documentClass = HeroSystem6eTokenDocument;
    CONFIG.Token.objectClass = HeroSystem6eToken;
    CONFIG.statusEffects = HeroSystem6eActorActiveEffects.getEffects();
    CONFIG.ActiveEffect.documentClass = HeroSystem6eActorActiveEffects;
    CONFIG.ui.combat = HeroSystem6eCombatTracker;

    HeroRuler.initialize()

    SettingsHelpers.initLevelSettings();

    initializeHandlebarsHelpers();

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    // Actors.registerSheet("herosystem6e", HeroSystem6eActorSheet);
    Actors.registerSheet("herosystem6e", HeroSystem6eActorSidebarSheet, { makeDefault: true });
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("herosystem6e", HeroSystem6eItemSheet, { makeDefault: true });

    // Actors.registerSheet("herosystem6e", HeroSystem6eActorSheetMini, { makeDefault: false });

    // If you need to add Handlebars helpers, here are a few useful examples:
    Handlebars.registerHelper('concat', function () {
        var outStr = '';
        for (var arg in arguments) {
            if (typeof arguments[arg] != 'object') {
                outStr += arguments[arg];
            }
        }
        return outStr;
    });

    Handlebars.registerHelper('toLowerCase', function (str) {
        return str.toLowerCase();
    });

    Handlebars.registerHelper('is_active_segment', function (actives, index) {
        return actives[index];
    });

    // Handlebars Templates and Partials
    loadTemplates([
        `systems/hero6efoundryvttv2/templates/item/item-common-partial.hbs`,
        `systems/hero6efoundryvttv2/templates/item/item-effects-partial.hbs`,
        `systems/hero6efoundryvttv2/templates/item/item-attack-partial.hbs`,
    ]);

});

Hooks.once("ready", async function () {
    // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
    Hooks.on("hotbarDrop", (bar, data, slot) => createHeroSystem6eMacro(bar, data, slot));

    if (typeof SimpleCalendar != "undefined" && game.user.isGM && SimpleCalendar.api.getCurrentCalendar().general.gameWorldTimeIntegration != "mixed") {
        console.log(SimpleCalendar.api.getCurrentCalendar().general.gameWorldTimeIntegration);
        return ui.notifications.warn(`Recommend setting Simple Calendar GameWorldTimeIntegration = Mixed`);
    }
});

Hooks.on("renderChatMessage", (app, html, data) => {
    // Display action buttons
    chat.displayChatActionButtons(app, html, data);
    HeroSystem6eCardHelpers.onMessageRendered(html);
});
Hooks.on("renderChatLog", (app, html, data) => HeroSystem6eCardHelpers.chatListeners(html));
Hooks.on("renderChatPopout", (app, html, data) => HeroSystem6eCardHelpers.chatListeners(html));

// When actor SPD is changed we need to setupTurns again
Hooks.on("updateActor", (app, html, data) => {
    //app.sheet._render()

    for (let combat of game.combats) {
        combat.setupTurns(); //_onActorDataUpdate();
    }
});

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
    registerPackageDebugFlag(HEROSYS.ID);
});

export class HEROSYS {
    static ID = "HEROSYS";

    static module = "hero6efoundryvttv2";

    static log(force, ...args) {
        const shouldLog = force || game.settings.get(game.system.id, 'alphaTesting')

        if (shouldLog) {
            console.log(this.ID, '|', ...args);
        }
    }

    static trace(force, ...args) {
        const shouldLog = force || game.settings.get(game.system.id, 'alphaTesting')

        if (shouldLog) {
            console.trace(this.ID, '|', ...args);
        }
    }
}

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
function createHeroSystem6eMacro(bar, data, slot) {

    // Check if we want to override the default macro (open sheet)
    if (data.type === "Item" && typeof data.uuid === "string") {
        const item = fromUuidSync(data.uuid);
        if (item.isRollable()) {
            handleMacroCreation(bar, data, slot, item)
            return false
        }
    }
}

async function handleMacroCreation(bar, data, slot, item) {
    HEROSYS.log(false, "createHeroSystem6eMacro", item)
    if (!item) return;
    if (!item.roll) return;

    // Create the macro command
    const command = `game.herosystem6e.rollItemMacro("${item.name}", "${item.type}");`;
    let macro = game.macros.find(m => m.command === command && m.name === item.name && m.img === item.img);
    if (!macro) {
        macro = await Macro.create({
            name: item.name,
            type: "script",
            img: item.img,
            command: command,
            flags: { "herosystem6e.itemMacro": true }
        });
    }
    game.user.assignHotbarMacro(macro, slot);
}

async function CreateCustomAttack(actor) {
    if (!actor) return ui.notifications.error("You must select token or actor");
    let myValue = await Dialog.prompt({
        content: `<h1>${actor.name}</h1><label>Enter Item Data</label><textarea rows="20" cols="200">
{
    "name": "Custom Attack",
    "system": {
    "modifiers": [],
    "end": 1,
    "adders": [],
    "XMLID": "ENERGYBLAST",
    "ALIAS": "Blast",
    "LEVELS": {
        "value": "1",
        "max": "1"
    },
    "MULTIPLIER": "1.0",
    "basePointsPlusAdders": 5,
    "activePoints": 5,
    "realCost": 2,
    "subType": "attack",
    "class": "energy",
    "dice": 1,
    "extraDice": "zero",
    "killing": false,
    "knockbackMultiplier": 1,
    "targets": "dcv",
    "uses": "ocv",
    "usesStrength": true,
    "areaOfEffect": {
        "type": "none",
        "value": 0
    },
    "piercing": 0,
    "penetrating": 0,
    "ocv": "+0",
    "dcv": "+0",
    "stunBodyDamage": "stunbody"
    }
}

</textarea>`,
        callback: async function (html) {

            let value = html.find("textarea").val()
            try {
                let json = JSON.parse(value)
                console.log(json);
                json.type = 'attack';


                let item = await Item.create(json, { parent: actor })
                updateItemDescription(item);
                return ui.notifications.info(`Added ${item.name} to ${actor.name}`);
            }
            catch (e) {
                return ui.notifications.error(e);
            }
        }
    })
}



/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
function rollItemMacro(itemName, itemType) {
    const speaker = ChatMessage.getSpeaker();
    let actor;
    if (speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    let item = actor ? actor.items.find(i =>
        i.name === itemName &&
        (!itemType || i.type == itemType || i.system.subType == itemType)
    ) : null;

    // The selected actor does not have an item with this name.
    if (!item) {
        item = null
        // Search all owned tokens for this item
        for (let token of canvas.tokens.ownedTokens) {
            actor = token.actor
            item = actor.items.find(i =>
                i.name === itemName &&
                (!itemType || i.type == itemType || i.system.subType == itemType)
            )
            if (item) {
                break;
            }
        }

        if (!item) return ui.notifications.warn(`Your controlled Actor does not have an ${itemType || 'item'} named ${itemName}`);
    }


    // Trigger the item roll
    return item.roll();
}


// The default Foundry cone angle is 53.13 degrees.
// This will set the default angle to 60 degrees.
// REF: https://github.com/dmdorman/hero6e-foundryvtt/issues/40
Hooks.on("setup", () => CONFIG.MeasuredTemplate.defaults.angle = 60);


// Migration Script
// For now we will migrate EVERY time
// TODO: add version setting check
// REF: https://www.youtube.com/watch?v=Hl23n3MvtaI
Hooks.once("ready", async function () {
    if (!game.user.isGM) {
        return;
    }

    // Check if we have already migrated
    const lastMigration = game.settings.get(game.system.id, 'lastMigration')
    if (foundry.utils.isNewerVersion(game.system.version.replace("-alpha", ""), lastMigration)) {

        // Update lastMigration
        await game.settings.set(game.system.id, 'lastMigration', game.system.version.replace("-alpha", ""))

        // if lastMigration < 2.2.0-alpha
        if (foundry.utils.isNewerVersion('2.2.0', lastMigration)) {
            migrateActorTypes()
            migrateKnockback()
            migrateRemoveDuplicateDefenseMovementItems()
        }

        // if lastMigration < 3.0.0-alpha
        if (foundry.utils.isNewerVersion('3.0.0', lastMigration)) {
            ui.notifications.info(`Migragrating actor data.`)
            for (let actor of game.actors.contents) {
                await updateItemSubTypes(actor, true)
            }
            ui.notifications.info(`Migragtion complete.`)
        }

        // if lastMigration < 3.0.4
        // Remove all tranferred effects
        if (foundry.utils.isNewerVersion('3.0.4', lastMigration)) {
            await ui.notifications.info(`Migragrating actor data.`)
            for (let actor of game.actors.contents) {
                for (let effect of actor.effects.filter(o => o.origin)) {
                    await effect.delete();
                }
            }
            await ui.notifications.info(`Migragtion complete.`)
        }

        // if lastMigration < 3.0.9
        // Charges
        if (foundry.utils.isNewerVersion('3.0.9', lastMigration)) {
            await ui.notifications.info(`Migragrating actor data.`)
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
            await ui.notifications.info(`Migragtion complete.`)
        }

    }

});


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

// async function migrateWorld()
// {
//   for (let actor of game.actors.contents) {
//     const updateData = migrateActorData(actor.system);
//     if (!foundry.utils.isEmpty(updateData)) {
//       HEROSYS.log(false, `Migrating Actor entity ${actor.name}.`);
//       await actor.update(updateData);
//     }
//   }
// }

// function migrateActorData(actor)
// {
//   let updateData = {};
//   //updateData["system.type"] = 'complication';
//   return updateData;
// }

// Change Actor type from "character" to "pc"
async function migrateActorTypes() {
    const updates = [];
    for (let actor of game.actors) {
        if (actor.type !== "character") continue;

        if (actor.prototypeToken.disposition == CONST.TOKEN_DISPOSITIONS.FRIENDLY) {
            updates.push({ _id: actor.id, type: "pc" });
        }
        else {
            updates.push({ _id: actor.id, type: "npc" });
        }

    }
    if (updates.length > 0) {
        await Actor.updateDocuments(updates);
        ui.notifications.info(`${updates.length} actors migrated.`)
    }
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


// Remove Character from selectable actor types
Hooks.on("renderDialog", (dialog, html, data) => {
    if (html[0].querySelector(".window-title").textContent != "Create New Actor") return
    let option = html[0].querySelector("option[value*='character']")
    if (option) option.remove()
})

Hooks.on("renderActorSheet", (dialog, html, data) => {
    //html.find('header h4').append(`<span>${data.actor.type.toUpperCase()}</span>`)
    html.find('header h4').append(`<span>${game.system.version}</span>`)

    let element = document.createElement("a");
    element.setAttribute(`data-id`, data.actor.id)
    element.title = data.actor.type.toUpperCase()
    element.addEventListener('click', () => {
        const actor = game.actors.get(event.target.dataset.id)
        actor.ChangeType()
    });

    element.innerHTML = `<i class="fal fa-user-robot"></i>Type`


    html.find('header h4').after(element);
    // `<a class="header-button control configure-type" onclick=">
    // <i class="fal fa-user-robot"></i>Type 
    // </a>`)

})

Hooks.on("renderItemSheet", (dialog, html, data) => {
    html.find('header h4').append(`<span>${game.system.version}<span>`)
})

Hooks.on("getActorDirectoryEntryContext", (dialog, html, data) => {

    console.log("getActorDirectoryEntryContext")
    const menu = {
        "name": "Change Type",
        "icon": "<i class=\"fas fa-cog\"></i>",
        "callback": async function (target) {
            const dataset = { ...target[0].dataset }
            const actor = game.actors.get(dataset.entryId)
            return actor.ChangeType()
        },
    }
    html.push(menu)
})


//Modify TokenHUD (need 3 bars: end, stun, body)
Hooks.on("renderTokenHUD", HeroSystem6eTokenHud);
Hooks.on("renderTokenConfig", extendTokenConfig);


// Expire ActiveEffects
let secondsSinceRecovery = 0;
let lastDate = 0;

/**
 * Handle follow-up actions when the official World time is changed
 * @param {number} worldTime      The new canonical World time.
 * @param {object} options        Options passed from the requesting client where the change was made
 * @param {string} userId         The ID of the User who advanced the time
 */
Hooks.on('updateWorldTime', async (worldTime, options, userId) => {

    const start = new Date();

    // Guard
    if (!lastDate) game.user.getFlag(game.system.id, "lastDate") || 0;


    let deltaSeconds = parseInt(options || 0);
    secondsSinceRecovery += deltaSeconds;

    const multiplier = Math.floor(secondsSinceRecovery / 12);
    secondsSinceRecovery = Math.max(0, secondsSinceRecovery - secondsSinceRecovery * multiplier);

    // Charges and Body use days
    const dt = new Date(worldTime * 1000)
    dt.setHours(0);
    dt.setMinutes(0);
    dt.setSeconds(0);
    dt.setMilliseconds(0);
    const today = dt.valueOf();

    // All actors plus any unlinked actors in active scene
    let actors = Array.from(game.actors);
    for (let token of game.scenes.current.tokens) {
        if (token.actor) {
            actors.push(token.actor);
        }
    }

    for (let actor of actors) {
        const characteristicCosts = actor.system.is5e ? CONFIG.HERO.characteristicCosts5e : CONFIG.HERO.characteristicCosts

        // Create a natural body healing if needed
        const naturalBodyHealing = actor.temporaryEffects.find(o => o.name.indexOf("Natural Body Healing") > -1);
        if (actor.type === "pc" && !naturalBodyHealing && parseInt(actor.system.characteristics.body.value) < parseInt(actor.system.characteristics.body.max)) {
            const bodyPerMonth = parseInt(actor.system.characteristics.rec.value);
            const secondsPerBody = Math.floor(2.628e+6 / bodyPerMonth);
            let activeEffect =
            {
                name: `Natural Body Healing (${bodyPerMonth}/month)`,
                id: 'naturalBodyHealing',
                icon: 'systems/hero6efoundryvttv2/icons/heartbeat.svg', //'icons/svg/regen.svg',
                duration: {
                    seconds: secondsPerBody,
                }
            }
            await actor.addActiveEffect(activeEffect);
        }

        // Delete natural body healing when body value = max (typically by manual adjustment)
        if (naturalBodyHealing && parseInt(actor.system.characteristics.body.value) >= parseInt(actor.system.characteristics.body.max)) {
            await naturalBodyHealing.delete();
        }


        // Active Effects
        for (let ae of actor.temporaryEffects) {


            let fade = 0;
            let name = ae.name;

            // With Simple Calendar you can move time ahead in large steps.
            // Need to loop as multiple fades may be required.
            let d = ae._prepareDuration();
            while (d.remaining != null && d.remaining <= 0) {
                // Add duration to startTime
                let x = ae.duration.startTime;
                ae.duration.startTime += d.duration;
                d = ae._prepareDuration();
                await ae.update({ duration: ae.duration });


                // Fade by 5 ActivePoints
                let _fade = Math.min(ae.flags.activePoints, 5);
                ae.flags.activePoints -= _fade;
                fade += _fade;

                if (ae.changes.length > 0) {
                    let value = parseInt(ae.changes[0].value);
                    let XMLID = ae.flags.XMLID;
                    let target = ae.flags.target;
                    let source = ae.flags.source;
                    let ActivePoints = ae.flags.activePoints;
                    let costPerPoint = parseFloat(characteristicCosts[target.toLowerCase()]) * AdjustmentMultiplier(target.toUpperCase());
                    let newLevels = parseInt(ActivePoints / costPerPoint);
                    ae.changes[0].value = value < 0 ? -parseInt(newLevels) : parseInt(newLevels);
                    ae.name = `${XMLID} ${parseInt(ae.changes[0].value) > 0 ? "+" : ""}${newLevels} ${target.toUpperCase()} [${source}]`;

                    // If ActivePoints <= 0 then remove effect
                    if (ae.flags.activePoints <= 0) {
                        //content += `  Effect deleted.`;
                        await ae.delete();
                    } else {
                        await ae.update({ name: ae.name, changes: ae.changes, flags: ae.flags }); //duration: ae.duration, 
                    }

                    // DRAIN fade (increase VALUE)
                    if (value < 0) {
                        let delta = -value - newLevels;
                        let newValue = Math.min(parseInt(actor.system.characteristics[target].max), parseInt(actor.system.characteristics[target].value) + delta);
                        actor.update({ [`system.characteristics.${target}.value`]: newValue })
                    } else

                    // AID fade (VALUE = max)
                    {
                        let newValue = Math.min(parseInt(actor.system.characteristics[target].max), parseInt(actor.system.characteristics[target].value));
                        actor.update({ [`system.characteristics.${target}.value`]: newValue })
                    }

                    if (ae.flags.activePoints <= 0) break;
                }
                else {
                    // No changes defined

                    // Natural Body Healing
                    if (ae.name.indexOf("Natural Body Healing") > -1) {
                        let bodyValue = parseInt(actor.system.characteristics.body.value);
                        let bodyMax = parseInt(actor.system.characteristics.body.max);
                        bodyValue = Math.min(bodyValue + 1, bodyMax);
                        actor.update({ 'system.characteristics.body.value': bodyValue });

                        if (bodyValue === bodyMax) {
                            ae.delete();
                            break;
                        } else {
                            //await ae.update({ duration: ae.duration });
                        }
                    }
                }
                
            }


            if (fade) {
                let content = `${actor.name}: ${name} fades by ${fade} active points.`;
                if (ae.flags.activePoints <= 0) {
                    content += `  Effect deleted.`;
                }

                const chatData = {
                    user: game.user.id, //ChatMessage.getWhisperRecipients('GM'),
                    whisper: ChatMessage.getWhisperRecipients("GM"),
                    speaker: ChatMessage.getSpeaker({ actor: this }),
                    blind: true,
                    content: content,
                }
                await ChatMessage.create(chatData)
            }

            

        }

        //game.user.setFlag(game.system.id, "secondsSinceRan", 0)

        // Out of combat recovery.  When SimpleCalendar is used to advance time.
        // This simple routine only handles increments of 12 seconds or more.
        const automation = game.settings.get("hero6efoundryvttv2", "automation");
        if ((automation === "all") || (automation === "npcOnly" && actor.type == 'npc') || (automation === "pcEndOnly" && actor.type === 'pc')) {

            if (multiplier > 0 && (
                parseInt(actor.system.characteristics.end.value) < parseInt(actor.system.characteristics.end.max) ||
                parseInt(actor.system.characteristics.stun.value) < parseInt(actor.system.characteristics.stun.max))
            ) {
                await actor.removeActiveEffect(HeroSystem6eActorActiveEffects.stunEffect);
                let rec = parseInt(actor.system.characteristics.rec.value) * multiplier;
                actor.system.characteristics.end.value = Math.min(parseInt(actor.system.characteristics.end.max), parseInt(actor.system.characteristics.end.value) + rec)
                actor.system.characteristics.stun.value = Math.min(parseInt(actor.system.characteristics.stun.max), parseInt(actor.system.characteristics.stun.value) + rec)
                actor.update({ 'system.characteristics.end.value': actor.system.characteristics.end.value, 'system.characteristics.stun.value': actor.system.characteristics.stun.value }, { 'render': true })
            }
        }




        // Charges Recover each day
        if (today > lastDate) {
            const itemsWithCharges = actor.items.filter(o => o.system.charges?.max);
            let content = "";
            for (let item of itemsWithCharges) {
                let value = parseInt(item.system.charges.value);
                let max = parseInt(item.system.charges.max);
                if (value < max) {
                    content += `${actor.name}/${item.name} ${value} to ${max} charges.  `;
                    item.update({ 'system.charges.value': max })
                }

            }

            if (content) {
                const chatData = {
                    user: game.user.id, //ChatMessage.getWhisperRecipients('GM'),
                    whisper: ChatMessage.getWhisperRecipients("GM"),
                    speaker: ChatMessage.getSpeaker({ actor: actor }),
                    blind: true,
                    content: content,
                }
                await ChatMessage.create(chatData)
            }
        }

    }

    if (today != lastDate) {
        lastDate = today
        game.user.setFlag(game.system.id, "lastDate", lastDate)
    }

    // If there are lots of actors updateWorldTime may result in performance issues.
    // Notify GM when this is a concern.
    const deltaMs = new Date() - start
    if (game.user.isGM && game.settings.get(game.system.id, 'alphaTesting') && deltaMs > 100) {
        return ui.notifications.warn(`updateWorldTime took ${deltaMs} ms`);
    }

});