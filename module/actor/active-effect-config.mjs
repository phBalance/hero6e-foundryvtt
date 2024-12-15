import { HEROSYS } from "../herosystem6e.mjs";

export class HeroSystemActiveEffectConfig extends ActiveEffectConfig {
    static get defaultOptions() {
        const defaultOptions = super.defaultOptions;
        return foundry.utils.mergeObject(defaultOptions, {
            //classes: ["herosystem6e", "sheet", "item"],
            // width: 520,
            // height: 660,
            // scrollY: [".sheet-body"],
            classes: ["sheet", "herosystem-active-effect-config", "active-effect-sheet"],
            template: `systems/${HEROSYS.module}/templates/actor/active-effect-config.hbs`,
        });
    }

    async getData() {
        const context = await super.getData();
        for (let i = 0; i < context.data.changes.length; i++) {
            context.data.changes[i] = { ...context.data.changes[i], ...context.data.flags.changes?.[i] };
        }
        return context;
    }

    // async _updateObject(event, formData) {
    //     await super._updateObject(event, formData);

    //     // if (formData.changes) {
    //     //     await this.object.update({ changes: formData.changes });
    //     // }
    // }
}
