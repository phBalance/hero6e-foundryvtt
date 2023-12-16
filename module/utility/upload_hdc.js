import { HEROSYS } from "../herosystem6e.js";
import { HeroSystem6eItem } from "../item/item.js";
import { RoundFavorPlayerDown } from "../utility/round.js";
import { getPowerInfo, getModifierInfo } from "../utility/util.js";
import { AdjustmentSources } from "../utility/adjustment.js";
import { HeroSystem6eActor } from "../actor/actor.js";

export async function applyCharacterSheet(xmlDoc) {
    const characterTemplate = xmlDoc
        .getElementsByTagName("CHARACTER")[0]
        .getAttribute("TEMPLATE");
    const characterInfo = xmlDoc.getElementsByTagName("CHARACTER_INFO")[0];
    const characteristics = xmlDoc.getElementsByTagName("CHARACTERISTICS")[0];
    const skills = xmlDoc.getElementsByTagName("SKILLS")[0];
    const powers = xmlDoc.getElementsByTagName("POWERS")[0];
    const perks = xmlDoc.getElementsByTagName("PERKS")[0];
    const talents = xmlDoc.getElementsByTagName("TALENTS")[0];
    const martialarts = xmlDoc.getElementsByTagName("MARTIALARTS")[0];
    const complications = xmlDoc.getElementsByTagName("DISADVANTAGES")[0];
    const equipment = xmlDoc.getElementsByTagName("EQUIPMENT")[0];
    const image = xmlDoc.getElementsByTagName("IMAGE")[0];

    // Individual changes to the actor are not very efficient.
    // Instead save all the changes and perform a bulk update.
    let changes = {};
    changes[`system.characterTemplate`] = characterTemplate;

    if (characterInfo.getAttribute("CHARACTER_NAME") !== "") {
        let name = characterInfo.getAttribute("CHARACTER_NAME");
        changes[`name`] = name;

        // Override name of prototype token if HDC upload was from library
        if (this.actor.prototypeToken) {
            changes[`prototypeToken.name`] = name;
        }

        // Overwrite token name if PC
        if (this.token) {
            if (this.actor.type == "pc") {
                await this.token.update(
                    { name: name },
                    { hideChatMessage: true },
                );
            }
        }
    }

    // Biography
    for (let child of characterInfo.children) {
        changes[`system.${child.nodeName}`] = child.textContent.trim() || "";
    }
    if (this.actor.system.biography) {
        changes[`system.biography`] = "";
    }

    // Remove all existing effects
    await this.actor.deleteEmbeddedDocuments(
        "ActiveEffect",
        this.actor.effects.map((o) => o.id),
    );

    // Remove all items from
    await this.actor.deleteEmbeddedDocuments(
        "Item",
        Array.from(this.actor.items.keys()),
    );

    // Remove properties that are not part of the default template
    const _actor = await HeroSystem6eActor.create(
        {
            name: "Test Actor",
            type: this.actor.type,
        },
        { temporary: true },
    );
    const _system = _actor.system;
    const schemaKeys = Object.keys(_system);
    for (const key of schemaKeys) {
        if (!Object.keys(this.actor.system).includes(key)) {
            changes[`system.-=${key}`] = null;
        }
    }

    // 6e vs 5e
    if (!characterTemplate) {
        // No template defined, so we will assume if COM-liness exists it is 5E.
        if (characteristics.querySelector("COM")) {
            ui.notifications.warn(
                `Import is missing Hero Designer character template.  Assuming 5E.`,
            );
            this.actor.update(
                { "system.is5e": true },
                { render: false },
                { hideChatMessage: true },
            );
        } else {
            ui.notifications.warn(
                `Import is missing Hero Designer character template.  Assuming 6E.`,
            );
            this.actor.update(
                { "system.is5e": false },
                { render: false },
                { hideChatMessage: true },
            );
        }
    } else {
        if (
            characterTemplate &&
            characterTemplate.includes("builtIn.") &&
            !characterTemplate.includes("6E.")
        ) {
            this.actor.update(
                { "system.is5e": true },
                { render: false },
                { hideChatMessage: true },
            );
        } else {
            this.actor.update(
                { "system.is5e": false },
                { render: false },
                { hideChatMessage: true },
            );
        }

        // Override existing actor type?  (npc, vehicles, bases, computers, automatons, ai or pc/npc)
        let targetType = this.actor.type;
        if (characterTemplate.match(/[.]Vehicle/i)) {
            targetType = "vehicle";
        }
        if (characterTemplate.match(/[.]Base/i)) {
            targetType = "base2";
        }
        if (characterTemplate.match(/[.]Automaton/i)) {
            targetType = "automaton";
        }
        if (characterTemplate.match(/[.]Computer/i)) {
            targetType = "computer";
        }
        if (characterTemplate.match(/[.]AI/i)) {
            targetType = "ai";
        }
        if (
            characterTemplate.match(/Heroic/i) &&
            !["pc", "npc"].includes(targetType)
        ) {
            targetType = "pc";
        }
        if (targetType != this.actor.type) {
            await this.actor.update({ type: targetType });
        }
    }

    //const characteristicCosts = this.actor.system.is5e ? CONFIG.HERO.characteristicCosts5e : CONFIG.HERO.characteristicCosts

    // Caracteristics for 6e
    //let characteristicKeys = Object.keys(characteristicCosts)

    // determine spd upfront for velocity calculations
    //let spd
    // let value
    // let characteristicDefaults = CONFIG.HERO.characteristicDefaults
    // if (this.actor.system.is5e) {
    //     characteristicDefaults = CONFIG.HERO.characteristicDefaults5e
    // }

    // 5e loading over 6e fix
    if (this.actor.system.is5e) {
        changes[`system.characteristics.ocv.core`] = null;
        changes[`system.characteristics.dcv.core`] = null;
        changes[`system.characteristics.omcv.core`] = null;
        changes[`system.characteristics.dmcv.core`] = null;
    }

    for (const characteristic of characteristics.children) {
        const key = characteristic.getAttribute("XMLID").toLowerCase(); //CONFIG.HERO.characteristicsXMLKey[characteristic.getAttribute('XMLID')]
        const levels = parseInt(characteristic.getAttribute("LEVELS"));
        //let value = (getPowerInfo({ xmlid: key.toUpperCase(), actor: this.actor }).base || 0) + levels
        let value =
            this.actor.getCharacteristicBase(key.toUpperCase()) + levels;

        // if (key === "leaping" && this.actor.system.is5e) {
        //     const str = parseInt(changes[`system.characteristics.str.core`])
        //     if (str >= 3) value = 0.5
        //     if (str >= 5) value = 1
        //     if (str >= 8) value = 1.5
        //     if (str >= 10) value = 2
        //     if (str >= 13) value = 2.5
        //     if (str >= 15) value = 3
        //     if (str >= 18) value = 3.5
        //     if (str >= 20) value = 4
        //     if (str >= 23) value = 4.5
        //     if (str >= 25) value = 5
        //     if (str >= 28) value = 5.5
        //     if (str >= 30) value = 6
        //     if (str >= 35) value = 7
        //     if (str >= 40) value = 8
        //     if (str >= 45) value = 9
        //     if (str >= 50) value = 10
        //     if (str >= 55) value = 11
        //     if (str >= 60) value = 12
        //     if (str >= 65) value = 13
        //     if (str >= 70) value = 14
        //     if (str >= 75) value = 15
        //     if (str >= 80) value = 16
        //     if (str >= 85) value = 17
        //     if (str >= 90) value = 18
        //     if (str >= 95) value = 19
        //     if (str >= 100) value = 20 + Math.floor((str - 100) / 5)
        //     changes[`system.characteristics.leaping.base`] = RoundFavorPlayerUp(value)
        //     value += parseInt(characteristic.getAttribute('LEVELS'))

        // }

        changes[`system.characteristics.${key}.value`] = value;
        changes[`system.characteristics.${key}.max`] = value;
        changes[`system.characteristics.${key}.core`] = value;
        this.actor.system.characteristics[key].core = value;
        // let cost = Math.round(levels * characteristicCosts[key])
        // changes[`system.characteristics.${key}.basePointsPlusAdders`] = cost
        // changes[`system.characteristics.${key}.realCost`] = cost
        // changes[`system.characteristics.${key}.activePoints`] = cost

        // if (key in CONFIG.HERO.movementPowers) {
        //     let name = characteristic.getAttribute('NAME')
        //     name = (name === '') ? characteristic.getAttribute('ALIAS') : name
        //     //const velocity = Math.round((spd * value) / 12)
        //     const itemData = {
        //         name: name,
        //         type: 'movement',
        //         system: {
        //             type: key,
        //             editable: false,
        //             base: value,
        //             value,
        //             //velBase: velocity,
        //             //velValue: velocity,
        //             class: key,
        //         }
        //     }

        //     await HeroSystem6eItem.create(itemData, { parent: this.actor })
        // }
    }

    if (this.actor.system.is5e) {
        // Base OCV & DCV = Attacker’s DEX/3
        let value = this.actor.getCharacteristicBase("OCV");
        changes[`system.characteristics.ocv.value`] = value;
        changes[`system.characteristics.ocv.max`] = value;
        changes[`system.characteristics.dcv.value`] = value;
        changes[`system.characteristics.dcv.max`] = value;

        //Base Ego Combat Value = EGO/3
        value = this.actor.getCharacteristicBase("OMCV");
        changes[`system.characteristics.omcv.value`] = value;
        changes[`system.characteristics.omcv.max`] = value;
        changes[`system.characteristics.dmcv.value`] = value;
        changes[`system.characteristics.dmcv.max`] = value;
    }

    await this.actor.update(changes, { render: false });

    for (const skill of skills.children) {
        await uploadSkill.call(this, skill);
    }

    // EXTRA DCs from martial arts
    // let extraDc = 0
    // const _extraDc = martialarts.getElementsByTagName('EXTRADC')[0]
    // if (_extraDc) {
    //     extraDc = parseInt(_extraDc.getAttribute("LEVELS"))
    // }

    // Possible TK martiarts (very rare with GM approval; requires BAREHAND weapon element with telekinesis/Psychokinesis in notes)
    // let usesTk = false
    // const _weaponElement = martialarts.getElementsByTagName('WEAPON_ELEMENT')[0]
    // if (_weaponElement && $(_weaponElement).find('[XMLID="BAREHAND"]')[0] && $(powers).find('[XMLID="TELEKINESIS"]')[0]) {

    //     const notes = _weaponElement.getElementsByTagName("NOTES")[0] || ""
    //     if (notes.textContent.match(/kinesis/i)) {
    //         usesTk = true
    //     }
    // }

    // EXTRADC goes first (so we can more easily add these DC's to MANEUVER's)
    for (const martialart of martialarts.querySelectorAll(
        "EXTRADC, RANGEDDC",
    )) {
        try {
            await uploadMartial.call(this, martialart, "martialart");
        } catch (e) {
            ui.notifications.error(
                `${this.actor.name} has item "${(
                    martialart.getAttribute("NAME") ||
                    martialart.getAttribute("XMLID")
                ).substr(0, 30)}" which failed to upload`,
            );
            console.log(e);
        }
    }

    // WEAPON_ELEMENT next
    for (const martialart of martialarts.querySelectorAll("WEAPON_ELEMENT")) {
        try {
            await uploadMartial.call(this, martialart, "martialart");
        } catch (e) {
            ui.notifications.error(
                `${this.actor.name} has item "${(
                    martialart.getAttribute("NAME") ||
                    martialart.getAttribute("XMLID")
                ).substr(0, 30)}" which failed to upload`,
            );
            console.log(e);
        }
    }

    // MANEUVER next
    for (const martialart of martialarts.querySelectorAll("MANEUVER")) {
        try {
            await uploadMartial.call(this, martialart, "martialart");
        } catch (e) {
            ui.notifications.error(
                `${this.actor.name} has item "${(
                    martialart.getAttribute("NAME") ||
                    martialart.getAttribute("XMLID")
                ).substr(0, 30)}" which failed to upload`,
            );
            console.log(e);
        }
    }

    for (const power of powers.children) {
        try {
            await uploadPower.call(this, power, "power");
        } catch (e) {
            ui.notifications.error(
                `${this.actor.name} has item "${(
                    power.getAttribute("NAME") || power.getAttribute("XMLID")
                ).substr(0, 30)}" which failed to upload`,
            );
            console.log(e);
        }
    }

    for (const perk of perks.children) {
        try {
            await uploadBasic.call(this, perk, "perk");
        } catch (e) {
            ui.notifications.error(
                `${this.actor.name} has item "${(
                    perk.getAttribute("NAME") || perk.getAttribute("XMLID")
                ).substr(0, 30)}" which failed to upload`,
            );
            console.log(e);
        }
    }

    for (const talent of talents.children) {
        try {
            await uploadBasic.call(this, talent, "talent");
        } catch (e) {
            ui.notifications.error(
                `${this.actor.name} has item "${(
                    talent.getAttribute("NAME") || talent.getAttribute("XMLID")
                ).substr(0, 30)}" which failed to upload`,
            );
            console.log(e);
        }
    }

    for (const complication of complications.children) {
        try {
            await uploadBasic.call(this, complication, "complication");
        } catch (e) {
            ui.notifications.error(
                `${this.actor.name} has item "${(
                    complication.getAttribute("NAME") ||
                    complication.getAttribute("XMLID")
                ).substr(0, 30)}" which failed to upload`,
            );
            console.log(e);
        }
    }

    for (const equip of equipment.children) {
        try {
            await uploadPower.call(this, equip, "equipment");
        } catch (e) {
            ui.notifications.error(
                `${equip.actor.name} has item "${(
                    equip.getAttribute("NAME") || equip.getAttribute("XMLID")
                ).substr(0, 30)}" which failed to upload`,
            );
            console.log(e);
        }
    }

    // combat maneuvers
    async function loadCombatManeuvers(dict, actor) {
        for (const entry of Object.entries(dict)) {
            const name = entry[0];
            const v = entry[1];
            const PHASE = v[0];
            const OCV = v[1];
            const DCV = v[2];
            const EFFECT = v[3];
            const attack = v[4];
            const XMLID = name.toUpperCase().replace(" ", ""); // A fake XMLID
            const itemData = {
                name,
                type: "maneuver",
                system: {
                    PHASE,
                    OCV,
                    DCV,
                    EFFECT,
                    active: false,
                    description: EFFECT,
                    XMLID,
                },
            };

            let item = await HeroSystem6eItem.create(itemData, {
                parent: actor,
            });
            if (attack) {
                await makeAttack(item);
            }
        }
    }

    // Perception Skill
    const itemDataPerception = {
        name: "Perception",
        type: "skill",
        system: {
            XMLID: "PERCEPTION",
            ALIAS: "Perception",
            CHARACTERISTIC: "int",
            state: "trained",
            levels: "0",
        },
    };

    await HeroSystem6eItem.create(itemDataPerception, { parent: this.actor });

    await loadCombatManeuvers(CONFIG.HERO.combatManeuvers, this.actor);

    if (game.settings.get("hero6efoundryvttv2", "optionalManeuvers")) {
        await loadCombatManeuvers(
            CONFIG.HERO.combatManeuversOptional,
            this.actor,
        );
    }

    // Actor Image
    if (image) {
        let filename = image.getAttribute("FileName");
        let extension = filename.split(".").pop();
        let base64 = "data:image/" + extension + ";base64," + image.textContent;
        let path = "worlds/" + game.world.id;
        if (this.actor.img.indexOf(filename) == -1) {
            await ImageHelper.uploadBase64(base64, filename, path);
            await this.actor.update(
                { [`img`]: path + "/" + filename },
                { render: false },
                { hideChatMessage: true },
            );
        }
    }

    // // Default Strike attack
    // let itemData = {
    //     type: "attack",
    //     name: "strike",
    //     system: {
    //         //xmlid: "HANDTOHANDATTACK",
    //         knockbackMultiplier: 1,
    //         usesStrength: true,
    //         rules: "This is the basic attack maneuver",
    //         XMLID: "HANDTOHANDATTACK",
    //         NAME: "Strike",
    //         LEVELS: { value: 0, max: 0 },
    //         ALIAS: "HANDTOHANDATTACK",
    //     }

    // }
    // await HeroSystem6eItem.create(itemData, { parent: this.actor })

    await updateItemSubTypes(this.actor);

    // Combat Skill Levels - Enumerate attacks that use OCV
    for (let cslItem of this.actor.items.filter((o) =>
        ["MENTAL_COMBAT_LEVELS", "COMBAT_LEVELS"].includes(o.system.XMLID),
    )) {
        let _ocv = "ocv";
        if (cslItem.system.XMLID === "MENTAL_COMBAT_LEVELS") {
            _ocv = "omcv";
        }

        let attacks = {};
        let checkedCount = 0;

        for (let attack of this.actor.items.filter(
            (o) =>
                (o.type == "attack" || o.system.subType == "attack") &&
                o.system.uses === _ocv,
        )) {
            let checked = false;

            // Attempt to determine if attack should be checked
            if (
                cslItem.system.OPTION_ALIAS.toLowerCase().indexOf(
                    attack.name.toLowerCase(),
                ) > -1
            ) {
                checked = true;
            }

            if (
                cslItem.system.OPTION === "HTH" &&
                (attack.system.XMLID === "HTH" ||
                    attack.system.XMLID === "HANDTOHANDATTACK" ||
                    attack.system.XMLID === "HKA" ||
                    attack.system.XMLID === "MANEUVER" ||
                    (attack.type === "maneuver" &&
                        !attack.system.EFFECT?.match(/throw/i)))
            ) {
                checked = true;
            }

            if (
                cslItem.system.OPTION === "RANGED" &&
                (attack.system.XMLID === "BLAST" ||
                    attack.system.XMLID === "RKA")
            ) {
                checked = true;
            }

            if (cslItem.system.OPTION === "ALL") {
                checked = true;
            }

            if (cslItem.system.OPTION === "TIGHT") {
                // up to three
                if (
                    cslItem.system.XMLID === "COMBAT_LEVELS" &&
                    attack.type != "maneuver" &&
                    checkedCount < 3
                ) {
                    checked = true;
                }

                // up to three
                if (
                    cslItem.system.XMLID === "MENTAL_COMBAT_LEVELS" &&
                    checkedCount < 3
                ) {
                    checked = true;
                }
            }

            if (cslItem.system.OPTION === "BROAD") {
                // A large group is more than 3 but less than ALL (whatever that means).
                // For now just assume all (non maneuvers).
                if (
                    cslItem.system.XMLID === "COMBAT_LEVELS" &&
                    attack.type != "maneuver"
                ) {
                    checked = true;
                }

                // For mental BROAD is actuallyl equal to ALL
                if (cslItem.system.XMLID === "MENTAL_COMBAT_LEVELS") {
                    checked = true;
                }
            }

            attacks[attack.id] = checked;

            if (checked) checkedCount++;
        }

        // Make sure at least one attacked is checked
        // if (checkedCount === 0 && Object.keys(attacks).length > 0) {
        //     attacks[Object.keys(attacks)[0]] = true;
        // }

        await cslItem.update(
            { "system.attacks": attacks },
            { hideChatMessage: true },
        );
    }

    await this.actor.calcCharacteristicsCost();

    // Make sure VALUE = MAX.
    // We may have applied ActiveEffectcs to MAX.
    for (let char of Object.keys(this.actor.system.characteristics)) {
        if (
            this.actor.system.characteristics[char].value !=
            this.actor.system.characteristics[char].max
        ) {
            await this.actor.update(
                {
                    [`system.characteristics.${char}.value`]:
                        this.actor.system.characteristics[char].max,
                },
                { render: false },
                { hideChatMessage: true },
            );
        }
    }

    await CalcActorRealAndActivePoints(this.actor);

    // We did all our updates with render: false
    // Now were all done so render.
    this.actor.render();

    // Update actor sidebar (needed when name is changed)
    ui.actors.render();

    ui.notifications.info(`${this.actor.name} upload complete`);

    Hooks.call("hdcUpload");
}

// Move to Actor?
export async function CalcActorRealAndActivePoints(actor) {
    await ui.warn.info(`called old CalcActorRealAndActivePoints`);

    return actor.CalcActorRealAndActivePoints();
}

export function XmlToItemData(xml, type) {
    const xmlid = xml.getAttribute("XMLID");

    const configPowerInfo = getPowerInfo({ xmlid: xmlid, actor: this?.actor });
    // if (!configPowerInfo)
    // {
    //     if (game.settings.get(game.system.id, 'alphaTesting')) {
    //         ui.notifications.warn(`${this.actor.name} has item ${xmlid} which it not defined in config.js`);
    //     }
    // }

    let systemData = {
        id: xmlid,
        rules: xmlid,
        adders: [],
        modifiers: [],
        powers: [],
    };

    // Add XML attributes to ItemData.
    const relevantFields = [
        "XMLID",
        "BASECOST",
        "LEVELS",
        "ALIAS",
        "MULTIPLIER",
        "NAME",
        "OPTION_ALIAS",
        "SFX",
        "PDLEVELS",
        "EDLEVELS",
        "MDLEVELS",
        "INPUT",
        "OPTION",
        "OPTIONID",
        "BASECOST",
        "PRIVATE",
        "EVERYMAN",
        "CHARACTERISTIC",
        "NATIVE_TONGUE",
        "POWDLEVELS",
        "WEIGHT",
        "PRICE",
        "CARRIED",
        "LENGTHLEVELS",
        "HEIGHTLEVELS",
        "WIDTHLEVELS",
        "BODYLEVELS",
        "ID",
        "PARENTID",
        "POSITION",
        "AFFECTS_PRIMARY",
        "AFFECTS_TOTAL",
        "CATEGORY",
        "PHASE",
        "OCV",
        "DCV",
        "DC",
        "EFFECT",
        "ADD_MODIFIERS_TO_BASE",
        "USE_END_RESERVE",
        "ULTRA_SLOT",
        "USESTANDARDEFFECT",
    ];
    for (const attribute of xml.attributes) {
        if (relevantFields.includes(attribute.name)) {
            switch (attribute.name) {
                case "CARRIED":
                    systemData.active = attribute.value == "Yes" ? true : false;
                    break;
                case "WEIGHT":
                    // Convert lbs to kg
                    systemData[attribute.name] = (
                        parseFloat(attribute.value) / 2.20462
                    ).toFixed(2);
                    break;
                case "LEVELS":
                    // case "PDLEVELS":
                    // case "EDLEVELS":
                    // case "MDLEVELS":
                    // case "LENGTHLEVELS":
                    // case "HEIGHTLEVELS":
                    // case "WIDTHLEVELS":
                    // case "BODYLEVELS":
                    systemData[attribute.name] = {
                        value: attribute.value,
                        max: attribute.value,
                    };
                    break;
                default:
                    switch (attribute.value.toUpperCase()) {
                        case "YES":
                            systemData[attribute.name] = true;
                            break;
                        case "NO":
                            systemData[attribute.name] = false;
                            break;
                        default:
                            systemData[attribute.name] = attribute.value;
                    }
            }
        }
    }

    // Make sure we have a name
    systemData.NAME = systemData.NAME || systemData.ALIAS;

    switch (systemData.NAME && systemData.INPUT) {
        case "Aid":
            systemData.NAME += " " + systemData.INPUT;
            break;
    }

    if (
        ["MENTAL_COMBAT_LEVELS", "PENALTY_SKILL_LEVELS"].includes(
            systemData.XMLID,
        )
    ) {
        switch (systemData.OPTION) {
            case "SINGLE":
                systemData.costPerLevel = 1;
                break;
            case "TIGHT":
                systemData.costPerLevel = 3;
                break;
            case "BROAD":
                systemData.costPerLevel = 6;
                break;
            default:
                HEROSYS.log(false, systemData.OPTION);
        }
    }

    if (systemData.XMLID == "COMBAT_LEVELS") {
        switch (systemData.OPTION) {
            case "SINGLE":
                systemData.costPerLevel = 2;
                break;
            case "TIGHT":
                systemData.costPerLevel = 3;
                break;
            case "BROAD":
                systemData.costPerLevel = 5;
                break;
            case "HTH":
                systemData.costPerLevel = 8;
                break;
            case "RANGED":
                systemData.costPerLevel = 8;
                break;
            case "ALL":
                systemData.costPerLevel = 10;
                break;

            default:
                HEROSYS.log(false, systemData.OPTION);
        }

        // Make sure CSL's are defined
        systemData.csl = {};
        for (let c = 0; c < parseInt(systemData.LEVELS.value); c++) {
            systemData.csl[c] = "ocv";
        }
    }

    if (systemData.XMLID == "MENTAL_COMBAT_LEVELS") {
        // Make sure CSL's are defined
        systemData.csl = {};
        for (let c = 0; c < parseInt(systemData.LEVELS.value); c++) {
            systemData.csl[c] = "omcv";
        }
    }

    if (systemData.XMLID == "SKILL_LEVELS") {
        switch (systemData.OPTION) {
            case "CHARACTERISTIC":
                systemData.costPerLevel = 2;
                break;
            case "RELATED":
                systemData.costPerLevel = 3;
                break;
            case "GROUP":
                systemData.costPerLevel = 4;
                break;
            case "AGILITY":
                systemData.costPerLevel = 6;
                break;
            case "NONCOMBAT":
                systemData.costPerLevel = 10;
                break;
            case "SINGLEMOVEMENT":
                systemData.costPerLevel = 2;
                break;
            case "ALLMOVEMENT":
                systemData.costPerLevel = 3;
                break;
            case "OVERALL":
                systemData.costPerLevel = 12;
                break;
            default:
                HEROSYS.log(false, systemData.OPTION);
        }
    }

    // AID, DRAIN, TRANSFER (any adjustment power)

    if (configPowerInfo && configPowerInfo.powerType?.includes("adjustment")) {
        // Make sure we have a valid INPUT
        let choices = AdjustmentSources(this.actor);
        systemData.INPUT = (systemData.INPUT || "").trim();

        // TRANSFER X to Y  (AID and DRAIN only have X)
        let xmlidX = (systemData.INPUT.match(/\w+/) || [""])[0];
        let xmlidY = (systemData.INPUT.match(/to[ ]+(\w+)/i) || ["", ""])[1];

        // Uppercase
        systemData.INPUT = xmlidX.toUpperCase();
        xmlidX = xmlidX.toUpperCase();

        if (xmlidY) {
            systemData.INPUT += " to " + xmlidY.toUpperCase();
            xmlidY = xmlidY.toUpperCase();
        }

        if (!choices[xmlidX] || xmlidX == "") {
            ui.notifications.warn(
                `${systemData.XMLID} adjustment of source ${
                    xmlidX || "UNDEFINED"
                } not supported.`,
            );
        }

        if (
            systemData.XMLID === "TRANSFER" &&
            (!choices[xmlidY] || xmlidY == "")
        ) {
            ui.notifications.warn(
                `${systemData.XMLID} adjustment of destination ${
                    xmlidX || "UNDEFINED"
                } not supported.`,
            );
        }
    }

    // POWERS (sub power like ENDURANCERESERVEREC )
    for (let POWER2 of xml.querySelectorAll(":scope > POWER")) {
        let _power = {};
        for (const attribute of POWER2.attributes) {
            switch (attribute.value.toUpperCase()) {
                case "YES":
                    _power[attribute.name] = true;
                    break;
                case "NO":
                    _power[attribute.name] = false;
                    break;
                default:
                    _power[attribute.name] = attribute.value;
            }
        }

        // For some reason some MODIFIERs have a 0 value.
        // We will override those values as necessary.
        const modifierInfo = getModifierInfo({ xmlid: _power.XMLID });
        if (modifierInfo?.BASECOST) {
            _power.BASECOST = modifierInfo?.BASECOST || _power.BASECOST;
        }

        systemData.powers.push(_power);
    }

    // ADDERS
    for (let ADDER of xml.querySelectorAll(":scope > ADDER")) {
        let _adder = { adders: [] };
        for (const attribute of ADDER.attributes) {
            switch (attribute.value.toUpperCase()) {
                case "YES":
                    _adder[attribute.name] = true;
                    break;
                case "NO":
                    _adder[attribute.name] = false;
                    break;
                default:
                    _adder[attribute.name] = attribute.value;
            }
        }

        // For some reason some ADDERs have a 0 value.
        // We will override those values as necessary.
        const adderInfo = getModifierInfo({ xmlid: _adder.XMLID });
        if (adderInfo?.BASECOST) {
            _adder.BASECOST = adderInfo?.BASECOST || _adder.BASECOST;
        }

        // ADDERs can have ADDERs.
        // And sometimes MODIFIERs, which we will coerce into an ADDER (CONTINUOUSCONCENTRATION).
        for (let ADDER2 of ADDER.querySelectorAll(
            ":scope > ADDER, :scope > ADDER",
        )) {
            let _adder2 = {};
            for (const attribute of ADDER2.attributes) {
                switch (attribute.value.toUpperCase()) {
                    case "YES":
                        _adder2[attribute.name] = true;
                        break;
                    case "NO":
                        _adder2[attribute.name] = false;
                        break;
                    default:
                        _adder2[attribute.name] = attribute.value;
                }
            }

            // For some reason some ADDERs have a 0 value.
            // We will override those values as necessary.
            const adder2Info = getModifierInfo({ xmlid: _adder2.XMLID });
            if (adder2Info?.BASECOST) {
                _adder2.BASECOST = adder2Info?.BASECOST || _adder2.BASECOST;
            }
            if (adder2Info?.MULTIPLIER) {
                _adder2.MULTIPLIER =
                    adder2Info?.MULTIPLIER || _adder2.MULTIPLIER;
            }

            _adder.adders.push(_adder2);
        }

        systemData.adders.push(_adder);
    }

    // MODIFIERS (which can have ADDERS as well)
    for (let MODIFIER of xml.querySelectorAll(":scope > MODIFIER")) {
        let _mod = { adders: [] };
        for (const attribute of MODIFIER.attributes) {
            switch (attribute.value.toUpperCase()) {
                case "YES":
                    _mod[attribute.name] = true;
                    break;
                case "NO":
                    _mod[attribute.name] = false;
                    break;
                default:
                    _mod[attribute.name] = attribute.value;
            }
        }

        // For some reason some MODIFIERs have a 0 value.
        // We will override those values as necessary.
        const modifierInfo = getModifierInfo({ xmlid: _mod.XMLID });
        if (modifierInfo?.BASECOST) {
            _mod.BASECOST = modifierInfo?.BASECOST || _mod.BASECOST;
        }

        // AOE BASECOST is also missing from HDC
        if (_mod.XMLID == "AOE" && parseFloat(_mod.BASECOST) == 0) {
            if (_mod.OPTION == "RADIUS" && parseInt(_mod.LEVELS) <= 32)
                _mod.BASECOST = 1.0;
            if (_mod.OPTION == "RADIUS" && parseInt(_mod.LEVELS) <= 16)
                _mod.BASECOST = 0.75;
            if (_mod.OPTION == "RADIUS" && parseInt(_mod.LEVELS) <= 8)
                _mod.BASECOST = 0.5;
            if (_mod.OPTION == "RADIUS" && parseInt(_mod.LEVELS) <= 4)
                _mod.BASECOST = 0.25;

            if (_mod.OPTION == "CONE" && parseInt(_mod.LEVELS) <= 64)
                _mod.BASECOST = 1.0;
            if (_mod.OPTION == "CONE" && parseInt(_mod.LEVELS) <= 32)
                _mod.BASECOST = 0.75;
            if (_mod.OPTION == "CONE" && parseInt(_mod.LEVELS) <= 16)
                _mod.BASECOST = 0.5;
            if (_mod.OPTION == "CONE" && parseInt(_mod.LEVELS) <= 8)
                _mod.BASECOST = 0.25;

            if (_mod.OPTION == "LINE" && parseInt(_mod.LEVELS) <= 125)
                _mod.BASECOST = 1.0;
            if (_mod.OPTION == "LINE" && parseInt(_mod.LEVELS) <= 64)
                _mod.BASECOST = 0.75;
            if (_mod.OPTION == "LINE" && parseInt(_mod.LEVELS) <= 32)
                _mod.BASECOST = 0.5;
            if (_mod.OPTION == "LINE" && parseInt(_mod.LEVELS) <= 16)
                _mod.BASECOST = 0.25;

            if (_mod.OPTION == "SURFACE" && parseInt(_mod.LEVELS) <= 16)
                _mod.BASECOST = 1.0;
            if (_mod.OPTION == "SURFACE" && parseInt(_mod.LEVELS) <= 8)
                _mod.BASECOST = 0.75;
            if (_mod.OPTION == "SURFACE" && parseInt(_mod.LEVELS) <= 4)
                _mod.BASECOST = 0.5;
            if (_mod.OPTION == "SURFACE" && parseInt(_mod.LEVELS) <= 2)
                _mod.BASECOST = 0.25;

            if (_mod.OPTION == "AREA" && parseInt(_mod.LEVELS) <= 16)
                _mod.BASECOST = 1.0;
            if (_mod.OPTION == "AREA" && parseInt(_mod.LEVELS) <= 8)
                _mod.BASECOST = 0.75;
            if (_mod.OPTION == "AREA" && parseInt(_mod.LEVELS) <= 4)
                _mod.BASECOST = 0.5;
            if (_mod.OPTION == "AREA" && parseInt(_mod.LEVELS) <= 2)
                _mod.BASECOST = 0.25;
        }

        if (_mod.XMLID == "REQUIRESASKILLROLL") {
            // <MODIFIER XMLID="REQUIRESASKILLROLL" ID="1589145772288" BASECOST="0.25" LEVELS="0" ALIAS="Requires A Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="14" OPTIONID="14" OPTION_ALIAS="14- roll" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
            // This is a limitation not an advantage, not sure why it is positive.  Force it negative.
            _mod.BASECOST = -Math.abs(parseFloat(_mod.BASECOST));
        }

        // MODIFIERs can have ADDERs.
        // And sometimes MODIFIERs, which we will coerce into an ADDER (CONTINUOUSCONCENTRATION).
        for (let ADDER of MODIFIER.querySelectorAll(
            ":scope > ADDER, :scope > MODIFIER",
        )) {
            let _adder = {};
            for (const attribute of ADDER.attributes) {
                switch (attribute.value.toUpperCase()) {
                    case "YES":
                        _adder[attribute.name] = true;
                        break;
                    case "NO":
                        _adder[attribute.name] = false;
                        break;
                    default:
                        _adder[attribute.name] = attribute.value;
                }
            }

            // For some reason some ADDERs have a 0 value.
            // We will override those values as necessary.
            const adderInfo = getModifierInfo({ xmlid: _adder.XMLID });
            if (adderInfo?.BASECOST) {
                _adder.BASECOST = adderInfo?.BASECOST || _adder.BASECOST;
            }
            if (adderInfo?.MULTIPLIER) {
                _adder.MULTIPLIER = adderInfo?.MULTIPLIER || _adder.MULTIPLIER;
            }

            _mod.adders.push(_adder);
        }
        systemData.modifiers.push(_mod);
    }

    // Charges do not typically use Endurance
    const charges = systemData.modifiers.find((o) => o.XMLID == "CHARGES");
    {
        const costsEnd = systemData.modifiers.find(
            (o) => o.XMLID == "COSTSEND",
        );
        if (charges && !costsEnd) {
            systemData.end = 0;
            systemData.charges = {
                value: parseInt(charges.OPTION_ALIAS),
                max: parseInt(charges.OPTION_ALIAS),
                recoverable: charges.adders.find(
                    (o) => o.XMLID == "RECOVERABLE",
                )
                    ? true
                    : false,
                continuing: charges.adders.find((o) => o.XMLID == "CONTINUING")
                    ?.OPTIONID,
            };
        }
    }

    // Make sure all defenses are enabled (if they don't have charges or AFFECTS_TOTAL = "No")
    if (configPowerInfo && configPowerInfo.powerType?.includes("defense")) {
        if (
            systemData.charges?.value > 0 ||
            systemData.AFFECTS_TOTAL === false ||
            configPowerInfo.duration === "instant"
        ) {
            systemData.active = false;
        } else {
            systemData.active = true;
        }
    }

    // Item name
    let name =
        xml.getAttribute("NAME").trim() ||
        xml.getAttribute("ALIAS").trim() ||
        xml.tagName;

    // Update Item Description (to closely match Hero Designer)
    updateItemDescription({
        actor: this?.actor,
        name: name,
        system: systemData,
        type: type,
    });

    // This item was created via HDC Upload (could be useful later)
    systemData.FromHdcUpload = true;

    // Create Item Data
    let itemData = {
        type: type,
        name: name,
        system: systemData,
    };

    createEffects.call(this, itemData);

    return itemData;
}

export async function uploadBasic(xml, type) {
    let itemData = XmlToItemData.call(this, xml, type);
    if (itemData.system.XMLID == "COMBAT_LUCK") {
        itemData.system.active = true;
    }
    const item = await HeroSystem6eItem.create(itemData, {
        parent: this.actor,
    });

    // // Some items should be copied and created as an attack
    // const configPowerInfo = getPowerInfo({ xmlid: itemData.system.XMLID, actor: this.actor })
    // if (configPowerInfo && configPowerInfo.powerType.includes("attack")) {
    //     await uploadAttack.call(this, xml)
    // }

    // Some items are attacks
    const configPowerInfo = getPowerInfo({
        xmlid: itemData.system.XMLID,
        actor: this?.actor,
    });
    if (configPowerInfo && configPowerInfo.powerType?.includes("attack")) {
        await makeAttack(item);
    }
}

export async function uploadMartial(power, type) {
    //if (power.getAttribute('XMLID') == "GENERIC_OBJECT") return;
    // GENERIC_OBJECT are likely Power Frameworks.
    // Rename GENERIC_OBJECT with TAGNAME to make it easier to parse.
    if (power.getAttribute("XMLID") == "GENERIC_OBJECT") {
        power.setAttribute("XMLID", power.tagName);
    }

    let itemData = XmlToItemData.call(this, power, type);
    let item = await HeroSystem6eItem.create(itemData, { parent: this.actor });

    // Make this martial item an attack, unless it is a +DC
    if (!["EXTRADC", "RANGEDDC"].includes(item.system.XMLID)) {
        makeAttack(item);
    }
}

export async function uploadSkill(skill, duplicate) {
    let itemData;

    // GENERIC_OBJECT are likely Power Frameworks.
    // Rename GENERIC_OBJECT with TAGNAME to make it easier to parse.
    if (skill.getAttribute("XMLID") == "GENERIC_OBJECT") {
        skill.setAttribute("XMLID", skill.tagName);
        itemData = XmlToItemData.call(this, skill, "skill");

        // This really isn't a skill so get rid of roll so sheet doesn't display a roll button
        itemData.system.characteristic = null;
        itemData.system.state = null;
        itemData.system.roll = null;
    } else {
        itemData = XmlToItemData.call(this, skill, "skill");
    }

    itemData.system.duplicate = duplicate;
    await HeroSystem6eItem.create(itemData, { parent: this.actor });
}

export async function calcItemPoints(item) {
    let changed = false;

    // For some reason some ADDERs have a 0 value.
    for (const adder of item.system?.adders || []) {
        const adderInfo = getModifierInfo({ xmlid: adder.XMLID });
        if (adderInfo?.BASECOST) {
            const baseCost = adderInfo?.BASECOST || adder.BASECOST;
            if (baseCost != adder.BASECOST) {
                adder.BASECOST = baseCost;
                await item.update({ "system.adders": item.system.adders });
                changed = true;
            }
        }
    }

    for (const modifier of item.system?.modifiers || []) {
        const modifierInfo = getModifierInfo({ xmlid: modifier.XMLID });
        let baseCost = modifierInfo?.BASECOST || modifier.BASECOST;
        if (baseCost != modifier.BASECOST) {
            modifier.BASECOST = baseCost;
            await item.update({ "system.modifiers": item.system.modifiers });
            changed = true;
        }

        for (const adder of modifier?.adders || []) {
            const adderInfo = getModifierInfo({ xmlid: adder.XMLID });
            if (adderInfo?.BASECOST) {
                let baseCost = adderInfo?.BASECOST || adder.BASECOST;
                if (baseCost != adder.BASECOST) {
                    adder.BASECOST = baseCost;
                    await item.update({
                        "system.modifiers": item.system.modifiers,
                    });
                    changed = true;
                }
            }
        }
    }

    changed = changed || calcBasePointsPlusAdders(item);
    changed = changed || calcActivePoints(item);
    changed = changed || calcRealCost(item);
    return changed;
}

function calcBasePointsPlusAdders(item) {
    let system = item.system;
    let actor = item.actor;

    let old = system.basePointsPlusAdders;

    if (!system.XMLID) return 0;

    // if (system.XMLID == "RKA")
    //     HEROSYS.log(false, system.XMLID)

    // Everyman skills are free
    if (system.EVERYMAN) {
        system.basePointsPlusAdders = 0;
        return { changed: old === system.basePointsPlusAdders };
    }

    // Native Tongue
    if (system.NATIVE_TONGUE) {
        system.basePointsPlusAdders = 0;
        return { changed: old === system.basePointsPlusAdders };
    }

    // Check if we have CONFIG info about this power
    const configPowerInfo = getPowerInfo({ xmlid: system.XMLID, actor: actor });

    // Base Cost is typcailly extracted directly from HDC
    let baseCost = parseInt(system.BASECOST);

    // PowerFramework might be important
    let parentItem = null;
    let configPowerInfoParent = null;
    if (system.PARENTID && actor?.items) {
        parentItem = actor.items.find((o) => o.system.ID === system.PARENTID);
        if (parentItem) {
            configPowerInfoParent = getPowerInfo({
                xmlid: parentItem.system.XMLID,
                actor: actor,
            });
        }
    }

    // Cost per level is NOT included in the HDC file.
    // We will try to get cost per level via config.js
    // Default cost per level will be BASECOST, or 3/2 for skill, or 1 for everything else
    //const characteristicCosts = actor?.system?.is5e ? CONFIG.HERO.characteristicCosts5e : CONFIG.HERO.characteristicCosts
    let costPerLevel = parseFloat(
        configPowerInfo?.costPerLevel ||
            //characteristicCosts[system.XMLID.toLocaleLowerCase()] ||
            system.costPerLevel ||
            baseCost ||
            (configPowerInfo?.powerType == "skill" ? 2 : 1),
    );

    // FLASH (target group cost 5 per level, non-targeting costs 3 per level)
    if (system.XMLID === "FLASH") {
        if (system.OPTIONID === "SIGHTGROUP") {
            // The only targeting group
            costPerLevel = 5;
        } else {
            costPerLevel = 3;
        }
    }

    // But configPowerInfo?.costPerLevel could actually be 0 (EXTRALIMBS)
    if (configPowerInfo?.costPerLevel != undefined) {
        costPerLevel = parseFloat(configPowerInfo?.costPerLevel);
    }

    let levels = parseInt(system.LEVELS?.value);

    let subCost = costPerLevel * levels;

    // 3 CP per 2 points
    if (costPerLevel == 3 / 2 && subCost % 1) {
        let _threePerTwo = Math.ceil(costPerLevel * levels) + 1;
        subCost = _threePerTwo;
        system.title =
            (system.title || "") +
            "3 CP per 2 points; \n+1 level may cost nothing. ";
    }

    // FORCEWALL/BARRIER
    if (system.XMLID == "FORCEWALL") {
        baseCost += parseInt(system.BODYLEVELS) || 0;
        baseCost += parseInt(system.LENGTHLEVELS) || 0;
        baseCost += parseInt(system.HEIGHTLEVELS) || 0;
        baseCost += Math.ceil(parseFloat(system.WIDTHLEVELS * 2)) || 0; // per +½m of thickness
    }

    // Start adding up the costs
    let cost = baseCost + subCost;

    // ADDERS
    let adderCost = 0;
    if (system.adders) {
        for (let adder of system.adders.filter((o) => o.SELECTED)) {
            let adderBaseCost = parseFloat(adder.BASECOST);

            let adderLevels = Math.max(1, parseInt(adder.LEVELS));
            adderCost += Math.ceil(adderBaseCost * adderLevels); // ceil is for ENTANGLE +5 PD
        }
    }

    // Categorized skills cost 2 per category and +1 per each subcategory.
    // If no catagories selected then assume 3 pts
    if (configPowerInfo?.categorized && adderCost >= 4) {
        if (adderCost == 0) {
            adderCost = 3;
        } else {
            adderCost = Math.floor(adderCost / 2) + 1;
        }
    }

    // POWERS (likely ENDURANCERESERVEREC)
    if (system.powers) {
        for (let adder of system.powers) {
            let adderBaseCost = parseFloat(adder.BASECOST);
            let adderLevels = Math.max(1, parseInt(adder.LEVELS));
            adderCost += Math.ceil(adderBaseCost * adderLevels);
        }
    }

    // Skill Enhancer discount (a hidden discount; not shown in item description)
    if (
        configPowerInfoParent &&
        configPowerInfoParent.powerType?.includes("enhancer")
    ) {
        cost = Math.max(1, cost - 1);
    }

    cost += adderCost;

    // INDEPENDENT ADVANTAGE (aka Naked Advantage)
    // NAKEDMODIFIER uses PRIVATE=="No" to indicate NAKED modifier
    if (system.XMLID == "NAKEDMODIFIER") {
        let advantages = 0;
        for (let modifier of system.modifiers.filter((o) => !o.PRIVATE)) {
            advantages += parseFloat(modifier.BASECOST);
        }
        cost = cost * advantages;
    }

    system.basePointsPlusAdders = cost;

    //return cost; //Math.max(1, cost)
    return old != system.basePointsPlusAdders;
}

function calcActivePoints(item) {
    let system = item.system;
    // Active Points = (Base Points + cost of any Adders) x (1 + total value of all Advantages)

    // if (system.XMLID == "ARMOR")
    //     HEROSYS.log(false, system.XMLID)

    let advantages = 0;
    let advantagesDC = 0;

    for (let modifier of system.modifiers.filter(
        (o) =>
            (system.XMLID != "NAKEDMODIFIER" || o.PRIVATE) &&
            parseFloat(o.BASECOST) >= 0,
    )) {
        let _myAdvantage = 0;
        const modifierBaseCost = parseFloat(modifier.BASECOST || 0);
        const levels = Math.max(1, parseFloat(modifier.LEVELS));
        switch (modifier.XMLID) {
            case "AOE":
                _myAdvantage += modifierBaseCost;
                break;

            case "CUMULATIVE":
                _myAdvantage += modifierBaseCost + levels * 0.25;
                break;

            default:
                _myAdvantage += modifierBaseCost * levels;
        }

        // Some modifiers may have ADDERS
        const adders = modifier.adders; //modifier.getElementsByTagName("ADDER")
        if (adders.length) {
            for (let adder of adders) {
                const adderBaseCost = parseFloat(adder.BASECOST || 0);
                //if (adderBaseCost > 0) {
                _myAdvantage += adderBaseCost;
                //HEROSYS.log(false, adder.XMLID, adderBaseCost)
                //}
            }
        }

        // No negative advantages
        advantages += Math.max(0, _myAdvantage);
        modifier.BASECOST_total = _myAdvantage;

        // For attacks with Advantages, determine the DCs by
        // making a special Active Point calculation that only counts
        // Advantages that directly affect how the victim takes damage.
        let powerInfo = getPowerInfo({ xmlid: system.XMLID });
        let modifierInfo = getModifierInfo({ xmlid: modifier.XMLID });
        if (powerInfo && powerInfo.powerType?.includes("attack")) {
            if (modifierInfo && modifierInfo.dc) {
                advantagesDC += Math.max(0, _myAdvantage);
            }
        }
    }

    const _activePoints = system.basePointsPlusAdders * (1 + advantages);
    system.activePointsDc = RoundFavorPlayerDown(
        system.basePointsPlusAdders * (1 + advantagesDC),
    );

    // This may be a slot in a framework if so get parent
    // const parent = item.actor.items.find(o=> o.system.ID === system.PARENTID);

    // HALFEND is based on active points without the HALFEND modifier
    if (system.modifiers.find((o) => o.XMLID == "REDUCEDEND")) {
        system._activePointsWithoutEndMods =
            system.basePointsPlusAdders * (1 + advantages - 0.25);
    }

    let old = system.activePoints;
    system.activePoints = RoundFavorPlayerDown(_activePoints);

    //return RoundFavorPlayerDown(_activePoints)
    return old != system.activePoints;
}

function calcRealCost(item) {
    let system = item.system;
    // Real Cost = Active Cost / (1 + total value of all Limitations)

    // if (system.XMLID == "RKA")
    //     HEROSYS.log(false, system.XMLID)

    // This may be a slot in a framework if so get parent
    const parent = item.actor
        ? item.actor.items.find((o) => o.system.ID === system.PARENTID)
        : null;

    let modifiers = system.modifiers.filter((o) => parseFloat(o.BASECOST) < 0);

    // Add limitations from parent
    if (parent) {
        modifiers.push(
            ...parent.system.modifiers.filter(
                (o) => parseFloat(o.BASECOST) < 0,
            ),
        );
    }

    let limitations = 0;
    for (let modifier of modifiers) {
        let _myLimitation = 0;
        const modifierBaseCost = parseFloat(modifier.BASECOST || 0);
        _myLimitation += -modifierBaseCost;

        // Some modifiers may have ADDERS as well (like a focus)
        for (let adder of modifier.adders) {
            let adderBaseCost = parseFloat(adder.BASECOST || 0);

            // Unique situation where JAMMED floors the limitation
            if (adder.XMLID == "JAMMED" && _myLimitation == 0.25) {
                system.title =
                    (system.title || "") +
                    "Limitations are below the minumum of -1/4; \nConsider removing unnecessary limitations. ";
                adderBaseCost = 0;
            }

            // can be positive or negative (like charges).
            // Requires a roll gets interesting with Jammed / Can choose which of two rolls to make from use to use
            _myLimitation += -adderBaseCost;

            const multiplier = Math.max(1, parseFloat(adder.MULTIPLIER || 0));
            _myLimitation *= multiplier;
        }

        // NOTE: REQUIRESASKILLROLL The minimum value is -1/4, regardless of modifiers.
        if (_myLimitation < 0.25) {
            // if (game.settings.get(game.system.id, 'alphaTesting')) {
            //     ui.notifications.warn(`${system.XMLID} ${modifier.XMLID} has a limiation of ${-_myLimitation}.  Overrided limitation to be -1/4.`)
            //     console.log(`${system.XMLID} ${modifier.XMLID} has a limiation of ${-_myLimitation}.  Overrided limitation to be -1/4.`, system)
            // }
            _myLimitation = 0.25;
            system.title =
                (system.title || "") +
                "Limitations are below the minumum of -1/4; \nConsider removing unnecessary limitations. ";
        }

        //console.log("limitation", modifier.ALIAS, _myLimitation)
        modifier.BASECOST_total = -_myLimitation;

        limitations += _myLimitation;
    }

    let _realCost = system.activePoints / (1 + limitations);

    // MULTIPOWER
    let costSuffix = "";
    if (parent && parent.system.XMLID === "MULTIPOWER") {
        // Fixed
        if (item.system.ULTRA_SLOT) {
            costSuffix = "f";
            _realCost /= 10.0;
        }

        // Variable
        else {
            costSuffix = "v";
            _realCost /= 5.0;
        }
    }

    _realCost = RoundFavorPlayerDown(_realCost);

    // Minumum cost
    if (_realCost == 0 && system.activePoints > 0) {
        _realCost = 1;
    }

    let old = system.realCost;
    system.realCost = _realCost + costSuffix;

    return old != system.realCost; //_realCost
}

export async function uploadPower(power, type) {
    // GENERIC_OBJECT are likely Power Frameworks.
    // Rename GENERIC_OBJECT with TAGNAME to make it easier to parse.
    if (power.getAttribute("XMLID") == "GENERIC_OBJECT") {
        power.setAttribute("XMLID", power.tagName);
    }

    let itemData = XmlToItemData.call(this, power, type);

    let item = await HeroSystem6eItem.create(itemData, { parent: this.actor });

    let xmlid = itemData.system.XMLID;

    // Check if we have CONFIG info about this power
    const configPowerInfo = getPowerInfo({ xmlid: xmlid, actor: this.actor });

    if (configPowerInfo) {
        // if ((configPowerInfo?.powerType || "").includes("skill")) {
        // //     await uploadSkill.call(this, power, true)
        //     await item.update({ 'system.subType': 'skill'});
        // }

        // Detect attacks
        if (configPowerInfo.powerType?.includes("attack")) {
            //await uploadAttack.call(this, power, true)
            await makeAttack(item);
        }
    } else {
        if (game.settings.get(game.system.id, "alphaTesting")) {
            ui.notifications.warn(
                `${xmlid} not handled during HDC upload of ${this.actor.name}`,
            );
            // HEROSYS.log(false, power)
        }
    }
}

export function updateItemDescription(item) {
    ui.notifications.warn(`Old updateItemDescription(${item.name}) called.`);

    item.updateItemDescription();
}

export async function makeAttack(item) {
    ui.notifications.warn(`Old makeAttack(${item.name}) called.`);

    const xmlid = item.system.XMLID || item.system.xmlid || item.system.rules;

    // Confirm this is an attack
    const configPowerInfo = getPowerInfo({ xmlid: xmlid, actor: item.actor });
    //if (!configPowerInfo || !configPowerInfo.powerType.includes("attack")) return

    let changes = {};
    //changes[`img`] = "icons/svg/sword.svg"

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

export async function createEffects(itemData, actor) {
    const configPowerInfo = getPowerInfo({
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

export async function updateItemSubTypes(actor, removeDups) {
    // Update Item SubType
    for (const item of actor.items) {
        const configPowerInfo = getPowerInfo({ item: item });

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
                await makeAttack(item);
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

export async function updateItem(item) {
    // Guards
    if (!item) return;

    await item._postUpload();

    ui.notifications.warn(`Item editing may be limited.`);
}
