// eslint-disable-next-line no-undef
export class HeroSystem6eItemDirectory extends ItemDirectory {
    // static get defaultOptions() {
    //     return foundry.utils.mergeObject(super.defaultOptions, {
    //         template: "templates/sidebar/document-directory.hbs",
    //     });
    // }

    static entryPartial = `systems/hero6efoundryvttv2/templates/sidebar/partials/document-partial.hbs`;

    constructor(...args) {
        super(...args);
        //debugger;
        // template: "templates/sidebar/sidebar.html"
        // template: "templates/sidebar/document-directory.html"
    }

    _onDrop(event) {
        const data = TextEditor.getDragEventData(event);
        if (!data.type) return;
        if (!data.type === "item") return;
        const item = fromUuidSync(data.uuid);

        // Check if this is a COMPOUNDPOWER
        if (!item.childItems) {
            super._onDrop(event);
        } else {
            //const newParentId = new Date().getTime().toString();
            this._handleDroppedEntry(null, data);
            //newItem.update([{ "system.ID": newParentId }]);

            for (const childItem of item.childItems) {
                const psudoData = {
                    type: data.type,
                    uuid: childItem.uuid,
                };

                this._handleDroppedEntry(null, psudoData);
            }
        }
    }

    async _render(...args) {
        await super._render(args);
    }
}
