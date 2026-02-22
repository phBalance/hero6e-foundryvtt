import { HEROSYS } from "../herosystem6e.mjs";

export class ItemModifierFormApplication extends FormApplication {
    constructor(data) {
        super();
        this.options.title = `Edit ${data.mod.XMLID} of ${data.item.system.XMLID}`;

        this.data = data;
        this.data.modOrig = this.data.mod;
        this.data.mod = this.data.mod._source;

        globalThis.mod = this.data.modOrig; // Global mod is the database view and not the in process changes
    }

    async updateItem() {
        this.render();
    }

    static get defaultOptions() {
        let options = super.defaultOptions;
        options = foundry.utils.mergeObject(options, {
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
        console.log(this.data.modOrig._source);
        const data = this.data;

        if (!this.data.modOrig.baseInfo) {
            ui.notifications.error(`${this.data?.mod?.XMLID} missing baseInfo`, this);
        }

        data.editOptions = foundry.utils.deepClone(this.data.modOrig.baseInfo?.editOptions);
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);
    }

    async _render(...args) {
        await super._render(...args);
    }

    async _updateObject(event, formData) {
        console.log(event, formData);
        const expandedData = foundry.utils.expandObject(formData);
        this.data.mod = foundry.utils.mergeObject(this.data.mod, expandedData.mod);

        if (this.data.editOptions?.choices) {
            const choiceSelected = this.data.editOptions.choices.find((o) => o.OPTIONID === this.data.mod.OPTIONID);
            this.data.mod.OPTION = choiceSelected.OPTION;
            this.data.mod.OPTION_ALIAS = choiceSelected.OPTION_ALIAS;
            this.data.mod.BASECOST = choiceSelected.BASECOST || this.data.mod.BASECOST;
        }

        await this.data.item.update({
            [`system.${this.data.mod.xmlTag}`]: foundry.utils.deepClone(
                this.data.item._source.system[this.data.mod.xmlTag],
            ),
        });

        // Show any changes from dropdowns
        this.render();
    }
}

window.ItemModifierFormApplication = ItemModifierFormApplication;
