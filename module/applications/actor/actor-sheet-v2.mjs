import { HEROSYS } from "../../herosystem6e.mjs";
import { getActorDefensesVsAttack } from "../../utility/defense.mjs";
import { HeroSystem6eActor } from "../../actor/actor.mjs";
import { HeroSystem6eItem } from "../../item/item.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

// REF: https://foundryvtt.wiki/en/development/guides/converting-to-appv2

export class HeroSystemActorSheetV2 extends HandlebarsApplicationMixin(ActorSheetV2) {
    static DEFAULT_OPTIONS = {
        //id: "foo-form",
        // form: {
        //     //handler: TemplateApplication.#onSubmit,
        //     closeOnSubmit: false, // do not close when submitted
        // },
        classes: ["herosystem6e", "actor-sheet-v2"],
        position: {
            width: 800,
            height: 700,
        },
        actions: {
            clear: HeroSystemActorSheetV2.#onClear,
            roll: HeroSystemActorSheetV2.#onRoll,
            toggleItemContainer: HeroSystemActorSheetV2.#onToggleItemContainer,
        },
        //tag: "form", // The default is "div"
        window: {
            resizable: true,
            //     icon: "fas fa-gear", // You can now add an icon to the header
            //     title: "FOO.form.title",
            contentClasses: ["standard-form"],
            tabs: [
                {
                    navSelector: ".sheet-navigation",
                    contentSelector: ".sheet-body",
                    initial: "Attacks",
                },
            ],
        },
    };

    get title() {
        return `${this.actor.type.toUpperCase()}: ${this.actor.name}`;
    }

    static initializeTemplate() {
        HeroSystemActorSheetV2.PARTS = {
            aside: {
                template: `systems/${HEROSYS.module}/templates/actor/actor-sheet-v2-parts/actor-sheet-aside-v2.hbs`,
            },
            header: {
                template: `systems/${HEROSYS.module}/templates/actor/actor-sheet-v2-parts/actor-sheet-header-v2.hbs`,
            },
            tabs: {
                // Foundry-provided generic template
                template: `templates/generic/tab-navigation.hbs`,
                // classes: ['sysclass'], // Optionally add extra classes to the part for extra customization
            },
            attacks: {
                template: `systems/${HEROSYS.module}/templates/actor/actor-sheet-v2-parts/actor-sheet-attacks-v2.hbs`,
                scrollable: [""],
            },
            defenses: {
                template: `systems/${HEROSYS.module}/templates/actor/actor-sheet-v2-parts/actor-sheet-defenses-v2.hbs`,
                scrollable: [""],
            },
            movements: {
                template: `systems/${HEROSYS.module}/templates/actor/actor-sheet-v2-parts/actor-sheet-movements-v2.hbs`,
                scrollable: [""],
            },
            martialArts: {
                template: `systems/${HEROSYS.module}/templates/actor/actor-sheet-v2-parts/actor-sheet-martial-arts-v2.hbs`,
                scrollable: [""],
            },
            skills: {
                template: `systems/${HEROSYS.module}/templates/actor/actor-sheet-v2-parts/actor-sheet-skills-v2.hbs`,
                scrollable: [""],
            },
            maneuvers: {
                template: `systems/${HEROSYS.module}/templates/actor/actor-sheet-v2-parts/actor-sheet-maneuvers-v2.hbs`,
                scrollable: [""],
            },
            powers: {
                template: `systems/${HEROSYS.module}/templates/actor/actor-sheet-v2-parts/actor-sheet-powers-v2.hbs`,
                scrollable: [""],
            },
            equipment: {
                template: `systems/${HEROSYS.module}/templates/actor/actor-sheet-v2-parts/actor-sheet-equipment-v2.hbs`,
                scrollable: [""],
            },
            other: {
                template: `systems/${HEROSYS.module}/templates/actor/actor-sheet-v2-parts/actor-sheet-other-v2.hbs`,
                scrollable: [""],
            },
            analysis: {
                template: `systems/${HEROSYS.module}/templates/actor/actor-sheet-v2-parts/actor-sheet-analysis-v2.hbs`,
                scrollable: [""],
            },
        };
    }

    static TABS = {
        primary: {
            tabs: [
                { id: "attacks" },
                { id: "defenses" },
                { id: "movements" },
                { id: "martial-arts" },
                { id: "skills" },
                { id: "maneuvers" },
                { id: "powers" },
                { id: "equipment" },
                { id: "other" },
                { id: "analysis" },
            ],
            labelPrefix: "ActorSheet.Tabs", // Optional. Prepended to the id to generate a localization key
            initial: "attacks", // Set the initial tab
        },
    };

    async _preparePartContext(partId, context) {
        context = await super._preparePartContext(partId, context);
        context.tab = context.tabs[partId];

        try {
            switch (partId) {
                case "aside":
                    this.#prepareContextDefenseSummary(context);
                    break;
                case "header":
                    this.#prepareContextCharacterPointTooltips(context);
                    break;
                case "attacks":
                    context.items = this.actor.items.filter((item) => item.showAttack);
                    break;
                case "powers":
                    context.items = this.actor.items.filter((item) => item.type === "power" && !item.parentItem);
                    break;
            }
        } catch (e) {
            console.error(e);
        }
        return context;
    }

    async _prepareContext(options) {
        window.actor = this.actor;

        const context = await super._prepareContext(options);

        try {
            // Early out if we are uploading (if we continue we might run into issues requiring ?. optional chaining)
            if (this.actor.flags[game.system.id].uploading) {
                return context;
            }

            // Check for missing data model properties.
            // At some point we can probably get rid of this check.
            if (this.actor.system.debugModelProps) {
                this.actor.system.debugModelProps();
            }

            context.actor = this.actor;
            context.token = options?.token;
            context.isOwner = this.actor.isOwner;
            context.isGM = game.user.isGM;
            context.gameSystemId = game.system.id;
            context.alphaTesting = game.settings.get(game.system.id, "alphaTesting");
            context.hasEquipment = !!context.actor.items.find((o) => o.type === "equipment");
            context.hasMartialArts = !!context.actor.items.find((o) => o.type === "martialart");
            context.useHAP = game.settings.get(game.system.id, "HAP");
        } catch (e) {
            console.error(e);
        }

        return context;
    }

    // Character & Active Points tooltip details
    #prepareContextCharacterPointTooltips(context) {
        try {
            context.pointsTitle = "";
            context.activePointsTitle = "";
            if (context.actor.pointsDetail) {
                for (const [key, value] of Object.entries(context.actor.pointsDetail)) {
                    context.pointsTitle += `${key.replace("equipment", "[equipment]")}: ${value}\n`;
                }
            }
            if (context.actor.activePointsDetail) {
                for (const [key, value] of Object.entries(context.actor.activePointsDetail)) {
                    context.activePointsTitle += `${key}: ${value}\n`;
                }
            } else {
                context.activePointsTitle = "Total Active Points (estimate)";
            }
        } catch (e) {
            console.error(e);
        }
    }

    #prepareContextDefenseSummary(context) {
        try {
            // Defense (create fake attacks and get defense results)
            const defense = {};

            // Make a fake actor to hold the fake attacks we're going to create. Give it the
            // same HERO system version as the actor related to this sheet.
            // TODO: Is there a better way to calculate defense without creating fake attacks?

            // Defense PD
            const pdAttack = this.#createStaticFakeAttack(
                "pd",
                `<POWER XMLID="ENERGYBLAST" ID="1695402954902" BASECOST="0.0" LEVELS="1" ALIAS="Blast" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" INPUT="PD" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
            </POWER>`,
            );
            const {
                defenseValue: defenseValuePD,
                resistantValue: resistantValuePD,
                damageReductionValue: damageReductionValuePD,
                damageNegationValue: damageNegationValuePD,
                defenseTags: defenseTagsPD,
            } = getActorDefensesVsAttack(this.actor, pdAttack);
            defense.PD = defenseValuePD;
            for (const tag of defenseTagsPD.filter(
                (o) => o.operation === "add" && (!o.options?.resistant || o.options?.resistantAdvantage),
            )) {
                defense.PDtags = `${defense.PDtags || ""}${tag.value.signedStringHero()} ${tag.name} ${tag.shortDesc}\n`;
            }
            defense.rPD = resistantValuePD;
            for (const tag of defenseTagsPD.filter((o) => o.operation === "add" && o.options?.resistant)) {
                defense.rPDtags = `${defense.rPDtags || ""}${tag.value.signedStringHero()} ${tag.name} ${tag.shortDesc}\n`;
            }
            defense.drp = damageReductionValuePD;
            for (const tag of defenseTagsPD.filter((o) => o.operation === "pct")) {
                defense.drptags = `${defense.drptags || ""}${tag.value.signedStringHero()} ${tag.name} ${tag.shortDesc}\n`;
            }
            defense.dnp = damageNegationValuePD;
            for (const tag of defenseTagsPD.filter((o) => o.operation === "subtract")) {
                defense.dnptags = `${defense.dnptags || ""}${tag.value.signedStringHero()} ${tag.name} ${tag.shortDesc}\n`;
            }

            // Defense ED
            const edAttack = this.#createStaticFakeAttack(
                "ed",
                `<POWER XMLID="ENERGYBLAST" ID="1695402954902" BASECOST="0.0" LEVELS="1" ALIAS="Blast" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" INPUT="ED" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
        </POWER>`,
            );
            const {
                defenseValue: defenseValueED,
                resistantValue: resistantValueED,
                damageReductionValue: damageReductionValueED,
                damageNegationValue: damageNegationValueED,
                defenseTags: defenseTagsED,
            } = getActorDefensesVsAttack(this.actor, edAttack);
            defense.ED = defenseValueED;
            for (const tag of defenseTagsED.filter((o) => o.operation === "add" && !o.options?.resistant)) {
                defense.EDtags = `${defense.EDtags || ""}${tag.value.signedStringHero()} ${tag.name} ${tag.shortDesc}\n`;
            }
            defense.rED = resistantValueED;
            for (const tag of defenseTagsED.filter((o) => o.operation === "add" && o.options?.resistant)) {
                defense.rEDtags = `${defense.rEDtags || ""}${tag.value.signedStringHero()} ${tag.name} ${tag.shortDesc}\n`;
            }
            defense.dre = damageReductionValueED;
            for (const tag of defenseTagsED.filter((o) => o.operation === "pct")) {
                defense.dretags = `${defense.dretags || ""}${tag.value.signedStringHero()} ${tag.name} ${tag.shortDesc}\n`;
            }
            defense.dne = damageNegationValueED;
            for (const tag of defenseTagsED.filter((o) => o.operation === "subtract")) {
                defense.dnetags = `${defense.dnetags || ""}${tag.value.signedStringHero()} ${tag.name} ${tag.shortDesc}\n`;
            }

            // Defense MD
            const mdAttack = this.#createStaticFakeAttack(
                "md",
                `<POWER XMLID="EGOATTACK" ID="1695575160315" BASECOST="0.0" LEVELS="1" ALIAS="Mental Blast" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
            </POWER>`,
            );
            const {
                defenseValue: defenseValueMD,
                resistantValue: resistantValueMD,
                damageReductionValue: damageReductionValueMD,
                damageNegationValue: damageNegationValueMD,
                defenseTags: defenseTagsMD,
            } = getActorDefensesVsAttack(this.actor, mdAttack);
            defense.MD = defenseValueMD;
            for (const tag of defenseTagsMD.filter((o) => o.operation === "add" && !o.options?.resistant)) {
                defense.MDtags = `${defense.MDtags || ""}${tag.value.signedStringHero()} ${tag.name} ${tag.shortDesc}\n`;
            }
            defense.rMD = resistantValueMD;
            for (const tag of defenseTagsMD.filter((o) => o.operation === "add" && o.options?.resistant)) {
                defense.rMDtags = `${defense.rMDtags || ""}${tag.value.signedStringHero()} ${tag.name} ${tag.shortDesc}\n`;
            }
            defense.drm = damageReductionValueMD;
            for (const tag of defenseTagsMD.filter((o) => o.operation === "pct")) {
                defense.drmtags = `${defense.drmtags || ""}${tag.value.signedStringHero()} ${tag.name} ${tag.shortDesc}\n`;
            }
            defense.dnm = damageNegationValueMD;
            for (const tag of defenseTagsMD.filter((o) => o.operation === "subtract")) {
                defense.dnmtags = `${defense.dnmtags || ""}${tag.value.signedStringHero()} ${tag.name} ${tag.shortDesc}\n`;
            }

            // Defense POWD
            const drainAttack = this.#createStaticFakeAttack(
                "drain",
                `<POWER XMLID="DRAIN" ID="1703727634494" BASECOST="0.0" LEVELS="1" ALIAS="Drain" POSITION="14" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" INPUT="BODY" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
            </POWER>`,
            );
            const {
                defenseValue: defenseValuePOWD,
                resistantValue: resistantValuePOWD,
                defenseTags: defenseTagsPOWD,
            } = getActorDefensesVsAttack(this.actor, drainAttack);
            defense.POWD = defenseValuePOWD;
            for (const tag of defenseTagsPOWD.filter((o) => o.operation === "add" && !o.options?.resistant)) {
                defense.POWDtags = `${defense.POWDtags || ""}${tag.value.signedStringHero()} ${tag.name} ${
                    tag.shortDesc
                }\n`;
            }
            defense.rPOWD = resistantValuePOWD;
            for (const tag of defenseTagsPOWD.filter((o) => o.operation === "add" && o.options?.resistant)) {
                defense.rPOWDtags = `${defense.rPOWDtags || ""}${tag.value.signedStringHero()} ${tag.name} ${
                    tag.shortDesc
                }\n`;
            }

            context.defense = defense;
        } catch (e) {
            console.error(e);
        }
    }

    // Static variable to hold all the sampleAttacks that we use to create defense summary
    static sampleAttacks = {};

    #createStaticFakeAttack(damageType, xml) {
        const is5e = this.actor.is5e;
        const attackKey = `${damageType}Attack${is5e ? "5e" : "6e"}`;
        const defenseCalculationActorKey = `defenseCalculationActor${is5e ? "5e" : "6e"}`;

        // This typically happens during upload.  Don't save anything in static.
        if (is5e === undefined) {
            return;
        }

        HeroSystemActorSheetV2.sampleAttacks[defenseCalculationActorKey] ??= new HeroSystem6eActor(
            {
                name: "Defense Calculation Actor",
                type: "pc",
                system: { is5e },
            },
            {},
        );
        const defenseCalculationActor = HeroSystemActorSheetV2.sampleAttacks[defenseCalculationActorKey];

        if (!HeroSystemActorSheetV2.sampleAttacks[attackKey]) {
            HeroSystemActorSheetV2.sampleAttacks[attackKey] = new HeroSystem6eItem(
                HeroSystem6eItem.itemDataFromXml(xml, defenseCalculationActor),
                { parent: defenseCalculationActor },
            );
            //console.debug(`${attackKey}: Created`);
        } else {
            //console.debug(`${attackKey}: used cache`);
        }
        return HeroSystemActorSheetV2.sampleAttacks[attackKey];
    }

    async _onFirstRender(context, options) {
        await super._onFirstRender(context, options);

        // General right click on row
        this._createContextMenu(this._getDocumentListContextOptions, "[data-document-uuid]", {
            hookName: "getDocumentListContextOptions",
            parentClassHooks: false,
            fixed: true,
        });

        // Same menu but for the specific vertical ellipsis control
        this._createContextMenu(this._getDocumentListContextOptions, '[data-action="documentListContext"]', {
            hookName: "getDocumentListContextOptions",
            parentClassHooks: false,
            fixed: true,
            eventName: "click",
        });

        // item-description-expand chevron expand collapse
        this.element.querySelectorAll('[data-action="toggleDocumentDescription"]').forEach((el) => {
            el.addEventListener("click", (ev) => {
                ev.preventDefault();
                ev.stopImmediatePropagation();
                ev.target.closest("li").classList.toggle("expanded");
            });
        });

        this.element.querySelectorAll('[data-action="search"]').forEach((el) => {
            el.addEventListener("keydown", this._debouncedSearch, { passive: true });
        });
    }

    static SEARCH_DELAY = 200;

    _debouncedSearch = foundry.utils.debounce(this._onSearch.bind(this), this.constructor.SEARCH_DELAY);

    _onSearch(ev) {
        const filter = ev.target.value;
        const regex = new RegExp(RegExp.escape(filter), "i");
        const itemList = ev.target.closest(".tab.active").querySelector(".item-list");
        for (const li of itemList.children) {
            const documentUuid = li.closest("[data-document-uuid]").dataset.documentUuid;
            const item = fromUuidSync(documentUuid);
            if (!item) {
                console.error(`Unable to locate ${documentUuid}`);
                continue;
            }
            try {
                if (
                    item.name.match(regex) ||
                    item.system.XMLID.match(regex) ||
                    item.system.description.match(regex) ||
                    item.parentItem?.system.description.match(regex)
                ) {
                    li.classList.remove("hidden");
                } else {
                    li.classList.add("hidden");
                }
            } catch (e) {
                console.error(e);
            }
        }
    }

    _getDocumentListContextOptions() {
        // name is auto-localized
        return [
            {
                name: "Edit",
                icon: '<i class="fa-solid fa-fw fa-edit"></i>',
                condition: () => this.actor.isOwner,
                callback: async (target) => {
                    const document = this._getEmbeddedDocument(target);
                    await document.sheet.render({ force: true });
                },
            },
            {
                name: "Display in chat",
                icon: '<i class="fa-solid fa-fw fa-share-from-square"></i>',
                condition: (target) => {
                    const document = this._getEmbeddedDocument(target);
                    return !!document.system.description;
                },
                callback: async (target) => {
                    const document = this._getEmbeddedDocument(target);
                    await document.chat();
                    // await DrawSteelChatMessage.create({
                    //     content: `@Embed[${document.uuid} caption=false]`,
                    //     speaker: DrawSteelChatMessage.getSpeaker({ actor: this.actor }),
                    //     title: document.name,
                    //     flags: {
                    //         core: { canPopout: true },
                    //     },
                    // });
                },
            },
            {
                name: "Delete",
                icon: '<i class="fa-solid fa-fw fa-trash"></i>',
                condition: () => this.actor.isOwner,
                callback: async (target) => {
                    const document = this._getEmbeddedDocument(target);
                    await document.deleteDialog();
                },
            },
        ];
    }

    _getEmbeddedDocument(target) {
        const documentUuid = target.closest("[data-document-uuid]").dataset.documentUuid;

        // fromUuidSync doesn't allow  retrieving embedded compendium documents, so manually retrieving each child document from the base document.
        const { collection, embedded, documentId } = foundry.utils.parseUuid(documentUuid);
        let document = collection.get(documentId);
        while (document && embedded.length > 1) {
            const [embeddedName, embeddedId] = embedded.splice(0, 2);
            document = document.getEmbeddedDocument(embeddedName, embeddedId);
        }

        return document;
    }

    static async #onClear(event, target) {
        const inputSearch = target.closest("div.search").querySelector("input");
        if (inputSearch) {
            inputSearch.value = "";
            const itemList = target.closest(".tab.active").querySelector(".item-list");
            for (const li of itemList.children) {
                li.classList.remove("hidden");
            }
        }
    }

    static async #onRoll(event, target) {
        const item = this._getEmbeddedDocument(target);
        if (!item) {
            console.error("Unable to locate roll item");
        }
        await item.roll();
    }

    static async #onToggleItemContainer(event, target) {
        const item = this._getEmbeddedDocument(target);
        if (!item) {
            console.error("Unable to locate item");
        }
        target.closest("li").classList.toggle("collapsed");
    }
}
