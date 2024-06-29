// eslint-disable-next-line no-undef
export class HeroSystem6eCompendium extends Compendium {
    //static entryPartial = `systems/hero6efoundryvttv2/templates/sidebar/partials/compendium-index-partial.hbs`;

    async _onDrop(event) {
        const data = TextEditor.getDragEventData(event);
        if (!data.type) return;
        if (!data.type === "item") return;
        const item = fromUuidSync(data.uuid);

        // Ignore drop if item already exists (dragging to ourselves)
        if (this.collection.index.has(document.id) === item.id) {
            console.log(`Ignoring _onDrop because ${item.name}/${item.id} already exists in this ItemDirectory`);
            return;
        }
        // if (this.collection.index.has(document.id) === item.system.ID)) {
        //     console.log(
        //         `Ignoring _onDrop because ${item.name}/${item.id} already exists in this ItemDirectory`,
        //     );
        //     return;
        // }

        // Do super if there is no parent.
        if (!item.childItems) {
            return super._onDrop(event);
        }

        // Not sure why compendium- is sometimes there, unable to create a folder/item with it, so getting rid of it.
        const packId = this.id.replace(/^compendium-/, "");

        // Create new folder
        const folder = await Folder.create({ type: "Item", name: item.name }, { pack: packId });

        // Add parent to folder
        await HeroSystem6eItem.create(
            {
                ...item.toObject(),
                folder: folder.id,
            },
            { pack: packId },
        );

        // Add children to folder
        for (const childItem of item.childItems) {
            await HeroSystem6eItem.create(
                {
                    ...childItem.toObject(),
                    folder: folder.id,
                },
                { pack: packId },
            );
        }
    }
}
