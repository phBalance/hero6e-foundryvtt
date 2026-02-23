const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;
import {
    createModifierOrAdderFromXml,
    replaceBaseCostForHalfDieAdderXml,
    replaceBaseCostForPipAdderXml,
} from "../../item/item.mjs";
import { HeroAdderModel, HeroModifierModel } from "../../item/HeroSystem6eTypeDataModels.mjs";

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
        actions: {
            create: HeroSystemItemSheetV2.#onCreate,
            delete: HeroSystemItemSheetV2.#onDelete,
            edit: HeroSystemItemSheetV2.#onEdit,
        },
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

        if (this.item.system.CHARACTERISTIC) {
            context.skillCharacteristicOptions = this.item.is5e
                ? CONFIG.HERO.skillCharacteristics5e
                : CONFIG.HERO.skillCharacteristics;
        }

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

    static async #onCreate(event, target) {
        const item = this.item;
        const adderOrModifier = target.dataset.type;
        const powers = item.actor.system.is5e ? CONFIG.HERO.powers5e : CONFIG.HERO.powers6e;
        const powersOfType = powers.filter((o) => o.behaviors.includes(adderOrModifier.toLowerCase()) && o.xml);

        if (powersOfType.length === 0) {
            throw new Error(`Creating a new ${adderOrModifier.toUpperCase()} has no valid selections`);
        }

        const optionHTML = powersOfType
            .sort((a, b) => {
                const parserA = new DOMParser();
                const xmlA = parserA.parseFromString(a.xml.trim(), "text/xml");
                const parserB = new DOMParser();
                const xmlB = parserB.parseFromString(b.xml.trim(), "text/xml");
                const nameA = xmlA.children[0].getAttribute("ALIAS");
                const nameB = xmlB.children[0].getAttribute("ALIAS");
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }

                // names must be equal
                return 0;
            })
            .map(function (a) {
                const parserA = new DOMParser();
                const xmlA = parserA.parseFromString(a.xml.trim(), "text/xml");
                const alias = xmlA.children[0].getAttribute("ALIAS");

                // Make sure XMLIDs match, if not then skip
                if (a.key != xmlA.children[0].getAttribute("XMLID")) {
                    console.warn(`XMLID mismatch`, a, xmlA.children[0]);
                    return "";
                }

                return `<option value='${a.key}'>${alias}</option>`;
            });

        const content = `
            <p>
                Adding ADDERs and MODIFIERs is limited and has not been fully vetted.  
                Invalid adders/modifiers are likely to be ignored and may cause automation issues.
                Cost and Active Points may not be updated.
            </p>
            <p>
            <label>Select ${adderOrModifier}:</label>
            <br>
                <select name="XMLID">
                    ${optionHTML}
                </select>
            </p>`;

        const inputData = await foundry.applications.api.DialogV2.input({
            window: {
                title: `Create ${adderOrModifier.toUpperCase()} for ${item.system.XMLID}`,
            },
            content,
        });

        if (!inputData.XMLID) {
            return;
        }

        const power = powersOfType.find((o) => o.key == inputData.XMLID);
        if (!power) {
            throw new Error(`Creating new ${adderOrModifier.toUpperCase()} failed`);
        }

        // Warn if xml is missing as the item is likely missing properties that we are expecting
        if (!power.xml) {
            throw new Error(`${power.key.toUpperCase()} is missing XML definition.`);
        }

        // We need special exceptions for 1d6-1, 1/2d6, and +1 modifiers as their BASECOST changes
        // based on what they're being added to.
        let xml = power.xml;
        if (inputData.xmlid === "MINUSONEPIP" || inputData.xmlid === "PLUSONEHALFDIE") {
            xml = replaceBaseCostForHalfDieAdderXml(item, xml);
        } else if (inputData.xmlid === "PLUSONEPIP") {
            xml = replaceBaseCostForPipAdderXml(item, xml);
        }

        const modifierOrAdderData = createModifierOrAdderFromXml(xml);

        // Track when added manually for diagnostic purposes
        modifierOrAdderData.versionHeroSystem6eManuallyCreated = game.system.version;

        let dataModelObject = null;
        if (modifierOrAdderData.xmlTag === "ADDER") {
            dataModelObject = new HeroAdderModel(modifierOrAdderData, { parent: item });
        } else if (modifierOrAdderData.xmlTag === "MODIFIER") {
            dataModelObject = new HeroModifierModel(modifierOrAdderData, { parent: item });
        }

        if (!dataModelObject || !dataModelObject.XMLID) {
            ui.notifications.error(`unable to create ${adderOrModifier}`);
            return;
        }

        // Add the MODIFIER or ADDER to the array
        await item.update({
            [`system.${adderOrModifier.toUpperCase()}`]:
                item.system[adderOrModifier.toUpperCase()].concat(dataModelObject),
        });
    }

    static async #onDelete(event, target) {
        const xmlid = target.closest("[data-xmlid]")?.dataset?.xmlid;
        const adderId = target.closest("[data-adder-id]")?.dataset?.adderId;
        const modifierId = target.closest("[data-modifier-id]")?.dataset?.modifierId;
        if (!adderId && !modifierId) {
            throw new Error(`Unable to edit adder/modifier.`);
        }

        const adderOrModifier =
            this.item.system.ADDER.find((m) => m.ID == adderId) ||
            this.item.system.MODIFIER.find((m) => m.ID == modifierId);
        if (!adderOrModifier || adderOrModifier.XMLID !== xmlid) {
            throw new Error(`Unable to edit adder/modifier.`);
        }

        const confirmed = await foundry.applications.api.DialogV2.confirm({
            window: {
                title:
                    game.i18n.localize("HERO6EFOUNDRYVTTV2.confirms.deleteConfirm.Title") +
                    ` ${adderOrModifier.ALIAS ?? adderOrModifier.XMLID}`,
            },
            content: game.i18n.localize("HERO6EFOUNDRYVTTV2.confirms.deleteConfirm.Content"),
        });

        const xmlTag = adderId ? "ADDER" : "MODIFIER";
        if (xmlTag !== adderOrModifier.xmlTag) {
            console.error(`${adderOrModifier.XMLID} has xmlTag mismatch`);
        }

        if (confirmed) {
            await this.item.update({
                [`system.${xmlTag}`]: this.item.system[xmlTag]
                    .filter((o) => o.ID != adderOrModifier.ID)
                    .map((o) => o._source),
            });
        }
    }

    static async #onEdit(event, target) {
        throw new Error("#onEdit unhandled", event, target);
    }
}
