import { HEROSYS } from "../herosystem6e.js";
import { HeroSystem6eItem } from "../item/item.js";
import { RoundFavorPlayerDown, RoundFavorPlayerUp } from "../utility/round.js"
import { getPowerInfo, getModifierInfo } from '../utility/util.js'
import { AdjustmentSources } from '../utility/adjustment.js'
import { convertToDcFromItem, convertFromDC } from "./damage.js";


export async function applyCharacterSheet(xmlDoc) {
    //HEROSYS.log(false, "applyCharacterSheet")

    const characterTemplate = xmlDoc.getElementsByTagName('CHARACTER')[0].getAttribute("TEMPLATE")
    const characterInfo = xmlDoc.getElementsByTagName('CHARACTER_INFO')[0]
    const characteristics = xmlDoc.getElementsByTagName('CHARACTERISTICS')[0]
    const skills = xmlDoc.getElementsByTagName('SKILLS')[0]
    const powers = xmlDoc.getElementsByTagName('POWERS')[0]
    const perks = xmlDoc.getElementsByTagName('PERKS')[0]
    const talents = xmlDoc.getElementsByTagName('TALENTS')[0]
    const martialarts = xmlDoc.getElementsByTagName('MARTIALARTS')[0]
    const complications = xmlDoc.getElementsByTagName('DISADVANTAGES')[0]
    const equipment = xmlDoc.getElementsByTagName('EQUIPMENT')[0]
    const image = xmlDoc.getElementsByTagName('IMAGE')[0]


    // let elementsToLoad = ["POWERS", "PERKS", "TALENTS", "MARTIALARTS", "DISADVANTAGES"]

    // Individual changes to the actor are not very effecient.
    // Instead save all the changes and perform a bulk update.
    let changes = {}
    changes[`system.characterTemplate`] = characterTemplate

    if (characterInfo.getAttribute('CHARACTER_NAME') !== '') {
        let name = characterInfo.getAttribute('CHARACTER_NAME')
        changes[`name`] = name

        // Override name of prototype token if HDC upload was from library
        if (this.actor.prototypeToken) {
            changes[`prototypeToken.name`] = name
        }

        // Overwrite token name if PC
        if (this.token) {
            if (this.actor.type == 'pc') {
                await this.token.update({ name: name }, { hideChatMessage: true })
            }
        }
    }

    // Biography
    let Biography = ""
    for (let child of characterInfo.children) {
        //let text = child.textContent.trim();
        changes[`system.${child.nodeName}`] = child.textContent.trim() || "";
        // if (text) {
        //     Biography += "<p><b>" + child.nodeName + "</b>: " + text + "</p>"
        // }
    }
    if (this.actor.system.biography) {
        changes[`system.biography`] = "";
    }


    // Remove all items from
    await this.actor.deleteEmbeddedDocuments("Item", Array.from(this.actor.items.keys()))

    // Remove all existing effects
    await this.actor.deleteEmbeddedDocuments("ActiveEffect", this.actor.effects.map(o => o.id))

    // 6e vs 5e
    if (!characterTemplate) {
        // No template defined, so we will assume if COM-liness exists it is 5E.
        if (characteristics.querySelector("COM")) {
            ui.notifications.warn(`Import is missing Hero Designer character template.  Assuming 5E.`)
            this.actor.update({ 'system.is5e': true }, { render: false }, { hideChatMessage: true })
        } else {
            ui.notifications.warn(`Import is missing Hero Designer character template.  Assuming 6E.`)
            this.actor.update({ 'system.is5e': false }, { render: false }, { hideChatMessage: true })
        }
    } else {
        if (characterTemplate && characterTemplate.includes("builtIn.") && !characterTemplate.includes("6E.")) {
            this.actor.update({ 'system.is5e': true }, { render: false }, { hideChatMessage: true })
        } else {
            this.actor.update({ 'system.is5e': false }, { render: false }, { hideChatMessage: true })
        }
    }

    const characteristicCosts = this.actor.system.is5e ? CONFIG.HERO.characteristicCosts5e : CONFIG.HERO.characteristicCosts

    // Caracteristics for 6e
    //let characteristicKeys = Object.keys(characteristicCosts)


    // determine spd upfront for velocity calculations
    //let spd
    let value
    let characteristicDefaults = CONFIG.HERO.characteristicDefaults
    if (this.actor.system.is5e) {
        characteristicDefaults = CONFIG.HERO.characteristicDefaults5e
    }

    for (const characteristic of characteristics.children) {
        const key = CONFIG.HERO.characteristicsXMLKey[characteristic.getAttribute('XMLID')]
        const levels = parseInt(characteristic.getAttribute('LEVELS'))
        value = characteristicDefaults[key] + levels


        // if (key === "running" && this.actor.system.is5e) {
        //     HEROSYS.log(false, key)
        // }

        if (key === "leaping" && this.actor.system.is5e) {
            const str = parseInt(changes[`system.characteristics.str.core`])
            if (str >= 3) value = 0.5
            if (str >= 5) value = 1
            if (str >= 8) value = 1.5
            if (str >= 10) value = 2
            if (str >= 13) value = 2.5
            if (str >= 15) value = 3
            if (str >= 18) value = 3.5
            if (str >= 20) value = 4
            if (str >= 23) value = 4.5
            if (str >= 25) value = 5
            if (str >= 28) value = 5.5
            if (str >= 30) value = 6
            if (str >= 35) value = 7
            if (str >= 40) value = 8
            if (str >= 45) value = 9
            if (str >= 50) value = 10
            if (str >= 55) value = 11
            if (str >= 60) value = 12
            if (str >= 65) value = 13
            if (str >= 70) value = 14
            if (str >= 75) value = 15
            if (str >= 80) value = 16
            if (str >= 85) value = 17
            if (str >= 90) value = 18
            if (str >= 95) value = 19
            if (str >= 100) value = 20 + Math.floor((str - 100) / 5)
            changes[`system.characteristics.leaping.base`] = RoundFavorPlayerUp(value)
            value += parseInt(characteristic.getAttribute('LEVELS'))

        }

        changes[`system.characteristics.${key}.value`] = value
        changes[`system.characteristics.${key}.max`] = value
        changes[`system.characteristics.${key}.core`] = value
        let cost = Math.round(levels * characteristicCosts[key])
        changes[`system.characteristics.${key}.basePointsPlusAdders`] = cost
        changes[`system.characteristics.${key}.realCost`] = cost
        changes[`system.characteristics.${key}.activePoints`] = cost

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

    await this.actor.update(changes, { render: false })
    changes = {}

    // Initial 5e support
    // 5th edition has no edition designator, so assuming if there is no 6E then it is 5E.
    // "builtIn.Superheroic6E.hdt"
    if (this.actor.system.is5e) {
        const figuredChanges = {}
        figuredChanges[`system.is5e`] = true  // used in item-attack.js to modify killing attack stun multiplier

        // One major difference between 5E and 6E is figured characteristics.

        // Physical Defense (PD) STR/5
        const pdLevels = this.actor.system.characteristics.pd.max - CONFIG.HERO.characteristicDefaults5e.pd;
        const pdFigured = Math.round(this.actor.system.characteristics.str.max / 5)
        figuredChanges[`system.characteristics.pd.max`] = pdLevels + pdFigured
        figuredChanges[`system.characteristics.pd.value`] = pdLevels + pdFigured
        figuredChanges[`system.characteristics.pd.base`] = pdFigured //this.actor.system.characteristics.pd.base + pdFigured
        figuredChanges[`system.characteristics.pd.core`] = pdLevels + pdFigured
        figuredChanges[`system.characteristics.pd.figured`] = pdFigured

        // Energy Defense (ED) CON/5
        const edLevels = this.actor.system.characteristics.ed.max - CONFIG.HERO.characteristicDefaults5e.ed;
        const edFigured = Math.round(this.actor.system.characteristics.con.max / 5)
        figuredChanges[`system.characteristics.ed.max`] = edLevels + edFigured
        figuredChanges[`system.characteristics.ed.value`] = edLevels + edFigured
        figuredChanges[`system.characteristics.ed.base`] = edFigured //this.actor.system.characteristics.ed.base + edFigured
        figuredChanges[`system.characteristics.ed.core`] = edLevels + edFigured
        figuredChanges[`system.characteristics.ed.figured`] = edFigured


        // Speed (SPD) 1 + (DEX/10)   can be fractional
        const spdLevels = this.actor.system.characteristics.spd.max - CONFIG.HERO.characteristicDefaults5e.spd;
        const spdFigured = 1 + parseFloat(parseFloat(this.actor.system.characteristics.dex.max / 10).toFixed(1))
        figuredChanges[`system.characteristics.spd.max`] = Math.floor(spdLevels + spdFigured)
        figuredChanges[`system.characteristics.spd.value`] = Math.floor(spdLevels + spdFigured)
        figuredChanges[`system.characteristics.spd.base`] = spdFigured //this.actor.system.characteristics.spd.base + spdFigured
        figuredChanges[`system.characteristics.spd.core`] = Math.floor(spdLevels + spdFigured)
        figuredChanges[`system.characteristics.spd.figured`] = spdFigured
        figuredChanges[`system.characteristics.spd.realCost`] = Math.ceil((this.actor.system.characteristics.spd.max - spdFigured) * CONFIG.HERO.characteristicCosts5e.spd)


        // Recovery (REC) (STR/5) + (CON/5)
        const recLevels = this.actor.system.characteristics.rec.max - CONFIG.HERO.characteristicDefaults5e.rec;
        const recFigured = Math.round(this.actor.system.characteristics.str.max / 5) + Math.round(this.actor.system.characteristics.con.max / 5)
        figuredChanges[`system.characteristics.rec.max`] = recLevels + recFigured
        figuredChanges[`system.characteristics.rec.value`] = recLevels + recFigured
        figuredChanges[`system.characteristics.rec.base`] = recFigured //this.actor.system.characteristics.rec.base + recFigured
        figuredChanges[`system.characteristics.rec.core`] = recLevels + recFigured
        figuredChanges[`system.characteristics.rec.figured`] = recFigured
        figuredChanges[`system.characteristics.red.realCost`] = recLevels * CONFIG.HERO.characteristicCosts5e.red

        // Endurance (END) 2 x CON
        const endLevels = this.actor.system.characteristics.end.max - CONFIG.HERO.characteristicDefaults5e.end;
        const endFigured = Math.round(this.actor.system.characteristics.con.max * 2)
        figuredChanges[`system.characteristics.end.max`] = endLevels + endFigured
        figuredChanges[`system.characteristics.end.value`] = endLevels + endFigured
        figuredChanges[`system.characteristics.end.base`] = endFigured //this.actor.system.characteristics.end.base + endFigured
        figuredChanges[`system.characteristics.end.core`] = endLevels + endFigured
        figuredChanges[`system.characteristics.end.figured`] = endFigured


        // Stun (STUN) BODY+(STR/2)+(CON/2) 
        const stunLevels = this.actor.system.characteristics.stun.max - CONFIG.HERO.characteristicDefaults5e.stun;
        const stunFigured = this.actor.system.characteristics.body.max + Math.round(this.actor.system.characteristics.str.max / 2) + Math.round(this.actor.system.characteristics.con.max / 2)
        figuredChanges[`system.characteristics.stun.max`] = stunLevels + stunFigured
        figuredChanges[`system.characteristics.stun.value`] = stunLevels + stunFigured
        figuredChanges[`system.characteristics.stun.base`] = stunFigured //this.actor.system.characteristics.stun.base + stunFigured
        figuredChanges[`system.characteristics.stun.core`] = stunLevels + stunFigured
        figuredChanges[`system.characteristics.stun.figured`] = stunFigured
        figuredChanges[`system.characteristics.stun.realCost`] = stunLevels * CONFIG.HERO.characteristicCosts5e.stun


        // Base OCV & DCV = Attacker’s DEX/3
        const baseCv = Math.round(this.actor.system.characteristics.dex.max / 3)
        figuredChanges[`system.characteristics.ocv.max`] = baseCv // + this.actor.system.characteristics.ocv.max - this.actor.system.characteristics.ocv.base
        figuredChanges[`system.characteristics.ocv.value`] = baseCv // + this.actor.system.characteristics.ocv.max - this.actor.system.characteristics.ocv.base
        figuredChanges[`system.characteristics.ocv.base`] = 0 //baseCv + this.actor.system.characteristics.ocv.max - this.actor.system.characteristics.ocv.base
        figuredChanges[`system.characteristics.dcv.max`] = baseCv // + this.actor.system.characteristics.dcv.max - this.actor.system.characteristics.dcv.base
        figuredChanges[`system.characteristics.dcv.value`] = baseCv //+ this.actor.system.characteristics.dcv.max - this.actor.system.characteristics.dcv.base
        figuredChanges[`system.characteristics.dcv.base`] = 0 //baseCv + this.actor.system.characteristics.dcv.max - this.actor.system.characteristics.dcv.base
        figuredChanges[`system.characteristics.ocv.realCost`] = 0
        figuredChanges[`system.characteristics.dcv.realCost`] = 0

        //Base Ego Combat Value = EGO/3
        const baseEcv = Math.round(this.actor.system.characteristics.ego.max / 3)
        figuredChanges[`system.characteristics.omcv.max`] = baseEcv //+ this.actor.system.characteristics.omcv.max - this.actor.system.characteristics.omcv.base
        figuredChanges[`system.characteristics.omcv.value`] = baseEcv //+ this.actor.system.characteristics.omcv.max - this.actor.system.characteristics.omcv.base
        figuredChanges[`system.characteristics.omcv.base`] = 0 //baseEcv + this.actor.system.characteristics.omcv.max - this.actor.system.characteristics.omcv.base
        figuredChanges[`system.characteristics.dmcv.max`] = baseEcv //+ this.actor.system.characteristics.dmcv.max - this.actor.system.characteristics.dmcv.base
        figuredChanges[`system.characteristics.dmcv.value`] = baseEcv //+ this.actor.system.characteristics.dmcv.max - this.actor.system.characteristics.dmcv.base
        figuredChanges[`system.characteristics.dmcv.base`] = 0 //baseEcv + this.actor.system.characteristics.dmcv.max - this.actor.system.characteristics.dmcv.base
        figuredChanges[`system.characteristics.omcv.realCost`] = 0
        figuredChanges[`system.characteristics.dmcv.realCost`] = 0

        await this.actor.update(figuredChanges, { render: false }, { hideChatMessage: true })
    }
    else {
        // Confirm 6E
        if (this.actor.system.is5e) {
            if (game.settings.get(game.system.id, 'alphaTesting')) {
                ui.notifications.warn(`Actor was incorrectly flagged as 5e.`)
                console.log(`Actor was incorrectly flagged as 5e.`)
            }
            await this.actor.update({ 'system.is5e': false }, { render: false }, { hideChatMessage: true })
        }
    }

    for (const skill of skills.children) {
        await uploadSkill.call(this, skill)
    }

    // Perception Skill
    const itemDataPerception = {
        name: 'Perception',
        type: 'skill',
        system: {
            ALIAS: "Perception",
            characteristic: "int",
            state: 'trained',
            levels: "0"
        }
    }

    await HeroSystem6eItem.create(itemDataPerception, { parent: this.actor })

    // EXTRA DC's from martial arts
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
    for (const martialart of martialarts.querySelectorAll("EXTRADC")) {
        await uploadMartial.call(this, martialart, 'martialart') //, extraDc, usesTk)
    }

    // WEAPON_ELEMENT next
    for (const martialart of martialarts.querySelectorAll("WEAPON_ELEMENT")) {
        await uploadMartial.call(this, martialart, 'martialart') //, extraDc, usesTk)
    }

    // MANEUVER next
    for (const martialart of martialarts.querySelectorAll("MANEUVER")) {
        await uploadMartial.call(this, martialart, 'martialart') //, extraDc, usesTk)
    }



    for (const power of powers.children) {
        await uploadPower.call(this, power, 'power')
    }

    for (const perk of perks.children) {
        await uploadBasic.call(this, perk, 'perk')
    }

    for (const talent of talents.children) {
        await uploadBasic.call(this, talent, 'talent')
    }

    for (const complication of complications.children) {
        await uploadBasic.call(this, complication, 'complication')
    }

    for (const equip of equipment.children) {
        await uploadPower.call(this, equip, 'equipment')
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
                type: 'maneuver',
                system: {
                    PHASE,
                    OCV,
                    DCV,
                    EFFECT,
                    active: false,
                    description: EFFECT,
                    XMLID,
                }
            }

            let item = await HeroSystem6eItem.create(itemData, { parent: actor })
            if (attack) {
                await makeAttack(item)
            }
        }
    }



    await loadCombatManeuvers(CONFIG.HERO.combatManeuvers, this.actor)

    if (game.settings.get('hero6efoundryvttv2', 'optionalManeuvers')) {
        await loadCombatManeuvers(CONFIG.HERO.combatManeuversOptional, this.actor)
    }

    // Actor Image
    if (image) {
        let filename = image.getAttribute("FileName")
        let extension = filename.split('.').pop()
        let base64 = "data:image/" + extension + ";base64," + image.textContent
        let path = "worlds/" + game.world.id
        if (this.actor.img.indexOf(filename) == -1) {
            await ImageHelper.uploadBase64(base64, filename, path)
            await this.actor.update({ [`img`]: path + '/' + filename }, { render: false }, { hideChatMessage: true })
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

    await updateItemSubTypes(this.actor)


    // Combat Skill Levels - Enumerate attacks that use OCV
    for (let cslItem of this.actor.items.filter(o => ["MENTAL_COMBAT_LEVELS", "COMBAT_LEVELS"].includes(o.system.XMLID))) {
        let _ocv = 'ocv'
        if (cslItem.system.XMLID === "MENTAL_COMBAT_LEVELS") {
            _ocv = 'omcv'
        }

        let attacks = {}
        let checkedCount = 0;
        for (let attack of this.actor.items.filter(o =>
            (o.type == 'attack' || o.system.subType == 'attack') &&
            o.system.uses === _ocv
        )) {
            let checked = false;

            // Attempt to determine if attack should be checked
            if (cslItem.system.OPTION_ALIAS.toLowerCase().indexOf(attack.name.toLowerCase()) > -1) {
                checked = true;
            }

            if (cslItem.system.OPTION === "HTH" && (
                attack.system.XMLID === "HTH" ||
                attack.system.XMLID === "HANDTOHANDATTACK" ||
                attack.system.XMLID === "HKA" ||
                attack.system.XMLID === "MANEUVER" ||
                (attack.type === "maneuver" && !attack.system.EFFECT?.match(/throw/i))
            )
            ) {
                checked = true;
            }

            if (cslItem.system.OPTION === "RANGED" && (
                attack.system.XMLID === "BLAST" ||
                attack.system.XMLID === "RKA"
            )
            ) {
                checked = true;
            }

            if (cslItem.system.OPTION === "ALL") {
                checked = true;
            }

            if (cslItem.system.OPTION === "BROAD" && cslItem.system.XMLID === "MENTAL_COMBAT_LEVELS") {
                checked = true;
            }

            attacks[attack.id] = checked;

            if (checked) checkedCount++;

        }

        // Make sure at least one attacked is checked
        if (checkedCount === 0 && Object.keys(attacks).length > 0) {
            attacks[Object.keys(attacks)[0]] = true;
        }

        await cslItem.update({ 'system.attacks': attacks }, { hideChatMessage: true });
    }




    // Make sure VALUE = MAX.
    // We may have applied ActiveEffectcs to MAX.
    for (let char of Object.keys(this.actor.system.characteristics)) {
        if (this.actor.system.characteristics[char].value != this.actor.system.characteristics[char].max) {
            await this.actor.update({ [`system.characteristics.${char}.value`]: this.actor.system.characteristics[char].max }, { render: false }, { hideChatMessage: true });
        }

    }

    await CalcRealAndActivePoints(this.actor)



    // We did all our updates with render: false
    // Now were all done so render.
    this.actor.render()

    // Update actor sidebar (needed when name is changed)
    ui.actors.render()

    ui.notifications.info(`${this.actor.name} upload complete`)

    Hooks.call('hdcUpload')
}

async function CalcRealAndActivePoints(actor) {
    // Calculate realCost & Active Points for bought as characteristics
    let realCost = 0;
    let activePoints = 0;
    const characteristicCosts = actor.system.is5e ? CONFIG.HERO.characteristicCosts : CONFIG.HERO.characteristicCosts5e
    //if (actor.system.is5e) {
    for (const key of Object.keys(characteristicCosts)) {
        realCost += parseInt(actor.system.characteristics[key].realCost || 0);
    }
    // } else {
    //     for (const key of Object.keys(CONFIG.HERO.characteristicCosts)) {
    //         realCost += parseInt(actor.system.characteristics[key].realCost || 0);
    //     }
    // }
    activePoints = realCost
    // Add in costs for items
    let _splitCost = {}
    for (let item of actor.items.filter(o => o.type != 'attack' && o.type != 'defense' && o.type != 'movement' && o.type != 'complication' && !o.system.duplicate)) {
        //HEROSYS.log(false, item.type, item.name, item.system.realCost)

        // Equipment is typically purchased with money, not character points
        if (item.type != 'equipment') {
            realCost += parseInt(item.system?.realCost || 0);
        }
        activePoints += parseInt(item.system?.activePoints || 0);

        _splitCost[item.type] = (_splitCost[item.type] || 0) + (item.system?.realCost || 0)
    }
    //HEROSYS.log(false, _splitCost)
    await actor.update({ 'system.points': realCost, 'system.activePoints': activePoints }, { render: false }, { hideChatMessage: true });
}


export function XmlToItemData(xml, type) {

    const xmlid = xml.getAttribute('XMLID')

    let systemData = {
        id: xmlid,
        rules: xmlid,
        adders: [],
        modifiers: [],
        powers: [],
    }

    // Add XML attributes to ItemData.
    const relevantFields = [
        'XMLID', 'BASECOST', 'LEVELS', 'ALIAS', 'MULTIPLIER', 'NAME', 'OPTION_ALIAS', 'SFX',
        'PDLEVELS', 'EDLEVELS', 'MDLEVELS', 'INPUT', 'OPTION', 'OPTIONID', 'BASECOST',
        'PRIVATE', 'EVERYMAN', 'CHARACTERISTIC', 'NATIVE_TONGUE', 'POWDLEVELS',
        "WEIGHT", "PRICE", "CARRIED", "LENGTHLEVELS", "HEIGHTLEVELS", "WIDTHLEVELS",
        "BODYLEVELS", "ID", "PARENTID", "POSITION", "AFFECTS_TOTAL",
        "CATEGORY", "PHASE", "OCV", "DCV", "DC", "EFFECT", "ADD_MODIFIERS_TO_BASE",
        "USE_END_RESERVE",
    ]
    for (const attribute of xml.attributes) {
        if (relevantFields.includes(attribute.name)) {
            switch (attribute.name) {
                case "CARRIED":
                    systemData.active = attribute.value == "Yes" ? true : false
                    break;
                case "WEIGHT":
                    // Convert lbs to kg
                    systemData[attribute.name] = (parseFloat(attribute.value) / 2.20462).toFixed(2)
                    break;
                case "LEVELS":
                    // case "PDLEVELS":
                    // case "EDLEVELS":
                    // case "MDLEVELS":
                    // case "LENGTHLEVELS":
                    // case "HEIGHTLEVELS":
                    // case "WIDTHLEVELS":
                    // case "BODYLEVELS":
                    systemData[attribute.name] = { value: attribute.value, max: attribute.value }
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
                            systemData[attribute.name] = attribute.value
                    }

            }
        }
    }

    // Make sure we have a name
    systemData.NAME = systemData.NAME || systemData.ALIAS

    switch (systemData.NAME) {
        case "Aid":
            systemData.NAME += " " + systemData.INPUT;
            break;
    }

    if (["MENTAL_COMBAT_LEVELS", "PENALTY_SKILL_LEVELS"].includes(systemData.XMLID)) {
        switch (systemData.OPTION) {
            case "SINGLE": systemData.costPerLevel = 1; break;
            case "TIGHT": systemData.costPerLevel = 3; break;
            case "BROAD": systemData.costPerLevel = 6; break;
            default: HEROSYS.log(false, systemData.OPTION)
        }
    }

    if (systemData.XMLID == "COMBAT_LEVELS") {
        switch (systemData.OPTION) {
            case "SINGLE": systemData.costPerLevel = 2; break;
            case "TIGHT": systemData.costPerLevel = 3; break;
            case "BROAD": systemData.costPerLevel = 5; break;
            case "HTH": systemData.costPerLevel = 8; break;
            case "RANGED": systemData.costPerLevel = 8; break;
            case "ALL": systemData.costPerLevel = 10; break;

            default: HEROSYS.log(false, systemData.OPTION)
        }

        // Make sure CSL's are defined
        systemData.csl = {}
        for (let c = 0; c < parseInt(systemData.LEVELS.value); c++) {
            systemData.csl[c] = 'ocv';
        }
    }


    if (systemData.XMLID == "SKILL_LEVELS") {
        switch (systemData.OPTION) {
            case "CHARACTERISTIC": systemData.costPerLevel = 2; break;
            case "RELATED": systemData.costPerLevel = 3; break;
            case "GROUP": systemData.costPerLevel = 4; break;
            case "AGILITY": systemData.costPerLevel = 6; break;
            case "NONCOMBAT": systemData.costPerLevel = 10; break;
            case "SINGLEMOVEMENT": systemData.costPerLevel = 2; break;
            case "ALLMOVEMENT": systemData.costPerLevel = 3; break;
            case "OVERALL": systemData.costPerLevel = 12; break;
            default: HEROSYS.log(false, systemData.OPTION)
        }
    }

    // AID, DRAIN, TRANSFER (any adjustment power)
    const configPowerInfo = getPowerInfo({ xmlid: systemData.XMLID })
    if (configPowerInfo && configPowerInfo.powerType.includes("adjustment")) {
        // Make sure we have a valid INPUT
        let choices = AdjustmentSources()
        systemData.INPUT = (systemData.INPUT || "").trim()

        // TRANSFER X to Y  (AID and DRAIN only have X)
        let xmlidX = systemData.INPUT.match(/\w+/)[0];
        let xmlidY = (systemData.INPUT.match(/to[ ]+(\w+)/i) || ["", ""])[1];

        // Uppercase
        systemData.INPUT = xmlidX.toUpperCase();
        xmlidX = xmlidX.toUpperCase();

        if (xmlidY) {
            systemData.INPUT += " to " + xmlidY.toUpperCase();
            xmlidY = xmlidY.toUpperCase();
        }


        if (!choices[xmlidX] || xmlidX == "") {
            ui.notifications.warn(`${systemData.XMLID} adjustment of source ${xmlidX || "UNDEFINED"} not supported.`)
        }

        if (systemData.XMLID === "TRANSFER" && (!choices[xmlidY] || xmlidY == "")) {
            ui.notifications.warn(`${systemData.XMLID} adjustment of destination ${xmlidX || "UNDEFINED"} not supported.`)
        }
    }

    // POWERS (sub power like ENDURANCERESERVEREC )
    for (let POWER2 of xml.querySelectorAll(":scope > POWER")) {
        let _power = {}
        for (const attribute of POWER2.attributes) {
            switch (attribute.value.toUpperCase()) {
                case "YES":
                    _power[attribute.name] = true;
                    break;
                case "NO":
                    _power[attribute.name] = false;
                    break;
                default:
                    _power[attribute.name] = attribute.value
            }
        }

        // For some reason some ADDERs have a 0 value.
        // We will override those values as necessary.
        if (CONFIG.HERO.ModifierOverride[_power.XMLID]?.BASECOST) {
            _power.BASECOST = CONFIG.HERO.ModifierOverride[_power.XMLID]?.BASECOST || _power.BASECOST
        }

        systemData.powers.push(_power)
    }


    // ADDERS
    for (let ADDER of xml.querySelectorAll(":scope > ADDER")) {
        let _adder = {}
        for (const attribute of ADDER.attributes) {
            switch (attribute.value.toUpperCase()) {
                case "YES":
                    _adder[attribute.name] = true;
                    break;
                case "NO":
                    _adder[attribute.name] = false;
                    break;
                default:
                    _adder[attribute.name] = attribute.value
            }

        }

        // For some reason some ADDERs have a 0 value.
        // We will override those values as necessary.
        if (CONFIG.HERO.ModifierOverride[_adder.XMLID]?.BASECOST) {
            _adder.BASECOST = CONFIG.HERO.ModifierOverride[_adder.XMLID]?.BASECOST || _adder.BASECOST
        }

        systemData.adders.push(_adder)
    }

    // MODIFIERS (which can have ADDERS as well)
    for (let MODIFIER of xml.querySelectorAll(":scope > MODIFIER")) {
        let _mod = { adders: [] }
        for (const attribute of MODIFIER.attributes) {

            switch (attribute.value.toUpperCase()) {
                case "YES":
                    _mod[attribute.name] = true;
                    break;
                case "NO":
                    _mod[attribute.name] = false;
                    break;
                default:
                    _mod[attribute.name] = attribute.value
            }
        }

        // For some reason some MODIFIERs have a 0 value.
        // We will override those values as necessary.
        if (CONFIG.HERO.ModifierOverride[_mod.XMLID]?.BASECOST) {
            _mod.BASECOST = CONFIG.HERO.ModifierOverride[_mod.XMLID]?.BASECOST || _mod.BASECOST
        }

        // AOE BASECOST is also missing from HDC
        if (_mod.XMLID == "AOE" && parseFloat(_mod.BASECOST) == 0) {
            if (_mod.OPTION == "RADIUS" && parseInt(_mod.LEVELS) <= 32) _mod.BASECOST = 1.0
            if (_mod.OPTION == "RADIUS" && parseInt(_mod.LEVELS) <= 16) _mod.BASECOST = 0.75
            if (_mod.OPTION == "RADIUS" && parseInt(_mod.LEVELS) <= 8) _mod.BASECOST = 0.50
            if (_mod.OPTION == "RADIUS" && parseInt(_mod.LEVELS) <= 4) _mod.BASECOST = 0.25

            if (_mod.OPTION == "CONE" && parseInt(_mod.LEVELS) <= 64) _mod.BASECOST = 1.0
            if (_mod.OPTION == "CONE" && parseInt(_mod.LEVELS) <= 32) _mod.BASECOST = 0.75
            if (_mod.OPTION == "CONE" && parseInt(_mod.LEVELS) <= 16) _mod.BASECOST = 0.50
            if (_mod.OPTION == "CONE" && parseInt(_mod.LEVELS) <= 8) _mod.BASECOST = 0.25

            if (_mod.OPTION == "LINE" && parseInt(_mod.LEVELS) <= 125) _mod.BASECOST = 1.0
            if (_mod.OPTION == "LINE" && parseInt(_mod.LEVELS) <= 64) _mod.BASECOST = 0.75
            if (_mod.OPTION == "LINE" && parseInt(_mod.LEVELS) <= 32) _mod.BASECOST = 0.50
            if (_mod.OPTION == "LINE" && parseInt(_mod.LEVELS) <= 16) _mod.BASECOST = 0.25

            if (_mod.OPTION == "SURFACE" && parseInt(_mod.LEVELS) <= 16) _mod.BASECOST = 1.0
            if (_mod.OPTION == "SURFACE" && parseInt(_mod.LEVELS) <= 8) _mod.BASECOST = 0.75
            if (_mod.OPTION == "SURFACE" && parseInt(_mod.LEVELS) <= 4) _mod.BASECOST = 0.50
            if (_mod.OPTION == "SURFACE" && parseInt(_mod.LEVELS) <= 2) _mod.BASECOST = 0.25

            if (_mod.OPTION == "AREA" && parseInt(_mod.LEVELS) <= 16) _mod.BASECOST = 1.0
            if (_mod.OPTION == "AREA" && parseInt(_mod.LEVELS) <= 8) _mod.BASECOST = 0.75
            if (_mod.OPTION == "AREA" && parseInt(_mod.LEVELS) <= 4) _mod.BASECOST = 0.50
            if (_mod.OPTION == "AREA" && parseInt(_mod.LEVELS) <= 2) _mod.BASECOST = 0.25
        }

        if (_mod.XMLID == "REQUIRESASKILLROLL") {
            // <MODIFIER XMLID="REQUIRESASKILLROLL" ID="1589145772288" BASECOST="0.25" LEVELS="0" ALIAS="Requires A Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="14" OPTIONID="14" OPTION_ALIAS="14- roll" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
            // This is a limitation not an advantage, not sure why it is positive.  Force it negative.
            _mod.BASECOST = - Math.abs(parseFloat(_mod.BASECOST))
        }




        // MODIFIERs can have ADDERs.
        // And sometimes MODIFIERs, which we will coerce into an ADDER (CONTINUOUSCONCENTRATION).
        for (let ADDER of MODIFIER.querySelectorAll(":scope > ADDER, :scope > MODIFIER")) {
            let _adder = {}
            for (const attribute of ADDER.attributes) {
                switch (attribute.value.toUpperCase()) {
                    case "YES":
                        _adder[attribute.name] = true;
                        break;
                    case "NO":
                        _adder[attribute.name] = false;
                        break;
                    default:
                        _adder[attribute.name] = attribute.value
                }
            }

            // For some reason some ADDERs have a 0 value.
            // We will override those values as necessary.
            if (CONFIG.HERO.ModifierOverride[_adder.XMLID]?.BASECOST != undefined) {
                _adder.BASECOST = CONFIG.HERO.ModifierOverride[_adder.XMLID]?.BASECOST
            }
            if (CONFIG.HERO.ModifierOverride[_adder.XMLID]?.MULTIPLIER) {
                _adder.MULTIPLIER = CONFIG.HERO.ModifierOverride[_adder.XMLID]?.MULTIPLIER || _adder.MULTIPLIER
            }

            _mod.adders.push(_adder)
        }
        systemData.modifiers.push(_mod)
    }

    // Charges do not typically use Endurance
    const charges = systemData.modifiers.find(o => o.XMLID == "CHARGES")
    {
        const costsEnd = systemData.modifiers.find(o => o.XMLID == "COSTSEND")
        if (charges && !costsEnd) {
            systemData.end = 0;
            systemData.charges = {
                value: parseInt(charges.OPTION_ALIAS),
                max: parseInt(charges.OPTION_ALIAS),
                recoverable: charges.adders.find(o => o.XMLID == "RECOVERABLE") ? true : false,
                continuing: charges.adders.find(o => o.XMLID == "CONTINUING")?.OPTIONID
            }
        }
    }

    // Make sure all defenses are enabled (if they don't have charges or AFFECTS_TOTAL = "No")
    if (configPowerInfo && configPowerInfo.powerType.includes("defense")) {
        if (systemData.charges?.value > 0 || systemData.AFFECTS_TOTAL === false || configPowerInfo.duration === "instant") {
            systemData.active = false;
        } else {
            systemData.active = true;
        }

    }


    // Calculate RealCost, ActivePoints, and END
    let _basePointsPlusAdders = calcBasePointsPlusAdders.call(this, systemData)
    let _activePoints = calcActivePoints(_basePointsPlusAdders, systemData)
    let _realCost = calcRealCost(_activePoints, systemData)
    systemData.basePointsPlusAdders = RoundFavorPlayerDown(_basePointsPlusAdders)
    systemData.activePoints = RoundFavorPlayerDown(_activePoints)
    systemData.realCost = RoundFavorPlayerDown(_realCost)

    // Update Item Description (to closely match Hero Designer)
    updateItemDescription({ system: systemData, type: type })

    // Item name
    let name = xml.getAttribute('NAME').trim() || xml.getAttribute('ALIAS').trim() || xml.tagName

    // This item was created via HDC Uploadn (could be useful later)
    systemData.FromHdcUpload = true

    // Create Item Data
    let itemData = {
        'type': type,
        'name': name,
        system: systemData,
    }

    createEffects.call(this, itemData)

    return itemData
}

export async function uploadBasic(xml, type) {

    let itemData = XmlToItemData.call(this, xml, type)
    if (itemData.system.XMLID == "COMBAT_LUCK") {
        itemData.system.active = true
    }
    const item = await HeroSystem6eItem.create(itemData, { parent: this.actor })

    // // Some items should be copied and created as an attack
    // const configPowerInfo = getPowerInfo({ xmlid: itemData.system.XMLID, actor: this.actor })
    // if (configPowerInfo && configPowerInfo.powerType.includes("attack")) {
    //     await uploadAttack.call(this, xml)
    // }

    // Some items are attacks
    const configPowerInfo = getPowerInfo({ xmlid: itemData.system.XMLID, actor: this.actor })
    if (configPowerInfo && configPowerInfo.powerType.includes("attack")) {
        await makeAttack(item)
    }
}

export async function uploadMartial(power, type, extraDc, usesTk) {
    //if (power.getAttribute('XMLID') == "GENERIC_OBJECT") return;
    // GENERIC_OBJECT are likely Power Frameworks.
    // Rename GENERIC_OBJECT with TAGNAME to make it easier to parse.
    if (power.getAttribute('XMLID') == "GENERIC_OBJECT") {
        power.setAttribute('XMLID', power.tagName)
    }

    let itemData = XmlToItemData.call(this, power, type)
    let item = await HeroSystem6eItem.create(itemData, { parent: this.actor })
    makeAttack(item)




}


export async function uploadSkill(skill, duplicate) {

    let itemData

    // GENERIC_OBJECT are likely Power Frameworks.
    // Rename GENERIC_OBJECT with TAGNAME to make it easier to parse.
    if (skill.getAttribute('XMLID') == "GENERIC_OBJECT") {
        skill.setAttribute('XMLID', skill.tagName)
        itemData = XmlToItemData.call(this, skill, 'skill')

        // This really isn't a skill so get rid of roll so sheet doesn't display a roll button
        itemData.system.characteristic = null
        itemData.system.state = null
        itemData.system.roll = null
    }
    else {
        itemData = XmlToItemData.call(this, skill, 'skill')
    }

    itemData.system.duplicate = duplicate
    let item = await HeroSystem6eItem.create(itemData, { parent: this.actor })

}

function calcBasePointsPlusAdders(system) {


    if (!system.XMLID)
        return 0

    // if (system.XMLID == "RKA")
    //     HEROSYS.log(false, system.XMLID)


    // Everyman skills are free
    if (system.EVERYMAN) {
        return 0
    }

    // Native Tongue
    if (system.NATIVE_TONGUE) {
        return 0
    }

    // Check if we have CONFIG info about this power
    const configPowerInfo = getPowerInfo({ xmlid: system.XMLID, actor: this?.actor })


    // Base Cost is typcailly extracted directly from HDC
    let baseCost = parseInt(system.BASECOST)


    // Cost per level is NOT included in the HDC file.
    // We will try to get cost per level via config.js
    // Default cost per level will be BASECOST, or 3/2 for skill, or 1 for everything else
    const characteristicCosts = this?.actor?.system?.is5e ? CONFIG.HERO.characteristicCosts5e : CONFIG.HERO.characteristicCosts
    let costPerLevel = parseFloat(
        configPowerInfo?.costPerLevel ||
        characteristicCosts[system.XMLID.toLocaleLowerCase()] ||
        system.costPerLevel ||
        baseCost
        || (configPowerInfo?.powerType == 'skill' ? 2 : 1)
    )

    // But configPowerInfo?.costPerLevel could actually be 0 (EXTRALIMBS)
    if (configPowerInfo?.costPerLevel != undefined) {
        costPerLevel = parseFloat(configPowerInfo?.costPerLevel)
    }

    let levels = parseInt(system.LEVELS?.value)

    let subCost = costPerLevel * levels

    // 3 CP per 2 points
    if (costPerLevel == 3 / 2 && subCost % 1) {
        let _threePerTwo = Math.ceil(costPerLevel * levels) + 1
        subCost = _threePerTwo
        system.title = (system.title || "") + '3 CP per 2 points; \n+1 level may cost nothing. '
    }

    // FORCEWALL/BARRIER
    if (system.XMLID == "FORCEWALL") {
        baseCost += (parseInt(system.BODYLEVELS) || 0)
        baseCost += (parseInt(system.LENGTHLEVELS) || 0)
        baseCost += (parseInt(system.HEIGHTLEVELS) || 0)
        baseCost += (Math.ceil(parseFloat(system.WIDTHLEVELS * 2)) || 0)  // per +½m of thickness
    }

    // Start adding up the costs
    let cost = baseCost + subCost



    // ADDERS
    let adderCost = 0
    if (system.adders) {
        for (let adder of system.adders.filter(o => o.SELECTED)) {
            let adderBaseCost = parseInt(adder.BASECOST)

            let adderLevels = Math.max(1, parseInt(adder.LEVELS))
            adderCost += adderBaseCost * adderLevels
        }
    }

    // Categorized skills cost 2 per catory and +1 per each subcategory.
    // If no catagories selected then assume 3 pts
    if (configPowerInfo?.categorized && adderCost >= 4) {
        if (adderCost == 0) {
            adderCost = 3
        } else {
            adderCost = Math.floor(adderCost / 2) + 1
        }
    }

    // POWERS (likely ENDURANCERESERVEREC)
    if (system.powers) {
        for (let adder of system.powers) {
            let adderBaseCost = parseFloat(adder.BASECOST)
            let adderLevels = Math.max(1, parseInt(adder.LEVELS))
            adderCost += Math.ceil(adderBaseCost * adderLevels);
        }
    }

    cost += adderCost



    // INDEPENDENT ADVANTAGE (aka Naked Advantage)
    // NAKEDMODIFIER uses PRIVATE=="No" to indicate NAKED modifier
    if (system.XMLID == "NAKEDMODIFIER") {
        let advantages = 0
        for (let modifier of system.modifiers.filter(o => !o.PRIVATE)) {
            advantages += parseFloat(modifier.BASECOST)
        }
        cost = cost * advantages
    }

    return Math.max(0, cost)
}

function calcActivePoints(_basePointsPlusAdders, system) {
    // Active Points = (Base Points + cost of any Adders) x (1 + total value of all Advantages)

    if (system.XMLID == "ARMOR")
        HEROSYS.log(false, system.XMLID)

    let advantages = 0;
    let advantagesDC = 0;

    for (let modifier of system.modifiers.filter(o =>
        (system.XMLID != "NAKEDMODIFIER" || o.PRIVATE)
        && parseFloat(o.BASECOST) >= 0
    )) {
        let _myAdvantage = 0
        const modifierBaseCost = parseFloat(modifier.BASECOST || 0)
        const costPerLevel = parseFloat(modifier.costPerLevel || 0)
        const levels = Math.max(1, parseFloat(modifier.LEVELS))
        switch (modifier.XMLID) {
            case "AOE":
                _myAdvantage += modifierBaseCost;
                break;

            case "CUMULATIVE":
                _myAdvantage += modifierBaseCost + (levels * 0.25);
                break;

            default:
                _myAdvantage += modifierBaseCost * levels;
        }

        // Some modifiers may have ADDERS
        const adders = modifier.adders //modifier.getElementsByTagName("ADDER")
        if (adders.length) {
            for (let adder of adders) {
                const adderBaseCost = parseFloat(adder.BASECOST || 0)
                //if (adderBaseCost > 0) {
                _myAdvantage += adderBaseCost;
                //HEROSYS.log(false, adder.XMLID, adderBaseCost)
                //}
            }
        }

        // No negative advantages
        advantages += Math.max(0, _myAdvantage)
        modifier.BASECOST_total = _myAdvantage


        // For attacks with Advantages, determine the DCs by
        // making a special Active Point calculation that only counts
        // Advantages that directly affect how the victim takes damage.
        let powerInfo = getPowerInfo({ xmlid: system.XMLID })
        let modifierInfo = getModifierInfo({ xmlid: modifier.XMLID })
        if (powerInfo && powerInfo.powerType.includes("attack")) {
            if (modifierInfo && modifierInfo.dc) {
                advantagesDC += Math.max(0, _myAdvantage)
            }
        }
    }

    const _activePoints = _basePointsPlusAdders * (1 + advantages)
    system.activePointsDc = RoundFavorPlayerDown(_basePointsPlusAdders * (1 + advantagesDC))

    // HALFEND is based on active points without the HALFEND modifier
    if (system.modifiers.find(o => o.XMLID == "REDUCEDEND")) {
        system._activePointsWithoutEndMods = _basePointsPlusAdders * (1 + advantages - 0.25);
    }


    return RoundFavorPlayerDown(_activePoints)
}

function calcRealCost(_activeCost, system) {
    // Real Cost = Active Cost / (1 + total value of all Limitations)

    // if (system.XMLID == "RKA")
    //     HEROSYS.log(false, system.XMLID)

    let limitations = 0
    for (let modifier of system.modifiers.filter(o => parseFloat(o.BASECOST) < 0)) {
        let _myLimitation = 0
        const modifierBaseCost = parseFloat(modifier.BASECOST || 0)
        _myLimitation += -modifierBaseCost;

        // Some modifiers may have ADDERS as well (like a focus)
        for (let adder of modifier.adders) {
            let adderBaseCost = parseFloat(adder.BASECOST || 0)

            // Unique situation where JAMMED floors the limitation
            if (adder.XMLID == "JAMMED" && _myLimitation == 0.25) {
                system.title = (system.title || "") + 'Limitations are below the minumum of -1/4; \nConsider removing unnecessary limitations. '
                adderBaseCost = 0
            }

            // can be positive or negative (like charges).
            // Requires a roll gets interesting with Jammed / Can choose which of two rolls to make from use to use
            _myLimitation += -adderBaseCost;

            const multiplier = Math.max(1, parseFloat(adder.MULTIPLIER || 0))
            _myLimitation *= multiplier
        }


        // NOTE: REQUIRESASKILLROLL The minimum value is -1/4, regardless of modifiers.
        if (_myLimitation < 0.25) {

            // if (game.settings.get(game.system.id, 'alphaTesting')) {
            //     ui.notifications.warn(`${system.XMLID} ${modifier.XMLID} has a limiation of ${-_myLimitation}.  Overrided limitation to be -1/4.`)
            //     console.log(`${system.XMLID} ${modifier.XMLID} has a limiation of ${-_myLimitation}.  Overrided limitation to be -1/4.`, system)
            // }
            _myLimitation = 0.25
            system.title = (system.title || "") + 'Limitations are below the minumum of -1/4; \nConsider removing unnecessary limitations. '
        }

        //console.log("limitation", modifier.ALIAS, _myLimitation)
        modifier.BASECOST_total = -_myLimitation

        limitations += _myLimitation
    }

    // if (system.XMLID == "END")
    //     HEROSYS.log(false, system.XMLID)

    let _realCost = _activeCost / (1 + limitations)
    _realCost = RoundFavorPlayerDown(_realCost)

    // Minumum cost
    if (_realCost == 0 && _activeCost > 0) {
        _realCost = 1
    }

    return _realCost
}

export async function uploadPower(power, type) {

    // GENERIC_OBJECT are likely Power Frameworks.
    // Rename GENERIC_OBJECT with TAGNAME to make it easier to parse.
    if (power.getAttribute('XMLID') == "GENERIC_OBJECT") {
        power.setAttribute('XMLID', power.tagName)
    }

    let itemData = XmlToItemData.call(this, power, type)

    let item = await HeroSystem6eItem.create(itemData, { parent: this.actor })


    // let itemData = XmlToItemData(xml, type)
    // await HeroSystem6eItem.create(itemData, { parent: this.actor })

    let xmlid = itemData.system.XMLID
    // const name = power.getAttribute('NAME')
    // const alias = power.getAttribute('ALIAS')
    // const levels = power.getAttribute('LEVELS')
    // const input = power.getAttribute('INPUT')
    // const optionAlias = power.getAttribute("OPTION_ALIAS")

    // const relevantFields = ['BASECOST', 'LEVELS', 'ALIAS', 'MULTIPLIER', 'NAME', 'OPTION_ALIAS', 'SFX',
    //     'PDLEVELS', 'EDLEVELS', 'MDLEVELS', 'INPUT', 'OPTION', 'OPTIONID', 'BASECOST' // FORCEFIELD
    // ]
    //if (xmlid === 'GENERIC_OBJECT') return;

    // Check if we have CONFIG info about this power
    const configPowerInfo = getPowerInfo({ xmlid: xmlid, actor: this.actor })

    if (configPowerInfo) {

        if ((configPowerInfo?.powerType || "").includes("skill")) {
            await uploadSkill.call(this, power, true)
        }

        // Detect attacks
        if (configPowerInfo.powerType.includes("attack")) {
            //await uploadAttack.call(this, power, true)
            await makeAttack(item)
        }


    }
    else {
        if (game.settings.get(game.system.id, 'alphaTesting')) {
            ui.notifications.warn(`${xmlid} not handled during HDC upload of ${this.actor.name}`)
            // HEROSYS.log(false, power)
        }

    }
}

// TODO: Can this be reworked to take only ITEM as a property?
export function updateItemDescription(item) {
    // Description (eventual goal is to largely match Hero Designer)
    // TODO: This should probably be moved to the sheets code
    // so when the power is modified in foundry, the power
    // description updates as well.
    // If in sheets code it may handle drains/suppresses nicely.

    const system = item.system;
    const type = item.type;

    const configPowerInfo = getPowerInfo({ xmlid: system.XMLID, actor: item?.actor })




    switch (configPowerInfo?.xmlid || system.XMLID) {

        case "Mind Scan":
            system.description = levels + "d6 Mind Scan (" +
                input + " class of minds)";
            break;
        case "FORCEFIELD":
        case "ARMOR":
        case "DAMAGERESISTANCE":
            system.description = system.ALIAS + " ("
            let ary = []
            if (parseInt(system.PDLEVELS)) ary.push(system.PDLEVELS + " PD")
            if (parseInt(system.EDLEVELS)) ary.push(system.EDLEVELS + " ED")
            if (parseInt(system.MDLEVELS)) ary.push(system.MDLEVELS + " MD")
            if (parseInt(system.POWDLEVELS)) ary.push(system.POWDLEVELS + " POW")
            system.description += ary.join("/") + ")"
            break;

        case "FORCEWALL":
            system.description = system.ALIAS + " "
            let aryFW = []
            if (parseInt(system.PDLEVELS)) aryFW.push(system.PDLEVELS + " PD")
            if (parseInt(system.EDLEVELS)) aryFW.push(system.EDLEVELS + " ED")
            if (parseInt(system.MDLEVELS)) aryFW.push(system.MDLEVELS + " MD")
            if (parseInt(system.POWDLEVELS)) aryFW.push(system.POWDLEVELS + " POW")
            if (parseInt(system.BODYLEVELS)) aryFW.push(system.BODYLEVELS + " BODY")
            system.description += aryFW.join("/")
            system.description += `(up to ${parseInt(system.LENGTHLEVELS) + 1}m long, and ${parseInt(system.HEIGHTLEVELS) + 1}m tall, and ${parseFloat(system.WIDTHLEVELS) + 0.5}m thick)`
            break;

        case "TRANSFER":
        case "DRAIN":
        case "AID":
            // Aid  STR 5d6 (standard effect: 15 points)
            system.description = system.ALIAS + (system.INPUT ? " " + system.INPUT : "") + " " + system.LEVELS?.value + "d6"
            if (system.USESTANDARDEFFECT) {
                system.description += " (standard effect: " + parseInt(system.LEVELS?.value * 3) + " points)"
            }
            //system.description = `${system.ALIAS} ${system.LEVELS}d6`
            break;

        case "STRETCHING":
            system.description = system.ALIAS + " " + system.LEVELS?.value + "m"
            break;

        case "RUNNING":
        case "SWIMMING":
        case "LEAPING":
        case "TELEPORTATION":
            // Running +25m (12m/37m total)
            system.description = system.ALIAS + " +" + system.LEVELS?.value + "m"
            break;

        case "TUNNELING":
            // Tunneling 22m through 10 PD materials
            let defbonus = system.adders.find(o => o.XMLID == "DEFBONUS")
            let pd = 1 + parseInt(defbonus?.LEVELS || 0)
            system.description = `${system.ALIAS} +${system.LEVELS?.value}m through ${pd} PD materials`
            break;

        case "NAKEDMODIFIER":
            // Area Of Effect (8m Radius; +1/2) for up to 53 Active Points of STR
            // Naked Advantage: Reduced Endurance (0 END; +1/2) for up to 70 Active Points (35 Active Points); Gestures (Requires both hands; -1/2), Linked to Opening of the Blind, Third Eye (Opening of the Blind, Third Eye; -1/4), Visible (Tattoos of flames encompass the biceps and shoulders.  When this power is active, these flames appear to burn, emitting firelight.  ; -1/4)
            system.description = `${system.ALIAS} for up to ${system.LEVELS?.value} Active points`
            if (system.INPUT) {
                system.description += ` of ${system.INPUT}`
            }
            break;

        case "DEFENSE_MANEUVER":
            system.description = system.ALIAS + " " + system.OPTION_ALIAS
            break;


        case "LANGUAGES":
            //English:  Language (basic conversation) (1 Active Points)
            system.description = system.NAME + ": " + (system.INPUT || system.ALIAS)
            if (system.OPTION_ALIAS) {
                system.description += " (" + system.OPTION_ALIAS + ")"
            }
            break;

        case "KNOWLEDGE_SKILL":

            // 6e HDC
            //if (system.ALIAS == "KS") {
            system.description = system.ALIAS + ": " + (system.NAME.replace(system.ALIAS, "") || system.INPUT || "")
            // } else {
            //     system.description = system.NAME
            // }
            // let item = {
            //     actor: this?.actor || this,
            //     system: system
            // }
            // SkillRollUpdateValue(item)
            // if (system.roll) {
            //     system.description += ` ${system.roll}`
            // }

            break;
        case "TRANSPORT_FAMILIARITY":
            //TF:  Custom Adder, Small Motorized Ground Vehicles
            system.description = system.ALIAS + ": "
            break;

        case "MENTAL_COMBAT_LEVELS":
        case "PENALTY_SKILL_LEVELS":
            system.description = system.NAME + ": +" + system.LEVELS?.value + " " + system.OPTION_ALIAS
            break;

        case "RKA":
        case "HKA":
        case "ENERGYBLAST": //Energy Blast 1d6
        case "EGOATTACK":
        case "MINDCONTROL":
            system.description = `${system.ALIAS} ${system.LEVELS?.value}d6`
            break;

        case "HANDTOHANDATTACK":
            system.description = `${system.ALIAS} +${system.LEVELS?.value}d6`
            break;

        case "KBRESISTANCE":
            system.description = (system.INPUT ? system.INPUT + " " : "") + (system.OPTION_ALIAS || system.ALIAS)
                + ` -${system.LEVELS?.value}m`
            break;

        case "ELEMENTAL_CONTROL":
            // Elemental Control, 12-point powers
            system.description = `${system.ALIAS}, ${parseInt(system.BASECOST) * 2}-point powers`
            break;

        case "FLIGHT":
            // Flight 5m
            system.description = `${system.ALIAS} ${system.LEVELS?.value}m`
            break;

        case "MANEUVER":

            system.description = "";


            // For most maneuvers we can use the EFFECT
            if (system.EFFECT) {
                system.description = system.EFFECT + ", ";
            }

            // Martial attacks tyipcally add STR to description
            let fullDice = system.dice;
            let extraDice = 0;
            switch (system.extraDice) {
                case 'pip':
                    extraDice += 1;
                    break
                case 'half':
                    extraDice += 2;
                    break
            }

            if (item.actor) {  // Make sure we have an actor
                // Convert dice to pips
                let pips = system.dice * 3;
                switch (system.extraDice) {
                    case 'pip':
                        pips += 1;
                        break
                    case 'half':
                        pips += 2;
                        break
                }

                // Add in STR
                if (system.usesStrength && item.actor) {
                    let str = item.actor.system.characteristics.str.value
                    let str5 = Math.floor(str / 5)
                    if (system.killing) {
                        pips += str5
                    } else {
                        pips += str5 * 3
                    }
                }

                // Convert pips to DICE
                fullDice = Math.floor(pips / 3)
                extraDice = pips - fullDice * 3
            }


            // Offensive Strike:  1/2 Phase, -2 OCV, +1 DCV, 8d6 Strike
            // Killing Strike:  1/2 Phase, -2 OCV, +0 DCV, HKA 1d6 +1
            //`${system.ALIAS}:`
            if (system.PHASE) system.description += ` ${system.PHASE} Phase`
            if (system.OCV) system.description += `, ${system.OCV} OCV, ${system.DCV} DCV`
            if (system.EFFECT) {
                let dc = convertToDcFromItem(item).dc;
                if (dc) {
                    let damageDice = convertFromDC(item, dc);
                    if (damageDice) {
                        system.description += `,`;

                        if (system.CATEGORY === "Hand To Hand" && system.EFFECT.indexOf("KILLING") > -1) {
                            system.description += " HKA";
                        }
                        system.description += ` ${system.EFFECT.replace("[NORMALDC]", damageDice).replace("[KILLINGDC]", damageDice.replace("+ 1", "+1"))}`
                    }
                }
            }
            break;

        case "TELEKINESIS":
            //Psychokinesis:  Telekinesis (62 STR), Alternate Combat Value (uses OMCV against DCV; +0) 
            // (93 Active Points); Limited Range (-1/4), Only In Alternate Identity (-1/4), 
            // Extra Time (Delayed Phase, -1/4), Requires A Roll (14- roll; -1/4)
            system.description = `${system.ALIAS} (${system.LEVELS.value} STR)`
            break;

        case "MENTAL_COMBAT_LEVELS":
        case "COMBAT_LEVELS":
            // +1 with any single attack
            system.description = `+${system.LEVELS.value} ${system.OPTION_ALIAS}`;
            break;

        case "INVISIBILITY":
            // Invisibility to Hearing and Touch Groups  (15 Active Points); Conditional Power Only vs organic perception (-1/2)
            system.description = `${system.ALIAS}`;
            break;

        case "ENDURANCERESERVE":
            // Endurance Reserve  (20 END, 5 REC) (9 Active Points)
            system.description = `${system.ALIAS.replace('Endurance Reserve', '')}`;

            const power = system.powers.find(o => o.XMLID === "ENDURANCERESERVEREC");
            if (power) {
                if (parseInt(system.LEVELS.value) === parseInt(system.LEVELS.max)) {
                    system.description += ` (${system.LEVELS.max} END, ${power.LEVELS} REC)`
                } else {
                    system.description += ` (${system.LEVELS.value}/${system.LEVELS.max} END, ${power.LEVELS} REC)`
                }
            }
            break;

        default:
            if (configPowerInfo && configPowerInfo.powerType.includes("characteristic")) {
                system.description = "+" + system.LEVELS?.value + " " + system.ALIAS;
                break;
            }
            system.description = (system.INPUT ? system.INPUT + " " : "") + (system.OPTION_ALIAS || system.ALIAS || "")

            // Skill Roll?
            if (type == 'skill') {
                // let item = {
                //     actor: this?.actor || this,
                //     system: system
                // }
                // SkillRollUpdateValue(item)
                // if (system.roll) {
                //     system.description += ` ${system.roll}`
                // }
            }

    }

    // ADDRS
    let _adderArray = []
    if (system.XMLID === "INVISIBILITY") {
        _adderArray.push(system.OPTION_ALIAS)
    }
    if (system?.adders?.length > 0) {
        for (let adder of system.adders) {
            switch (adder.XMLID) {
                case "DIMENSIONS":
                    system.description += ", " + adder.ALIAS
                    break;
                case "DEFBONUS":
                    break
                case "EXTENDEDBREATHING":
                    system.description += adder.ALIAS + " " + adder.OPTION_ALIAS
                    break
                case "CONCEALABILITY":
                case "REACTION":
                case "SENSING":
                case "SITUATION":
                case "INTENSITY":
                case "EFFECTS":
                case "OCCUR":
                    _adderArray.push(adder.OPTION_ALIAS.replace("(", ""))
                    break;
                case "PHYSICAL":
                case "ENERGY":
                case "MENTAL":
                    _adderArray.push("-" + parseInt(adder.LEVELS) + " " + adder.ALIAS)
                    break;
                case "PLUSONEHALFDIE":
                    system.description = system.description.replace(/d6$/, " ") + adder.ALIAS.replace("+", "").replace(" ", "");
                    break;
                default: if (adder.ALIAS.trim()) _adderArray.push(adder.ALIAS)
            }
        }

        if (_adderArray.length > 0) {
            switch (system.XMLID) {
                case "TRANSPORT_FAMILIARITY":
                    system.description += _adderArray.join("; ")
                    break;
                case "INVISIBILITY":
                    system.description += " to ";
                    // Groups
                    let _groups = _adderArray.filter(o => o.indexOf("Group") > -1);
                    if (_groups.length === 1) {
                        system.description += _groups[0];
                    } else {
                        system.description += _groups.slice(0, -1).join(", ").replace(/ Group/g, "");
                        system.description += " and " + _groups.slice(-1) + "s";
                    }

                    // spacing
                    if (_groups.length > 0) {
                        system.description += ", ";
                    }

                    // singles
                    let _singles = _adderArray.filter(o => o.indexOf("Group") === -1);
                    if (_singles.length === 1) {
                        system.description += _singles[0];
                    } else {
                        system.description += _singles.slice(0, -1).join(", ");
                        system.description += " and " + _singles.slice(-1);
                    }

                    break;
                default:
                    system.description += "(" + _adderArray.join("; ") + ")"
            }
        }
    }



    // if (system.XMLID === "MINDCONTROL")
    //     HEROSYS.log(false, system.XMLID);

    // Advantages sorted low to high
    for (let modifier of system.modifiers.filter(o => o.BASECOST >= 0).sort((a, b) => { return a.BASECOST_total - b.BASECOST_total })) {
        system.description += createPowerDescriptionModifier(modifier, system)
    }

    // Active Points
    if (system.realCost != system.activePoints) {
        system.description += " (" + system.activePoints + " Active Points); "
    }

    // Disadvantages sorted low to high
    for (let modifier of system.modifiers.filter(o => o.BASECOST < 0).sort((a, b) => { return a.BASECOST_total - b.BASECOST_total })) {
        system.description += createPowerDescriptionModifier(modifier, system)
    }

    system.description = system.description.replace("; ,", ";").replace("; ;", ";").trim()


    // Endurance
    system.end = Math.max(1, RoundFavorPlayerDown(system.activePoints / 10) || 0)
    const costsEnd = system.modifiers.find(o => o.XMLID == "COSTSEND")
    const increasedEnd = system.modifiers.find(o => o.XMLID == "INCREASEDEND")
    if (increasedEnd) {
        system.end *= parseInt(increasedEnd.OPTION.replace('x', ''))
    }

    const reducedEnd = system.modifiers.find(o => o.XMLID == "REDUCEDEND")
    if (reducedEnd && reducedEnd.OPTION === 'HALFEND') {
        system.end = RoundFavorPlayerDown(system._activePointsWithoutEndMods / 10)
        system.end = RoundFavorPlayerDown(system.end / 2);
    }
    if (reducedEnd && reducedEnd.OPTION === 'ZERO') {
        system.end = 0;
    }

    // Some powers do not use Endurance
    if (configPowerInfo && !configPowerInfo.costEnd && !costsEnd) {
        system.end = 0
    }

    // Charges typically do not cost END
    if (system.charges?.max && !costsEnd) {
        system.end = 0;
    }

    // STR only costs endurance when used.
    // Can get a bit messy, like when resisting an entangle, but will deal with that later.
    if (system.XMLID == "STR") {
        system.end = 0
    }

    // MOVEMENT only costs endurance when used.  Typically per round.
    if (configPowerInfo && configPowerInfo.powerType.includes("movement")) {
        system.end = 0
    }

    // PERKS, TALENTS, COMPLICATIONS do not use endurance.
    if (["perk", "talent", "complication"].includes(type)) {
        system.end = 0
    }


}

function createPowerDescriptionModifier(modifier, system) {



    let result = ""

    switch (modifier.XMLID) {
        case "CHARGES":
            // 1 Recoverable Continuing Charge lasting 1 Minute
            result += ", " + modifier.OPTION_ALIAS

            let recoverable = modifier.adders.find(o => o.XMLID == "RECOVERABLE")
            if (recoverable) {
                result += " " + recoverable.ALIAS
            }

            let continuing = modifier.adders.find(o => o.XMLID == "CONTINUING")
            if (continuing) {
                result += " " + continuing.ALIAS
            }

            result += parseInt(modifier.OPTION_ALIAS) > 1 ? " Charges" : " Charge"

            if (continuing) {
                result += " lasting " + continuing.OPTION_ALIAS
            }

            break;
        case "FOCUS":
            result += modifier.ALIAS
            break;

        default:
            if (modifier.ALIAS) result += ", " + modifier.ALIAS || "?"


    }

    // if ((parseInt(modifier.LEVELS) || 0) > 1) {
    //     if (["HARDENED"].includes(modifier.XMLID)) {
    //         result += "x" + parseInt(modifier.LEVELS)
    //     }
    // }

    // ADDERS


    // if (modifier.comments) powerData.description += "; " + modifier.comments
    // if (modifier.option) powerData.description += "; " + modifier.option
    // if (modifier.optionId) powerData.description += "; " + modifier.optionId

    if (!["CONDITIONALPOWER"].includes(modifier.XMLID)) {
        result += " ("
    } else {
        result += " ";
    }


    // Multiple levels?
    if ((parseInt(modifier.LEVELS) || 0) > 1) {
        if (["HARDENED"].includes(modifier.XMLID)) {
            result += "x" + parseInt(modifier.LEVELS) + "; "
        }

        if (["AOE"].includes(modifier.XMLID)) {
            result += parseInt(modifier.LEVELS) + "m ";
        }
    }

    if (modifier.XMLID == "CUMULATIVE" && (parseInt(modifier.LEVELS) > 0)) {
        result += parseInt(system.LEVELS.value || system.LEVELS) * 6 * (parseInt(modifier.LEVELS) + 1) + " points; "
    }

    if (modifier.OPTION_ALIAS && !["VISIBLE", "CHARGES"].includes(modifier.XMLID)) {
        result += modifier.OPTION_ALIAS
        switch (modifier.XMLID) {
            case "EXTRATIME":
                result += ", ";
                break;
            case "CONDITIONALPOWER":
                break;
            default:
                result += "; ";
        }
    }

    // if (modifier.COMMENTS)
    // {
    //     result += modifier.COMMENTS + "; ";
    // }

    //if (["REQUIRESASKILLROLL", "LIMITEDBODYPARTS"].includes(modifier.XMLID)) result += modifier.COMMENTS + "; "
    if (modifier.COMMENTS) result += modifier.COMMENTS + "; "
    for (let adder of modifier.adders) {
        result += adder.ALIAS + ", "
    }

    let fraction = ""

    let BASECOST_total = modifier.BASECOST_total || modifier.BASECOST

    if (BASECOST_total == 0) {
        fraction += "+0"
        // if (game.settings.get(game.system.id, 'alphaTesting')) {
        //     ui.notifications.warn(`${powerName} has an unhandeled modifier (${modifier.XMLID})`)
        // }
    }

    if (BASECOST_total > 0) {
        fraction += "+"
    }
    let wholeNumber = Math.trunc(BASECOST_total)

    if (wholeNumber != 0) {
        fraction += wholeNumber + " "
    }
    else if (BASECOST_total < 0) {
        fraction += "-"
    }
    switch (Math.abs(BASECOST_total % 1)) {
        case 0: break;
        case 0.25: fraction += "1/4"; break;
        case 0.5: fraction += "1/2"; break;
        case 0.75: fraction += "3/4"; break;
        default: fraction += BASECOST_total % 1;
    }

    if (["CONDITIONALPOWER"].includes(modifier.XMLID)) {
        result += " ("
    }

    result += fraction.trim() + ")"

    // Highly summarized
    if (["FOCUS"].includes(modifier.XMLID)) {
        //result = `, ${modifier.OPTION} (${fraction.trim()})`
        // 'Focus (OAF; Pen-sized Device in pocket; -1)'
        result = result.replace(`Focus (${modifier.OPTION}; `, `${modifier.OPTION} (`)
    }

    return result;
}

export async function makeAttack(item) {
    const xmlid = item.system.XMLID || item.system.xmlid || item.system.rules

    // Confirm this is an attack
    const configPowerInfo = getPowerInfo({ xmlid: xmlid, actor: item.actor })
    //if (!configPowerInfo || !configPowerInfo.powerType.includes("attack")) return

    let changes = {}
    //changes[`img`] = "icons/svg/sword.svg"


    // Name
    let description = item.system.ALIAS
    let name = item.system.NAME || description || configPowerInfo?.xmlid || item.system.name;
    changes[`name`] = name

    let levels = parseInt(item.system.LEVELS?.value) || parseInt(item.system.DC) || 0;
    const input = item.system.INPUT

    const ocv = parseInt(item.system.ocv) || parseInt(item.system.OCV) || item.system.OCV || 0;
    const dcv = parseInt(item.system.dcv) || parseInt(item.system.DCV) || item.system.DCV || 0;

    // Check if this is a MARTIAL attack.  If so then EXTRA DC's may be present
    if (item.system.XMLID == "MANEUVER") {

        let EXTRADC = null;

        // HTH
        if (item.system.CATEGORY == "Hand To Hand") {
            EXTRADC = item.actor.items.find(o => o.system.XMLID == "EXTRADC" && o.system.ALIAS.indexOf("HTH") > -1)
        }
        // Ranged is not implemented yet

        // Extract +2 HTH Damage Class(es)
        if (EXTRADC) {
            let match = EXTRADC.system.ALIAS.match(/\+\d+/)
            if (match) {
                levels += parseInt(match[0])
            }
        }
    }

    // Check if TELEKINESIS + WeaponElement (BAREHAND) + EXTRADC  (WillForce)
    if (item.system.XMLID == "TELEKINESIS") {
        if (item.actor.items.find(o => o.system.XMLID == "WEAPON_ELEMENT" && o.system.adders.find(o => o.XMLID == "BAREHAND"))) {
            let EXTRADC = item.actor.items.find(o => o.system.XMLID == "EXTRADC" && o.system.ALIAS.indexOf("HTH") > -1)
            // Extract +2 HTH Damage Class(es)
            if (EXTRADC) {
                let match = EXTRADC.system.ALIAS.match(/\+\d+/)
                if (match) {
                    levels += parseInt(match[0]) * 5 // Below we take these levels (as STR) and determine dice
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

    changes[`system.subType`] = 'attack'
    changes[`system.class`] = input === "ED" ? "energy" : "physical"
    changes[`system.dice`] = levels
    changes[`system.extraDice`] = "zero"
    changes[`system.killing`] = false
    changes[`system.knockbackMultiplier`] = 1
    changes[`system.targets`] = "dcv"
    changes[`system.uses`] = "ocv"
    changes[`system.usesStrength`] = true
    changes[`system.areaOfEffect`] = { type: 'none', value: 0 }
    changes[`system.piercing`] = 0
    changes[`system.penetrating`] = 0
    changes[`system.ocv`] = ocv
    changes[`system.dcv`] = dcv
    changes['system.stunBodyDamage'] = "stunbody"

    // BLOCK and DODGE typically do not use STR
    if (["maneuver", "martialart"].includes(item.type)) {
        if (item.system.EFFECT.toLowerCase().indexOf("block") > -1 ||
            item.system.EFFECT.toLowerCase().indexOf("dodge") > -1
        ) {
            changes[`system.usesStrength`] = false;
        }
    }

    // ENTANGLE (not implemented)
    if (xmlid == "ENTANGLE") {
        changes[`system.class`] = 'entangle'
        changes[`system.usesStrength`] = false
        changes[`system.noHitLocations`] = true
    }

    // DARKNESS (not implemented)
    if (xmlid == "DARKNESS") {
        changes[`system.class`] = 'darkness'
        changes[`system.usesStrength`] = false
        changes[`system.noHitLocations`] = true
    }

    // IMAGES (not implemented)
    if (xmlid == "IMAGES") {
        changes[`system.class`] = 'images'
        changes[`system.usesStrength`] = false
        changes[`system.noHitLocations`] = true
    }

    // DRAIN (not implemented)
    if (xmlid == "DRAIN") {
        changes[`system.class`] = 'drain'
        changes[`system.usesStrength`] = false
        changes[`system.noHitLocations`] = true
    }

    // AID (not implemented)
    if (xmlid == "AID") {
        changes[`system.class`] = 'aid'
        changes[`system.usesStrength`] = false
        changes[`system.noHitLocations`] = true
    }

    // TRANSFER
    if (xmlid == "TRANSFER") {
        changes[`system.class`] = 'transfer'
        changes[`system.usesStrength`] = false
        changes[`system.noHitLocations`] = true
    }

    // MINDSCAN
    if (xmlid == "MINDSCAN") {
        changes[`system.class`] = 'mindscan'
        changes[`system.usesStrength`] = false
        changes[`system.noHitLocations`] = true
    }

    // DISPEL
    if (xmlid == "DISPEL") {
        changes[`system.class`] = 'dispel'
        changes[`system.usesStrength`] = false
        changes[`system.noHitLocations`] = true
    }

    // MENTALBLAST
    if (xmlid == "EGOATTACK") {
        changes[`system.class`] = 'mental'
        changes[`system.targets`] = "dmcv"
        changes[`system.uses`] = "omcv"
        changes[`system.knockbackMultiplier`] = 0
        changes[`system.usesStrength`] = false
        changes['system.stunBodyDamage'] = "stunonly"
        changes['system.noHitLocations'] = true
    }

    // MINDCONTROL
    if (xmlid == "MINDCONTROL") {
        changes[`system.class`] = 'mindcontrol'
        changes[`system.targets`] = "dmcv"
        changes[`system.uses`] = "omcv"
        changes[`system.knockbackMultiplier`] = 0
        changes[`system.usesStrength`] = false
        changes['system.stunBodyDamage'] = "stunonly"
        changes['system.noHitLocations'] = true
    }

    // CHANGEENVIRONMENT
    if (xmlid == "CHANGEENVIRONMENT") {
        changes[`system.class`] = 'change enviro'
        changes[`system.usesStrength`] = false
        changes[`system.noHitLocations`] = true
    }

    // FLASH
    if (xmlid == "FLASH") {
        changes[`system.class`] = 'flash'
        changes[`system.usesStrength`] = false
        changes[`system.noHitLocations`] = true
    }


    // Armor Piercing
    let ARMORPIERCING = item.system.modifiers.find(o => o.XMLID == "ARMORPIERCING")
    if (ARMORPIERCING) {
        changes[`system.piercing`] = parseInt(ARMORPIERCING.LEVELS)
    }

    // Penetrating
    let PENETRATING = item.system.modifiers.find(o => o.XMLID == "PENETRATING")
    if (PENETRATING) {
        changes[`system.penetrating`] = parseInt(PENETRATING.LEVELS)
    }

    // No Knockback
    let NOKB = item.system.modifiers.find(o => o.XMLID == "NOKB")
    if (NOKB) {
        changes[`system.knockbackMultiplier`] = 0
    }

    // Double Knockback
    let DOUBLEKB = item.system.modifiers.find(o => o.XMLID == "DOUBLEKB")
    if (DOUBLEKB) {
        changes[`system.knockbackMultiplier`] = 2
    }

    // Explosion
    let EXPLOSION = item.system.modifiers.find(o => o.XMLID == "EXPLOSION")
    if (EXPLOSION) {
        if (game.settings.get(game.system.id, 'alphaTesting')) {
            ui.notifications.warn(`EXPLOSION not implemented during HDC upload of ${item.actor.name}`)
        }
    }

    // Alternate Combat Value (uses OMCV against DCV)
    let ACV = item.system.modifiers.find(o => o.XMLID == "ACV")
    if (ACV) {
        if (ACV.OPTION_ALIAS === "uses OMCV against DCV") {
            changes[`system.uses`] = 'omcv'
            changes[`system.targets`] = 'dcv'
        }
        if (ACV.OPTION_ALIAS === "uses OCV against DMCV") {
            changes[`system.uses`] = 'ocv'
            changes[`system.targets`] = 'dmcv'
        }
        if (ACV.OPTION_ALIAS === "uses OMCV against DCV") {
            changes[`system.uses`] = 'omcv'
            changes[`system.targets`] = 'dcv'
        }
    }


    if (item.system.adders && item.system.adders.find(o => o.XMLID == "PLUSONEPIP")) {
        changes[`system.extraDice`] = "pip"
    }

    if (item.system.adders && item.system.adders.find(o => o.XMLID == "PLUSONEHALFDIE")) {
        changes[`system.extraDice`] = "half"
    }

    if (item.system.adders && item.system.adders.find(o => o.XMLID == "MINUSONEPIP")) {
        // Typically only allowed for killing attacks.
        //  Appears that +1d6-1 is roughly equal to +1/2 d6
        changes[`system.extraDice`] = "half"
    }

    const aoe = item.system.modifiers.find(o => o.XMLID == "AOE")
    if (aoe) {
        changes[`system.areaOfEffect`] = {
            type: aoe.OPTION_ALIAS.toLowerCase(),
            value: parseInt(aoe.LEVELS)
        }
    }


    if (xmlid === "HKA" || item.system.EFFECT?.indexOf("KILLING") > -1) {
        changes[`system.killing`] = true

        // Killing Strike uses DC=2 which is +1/2d6.
        // For now just recalculate that, but ideally rework this function to use DC instead of dice.
        let pips = parseInt(item.system.DC || item.system.LEVELS.value * 3);
        changes['system.dice'] = Math.floor(pips / 3);
        if (pips % 3 == 1) {
            changes['system.extraDice'] = "pip"
        }
        if (pips % 3 == 2) {
            changes['system.extraDice'] = "half"
        }

    }


    if (xmlid === "TELEKINESIS") {
        // levels is the equivalent strength
        changes[`system.extraDice`] = "zero"
        changes[`system.dice`] = 0
        changes[`system.extraDice`] = "zero";
        changes[`name`] = name + " (TK strike)"
        changes[`system.usesStrength`] = false
        changes[`system.usesTk`] = true
    }

    if (xmlid === "ENERGYBLAST") {
        changes[`system.usesStrength`] = false
    }

    if (xmlid === "RKA") {
        changes[`system.killing`] = true
        changes[`system.usesStrength`] = false
    }

    const noStrBonus = item.system.modifiers.find(o => o.XMLID == "NOSTRBONUS")
    if (noStrBonus) {
        changes[`system.usesStrength`] = false;
    }

    if (item._id) {
        await item.update(changes, { hideChatMessage: true })
    } else {
        // Likely a QUENCH test
        for (let change of Object.keys(changes)) {
            let target = item;
            for (let key of change.split('.')) {
                if (typeof target[key] == 'object') {
                    target = target[key]
                } else {
                    target[key] = changes[change]
                }
            }
        }
    }

}

// export async function uploadAttack(power) {
//     const xmlid = power.getAttribute('XMLID')

//     const configPowerInfo = getPowerInfo({ xmlid: xmlid, actor: this.actor })

//     // Verify we have an attack
//     if (!configPowerInfo.powerType.includes("attack")) return

//     let description = power.getAttribute('ALIAS')
//     let name = ''
//     if (power.hasAttribute('NAME') && power.getAttribute('NAME') !== '') {
//         name = power.getAttribute('NAME')
//     } else {
//         name = description
//     }

//     const levels = parseInt(power.getAttribute('LEVELS'))
//     const input = power.getAttribute('INPUT')

//     // Attempt to calculate avantages
//     //let advantages = 1;
//     //for (let mod in powers.)

//     // Active cost is required for endurance calculation.
//     // It should include all advantages (which we don't handle very well at the moment)
//     let activeCost = (levels * 5)
//     let end = Math.round(activeCost / 10 - 0.01);

//     let itemData = {
//         name,
//         type: "attack",
//         system: {
//             class: input === "ED" ? "energy" : "physical",
//             dice: levels,
//             end: end,
//             extraDice: "zero",
//             killing: false,
//             knockbackMultiplier: 1,
//             targets: "dcv",
//             uses: "ocv",
//             usesStrength: true,
//             activeCost: activeCost,
//         }
//     }

//     // Armor Piercing
//     let ARMORPIERCING = power.querySelector('[XMLID="ARMORPIERCING"]')
//     if (ARMORPIERCING) {
//         itemData.system.piercing = parseInt(ARMORPIERCING.getAttribute("LEVELS"))
//     }

//     // Penetrating
//     let PENETRATING = power.querySelector('[XMLID="PENETRATING"]')
//     if (PENETRATING) {
//         itemData.system.penetrating = parseInt(PENETRATING.getAttribute("LEVELS"))
//     }

//     // No Knockback
//     let NOKB = power.querySelector('[XMLID="NOKB"]')
//     if (NOKB) {
//         itemData.system.knockbackMultiplier = 0
//     }

//     // Double Knockback
//     let DOUBLEKB = power.querySelector('[XMLID="DOUBLEKB"]')
//     if (DOUBLEKB) {
//         itemData.system.knockbackMultiplier = 2
//     }

//     // Alternate Combat Value (uses OMCV against DCV)
//     let ACV = power.querySelector('[XMLID="ACV"]')
//     if (ACV) {
//         if (ACV.getAttribute('OPTION_ALIAS') === "uses OMCV against DCV") {
//             itemData.system.uses = 'omcv'
//             itemData.system.targets = 'dcv'
//         }
//         if (ACV.getAttribute('OPTION_ALIAS') === "uses OCV against DMCV") {
//             itemData.system.uses = 'ocv'
//             itemData.system.targets = 'dmcv'
//         }
//         if (ACV.getAttribute('OPTION_ALIAS') === "uses OMCV against DCV") {
//             itemData.system.uses = 'omcv'
//             itemData.system.targets = 'dcv'
//         }
//     }


//     if (power.querySelector('[XMLID="PLUSONEPIP"]')) {
//         itemData.system.extraDice = "pip"
//     }

//     if (power.querySelector('[XMLID="PLUSONEHALFDIE"]')) {
//         itemData.system.extraDice = "half"
//     }

//     if (power.querySelector('[XMLID="MINUSONEPIP"]')) {
//         // Typically only allowed for killing attacks.
//         // Appears that +1d6-1 is roughly equal to +1/2 d6
//         itemData.system.extraDice = "half"
//     }

//     const aoe = power.querySelector('[XMLID="AOE"]')
//     if (aoe) {
//         itemData.system.areaOfEffect = {
//             type: aoe.getAttribute('OPTION_ALIAS').toLowerCase(),
//             value: parseInt(aoe.getAttribute('LEVELS'))
//         }
//     }

//     if (xmlid === "HANDTOHANDATTACK") {
//         await HeroSystem6eItem.create(itemData, { parent: this.actor })
//         return
//     }

//     if (xmlid === "HKA") {
//         itemData.system.killing = true
//         await HeroSystem6eItem.create(itemData, { parent: this.actor })
//         return
//     }


//     if (xmlid === "TELEKINESIS") {
//         // levels is the equivalent strength
//         itemData.system.extraDice = "zero"
//         itemData.system.dice = Math.floor(levels / 5)
//         if (levels % 5 >= 3) itemData.system.extraDice = "half"
//         itemData.name += " (TK strike)"
//         itemData.system.usesStrength = false
//         await HeroSystem6eItem.create(itemData, { parent: this.actor })
//         return
//     }

//     if (xmlid === "ENERGYBLAST") {
//         itemData.system.usesStrength = false
//         await HeroSystem6eItem.create(itemData, { parent: this.actor })
//         return
//     }

//     if (xmlid === "RKA") {
//         itemData.system.killing = true
//         itemData.system.usesStrength = false
//         await HeroSystem6eItem.create(itemData, { parent: this.actor })
//         return
//     }


//     if (game.settings.get(game.system.id, 'alphaTesting')) {
//         ui.notifications.warn(`${xmlid} ATTACK not implemented during HDC upload of ${this.actor.name}`)
//     }
// }

export function SkillRollUpdateValue(item) {
    let skillData = item.system
    //if (skillData.state === 'everyman') {
    if (skillData.EVERYMAN) {
        skillData.roll = '8-'
        //} else if (skillData.state === 'familiar') {
    } else if (skillData.FAMILIARITY) {
        skillData.roll = '8-'
        //} else if (skillData.state === 'proficient') {
    } else if (skillData.PROFICIENCY) {
        skillData.roll = '10-'
        //} else if (skillData.state === 'trained') {
    } else if (skillData.CHARACTERISTIC || skillData.characteristic) {
        let characteristic = (skillData.CHARACTERISTIC || skillData.characteristic).toLowerCase()
        skillData.characteristic = characteristic
        const charValue = ((characteristic !== 'general') && (characteristic != '')) ?
            item.actor.system.characteristics[`${characteristic}`].value : 0

        let rollVal = 9 + Math.round(charValue / 5) + (parseInt(skillData.LEVELS?.value || skillData.LEVELS || skillData.levels) || 0)

        if (item.system.XMLID === "FINDWEAKNESS") {
            rollVal += 2; // 11-
        }
        skillData.roll = rollVal.toString() + '-'
    } else {
        // This is likely a Skill Enhancer.
        // Skill Enahncers provide a discount to the purchase of asssociated skills.
        // They no not change the roll.
        // Skip for now.
        // HEROSYS.log(false, (skillData.xmlid || item.name) + ' was not included in skills.  Likely Skill Enhancer')
        return
    }
}

export async function createEffects(itemData, actor) {

    const configPowerInfo = getPowerInfo({ xmlid: itemData.system.XMLID || itemData.system.rules, actor: actor || this?.actor })

    // Not every powers will have effects
    if (!configPowerInfo) return
    if (!configPowerInfo?.powerType) return

    const xmlid = configPowerInfo.xmlid
    const key = xmlid.toLowerCase()

    // Characteristics (via ActiveEffects)
    if (configPowerInfo?.powerType.includes("characteristic")) {

        let levels = itemData.system.LEVELS?.value
        // Add LEVELS to MAX
        let activeEffect =
        {
            name: `${key.toUpperCase()}+${levels}`,
            //id: newPower.system.rules,
            icon: 'icons/svg/upgrade.svg',
            changes: [
                {
                    key: "system.characteristics." + key + ".max",
                    value: parseInt(levels),
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD
                }
            ],
            flags: {
                XMLID: xmlid.toUpperCase() || itemData.system.XMLID
            },
            disabled: !itemData.system.AFFECTS_TOTAL,
            transfer: true,
        }
        if (activeEffect.name.toLowerCase().indexOf(itemData.name.toLowerCase()) == -1) {
            activeEffect.name = itemData.name + " " + activeEffect.name;
        }

        itemData.effects = [activeEffect]
        return
    }


    // Movement Powers
    if (configPowerInfo?.powerType.includes("movement")) {
        const key = itemData.system.XMLID.toLowerCase()
        let levels = itemData.system.LEVELS?.value

        let activeEffect =
        {
            name: `${key.toUpperCase()}+${levels}`,
            icon: 'icons/svg/upgrade.svg',
            changes: [
                {
                    key: `system.characteristics.${key}.max`,
                    value: parseInt(itemData.system.LEVELS?.value),
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD
                },
            ],
            transfer: true,
        }
        if (activeEffect.name.toLowerCase().indexOf(itemData.name.toLowerCase()) == -1) {
            activeEffect.name = itemData.name + " " + activeEffect.name;
        }

        itemData.effects = [activeEffect]
        return
    }


    if (xmlid === "DENSITYINCREASE") {
        const levels = parseInt(parseInt(itemData.system.LEVELS?.value))

        const strAdd = Math.floor(levels) * 5
        const pdAdd = Math.floor(levels)
        const edAdd = Math.floor(levels)

        let activeEffect =
        {
            name: itemData.name,
            icon: 'icons/svg/upgrade.svg',
            changes: [
                {
                    key: "system.characteristics.str.max",
                    value: strAdd,
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD
                },
                {
                    key: "system.characteristics.pd.max",
                    value: pdAdd,
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD
                },
                {
                    key: "system.characteristics.ed.max",
                    value: edAdd,
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD
                }
            ],
            transfer: true,
        }

        itemData.effects = [activeEffect]
        return
    }

}

export async function updateItemSubTypes(actor, removeDups) {

    // Update Item SubType
    for (const item of actor.items) {
        const configPowerInfo = getPowerInfo({ item: item })


        // Defenses
        if (configPowerInfo && configPowerInfo.powerType.includes("defense")) {
            await item.update({ 'system.subType': 'defense', 'system.showToggle': true }, { hideChatMessage: true })
        }

        // Is this a movement power?
        if (configPowerInfo && configPowerInfo.powerType.includes("movement")) {
            await item.update({ 'system.subType': 'movement', 'system.showToggle': true }, { hideChatMessage: true })
        }

        // Is this an attack power?
        if (configPowerInfo && configPowerInfo.powerType.includes("attack")) {
            if (item.system.subType != 'attack' || !item.system.dice) {
                await makeAttack(item)
                await item.update({ 'system.subType': 'attack', 'system.showToggle': true }, { hideChatMessage: true })
            }
        }

        // Remove duplicate attacks
        if (removeDups && item.type == 'attack') {
            const power = actor.items.find(o => o.name == item.name && o.system.subType == 'attack')
            if (power) {
                await item.delete()
            }
        }

        // Skill
        // if (item.type != "skill" && configPowerInfo && configPowerInfo.powerType.includes("skill")) {
        //     await item.update({ 'system.subType': 'skill'})
        // }

    }


}

export async function updateItem(item) {

    // Guards
    if (!item) return;


    let changed = false;

    // LEVELS are now a value/max to account for Aid/Drain
    if (item.system.LEVELS) {
        if (item.system.LEVELS.value == undefined) {
            let levels = item.system.LEVELS
            //delete item.system.LEVELS
            let _LEVELS = {
                value: levels,
                max: levels
            }
            changed = true;
            //await item.update({ 'system.LEVELS.value': levels, 'system.LEVELS.max': levels })
            await item.update({ 'system.LEVELS': null }, { hideChatMessage: true })
            let _item = await item.update({ ['system.LEVELS.value']: levels, ['system.LEVELS.max']: levels })
            //console.log(_item.system.LEVELS)
        }

        // Default values = max
        // if (item.system.LEVELS.value != item.system.LEVELS.max) {
        //     item.system.LEVELS.value = parseInt(item.system.LEVELS.max)
        //     changed = true
        // }

        // Look for active effects
        if (item.actor.effects) {


            for (const effect of item.actor.effects.filter(o => o.origin == item.actor.uuid && !o.disabled)) {
                for (const change of effect.changes) {
                    if (change.key == item.id) {
                        console.log(effect)
                        switch (change.mode) {
                            case CONST.ACTIVE_EFFECT_MODES.ADD:
                                const ActivePointsPerLevel = parseInt(item.system.activePoints) / parseFloat(item.system.LEVELS.value)
                                item.system.LEVELS.value += parseFloat(change.value / ActivePointsPerLevel) || 0
                                break;
                            default:
                            // HEROSYS.log(false, "unknown mode")
                        }
                    }
                }
            }
        }

        // Save effect changes

        if (item.system.LEVELS.value != item.system.LEVELS.max) {
            await item.update({ 'system.LEVELS.value': item.system.LEVELS.value }, { hideChatMessage: true })
            changed = true;
        }

        // Update dice on attack
        if (changed && (item.system.subType || item.type == 'attack')) {
            makeAttack(item)
        }
    }




    //let _basePointsPlusAdders = calcBasePointsPlusAdders.call(item, item.system)
    //let _activePoints = calcActivePoints(_basePointsPlusAdders, item.system)

    //_basePointsPlusAdders = RoundFavorPlayerDown(_basePointsPlusAdders)
    // let _realCost = calcRealCost(_activePoints, item.system)

    //_activePoints = RoundFavorPlayerDown(_activePoints)
    // _realCost = RoundFavorPlayerDown(_realCost)

    // if (item.system.basePointsPlusAdders != _basePointsPlusAdders && _basePointsPlusAdders) {
    //     await item.update({ 'system.basePointsPlusAdders': _basePointsPlusAdders })
    // }
    // if (item.system.activePoints != _activePoints)
    // {
    //     await item.update({'system.activePoints': _activePoints})
    // }
    // if (item.system.basePointsPlusAdders != _realCost)
    // {
    //     await item.update({'system.realCost': _realCost})
    // }

    const oldDesc = item.system.description;
    await updateItemDescription(item)
    if (item.system.description != oldDesc && item.id) {
        if (item.system.description.includes("undefined")) {
            if (game.settings.get(game.system.id, 'alphaTesting')) {
                ui.notifications.warn(`${item.actor.name} ${item.system.description}`)
            }
        } else {
            // if (!item.id) {
            //     if (game.settings.get(game.system.id, 'alphaTesting')) {
            //         ui.notifications.warn(`${item.actor.name} missing id`)
            //     }
            // } else {

            await item.update({ 'system.description': item.system.description }, { hideChatMessage: true })
            //}
        }
    }

}
