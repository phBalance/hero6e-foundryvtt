import { systemPath } from "../../../constants.mjs";
import { HeroApplication } from "../../api/application.mjs";
import { whisperUserTargetsForActor } from "../../../utility/util.mjs";

// REF: https://foundryvtt.wiki/en/development/guides/applicationV2-conversion-guide
// REF: https://foundryvtt.wiki/en/development/api/applicationv2
// REF: DrawSteel item-grant-configuration-dialog.mjs

export class ItemVppConfig extends HeroApplication {
    constructor(options) {
        if (!(options.item?.system?.XMLID === "VPP")) {
            throw new Error("A VPP item must be passed as an option.");
        }
        super(options);
        this.#item = options.item;
        this.#tokenUuid = options.tokenUuid;

        // For debugging
        globalThis.item = this.#item;
    }

    static DEFAULT_OPTIONS = {
        classes: ["vpp-config"],
        // form: {
        //     handler: ItemVppConfig.myFormHandler,
        //     submitOnChange: false,
        //     closeOnSubmit: false,
        // },
        // actions: {
        //     myAction: ItemVppConfig.myAction,
        // },
        window: {
            icon: "fa-solid fa-edit",
            title: "Title",
            //resizable: true,

            // controls: [
            //     {
            //         // font awesome icon
            //         icon: "fa-solid fa-triangle-exclamation",
            //         // string that will be run through localization
            //         label: "Bar",
            //         // string that MUST match one of your `actions`
            //         action: "myAction",
            //     },
            // ],
        },
    };

    static async ItemVppConfig(event, form, formData) {
        // Do things with the returned FormData
        console.log(event, form, formData);
    }

    static myAction(event, target) {
        console.log(this, event, target); // logs the specific application class instance
    }

    _configureRenderOptions(options) {
        // This fills in `options.parts` with an array of ALL part keys by default
        // So we need to call `super` first
        super._configureRenderOptions(options);

        // Window title
        options = foundry.utils.mergeObject(options, {
            window: {
                title: `CONFIGURE: ${this.item.name}`,
            },
        });
    }

    static PARTS = {
        body: {
            template: systemPath("templates/apps/ItemVppConfig/item-vpp-config.hbs"),
        },
        footer: {
            template: "templates/generic/form-footer.hbs",
        },
    };

    #item;
    get item() {
        return this.#item;
    }

    #tokenUuid;

    #vppSlottedIds = [];

    get vppSlottedItems() {
        return this.#item.childItems.filter((i) => this.#vppSlottedIds.includes(i.id));
    }

    get vppUnSlottedItems() {
        return this.#item.childItems.filter((i) => !this.#vppSlottedIds.includes(i.id));
    }

    get vppSlottedCost() {
        return this.vppSlottedItems.reduce((accumulator, currentValue) => accumulator + currentValue.realCost, 0);
    }

    async _prepareContext(options) {
        if (options.isFirstRender) {
            this.#vppSlottedIds = this.item.childItems.filter((i) => i.system.vppSlot).map((i) => i.id);
        }

        return super._prepareContext(options);
    }

    async _preparePartContext(partId, context, options) {
        context = await super._preparePartContext(partId, context, options);

        switch (partId) {
            case "body":
                context.item = this.item;
                context.vppUnSlottedItems = this.vppUnSlottedItems;
                context.vppSlottedItems = this.vppSlottedItems;
                context.vppPoolPoints = this.item.vppPoolPoints;
                context.vppSlottedCost = this.vppSlottedCost;
                break;
            case "footer":
                context.buttons = [
                    {
                        type: "submit",
                        label: "Confirm",
                        icon: "fa-solid fa-fw fa-check",
                        //disabled: this.advancement.chooseN == null || this.totalChosen !== this.advancement.chooseN,
                    },
                ];
                break;
        }

        return context;
    }

    async _onSubmitForm(formConfig, event) {
        await super._onSubmitForm(formConfig, event);

        // Update VPP items
        const changes = [];
        const changeContent = [];
        for (const vppItem of this.item.childItems) {
            const vppSlot = this.#vppSlottedIds.includes(vppItem.id);
            if (vppItem.system.vppSlot !== vppSlot) {
                changes.push({ _id: vppItem.id, ["system.vppSlot"]: vppSlot });
                changeContent.push(`<li>${vppItem.name}: ${!vppItem.system.vppSlot ? "Slotted" : "Unslottted"}</li>`);
            }
        }
        if (changes.length > 0) {
            await this.item.actor.updateEmbeddedDocuments("Item", changes);

            const chatData = {
                author: game.user._id,
                style: CONST.CHAT_MESSAGE_STYLES.IC,
                content: `${this.item.name} slots were changed. VPP pool points: ${this.vppSlottedCost} of ${this.item.vppPoolPoints}. <ul>${changeContent.join("")}</ul>`,
                whisper: whisperUserTargetsForActor(this.item.actor),
                speaker: ChatMessage.getSpeaker({ actor: this.item.actor, token: fromUuidSync(this.#tokenUuid) }),
            };
            await ChatMessage.create(chatData);
        }
    }

    async _onRender(context, options) {
        await super._onRender(context, options);

        function vppSelectHandler(ev, context) {
            switch (ev.target.id) {
                case "rightSelected": {
                    const selected = Array.from(
                        ev.target.closest("form").querySelectorAll("#vppUnSlotted option:checked"),
                    );
                    const selectedIds = selected.map((o) => o.value);
                    context.#vppSlottedIds.push.apply(context.#vppSlottedIds, selectedIds);
                    break;
                }
                case "leftSelected": {
                    const selected = Array.from(
                        ev.target.closest("form").querySelectorAll("#vppSlotted option:checked"),
                    );
                    const selectedIds = selected.map((o) => o.value);
                    context.#vppSlottedIds = context.#vppSlottedIds.filter((id) => !selectedIds.includes(id));
                    break;
                }
                case "reset":
                    context.#vppSlottedIds = [];
                    for (const slotItem of context.item.childItems) {
                        if (context.vppSlottedCost + slotItem.realCost <= context.item.vppPoolPoints) {
                            context.#vppSlottedIds.push(slotItem.id);
                        }
                    }
                    break;
                default:
                    console.warn(`${ev.target.id} is unhandled`);
            }
            context.render();
        }
        const vppSelectControls = document.querySelectorAll(".vpp-select-control");
        for (const vppSelect of vppSelectControls) {
            vppSelect.addEventListener("click", (ev) => vppSelectHandler(ev, this));
        }
    }
}
