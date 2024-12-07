// Possible reference: https://github.com/foundryvtt/foundryvtt/issues/9026
// Possible reference: https://gitlab.com/woodentavern/foundryvtt-bar-brawl

// import { getBarExtendedAttribute } from "../bar3/extendTokenConfig.mjs";
import { HEROSYS } from "../herosystem6e.mjs";
import { RoundFavorPlayerUp } from "../utility/round.mjs";
// import { clamp } from "../utility/compatibility.mjs";

export class HeroSystem6eTokenDocument extends TokenDocument {
    constructor(data, context) {
        super(data, context);
        //data.bars.bar3 = bars.addChild(new PIXI.Graphics());
    }

    // getBarAttribute(barName, alternative) {
    //     //HEROSYS.log(false, "getBarAttribute")
    //     let data = super.getBarAttribute(barName, alternative);

    //     if (barName == "bar3") {
    //         const attr = alternative || this.flags.bar3?.attribute; //this[barName]?.attribute;
    //         if (!attr || !this.actor) return null;
    //         let data = foundry.utils.getProperty(this.actor.system, attr);
    //         if (data === null || data === undefined) return null;
    //         const model = game.model.Actor[this.actor.type];

    //         // Single values
    //         if (Number.isNumeric(data)) {
    //             return {
    //                 type: "value",
    //                 attribute: attr,
    //                 value: Number(data),
    //                 editable: foundry.utils.hasProperty(model, attr),
    //             };
    //         }

    //         // Attribute objects
    //         else if ("value" in data && "max" in data) {
    //             return {
    //                 type: "bar",
    //                 attribute: attr,
    //                 value: parseInt(data.value || 0),
    //                 max: parseInt(data.max || 0),
    //                 editable: foundry.utils.hasProperty(model, `${attr}.value`),
    //                 label: attr.split(".").pop(),
    //             };
    //         }

    //         // Otherwise null
    //         return null;
    //     }

    //     // Add label
    //     let attr = alternative?.alternative || this[barName]?.attribute;
    //     if (attr && attr.indexOf(".") > -1) attr = attr.split(".").pop();
    //     if (attr) return { ...data, label: attr };
    //     return data;
    // }

    // static defineSchema() {
    //     //HEROSYS.log(false, "defineSchema")
    //     let schema = super.defineSchema();
    //     schema.bar3 = new foundry.data.fields.SchemaField({
    //         attribute: new foundry.data.fields.StringField({
    //             required: true,
    //             nullable: true,
    //             blank: false,
    //             initial: () => "characteristics.end",
    //         }),
    //     });
    //     return schema;
    // }

    _prepareDetectionModes() {
        if (!this.sight.enabled) return;

        if (!this.isOwner) return;

        if (this.sight.visionMode != "basic") {
            super._prepareDetectionModes();
            return;
        }

        // TO see the map you must have DETECT + SENSE
        // Anything with 'detect limited class of physical objects'

        // By default you must have a light source to see the map
        const initialRange = this.sight.range;
        this.sight.range = 0;

        // default lightPerception & basicSight detections
        //super._prepareDetectionModes();

        // Maximum distance we can see is based on perception.  This is typically 125m+ so rarely impacts scene.
        // Only 5e INT/PERCEPTION can go below 9.  6e INT cannot go below 0.  5e INT can go below 0.
        // THE RANGE OF SENSES
        // The Range Modifier (page 144) applies to all PER Rolls with Ranged
        // Senses; this effectively restricts their Range significantly. The rules
        // don’t establish any absolute outer limit or boundary for a Ranged
        // Sense; the GM should establish the limit based on common sense
        // and the situation. As a guideline, when the Range Modifier exceeds
        // the point where it reduces a character’s PER Roll to 0 or below,
        // things become too blurry, indistinct, or obscured for the character
        // to perceive, even if he rolls a 3.
        let maxRange = 8;
        // TODO: Fix PERCEPTION.system.roll so we don't have to poke into INT
        //const PERCEPTION = this.actor?.items.find((i) => i.system.XMLID === "PERCEPTION");
        if (this.actor && this.actor.system.characteristics.int) {
            //9 + (INT/5)
            const perRoll = 9 + RoundFavorPlayerUp(parseInt(this.actor.system.characteristics.int.value) / 5);
            const pwr = perRoll / 2 + 2;
            maxRange = Math.floor(Math.max(maxRange, Math.pow(2, pwr)));
        }

        const lightMode = this.detectionModes.find((m) => m.id === "lightPerception");
        if (!lightMode) {
            this.detectionModes.push({ id: "lightPerception", enabled: true, range: maxRange });
        } else {
            lightMode.range = maxRange;
            lightMode.enabled = true;
        }
        const basicMode = this.detectionModes.find((m) => m.id === "basicSight");
        if (!basicMode) {
            this.detectionModes.push({ id: "basicSight", enabled: true, range: 0 });
        } else {
            basicMode.range = 0;
            basicMode.enabled = true;
        }

        try {
            if (!this.actor?.statuses.has("blind")) {
                // GENERIC SIGHTGROUP (no lights required; INFRAREDPERCEPTION, NIGHTVISION, etc)
                const SIGHTGROUP = this.actor?.items.find(
                    (item) =>
                        item.isSense &&
                        item.system.GROUP === "SIGHTGROUP" &&
                        //item.system.OPTIONID === undefined && // DETECT
                        item.isActive,
                );

                if (SIGHTGROUP) {
                    const basicMode = this.detectionModes.find((m) => m.id === "basicSight");
                    basicMode.range = maxRange;
                    this.sight.range = maxRange; // You can see without a light source
                }
            }

            // GENERIC NON-SIGHTGROUP (not including MENTALGROUP which is unsupported)
            // const NONSIGHTGROUP = this.actor?.items.find(
            //     (item) =>
            //         item.isSense &&
            //         item.system.GROUP !== "SIGHTGROUP" &&
            //         item.system.GROUP !== "MENTALGROUP" &&
            //         item.isActive,
            // );
            const heroDetectSight = this.detectionModes.find((m) => m.id === "heroDetectSight");
            // if (SIGHTGROUP || NONSIGHTGROUP) {
            if (!heroDetectSight) {
                this.detectionModes.push({ id: "heroDetectSight", enabled: true, range: maxRange });
            } else {
                heroDetectSight.range = maxRange;
                heroDetectSight.enabled = true;
            }
            // } else {
            //     if (heroDetectSight) {
            //         heroDetectSight.enabled = false;
            //     }
            // }

            // Update Sight so people don't get confused when looking at the UI
            if (initialRange !== this.sight.range) {
                this.update({ "sight.range": this.sight.range });
            }
        } catch (e) {
            console.error(e);
        }
    }
}

export class HeroSystem6eToken extends Token {
    constructor(document) {
        super(document);
    }

    getData() {
        let data = super.getData();
        data.bar3 = this.token.flags.bar3;
        return data;
    }

    /**
     * Add or remove the currently controlled Tokens from the active combat encounter
     * @param {Combat} [combat]    A specific combat encounter to which this Token should be added
     * @returns {Promise<Token>} The Token which initiated the toggle
     */
    async toggleCombat(combat) {
        await super.toggleCombat(combat);
    }

    _canDragLeftStart(user, event) {
        let canDragLeftStart = super._canDragLeftStart(user, event);

        // If in combat, do not allow tokens to move when it is not their turn.
        if (
            canDragLeftStart &&
            !game.user.isGM &&
            this.inCombat &&
            this.combatant.combat.started &&
            this.combatant.combat.current?.tokenId !== this.id &&
            game.settings.get(HEROSYS.module, "CombatMovementOnlyOnActorsPhase")
        ) {
            ui.notifications.warn("Combat has started and you must wait for your phase to move.");
            canDragLeftStart = false;
        }

        // Entangled tokens typically can't move
        if (canDragLeftStart && this.actor) {
            canDragLeftStart = this.actor.canMove(true, event);
        }

        // Do not allow movement when actor cannot act.  SHIFT will override in canAct()
        // if (canDragLeftStart && this.actor) {
        //     canDragLeftStart = this.actor.canAct(true, event);
        // }

        return canDragLeftStart;
    }

    // _drawBar(number, bar, data) {
    //     // Ignore if bar3 not set
    //     if (!game.settings.get(game.system.id, "bar3")) {
    //         return super._drawBar(number, bar, data);
    //     }

    //     const val = Number(data.value);
    //     const pct = clamp(val, 0, data.max) / data.max;

    //     // Determine sizing
    //     let h = Math.max(canvas.dimensions.size / 12, 8);
    //     const w = this.w;
    //     const bs = clamp(h / 8, 1, 2);
    //     if (this.document.height >= 2) h *= 1.6; // Enlarge the bar for large tokens

    //     // Determine the color to use
    //     const blk = 0x000000;
    //     let color;
    //     if (number === 0) color = this.HeroColor([1 - pct / 2, pct, 0]);
    //     else color = this.HeroColor([0.5 * pct, 0.7 * pct, 0.5 + pct / 2]);

    //     // Override for Hero
    //     if (number === 0) color = this.HeroColor([1, 0, 0]); // Body
    //     if (number === 1) color = this.HeroColor([0, 1, 0]); // Stun
    //     if (number === 2) color = this.HeroColor([0.5, 0.5, 1]); // Endurance

    //     if (!bar) {
    //         HEROSYS.log(false, "bar is undefined");
    //         return;
    //     }
    //     // Draw the bar
    //     bar.clear();
    //     bar.beginFill(blk, 0.5).lineStyle(bs, blk, 1.0).drawRoundedRect(0, 0, this.w, h, 3);
    //     bar.beginFill(color, 1.0)
    //         .lineStyle(bs, blk, 1.0)
    //         .drawRoundedRect(0, 0, pct * w, h, 2);

    //     // Enlarge the bar for large tokens
    //     if (this.document.height >= 2) {
    //         h *= 1.6;
    //     }

    //     // Set position (stack bars from bottom to top)
    //     let posY = this.h - h * (number + 1);
    //     bar.position.set(0, posY);

    //     // Opacity
    //     bar.alpha = 0.8;

    //     // Label
    //     this.drawBarLabel(bar, data, data.value, data.max);
    // }

    // HeroColor(ary) {
    //     // v11
    //     if (PIXI.Color) {
    //         return new PIXI.Color(ary).toNumber();
    //     }

    //     // v10
    //     return PIXI.utils.rgb2hex(ary);
    // }

    // drawBarLabel(bar, data, value, max) {
    //     // remove any existing children (may want save the previous one, not sure yet)
    //     while (bar.children[0]) {
    //         bar.removeChild(bar.children[0]);
    //     }

    //     bar.resolution = 2;

    //     let textStyle = "fraction";
    //     switch (textStyle) {
    //         case "none":
    //             if (data.label) this.createBarLabel(bar, data, data.label);
    //             break;

    //         case "fraction":
    //             this.createBarLabel(bar, data, `${data.label ? data.label + "  " : ""}${value} / ${max}`);
    //             break;

    //         case "percent":
    //             {
    //                 // Label does not match bar percentage because of possible inversion.
    //                 const percentage = Math.round((clamp(value, 0, max) / max) * 100);
    //                 this.createBarLabel(bar, data, `${data.label ? data.label + "  " : ""}${percentage}%`);
    //             }
    //             break;

    //         default:
    //             console.error(`Unknown label style`);
    //             break;
    //     }
    // }

    // createBarLabel(bar, data, text) {
    //     let font = CONFIG.canvasTextStyle.clone();
    //     font.fontSize = bar.height;
    //     //font.fontSize = data.fgImage || data.bgImage ? getBarHeight(token, bar.contentWidth) : bar.contentHeight;

    //     const barText = new PIXI.Text(text, font);
    //     barText.name = bar.name + "-text";
    //     barText.x = bar.width / 2;
    //     barText.y = bar.height * 0.44; // For some reason 50% is slighly low
    //     barText.anchor.set(0.5);
    //     barText.resolution = 2;
    //     barText.height = bar.height;
    //     //barText.width = bar.width
    //     if (data.invertDirection) barText.scale.x *= -1;
    //     bar.addChild(barText);
    // }

    // drawBars() {
    //     //HEROSYS.log(false, "drawBars")

    //     // Ignore if bar3 not set
    //     if (!game.settings.get(game.system.id, "bar3")) {
    //         return super.drawBars();
    //     }

    //     if (!this.actor || this.document.displayBars === CONST.TOKEN_DISPLAY_MODES.NONE) {
    //         return (this.bars.visible = false);
    //     }

    //     // Custom bar 3
    //     this.bars.bar3 = this.bars.addChild(new PIXI.Graphics());

    //     ["bar1", "bar2", "bar3"].forEach((b, i) => {
    //         let bar = this.bars[b];
    //         const attr = getBarExtendedAttribute.bind(this.document)(b); // : this.document.getBarAttribute(b);
    //         if (!attr || attr.type !== "bar") return (bar.visible = false);
    //         this._drawBar(i, bar, attr);
    //         bar.visible = true;
    //     });

    //     if (!this._canViewMode) {
    //         HEROSYS.log(false, "this._canViewMode is undefined");
    //         return;
    //     }
    //     this.bars.visible = this._canViewMode(this.document.displayBars);
    // }

    // prepareBaseData() {
    //     super.prepareBaseData();
    //     HEROSYS.log(false, "prepareBaseData")
    // }

    // _onCreate(data)
    // {

    //     HEROSYS.log(false, "_onCreate", data)
    //     alert("_onCreate")
    // }

    _onControl(options) {
        if (game.ready) game[HEROSYS.module].effectPanel.refresh();
        if (game.ready && game.combat) {
            game.combat.collection.render();
        }
        return super._onControl(options);
    }

    _onRelease(options) {
        if (game.ready) game[HEROSYS.module].effectPanel.refresh();
        if (game.ready && game.combat) {
            game.combat.collection.render();
        }
        return super._onRelease(options);
    }
}
