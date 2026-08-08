import { HEROSYS } from "./herosystem6e.mjs";

const { Item, Macro } = foundry.documents;

const { CompendiumCollection } = foundry.documents.collections;

export async function CreateHeroCompendiums() {
    if (!game.user.isGM) return;

    try {
        await CreateHeroItems("five");
        await CreateHeroItems("six");
        await CreateHeroMacros();
    } catch (e) {
        console.error(e);
    }
}

async function createItem(itemDataArray, packId) {
    try {
        await Item.createDocuments(itemDataArray, {
            pack: packId,
        });
    } catch (e) {
        console.error(e);
    }
}

async function CreateHeroMacros() {
    const label = "HeroMacro";
    const metadata = { label: label, name: label.slugify({ strict: true }), type: "Macro" };

    // Delete compendium and re-create it.
    let pack = game.packs.get(`world.${metadata.name}`);
    if (pack) {
        await pack.configure({ locked: false });
        await pack.deleteCompendium();
    }
    pack = await CompendiumCollection.createCompendium(metadata);

    // V13 seems to default new compendiums to locked
    if (pack.locked) {
        await pack.configure({ locked: false });
    }

    const macroItemsArray = [];

    macroItemsArray.push({
        img: "icons/svg/regen.svg",
        name: "Full Health all owned tokens in scene",
        type: "script",
        command: `
        const confirmed = await foundry.applications.api.DialogV2.confirm({
  window: { title: "Full Health" },
  content: '<p>You are about to heal ' + game.scenes.current.tokens.filter(o=>o.isOwner).length + ' tokens in this scene. This is the same as clicking "Full Health" on each actor sheet. This includes setting all characteristics to max, removing status effects and removing temporary effects.  Do you want to continue?</p>',
});
if (confirmed) {
  for(const token of game.scenes.current.tokens.filter(o=>o.isOwner)) {
    console.log(token);
    token.actor?.fullHealth();
  }
}
        `,
        flags: {
            [`${game.system.id}.versionHeroSystem6eManuallyCreated`]: game.system.version,
        },
    });

    macroItemsArray.push({
        img: "icons/tools/scribal/magnifying-glass.webp",
        name: "Pan canvas to last Actor opened",
        type: "script",
        command: `const user_token = window.actor.getActiveTokens()[0];
if(user_token)
{
  canvas.animatePan({ x : user_token.x, y : user_token.y, scale:1});
  canvas.ping(user_token.center);
}
        `,
        flags: {
            [`${game.system.id}.versionHeroSystem6eManuallyCreated`]: game.system.version,
        },
    });

    await Macro.createDocuments(macroItemsArray, {
        pack: pack.metadata.id,
    });

    // Lock Compendium
    await pack.configure({ locked: true });
}

async function CreateHeroItems(edition) {
    // 5e vs 6e
    edition ??= game.settings.get(HEROSYS.module, "DefaultEdition");
    const powers = edition === "five" ? CONFIG.HERO.powers5e : CONFIG.HERO.powers6e;
    const bogusActor = {
        system: { is5e: edition === "five" ? true : false },
    };

    const label = `HeroItems ${edition === "five" ? "5e" : "6e"}`;
    const metadata = { label: label, name: label.slugify({ strict: true }), type: "Item" };

    // Delete legacy edition-less HeroItem compendium
    const legacyHeroItemPack = game.packs.get("world.heroitems");
    if (legacyHeroItemPack) {
        await legacyHeroItemPack.configure({ locked: false });
        await legacyHeroItemPack.deleteCompendium();
    }

    // Delete compendium and re-create it.
    let pack = game.packs.get(`world.${metadata.name}`);
    if (pack) {
        await pack.configure({ locked: false });
        await pack.deleteCompendium();
    }
    pack = await CompendiumCollection.createCompendium(metadata);

    if (pack.locked) {
        await pack.configure({ locked: false });
    }

    // PH: FIXME: Is there a way to simplify just create them all at once?
    async function createFolderGetId(name, color, parentFolderId) {
        const folder = await Folder.create(
            { name, type: "Item", color, folder: parentFolderId },
            {
                pack: pack.metadata.id,
            },
        );

        return folder.id;
    }

    // POWERS
    const folderPowersId = await createFolderGetId("Powers", CONFIG.HERO.folderColors["Powers"]);

    // Characteristics folder within powers
    const folderPowersCharacteristicsId = await createFolderGetId(
        "Characteristics",
        CONFIG.HERO.folderColors["Powers.Characteristics"],
        folderPowersId,
    );

    // Perks folder within powers
    const folderPowersPerksId = await createFolderGetId(
        "Perks",
        CONFIG.HERO.folderColors["Powers.Perks"],
        folderPowersId,
    );

    // Skills folder within powers
    const folderPowersSkillsId = await createFolderGetId(
        "Skills",
        CONFIG.HERO.folderColors["Powers.Skill"],
        folderPowersId,
    );

    // Talent folder within powers
    const folderPowersTalentsId = await createFolderGetId(
        "Talents",
        CONFIG.HERO.folderColors["Powers.Talents"],
        folderPowersId,
    );

    const itemDataArray = [];

    for (const power of powers.filter(
        (power) =>
            power.type != undefined &&
            !power.type.includes("martial") &&
            !power.type.includes("enhancer") &&
            !power.type.includes("disadvantage") &&
            !power.behaviors.includes("modifier") &&
            !power.behaviors.includes("adder") &&
            power.xml &&
            !power.key.startsWith("__"),
    )) {
        const itemData = HeroSystem6eItem.itemDataFromXml(power.xml, bogusActor);
        itemData.system.versionHeroSystem6eManuallyCreated = game.system.version;
        //console.log(power, itemData, bogusActor);
        if (power.type.includes("characteristic")) {
            itemData.folder = folderPowersCharacteristicsId;
        } else if (power.type.includes("perk")) {
            itemData.folder = folderPowersPerksId;
        } else if (power.type.includes("skill")) {
            itemData.folder = folderPowersSkillsId;
        } else if (power.type.includes("talent")) {
            itemData.folder = folderPowersTalentsId;
        } else if (itemData.system.XMLID !== "LIST") {
            // LIST will not be in a folder (to match SEPARATOR below)
            itemData.folder = folderPowersId;
        }

        itemDataArray.push(itemData);
    }

    // SEPARATOR is a LIST with no name
    const seperatorItemData = HeroSystem6eItem.itemDataFromXml(
        powers.find((power) => power.key === "LIST")?.xml,
        bogusActor,
    );
    if (seperatorItemData.name) {
        seperatorItemData.name = "Separator";
        seperatorItemData.system.ALIAS = "";
        seperatorItemData.system.NAME = "";
        itemDataArray.push(seperatorItemData);
    } else {
        console.error(`Failed to create separator item`);
    }

    //////////////////////////////////////////////////////////////////////////////
    // PERKS
    const folderPerksId = await createFolderGetId("Perks", CONFIG.HERO.folderColors["Perks"]);

    for (const power of powers.filter((power) => power.type?.includes("perk") && power.xml)) {
        // Only include powers where XML is defined
        const itemData = HeroSystem6eItem.itemDataFromXml(power.xml, bogusActor);
        itemData.system.versionHeroSystem6eManuallyCreated = game.system.version;
        itemData.folder = folderPerksId;
        itemDataArray.push(itemData);
    }

    //////////////////////////////////////////////////////////////////////////////
    // SKILLS
    const folderSkillsId = await createFolderGetId("Skills", CONFIG.HERO.folderColors["Skills"]);

    for (const power of powers.filter((power) => power.type?.includes("skill") && power.xml)) {
        // Only include powers where XML is defined
        const itemData = HeroSystem6eItem.itemDataFromXml(power.xml, bogusActor);
        itemData.system.versionHeroSystem6eManuallyCreated = game.system.version;
        itemData.folder = folderSkillsId;
        itemDataArray.push(itemData);
    }

    //////////////////////////////////////////////////////////////////////////////
    // TALENTS
    const folderTalentsId = await createFolderGetId("Talents", CONFIG.HERO.folderColors["Talents"]);

    for (const power of powers.filter((power) => power.type?.includes("talent") && power.xml)) {
        // Only include powers where XML is defined
        const itemData = HeroSystem6eItem.itemDataFromXml(power.xml, bogusActor);
        itemData.system.versionHeroSystem6eManuallyCreated = game.system.version;
        itemData.folder = folderTalentsId;
        itemData.folder = folderTalent[0].id;
        itemDataArray.push(itemData);
    }

    // Compendium should be unlocked, but for some reason it may not be
    if (pack.locked) {
        console.error(`${pack.name} compendium was unexpectedly locked`);
        await pack.configure({ locked: false });
    }

    // Create the array of items in the compendium
    try {
        await createItem(itemDataArray, pack.metadata.id);
    } catch (e) {
        console.error(e);
    }

    // Lock Compendium
    await pack.configure({ locked: true });
}
