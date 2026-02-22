const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

// REF: https://foundryvtt.wiki/en/development/guides/converting-to-appv2
// REF: https://foundryvtt.wiki/en/development/guides/applicationV2-conversion-guide

export class HeroSystemItemSheetV2 extends HandlebarsApplicationMixin(ItemSheetV2) {
    // Dynamic PARTS based on system.id
    static {
        Hooks.once("init", async function () {
            HeroSystemItemSheetV2.initializeTemplate();
        });
    }

    static DEFAULT_OPTIONS = {
        //id: "foo-form",
        // form: {
        //     //handler: TemplateApplication.#onSubmit,
        //     closeOnSubmit: false, // do not close when submitted
        // },
        classes: ["herosystem6e", "item-sheet-v2"],
        position: {
            width: 520,
            height: 660,
        },
        actions: {},
        //tag: "form", // The default is "div"
        window: {
            resizable: true,
        },
    };

    get title() {
        return `${this.item.type.toUpperCase()}:${this.item.system.XMLID}: ${this.item.name}`;
    }

    static initializeTemplate() {
        // HEROSYS.module isn't defined yet so using game.system.id
        const systemId = game.system.id;

        HeroSystemItemSheetV2.PARTS = {
            body: {
                template: `systems/${systemId}/templates/item/item-sheet-v2/item-sheet-v2.hbs`,
                scrollable: [""],
            },
        };
    }

    async _prepareContext(options) {
        window.actor = this.actor;

        const context = await super._prepareContext(options);

        // the super defines source (roughly item.source), but we want the actual item for getters and such
        context.item = this.item;

        if (this.item.isMartialManeuver) {
            context.martialArtsDamageTypeChoices = CONFIG.HERO.martialArtsDamageTypeChoices;
        }

        return context;
    }

    _onRender(context, options) {
        globalThis.item = this.item;

        super._onRender(context, options);

        // Edit input buttons
        // REF: https://foundryvtt.wiki/en/development/api/applicationv2
        const editableInputButtons = this.element.querySelectorAll(
            `input[name]:not([name=""]), textarea[name]:not([name=""]), select[name]:not([name=""])`,
        );
        for (const input of editableInputButtons) {
            const attributeName = input.name;
            if (foundry.utils.hasProperty(this.item, attributeName)) {
                input.addEventListener("change", async (e) => {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    const newValue =
                        e.currentTarget.type.toLowerCase() === "checkbox"
                            ? e.currentTarget.checked
                            : e.currentTarget.value;
                    await this.item.update({ [`${attributeName}`]: newValue });

                    const newName = this.item.system.NAME || this.item.system.ALIAS || this.item.system.XMLID;
                    if (newName && newName !== this.item.name) {
                        console.log(`Updating item name to ${newName}`);
                        await this.item.update({ name: newName });
                    }
                });
            } else {
                console.error(`Unhandled INPUT name="${attributeName}`);
            }
        }
    }
}
