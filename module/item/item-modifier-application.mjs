import { HEROSYS } from "../herosystem6e.mjs";

export class ItemModifierFormApplication extends FormApplication {
    constructor(data) {
        super();
        this.data = data;
        this.options.title = `Edit ${data.mod.XMLID} of ${data.item.system.XMLID}`;
    }

    async updateItem() {
        this.render();
    }

    static get defaultOptions() {
        let options = super.defaultOptions;
        options = mergeObject(options, {
            classes: ["form"],
            popOut: true,
            template: `systems/${HEROSYS.module}/templates/item/item-modifier-application.hbs`,
            id: "item-modifier-form-application",
            closeOnSubmit: false, // do not close when submitted
            submitOnChange: true, // submit when any input changes
        });

        return options;
    }

    getData() {
        console.log(this.data.mod);
        const data = this.data;
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);
    }

    async _render(...args) {
        await super._render(...args);

        // CSL can cause differences in form size.
        // if (this.position && this.rendered) {
        //     this.setPosition({ height: "auto" });
        // }
    }

    async _updateObject(event, formData) {
        console.log(event, formData);
        const expandedData = foundry.utils.expandObject(formData);
        this.data.mod = { ...this.data.mod, ...expandedData.mod };
        const oldMod = this.data.item.findModById(this.data.mod.ID);
        const idx = this.data.item.system[oldMod._parentKey].findIndex(
            (o) => o.ID == oldMod.ID,
        );
        this.data.item.system[oldMod._parentKey][idx] = this.data.mod;
        await this.data.item.update({ system: this.data.item.system });

        await this.data.item._postUpload();

        // Show any changes
        this.render();
    }
}

window.ItemModifierFormApplication = ItemModifierFormApplication;
