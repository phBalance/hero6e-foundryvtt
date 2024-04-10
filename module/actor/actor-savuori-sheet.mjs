import { HEROSYS } from "../herosystem6e.mjs";
import { HeroSystemActorSheet } from "./actor-sheet.mjs";

export class HeroSystemActorSavuoriSheet extends HeroSystemActorSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["actor-sheet", "savuori"],
            template:
                `systems/${HEROSYS.getModule()}/templates/actor/actor-savuori-sheet.hbs`,
            tabs: [
                {
                    navSelector: ".sheet-navigation",
                    contentSelector: ".sheet-body",
                    initial: "Attacks",
                },
            ],
            scrollY: [".sheet-body"],
            closeOnSubmit: false, // do not close when submitted
            submitOnChange: true, // submit when any input changes
            itemFilters: {}, // used to track item search filters on some tabs
        });
    }
}
