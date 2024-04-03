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
            template: `systems/hero6efoundryvttv2/templates/item/item-modifier-application.hbs`,
            id: "item-modifier-form-application",
            closeOnSubmit: false, // do not close when submitted
            submitOnChange: true, // submit when any input changes
        });

        return options;
    }

    getData() {
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
        // Show any changes
        this.render();
    }
}

window.ItemModifierFormApplication = ItemModifierFormApplication;
