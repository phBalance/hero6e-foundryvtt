// eslint-disable-next-line no-undef
export class HeroSystem6eItemDirectory extends ItemDirectory {
    // static get defaultOptions() {
    //     return foundry.utils.mergeObject(super.defaultOptions, {
    //         template: "templates/sidebar/document-directory.hbs",
    //     });
    // }

    static entryPartial = `systems/hero6efoundryvttv2/templates/sidebar/partials/document-partial.hbs`;

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
        if (game.items.find((i) => i.system.ID === item.system.ID)) {
            console.log(
                `Ignoring _onDrop because ${item.name}/${item.id} already exists in this ItemDirectory`,
            );
            return;
        }

        // Check if this is a COMPOUNDPOWER
        if (!item.childItems) {
            super._onDrop(event);
        } else {
            const newItem = await this._handleDroppedEntry(null, data);
            console.log(newItem);
            //newItem.update([{ "system.ID": newParentId }]);

            for (const childItem of item.childItems) {
                const psudoData = {
                    type: data.type,
                    uuid: childItem.uuid,
                };

                const newItem = await this._handleDroppedEntry(null, psudoData);
                console.log(newItem);
            }
        }

        const newParentId = new Date().getTime().toString();

        // Update CHILDREN that we just added
        for (const newItem of game.items.filter(
            (i) => i.system.PARENTID === item.system.ID,
        )) {
            console.log(
                `Updating ${item.name} PARENTID ${newItem.system.ID} to ${newParentId}`,
            );
            await newItem.update({ "system.PARENTID": newParentId });
        }

        // Update PARENT that we just added
        await game.items
            .find((i) => i.system.ID === item.system.ID)
            ?.update({ "system.ID": newParentId });
    }

    async _render(...args) {
        await super._render(args);
    }
}
