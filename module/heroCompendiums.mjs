import { HEROSYS } from "./herosystem6e.mjs";

export async function CreateHeroCompendiums() {
    if (!game.user.isGM) return;
    console.log("createHeroCompendiums");
    try {
        CreateHeroItems();
    } catch (e) {
        console.error(e);
    }
}

async function createItem(itemDataArray, packId) {
    try {
        const item = await Item.createDocuments(itemDataArray, {
            pack: packId,
        });

        await item[0]._postUpload();
    } catch (e) {
        console.error(e);
    }
}

async function CreateHeroItems() {
    const label = "HeroSystem";
    const metadata = { label: label, name: label.slugify({ strict: true }), type: "Item" };

    // Delete compendium and re-create it.
    let pack = game.packs.get(`world.${metadata.name}`);
    if (pack) {
        await pack.configure({ locked: false });
        await pack.deleteCompendium();
    }
    // eslint-disable-next-line no-undef
    pack = await CompendiumCollection.createCompendium(metadata);

    // 5e vs 6e
    const DefaultEdition = game.settings.get(HEROSYS.module, "DefaultEdition");
    const powers = DefaultEdition === "five" ? CONFIG.HERO.powers5e : CONFIG.HERO.powers6e;
    const bogusActor = {
        system: { is5e: DefaultEdition === "five" ? true : false },
    };

    // POWERS
    const folderPower = await Folder.createDocuments([{ name: "Power", type: "Item", color: "#ff0000" }], {
        pack: pack.metadata.id,
    });

    const folderPowerCharacteristic = await Folder.createDocuments(
        [
            {
                name: "Characteristic",
                type: "Item",
                color: "#ff6666",
                folder: folderPower[0].id,
            },
        ],
        {
            pack: pack.metadata.id,
        },
    );

    const folderPowerPerk = await Folder.createDocuments(
        [
            {
                name: "Perk",
                type: "Item",
                color: "#ff6666",
                folder: folderPower[0].id,
            },
        ],
        {
            pack: pack.metadata.id,
        },
    );

    const folderPowerSkill = await Folder.createDocuments(
        [
            {
                name: "Skill",
                type: "Item",
                color: "#ff6666",
                folder: folderPower[0].id,
            },
        ],
        {
            pack: pack.metadata.id,
        },
    );

    const folderPowerTalent = await Folder.createDocuments(
        [
            {
                name: "Talent",
                type: "Item",
                color: "#ff6666",
                folder: folderPower[0].id,
            },
        ],
        {
            pack: pack.metadata.id,
        },
    );

    const itemDataArray = [];

    for (const power of powers.filter(
        (o) =>
            o.type != undefined &&
            !o.type.includes("martial") &&
            !o.type.includes("framework") &&
            !o.type.includes("enhancer") &&
            !o.type.includes("disadvantage") &&
            !o.behaviors.includes("modifier") &&
            !o.behaviors.includes("adder") &&
            o.xml,
    )) {
        const itemData = HeroSystem6eItem.itemDataFromXml(power.xml, bogusActor);
        itemData.system.versionHeroSystem6eManuallyCreated = game.system.version;
        console.log(power, itemData, bogusActor);
        if (power.type.includes("characteristic")) {
            itemData.folder = folderPowerCharacteristic[0].id;
        } else if (power.type.includes("perk")) {
            itemData.folder = folderPowerPerk[0].id;
        } else if (power.type.includes("skill")) {
            itemData.folder = folderPowerSkill[0].id;
        } else if (power.type.includes("talent")) {
            itemData.folder = folderPowerTalent[0].id;
        } else {
            itemData.folder = folderPower[0].id;
        }
        itemDataArray.push(itemData);
    }

    //////////////////////////////////////////////////////////////////////////////
    // PERKS
    const folderPerk = await Folder.createDocuments([{ name: "Perk", type: "Item", color: "#0000aa" }], {
        pack: pack.metadata.id,
    });

    for (const power of powers.filter((o) => o.type.includes("perk") && o.xml)) {
        // Only include powers where XML is defined
        const itemData = HeroSystem6eItem.itemDataFromXml(power.xml, bogusActor);
        itemData.folder = folderPerk[0].id;
        itemDataArray.push(itemData);
    }

    //////////////////////////////////////////////////////////////////////////////
    // SKILLS
    const folderSkill = await Folder.createDocuments([{ name: "Skill", type: "Item", color: "#00aa00" }], {
        pack: pack.metadata.id,
    });

    for (const power of powers.filter((o) => o.type.includes("skill") && o.xml)) {
        // Only include powers where XML is defined
        const itemData = HeroSystem6eItem.itemDataFromXml(power.xml, bogusActor);
        itemData.folder = folderSkill[0].id;
        itemDataArray.push(itemData);
    }

    //////////////////////////////////////////////////////////////////////////////
    // TALENT
    const folderTalent = await Folder.createDocuments([{ name: "Talent", type: "Item", color: "#00aaaa" }], {
        pack: pack.metadata.id,
    });

    for (const power of powers.filter((o) => o.type.includes("talent") && o.xml)) {
        // Only include powers where XML is defined
        const itemData = HeroSystem6eItem.itemDataFromXml(power.xml, bogusActor);
        itemData.folder = folderTalent[0].id;
        itemDataArray.push(itemData);
    }

    // Create the array of items in the compendium
    await createItem(itemDataArray, pack.metadata.id);

    // Lock Compendium
    await pack.configure({ locked: true });
}
