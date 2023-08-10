import { CombatSkillLevelsForAttack } from '../utility/damage.js';
import { _processAttackOptions } from '../item/item-attack.js';


export class ItemAttackFormApplication extends FormApplication {
  constructor(data) {
    super();
    this.data = data;
    this.options.title = `${this.data?.item?.actor?.name} roll to hit`
  }

  static get defaultOptions() {
    let options = super.defaultOptions
    options = mergeObject(options, {
      classes: ['form'],
      popOut: true,
      template: `systems/hero6efoundryvttv2/templates/attack/item-attack-application.hbs`,
      id: 'item-attack-form-application',
      //title: `${actor.name} roll to hit`,
    });
    return options
  }

  getData() {
    const data = this.data;
    console.log(data);
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find(".combat-skill-levels input").change((event) => this._updateCsl(event, html));
  }

  async _updateObject(event, formData) {
    console.log(formData);
    return _processAttackOptions(this.data.item, formData);

  }

  async _updateCsl(event, formData) {
    const item = this.data.item
    // Combat Skill Levels (update SKILL if changed)
    const csl = CombatSkillLevelsForAttack(item);
    const checked = formData.find(".combat-skill-levels input:checked");
    if (csl && checked) {
      let updateRequired = false;
      for (let input of checked) {
        let m = input.name.match(/\.(\w+)\.(\d+)/);
        let name = m[1];
        let idx = m[2];

        if (csl.skill.system.csl[idx] != input.value) {
          csl.skill.system.csl[idx] = input.value;
          updateRequired = true;
        }
      }
      if (updateRequired) {
        await csl.skill.update({ 'system.csl': csl.skill.system.csl });
      }


    }
  }
}

window.ItemAttackFormApplication = ItemAttackFormApplication;