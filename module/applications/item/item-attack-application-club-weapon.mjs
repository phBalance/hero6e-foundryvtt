const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * A lightweight V2 dialog used when the Club Weapon maneuver is active.
 *
 * The dialog simply lets the user pick which hand-to-hand killing attack
 * should be treated as the "club" for the current attack.
 */
export class ItemAttackClubWeaponApplicationV2 extends HandlebarsApplicationMixin(ApplicationV2) {
    static {
        Hooks.once("init", () => {
            ItemAttackClubWeaponApplicationV2.initializeTemplate();
        });
    }

    constructor(data = {}) {
        super(data);
        // the caller may pass in an actor or token as part of the data
        this.data = data;
    }

    /**
     * Build a title for the window.
     */
    get title() {
        return `Club Weapon`;
    }

    /**
     * Option defaults for this V2 form.
     */
    static DEFAULT_OPTIONS = {
        tag: "form",
        classes: ["herosystem6e", "club-weapon-application"],
        id: "item-attack-club-weapon-v2",
        position: {
            width: "320",
        },
        form: {
            handler: ItemAttackClubWeaponApplicationV2.#onSubmit,
            closeOnSubmit: true,
        },
        window: {
            icon: "fas fa-screwdriver-wrench",
        },
    };

    /**
     * Populate the PARTS object that tells ApplicationV2 where to find
     * the handlebars template for the body (and footer if desired).
     */
    static initializeTemplate() {
        const systemId = game.system.id;
        ItemAttackClubWeaponApplicationV2.PARTS = {
            body: {
                template: `systems/${systemId}/templates/attack/item-attack-application-club-weapon-v2.hbs`,
            },
        };
    }

    /**
     * Prepare the context which will be passed to Handlebars.
     * The important piece is to supply a list of eligible HKA items on the
     * actor so the template can render them.
     */
    async _prepareContext(/* options */) {
        const actor = this.data.actor ?? this.data.token?.actor;
        const hkaItems = actor
            ? actor.items.filter((i) => i.system.XMLID === "HKA" && i.baseInfo.type.includes("attack"))
            : [];
        return foundry.utils.mergeObject(this.data, { hkaItems });
    }

    /**
     * Get the selected HKA and pass to the build attack dialog handler
     */
    static async #onSubmit /* html */() {
        // const form = html[0];
        // const formData = new FormData(form);
        // const selected = formData.get("hkaItem");
        // if (selected && this.data.actor) {
        //     await this.data.actor.setFlag(HEROSYS.module, "clubWeaponTarget", selected);
        // }

        return true;
    }
}
