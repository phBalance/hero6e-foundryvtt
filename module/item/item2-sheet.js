import { HeroSystem6eItem, getItem } from './item.js'
import { editSubItem, deleteSubItem, isPowerSubItem } from '../powers/powers.js'
import { HEROSYS } from '../herosystem6e.js'
import { onManageActiveEffect } from '../utility/effects.js'
import { AdjustmentSources } from '../utility/adjustment.js'
import { updateItemDescription } from '../utility/upload_hdc.js'
import { getPowerInfo } from '../utility/util.js'

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class HeroSystem6eItem2Sheet extends ItemSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['herosystem6e', 'sheet', 'item'],
            width: 520,
            height: 660,
            //tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'description' }],
            scrollY: [".sheet-body"],
        })
    }

    /** @override */
    get template() {
        const path = 'systems/hero6efoundryvttv2/templates/item'
        // Return a single sheet for all item types.
        return `${path}/item-sheet.hbs`

    }

    /* -------------------------------------------- */

    /** @override */
    getData() {
        const data = super.getData()


        data.config = CONFIG.HERO
        data.alphaTesting = game.settings.get(game.system.id, 'alphaTesting')

        // Easy reference to ActiveEffects with an origin of this item
        // if (this.actor) {
        //     data.effects = this.actor.effects.filter(o => o.origin === item.uuid)
        // } else {
        //     data.effects = this.document.effects
        // }

        
        const item = data.item;
        const configPowerInfo = getPowerInfo({ xmlid: item.system.XMLID, actor: item?.actor })
        data.sheet = { ...configPowerInfo?.sheet || {} };
        data.totalingOptions = configPowerInfo ? configPowerInfo.powerType.includes("characteristic") : null;

        // OPTIONID
        if (item.system.OPTIONID && !data.sheet.OPTIONID?.label) {
            data.sheet.OPTIONID = {
                label: "OPTIONID"
            }
        }

        // INPUT
        if (item.system.INPUT && !data.sheet.INPUT?.label) {
            data.sheet.INPUT = {
                label: "INPUT"
            }
        }

        // SFX
        data.sheet.SFX = {
            //dataList: sfx
            label: "SFX",
            selectOptions: CONFIG.HERO.SFX.reduce( (current, item) => {
                current[item] = item;
                return current;
              }, {})
            
        }

        // LEVELS
        data.sheet.LEVELS = {
            label: "LEVELS"
        }

        return data
    }

    /* -------------------------------------------- */

    /** @override */
    // setPosition(options = {}) {
    //     const position = super.setPosition(options)
    //     const sheetBody = this.element.find('.sheet-body')
    //     const bodyHeight = position.height - 192
    //     sheetBody.css('height', bodyHeight)
    //     return position
    // }

    /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
        super.activateListeners(html)
    }


    async _updateObject(event, formData) {
        console.log("_updateObject")
        event.preventDefault()

        // Totaling Options
        // Add to Primary Value: AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes"
        // Add to Secondary Value: AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes" 
        // Do not add to Totals: AFFECTS_PRIMARY="No" AFFECTS_TOTAL="No" 

        // For some reason updating LEVELS.value to a numeric 0 results in [object object].
        if (formData['system.LEVELS.value'] ) {
            formData['system.LEVELS.value'] = (parseInt(formData['system.LEVELS.value']) || 0).toString();
            formData['system.LEVELS.max'] = (parseInt(formData['system.LEVELS.max']) || 0).toString();
        }

        // The description may have changed
        let description = this.item.system.description;

        // Stadndard UpdateObject
        await super._updateObject(event, formData);

        // If Description changed, update it
        updateItemDescription(this.item);
        if (description != this.item.system.description) {
            this.item.update({ 'system.description': this.item.system.description })
        }

    }

}
