import { HEROSYS } from "../herosystem6e.js";
import { getPowerInfo } from './util.js'

function determineDefense(targetActor, attackItem, options) {
    if (!attackItem.findModsByXmlid) {
        console.error("Invalid attackItem", attackItem)
    }
    const avad = attackItem.findModsByXmlid("AVAD")
    const attackType = avad ? "avad" : attackItem.system.class;
    const piericng = parseInt(attackItem.system.piercing) || attackItem.findModsByXmlid("ARMORPIERCING")
    const penetrating = parseInt(attackItem.system.penetrating) || attackItem.findModsByXmlid("PENETRATING")

    // The defenses that are active
    const activeDefenses = targetActor.items.filter(o => (o.system.subType === 'defense' || o.type === 'defense')
        && (o.system.active || o.effects.find(o => true)?.disabled === false)
        && !(options?.ignoreDefenseIds || []).includes(o.id)
    );



    let PD = parseInt(targetActor.system.characteristics.pd.value);
    let ED = parseInt(targetActor.system.characteristics.ed.value);
    let MD = 0;
    let POWD = 0;
    let rPOWD = 0;
    let rPD = 0; // resistant physical defense
    let rED = 0; // resistant energy defense
    let rMD = 0; // resistant mental defense (not sure rMD is a real thing)
    let DRP = 0; // damage reduction physical
    let DRE = 0; // damage reduction energy
    let DRM = 0; // damage reduction mental
    let DNP = 0; // damage negation physical
    let DNE = 0; // damage negation energy
    let DNM = 0; // damage negation mental
    let knockbackResistance = 0;

    // DAMAGERESISTANCE (converts PD to rPD)
    for (const item of activeDefenses.filter(o => o.system.XMLID == "DAMAGERESISTANCE")) {
        const pdLevels = Math.min(PD, parseInt(item.system.PDLEVELS) || 0)
        PD -= pdLevels
        rPD += pdLevels
        const edLevels = Math.min(PD, parseInt(item.system.EDLEVELS) || 0)
        ED -= edLevels
        rED += edLevels
        const mdLevels = Math.min(PD, parseInt(item.system.MDLEVELS) || 0)
        MD -= mdLevels
        rMD += mdLevels

        // TODO:
        // Characters can also purchase Damage Resistance
        // for Mental Defense, Flash Defense, Power
        // Defense, or similar Defense Powers to make them
        // Resistant.: 
    }

    // PD bought as resistant
    for (const item of activeDefenses.filter(o => o.system.XMLID == "PD")) {
        if (item.findModsByXmlid('RESISTANT')) {
            const levels = parseInt(item.system.LEVELS.value) || 0
            PD -= levels
            rPD += levels
        }

        if (item.system.ADD_MODIFIERS_TO_BASE) { //=== "Yes") {
            PD -= targetActor.system.characteristics.pd.core;
            rPD += targetActor.system.characteristics.pd.core;
        }
    }

    // ED bought as resistant
    for (const item of activeDefenses.filter(o => o.system.XMLID == "ED")) {
        if (item.findModsByXmlid('RESISTANT')) {
            const levels = parseInt(item.system.LEVELS.value) || 0
            ED -= levels
            rED += levels
        }

        if (item.system.ADD_MODIFIERS_TO_BASE === "Yes") {
            ED -= targetActor.system.characteristics.ed.core;
            rED += targetActor.system.characteristics.ed.core;
        }
    }


    // Armor Piericng of natural PD and ED
    if (piericng) {
        PD = Math.round(PD / 2)
        ED = Math.round(ED / 2)
    }

    // Impenetrable (defense vs penetrating)
    let impenetrableValue = 0;



    // tags (defenses) will be displayed on apply damage card
    let defenseTags = []

    switch (attackType) {
        case 'physical':
            if (PD > 0) defenseTags.push({ name: 'PD', value: PD, resistant: false, title: 'Natural PD' })
            if (rPD > 0) defenseTags.push({ name: 'rPD', value: rPD, resistant: true, title: 'resistant PD' })
            break;
        case 'energy':
            if (ED > 0) defenseTags.push({ name: 'ED', value: ED, resistant: false, title: 'Natural ED' })
            if (rED > 0) defenseTags.push({ name: 'rED', value: rED, resistant: true, title: 'resistant ED' })
            break;
        case 'mental':
            break;
    }


    //if ((targetActor.items.size || targetActor.items.length) > 0) {
    for (let i of activeDefenses) {

        const configPowerInfo = getPowerInfo({ item: i })
        // if (configPowerInfo && configPowerInfo.powerType.includes("defense")) {
        //     i.subType = 'defense'
        // }

        //if ((i.system.subType || i.type) === "defense" && i.system.active) {
        let value = parseInt(i.system.value) || 0;

        const xmlid = i.system.XMLID

        // Resistant Defenses
        if (["FORCEFIELD", "FORCEWALL", "ARMOR"].includes(xmlid)) {
            switch (attackType) {
                case 'physical':
                    value = parseInt(i.system.PDLEVELS) || 0
                    i.system.defenseType = "pd"
                    i.system.resistant = true
                    break;
                case 'energy':
                    value = parseInt(i.system.EDLEVELS) || 0
                    i.system.defenseType = "ed"
                    i.system.resistant = true
                    break;
                case 'mental':
                    i.system.defenseType = "md"
                    value = parseInt(i.system.MDLEVELS) || 0
                    i.system.resistant = true
                    break;
                case 'drain':
                case 'transfer':
                    i.system.defenseType = "powd"
                    value = parseInt(i.system.POWDLEVELS) || 0
                    i.system.resistant = true
                    break;
            }
        }

        if (!value && ["POWERDEFENSE"].includes(xmlid)) {
            switch (attackType) {
                case 'drain':
                case 'transfer':
                    i.system.defenseType = "powd"
                    value = parseInt(i.system.LEVELS?.value || i.system.LEVELS) || 0
                    break;
            }
        }


        if (!value && ["MENTALDEFENSE"].includes(xmlid)) {
            switch (attackType) {
                case 'mental':
                    i.system.defenseType = "md"
                    value = parseInt(i.system.LEVELS?.value || i.system.LEVELS) || 0
                    break;
            }
        }


        if (!value && ["DAMAGEREDUCTION"].includes(xmlid) && i.system.INPUT.toLowerCase() == attackType) {
            value = parseInt(i.system.OPTIONID.match(/\d+/)) || 0
            i.system.resistant = i.system.OPTIONID.match(/RESISTANT/) ? true : false
            switch (attackType) {
                case 'physical':
                    i.system.defenseType = "drp"
                    break;
                case 'energy':
                    i.system.defenseType = "dre"
                    break;
                case 'mental':
                    i.system.defenseType = "drm"
                    break;
            }
        }

        if (!value && ["DAMAGENEGATION"].includes(xmlid)) {
            switch (attackType) {
                case 'physical':
                    i.system.defenseType = "dnp"
                    value = parseInt(i.system.adders.find(o => o.XMLID == "PHYSICAL")?.LEVELS) || 0
                    break;
                case 'energy':
                    i.system.defenseType = "dne"
                    value = parseInt(i.system.adders.find(o => o.XMLID == "ENERGY")?.LEVELS) || 0
                    break;
                case 'mental':
                    i.system.defenseType = "dnm"
                    value = parseInt(i.system.adders.find(o => o.XMLID == "MENTAL")?.LEVELS) || 0
                    break;
            }
        }

        if (!value && ["COMBAT_LUCK"].includes(xmlid)) {
            switch (attackType) {
                case 'physical':
                    i.system.defenseType = "pd"
                    value = (parseInt(i.system.LEVELS.value) || 0) * 3
                    i.system.resistant = true
                    break;
                case 'energy':
                    i.system.defenseType = "ed"
                    value = (parseInt(i.system.LEVELS.value) || 0) * 3
                    i.system.resistant = true
                    break;
            }
        }

        let valueAp = value
        let valueImp = 0

        // Hardened
        let hardened = parseInt(i.system.hardened || i.findModsByXmlid("HARDENED")?.LEVELS || 0)


        // Armor Piercing
        if (piericng > hardened) {
            valueAp = Math.round(valueAp / 2)
        }

        // Impenetrable
        let impenetrable = parseInt(i.system.impenetrable || i.findModsByXmlid("IMPENETRABLE")?.LEVELS || 0)

        // Penetrating
        if (penetrating <= impenetrable) {
            valueImp = valueAp
        }


        switch ((i.system.resistant ? "r" : "") + i.system.defenseType) {
            case "pd": // Physical Defense
                PD += valueAp;
                if (attackType === 'physical' || attackType === 'avad') {
                    if (valueAp > 0) defenseTags.push({ name: 'PD', value: valueAp, resistant: false, title: i.name })
                    impenetrableValue += valueImp
                }
                break;
            case "ed": // Energy Defense
                ED += valueAp
                if (attackType === 'energy' || attackType === 'avad') {
                    if (valueAp > 0) defenseTags.push({ name: 'ED', value: valueAp, resistant: false, title: i.name })
                    impenetrableValue += valueImp
                }
                break;
            case "md": // Mental Defense
                MD += valueAp
                if (attackType === 'mental' || attackType === 'avad') {
                    if (valueAp > 0) defenseTags.push({ name: 'MD', value: valueAp, resistant: false, title: i.name })
                    impenetrableValue += valueImp
                }
                break;
            case "powd": // Power Defense
                POWD += valueAp
                if (["drain", "transfer"].includes(attackType) || attackType === 'avad') {
                    if (valueAp > 0) defenseTags.push({ name: 'POWD', value: valueAp, resistant: false, title: i.name })
                    impenetrableValue += valueImp
                }
                break;
            case "rpd": // Resistant PD
                rPD += valueAp
                if (attackType === 'physical' || attackType === 'avad') {
                    if (valueAp > 0) defenseTags.push({ name: 'rPD', value: valueAp, resistant: true, title: i.name })
                    impenetrableValue += valueImp
                }
                break;
            case "red": // Resistant ED
                rED += valueAp
                if (attackType === 'energy' || attackType === 'avad') {
                    if (valueAp > 0) defenseTags.push({ name: 'rED', value: valueAp, resistant: true, title: i.name })
                    impenetrableValue += valueImp
                }
                break;
            case "rmd": // Resistant MD
                rMD += valueAp
                if (attackType === 'mental' || attackType === 'avad') {
                    if (valueAp > 0) defenseTags.push({ name: 'rMD', value: valueAp, resistant: true, title: i.name })
                    impenetrableValue += valueImp
                }
                break;
            case "rpowd": // Resistant Power Defense
                rPOWD += valueAp
                if (["drain", "transfer"].includes(attackType) || attackType === 'avad') {
                    if (valueAp > 0) defenseTags.push({ name: 'rPOWD', value: valueAp, resistant: true, title: i.name })
                    impenetrableValue += valueImp
                }
                break;
            case "drp": // Damage Reduction Physical
            case "rdrp":
                if (value > 0) defenseTags.push({ name: 'drp', value: `${i.system.resistant ? "r" : ""}${value}%`, resistant: i.system.resistant, title: i.name })
                DRP = Math.max(DRP, value);
                break;
            case "dre": // Damage Reduction Energy
            case "rdre":
                if (value > 0) defenseTags.push({ name: 'dre', value: `${i.system.resistant ? "r" : ""}${value}%`, resistant: i.system.resistant, title: i.name })
                DRE = Math.max(DRE, value);
                break;
            case "drm": // Damage Reduction Mental
            case "rdrm":
                if (value > 0) defenseTags.push({ name: 'drm', value: `${i.system.resistant ? "r" : ""}${value}%`, resistant: i.system.resistant, title: i.name })
                DRM = Math.max(DRM, value);
                break;
            case "dnp": // Damage Negation Physical
                if (value > 0) defenseTags.push({ name: 'dnp', value: value, resistant: false, title: i.name })
                DNP += value
                break;
            case "dne": // Damage Negation Energy
                if (value > 0) defenseTags.push({ name: 'dne', value: value, resistant: false, title: i.name })
                DNE += value
                break;
            case "dnm": // Damage Negation Mental
                if (value > 0) defenseTags.push({ name: 'dnm', value: value, resistant: false, title: i.name })
                DNM += value
                break;
            case "kbr": // Knockback Resistance
                knockbackResistance += value;
                if (attackType != 'mental' && game.settings.get("hero6efoundryvttv2", "knockback")) {
                    defenseTags.push({ name: 'KB Resistance', value: value, title: i.name })
                }
                break;
            default:
                if (game.settings.get(game.system.id, 'alphaTesting')) {
                    //ui.notifications.warn(i.system.defenseType + " not yet supported!")
                    //HEROSYS.log(false, i.system.defenseType + " not yet supported!");
                }
                break;
        }
        //}
    }
    //}

    let defenseValue = 0;
    let resistantValue = 0;
    let damageReductionValue = 0;
    let damageNegationValue = 0;
    switch (attackType) {
        case 'physical':
            defenseValue = PD;
            resistantValue = rPD;
            impenetrableValue = Math.max(PD, rPD);
            damageReductionValue = DRP;
            damageNegationValue = DNP;
            break;
        case 'energy':
            defenseValue = ED;
            resistantValue = rED;
            impenetrableValue = Math.max(ED, rED);
            damageReductionValue = DRE;
            damageNegationValue = DNE;
            break;
        case 'mental':
            defenseValue = MD;
            resistantValue = rMD;
            impenetrableValue = Math.max(MD, rMD);
            damageReductionValue = DRM;
            damageNegationValue = DNM;
            break;

        case 'drain':
        case 'transfer':
            defenseValue = POWD;
            resistantValue = rPOWD;
            impenetrableValue = Math.max(POWD, rPOWD);
            damageReductionValue = DRM;
            damageNegationValue = DNM;
            break;
        case 'avad':
            defenseValue = PD + ED + MD + POWD;
            resistantValue = rPD + rED + rMD + rPOWD;
            impenetrableValue = Math.max(PD, rPD) + Math.max(ED, rED) + Math.max(MD, rMD) + Math.max(POWD, rPOWD);
            damageReductionValue = DRM;
            damageNegationValue = DNM;
    }

    return [defenseValue, resistantValue, impenetrableValue, damageReductionValue, damageNegationValue, knockbackResistance, defenseTags];
}

export { determineDefense };