// eslint-disable-next-line no-undef
export class HeroSystem6eItemDirectory extends ItemDirectory {
    // static get defaultOptions() {
    //     return foundry.utils.mergeObject(super.defaultOptions, {
    //         template: "templates/sidebar/document-directory.hbs",
    //     });
    // }

    //static entryPartial = `systems/hero6efoundryvttv2/templates/sidebar/partials/document-partial.hbs`;

    // constructor(...args) {
    //     super(...args);
    //     //debugger;
    //     // template: "templates/sidebar/sidebar.html"
    //     // template: "templates/sidebar/document-directory.html"
    // }

    async _onDrop(event) {
        const data = TextEditor.getDragEventData(event);
        if (!data.type) return;
        if (!data.type === "item") return;
        const item = fromUuidSync(data.uuid);

        // Ignore drop if item already exists (dragging to ourselves)
        if (game.items.find((i) => i.id === item.id)) {
            console.log(`Ignoring _onDrop because ${item.name}/${item.id} already exists in this ItemDirectory`);
            return;
        }

        // Do super if there is no parent.
        if (!item.childItems) {
            return super._onDrop(event);
        }

        // Create new folder
        const folder = await Folder.create({ type: "Item", name: item.name });

        // Add parent to folder
        await HeroSystem6eItem.create({
            ...item.toObject(),
            folder: folder.id,
        });

        // Add children to folder
        for (const childItem of item.childItems) {
            await HeroSystem6eItem.create({
                ...childItem.toObject(),
                folder: folder.id,
            });
        }

        // const newItem = await this._handleDroppedEntry(null, data);
        // console.log(newItem);
        // //newItem.update([{ "system.ID": newParentId }]);

        // for (const childItem of item.childItems) {
        //     const psudoData = {
        //         type: data.type,
        //         uuid: childItem.uuid,
        //     };

        //     const newItem = await this._handleDroppedEntry(null, psudoData);
        //     console.log(newItem);
        // }

        // const newParentId = new Date().getTime().toString();

        // // Update CHILDREN that we just added
        // for (const newItem of game.items.filter(
        //     (i) => i.system.PARENTID === item.system.ID,
        // )) {
        //     console.log(
        //         `Updating ${item.name} PARENTID ${newItem.system.ID} to ${newParentId}`,
        //     );
        //     await newItem.update({ "system.PARENTID": newParentId });
        // }

        // // Update PARENT that we just added
        // await game.items
        //     .find((i) => i.system.ID === item.system.ID)
        //     ?.update({ "system.ID": newParentId });
    }

    _getEntryContextOptions() {
        const options = super._getEntryContextOptions();
        const idxDelete = options.findIndex((o) => o.name === "SIDEBAR.Delete");
        if (idxDelete) {
            const deleteAll = {
                name: "FOLDER.Delete",
                icon: '<i class="fas fa-dumpster"></i>',
                condition: (header) => {
                    const li = header.closest(".directory-item");
                    const entry = this.collection.get(li.data("entryId"));
                    return game.user.isGM && entry.childItems;
                },

                callback: (header) => {
                    const li = header.closest(".directory-item");
                    const entry = this.collection.get(li.data("entryId"));
                    if (!entry) return;
                    const type = game.i18n.localize(entry.constructor.metadata.label);
                    return Dialog.confirm({
                        title: `${game.i18n.format("FOLDER.Delete", {
                            type,
                        })}: ${entry.name}`,
                        content: `<h4 data-entry-id="${entry.id}">${game.i18n.localize(
                            "AreYouSure",
                        )}</h4><p>${game.i18n.format("FOLDER.DeleteWarning", {
                            type,
                        })}</p>`,
                        yes: (header) => {
                            const entryID = header.find("[data-entry-id]").data("entryId");
                            const entry = this.collection.get(entryID);
                            if (!entry) return;
                            for (const child of entry.childItems) {
                                child.delete();
                            }
                            entry.delete();
                        },
                        options: {
                            top: Math.min(li[0].offsetTop, window.innerHeight - 350),
                            left: window.innerWidth - 720,
                        },
                    });
                },
            };
            options.splice(idxDelete + 1, 0, deleteAll);
        }
        return options;
    }
}
