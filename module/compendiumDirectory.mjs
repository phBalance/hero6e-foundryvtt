import { HeroSystem6eActor } from "./actor/actor.mjs";
import { HeroSystem6eItem } from "./item/item.mjs";

// eslint-disable-next-line no-undef
export class HeroSystem6eCompendiumDirectory extends CompendiumDirectory {
    constructor(...args) {
        super(...args);
    }

    async _onCreateEntry(event) {
        event.preventDefault();
        event.stopPropagation();
        const li = event.currentTarget.closest(".directory-item");
        const targetFolderId = li ? li.dataset.folderId : null;
        const types = CONST.COMPENDIUM_DOCUMENT_TYPES.map((documentName) => {
            return {
                value: documentName,
                label: game.i18n.localize(getDocumentClass(documentName).metadata.label),
            };
        });
        game.i18n.sortObjects(types, "label");
        const folders = this.collection._formatFolderSelectOptions();
        let html = await renderTemplate("templates/sidebar/compendium-create.html", {
            types,
            folders,
            folder: targetFolderId,
            hasFolders: folders.length >= 1,
        });
        html = html.replace(
            "Document.</p>",
            `Document.</p><label>Hero Designer Prefab</label><input name="upload" class="upload" type="file" accept=".hdp"></input>`,
        );

        function handleRender(html) {
            html.on("change", "input.upload", (event) => {
                console.log(event, event.target.files[0]);
                const reader = new FileReader();
                reader.onload = async function (event) {
                    const contents = event.target.result;

                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(contents, "text/xml");
                    // TODO create the Item compendium
                    HeroSystem6eCompendiumDirectory.uploadFromXml(xmlDoc);
                }.bind(this);
                reader.readAsText(event.target.files[0]);

                // Close Create Compendium message box
                $(event.currentTarget).closest(".window-content").find("button").click();
            });
        }

        return new Dialog({
            title: game.i18n.localize("COMPENDIUM.Create"),
            content: html,
            //label: game.i18n.localize("COMPENDIUM.Create"),
            buttons: {
                create: {
                    label: game.i18n.localize("COMPENDIUM.Create"),
                    callback: async (html) => {
                        const form = html.find("#compendium-create")[0];
                        const fd = new FormDataExtended(form);
                        const metadata = fd.object;

                        if (metadata.upload) {
                            return; // We handle this in the onchage event above because browser security use fakepath
                        }

                        let targetFolderId = metadata.folder;
                        if (metadata.folder) delete metadata.folder;
                        if (!metadata.label) {
                            let defaultName = game.i18n.format("DOCUMENT.New", {
                                type: game.i18n.localize("PACKAGE.TagCompendium"),
                            });
                            const count = game.packs.size;
                            if (count > 0) defaultName += ` (${count + 1})`;
                            metadata.label = defaultName;
                        }
                        const pack =
                            // eslint-disable-next-line no-undef
                            await CompendiumCollection.createCompendium(metadata);
                        if (targetFolderId) await pack.setFolder(targetFolderId);
                    },
                },
            },
            render: handleRender,
            rejectClose: false,
            options: { jQuery: false },
        }).render(true);
    }

    static async uploadFromXml(xml, targetFolderId) {
        // Convert xml string to xml document (if necessary)
        if (typeof xml === "string") {
            const parser = new DOMParser();
            xml = parser.parseFromString(xml.trim(), "text/xml");
        }

        // Convert XML into JSON
        const heroJson = {};
        HeroSystem6eActor._xmlToJsonNode(heroJson, xml.children);

        // Character name is what's in the sheet or, if missing, what is already in the actor sheet.
        const characterName = heroJson.PREFAB?.CHARACTER_INFO.CHARACTER_NAME.trim();

        if (!characterName || characterName.length === 0) {
            console.error("Missing CHARACTER_NAME ", xml);
            return;
        }

        const metadata = {
            label: characterName,
            type: "Item",
            flags: {
                versionHeroSystem6eCreated: game.system.version,
            },
        };

        // Create Compendium
        // eslint-disable-next-line no-undef
        const pack = await CompendiumCollection.createCompendium(metadata);

        if (targetFolderId) await pack.setFolder(targetFolderId);

        ui.notifications.info(
            `Creating compendium ${pack.metadata.label} from Hero Designer Prefab file.`,
        );

        const folders = [];

        try {
            for (const itemTag of HeroSystem6eItem.ItemXmlTags) {
                if (heroJson.PREFAB?.[itemTag]) {
                    for (const system of heroJson.PREFAB[itemTag]) {
                        // Create new folder
                        if (!folders[itemTag]) {
                            folders[itemTag] = await Folder.create(
                                { type: "Item", name: itemTag },
                                { pack: pack.metadata.id },
                            );
                        }

                        const itemData = {
                            name: system.NAME || system?.ALIAS || system?.XMLID || itemTag,
                            type: itemTag.toLowerCase().replace(/s$/, ""),
                            system: system,
                            folder: folders[itemTag].id,
                        };
                        console.log(itemData);
                        const item = await HeroSystem6eItem.create(itemData, {
                            pack: pack.metadata.id,
                        });

                        await item._postUpload(); // we can probably skip the await here for a possible performance increase
                    }
                }
            }
            ui.notifications.info(
                `Compendium ${pack.metadata.label} finished upload.`,
            );
        } catch (e) {
            console.log(e);
            ui.notifications.error(
                `Compendium ${pack.metadata.label} failed to upload.`,
            );
        }
    }
}
