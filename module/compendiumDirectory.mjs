import { HeroSystem6eActor } from "./actor/actor.mjs";
import { HeroSystem6eItem } from "./item/item.mjs";
import { getPowerInfo } from "./utility/util.mjs";

// v13 has namespaced this. Remove when support is no longer provided. Also remove from eslint template.
const FoundryVttCompendiumDirectory = foundry.applications?.sidebar?.tabs?.CompendiumDirectory || CompendiumDirectory;
const foundryVttRenderTemplate = foundry.applications?.handlebars?.renderTemplate || renderTemplate;

export class HeroSystem6eCompendiumDirectory extends FoundryVttCompendiumDirectory {
    constructor(...args) {
        super(...args);
    }

    async _onCreateEntry(event, target) {
        try {
            event.preventDefault();
            event.stopPropagation();
            //const li = event.currentTarget.closest(".directory-item");
            //const targetFolderId = li ? li.dataset.folderId : null;
            target = target || event.target;
            const { folderId } = target.closest(".directory-item")?.dataset ?? {};

            const types = CONST.COMPENDIUM_DOCUMENT_TYPES.map((documentName) => {
                return {
                    value: documentName,
                    label: game.i18n.localize(getDocumentClass(documentName).metadata.label),
                };
            });
            game.i18n.sortObjects(types, "label");
            const folders = game.packs._formatFolderSelectOptions();

            let html = await foundryVttRenderTemplate(
                `templates/sidebar/compendium-create.${game.version.split(".")[0] === "12" ? "html" : "hbs"}`,
                {
                    types,
                    folders,
                    folder: folderId,
                    hasFolders: folders.length,
                },
            );
            html = html.replace(
                "Document.</p>",
                `Document.</p><label>Hero Designer Prefab</label><input name="upload" class="upload" type="file" accept=".hdp"></input>`,
            );

            if (game.version.split(".")[0] !== "12") {
                const { DialogV2 } = foundry.applications.api;

                // DialogV2RenderCallback
                function handleRender(event, dialog) {
                    const inputUpload = dialog.element.querySelector("input.upload");
                    inputUpload.addEventListener("change", (event) => {
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

                const content = document.createElement("div");
                content.innerHTML = html;
                const metadata = await DialogV2.prompt({
                    content: game.version.split(".")[0] === "12" ? html : content,
                    id: "create-compendium",
                    window: { title: "COMPENDIUM.Create" },
                    position: { width: 480 },
                    ok: {
                        label: "COMPENDIUM.Create",
                        callback: (_event, button) => new foundry.applications.ux.FormDataExtended(button.form).object,
                    },
                    render: handleRender,
                });
                if (!metadata) return;
                if (metadata.upload) return;
                const targetFolderId = metadata.folder;
                delete metadata.folder;
                if (!metadata.label) {
                    const count = game.packs.size;
                    metadata.label = game.i18n.format(count ? "DOCUMENT.NewCount" : "DOCUMENT.New", {
                        count: count + 1,
                        type: game.i18n.localize("PACKAGE.TagCompendium"),
                    });
                }
                const pack = await CompendiumCollection.createCompendium(metadata);
                if (targetFolderId) await pack.setFolder(targetFolderId);
            } else {
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
                                const fd = new foundry.applications.ux.FormDataExtended(form);
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
                                const pack = await CompendiumCollection.createCompendium(metadata);
                                if (targetFolderId) await pack.setFolder(targetFolderId);
                            },
                        },
                    },
                    render: handleRender,
                    rejectClose: false,
                    options: { jQuery: false },
                }).render(true);
            }
        } catch (e) {
            console.error(e);
            super._onCreateEntry(event, target);
        }
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
                [`${game.system.id}.versionHeroSystem6eCreated`]: game.system.version,
            },
        };

        // Create Compendium
        const pack = await CompendiumCollection.createCompendium(metadata);

        if (targetFolderId) await pack.setFolder(targetFolderId);

        ui.notifications.info(`Creating compendium ${pack.metadata.label} from Hero Designer Prefab file.`);

        const folders = [];

        try {
            const template = heroJson.PREFAB?.TEMPLATE;
            const is5e = !template?.includes("6");

            let errorCount = 0;
            for (const itemTag of HeroSystem6eItem.ItemXmlTags) {
                if (heroJson.PREFAB?.[itemTag]) {
                    for (const system of heroJson.PREFAB[itemTag]) {
                        try {
                            // Create new folder
                            if (!folders[itemTag]) {
                                const name = itemTag.titleCase();
                                folders[itemTag] = await Folder.create(
                                    {
                                        type: "Item",
                                        name: name,
                                        color: CONFIG.HERO.folderColors[name],
                                    },
                                    { pack: pack.metadata.id },
                                );
                            }

                            const itemData = {
                                name: system.NAME || system?.ALIAS || system?.XMLID || itemTag,
                                type: itemTag.toLowerCase().replace(/s$/, ""),
                                system: { ...system, is5e, template },
                                folder: folders[itemTag].id,
                            };

                            const power = getPowerInfo({
                                xmlid: system.XMLID,
                                is5e: itemData.system.is5e,
                            });

                            // If a framework then make a new subfolder for it, in the proper folder structure
                            if (power.type.includes("framework") || power.type.includes("compound")) {
                                const parentFolder =
                                    pack.contents.find((o) => o.system.ID === system.PARENTID)?.folder ||
                                    folders[itemTag];
                                const subFolder = await Folder.create(
                                    { type: "Item", name: itemData.name, folder: parentFolder },
                                    { pack: pack.metadata.id },
                                );
                                itemData.folder = subFolder.id;
                            }
                            // Check if a child
                            else if (system.PARENTID) {
                                const parentFolder = pack.contents.find((o) => o.system.ID === system.PARENTID)?.folder;
                                itemData.folder = parentFolder.id;
                            }

                            const item = await HeroSystem6eItem.create(itemData, {
                                pack: pack.metadata.id,
                            });

                            // COMPOUNDPOWER is similar to a MULTIPOWER.
                            // MULTIPOWER uses PARENTID references.
                            // COMPOUNDPOWER is structured as children.  Which we add PARENTID to, so it looks like a MULTIPOWER.
                            if (system.XMLID === "COMPOUNDPOWER") {
                                const compoundItems = [];
                                for (const value of Object.values(system)) {
                                    // We only care about arrays and objects (array of 1)
                                    if (typeof value === "object") {
                                        const values = value.length ? value : [value];
                                        for (const system2 of values) {
                                            if (system2.XMLID) {
                                                const power = getPowerInfo({
                                                    xmlid: system2.XMLID,
                                                    is5e,
                                                });
                                                if (!power) {
                                                    await ui.notifications.error(
                                                        `${this.name}/${item.name}/${system2.XMLID} failed to parse. It will not be available to this actor.  Please report.`,
                                                        {
                                                            console: true,
                                                            permanent: true,
                                                        },
                                                    );
                                                    continue;
                                                }
                                                system2.is5e = is5e;
                                                system2.template = template;
                                                compoundItems.push(system2);
                                            }
                                        }
                                    }
                                }
                                compoundItems.sort((a, b) => parseInt(a.POSITION) - parseInt(b.POSITION));
                                for (const system2 of compoundItems) {
                                    const power = getPowerInfo({
                                        xmlid: system2.XMLID,
                                        is5e,
                                    });
                                    let itemData2 = {
                                        name: system2.NAME || system2.ALIAS || system2.XMLID,
                                        type: power.type.includes("skill") ? "skill" : "power",
                                        system: {
                                            ...system2,
                                            PARENTID: system.ID,
                                            POSITION: parseInt(system2.POSITION),
                                        },
                                    };

                                    // Put in proper folder
                                    const parentFolder = pack.contents.find((o) => o.system.ID === system.ID)?.folder;
                                    itemData2.folder = parentFolder?.id;

                                    await HeroSystem6eItem.create(itemData2, { pack: pack.metadata.id });
                                }
                            }
                        } catch (e) {
                            console.error(e);
                            if (errorCount === 0) {
                                ui.notifications.error(
                                    `One or more items in compendium <b>${pack.metadata.label}</b> failed to upload. See error log for details.`,
                                );
                            }
                            errorCount++;
                        }
                    }
                }
            }

            ui.notifications.info(`Compendium ${pack.metadata.label} finished upload.`);
            pack.render(true);
        } catch (e) {
            console.log(e);
            ui.notifications.error(`Compendium <b>${pack.metadata.label}</b> failed to upload.`);
        }
    }
}
