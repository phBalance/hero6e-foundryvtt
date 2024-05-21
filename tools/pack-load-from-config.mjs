// Rebuild 6e Compendium Macro

const myPack = game.packs.get("hero6efoundryvttv2packs.hero6ePowers");
await myPack.getIndex();

// Delete items
const itemIds = [];
for (const item of myPack.index) {
    itemIds.push(item._id);
}
await Item.deleteDocuments(itemIds, {
    pack: "hero6efoundryvttv2packs.hero6ePowers",
});

// Delete folders
while (myPack.folders.size > 0) {
    for (const folder of myPack.folders) {
        //console.log(folder);

        // Make sure there are no children
        if (folder.children.length === 0) {
            await Folder.deleteDocuments([folder._id], {
                pack: "hero6efoundryvttv2packs.hero6ePowers",
            });
        }
    }
}

// 6e POWERS
const folder6e = await Folder.createDocuments(
    [{ name: "Powers", type: "Item", color: "#ff0000" }],
    {
        pack: "hero6efoundryvttv2packs.hero6ePowers",
    },
);
console.log(folder6e);

const bogus6eActor = { system: { is5e: false } };

for (const power of CONFIG.HERO.powers6e.filter(
    (o) =>
        o.type != undefined &&
        !o.type.includes("martial") &&
        !o.type.includes("framework") &&
        !o.type.includes("enhancer") &&
        !o.behaviors.includes("modifier") &&
        !o.behaviors.includes("adder") &&
        o.xml,
)) {
    // Only include powers where XML is defined
    if (power.xml) {
        console.log(power);

        // Get itemData frorm power configuration
        let itemData = HeroSystem6eItem.itemDataFromXml(
            power.xml,
            bogus6eActor,
        );

        if (!itemData.system) {
            console.warn("missing system", itemData, power);
            continue;
        }
        // Track when added manually for diagnostic purposes
        itemData.system.versionHeroSystem6eManuallyCreated =
            game.system.version;

        // Stick this item in the Powers folder
        itemData.folder = folder6e[0].id;

        const item = await Item.createDocuments([itemData], {
            pack: "hero6efoundryvttv2packs.hero6ePowers",
        });

        console.log(item[0]);
        await item[0]._postUpload();

        if (!item[0].system?.XMLID) {
            console.log(power.xml, itemData);
            break;
        }
        //break;
    }
}
