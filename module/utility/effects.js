import { HeroSystem6eItemSheet } from '../item/item-sheet.js'
import { HeroSystem6eItem } from '../item/item.js'
import { HeroSystem6eActor } from '../actor/actor.js'

export async function onManageActiveEffect(event, owner) {
    event.preventDefault();
    const a = event.currentTarget;
    const li = a.closest("tr") || a.closest("li");
    if (!li) return
    //const effect = li.dataset.effectId ? owner.effects.get(li.dataset.effectId) : null;
    const effect = Array.from(owner.allApplicableEffects()).find(o => o.id == li.dataset.effectId)

    // guard
    if (!effect) return;

    switch (a.dataset.action) {
        case "create":
            return owner.createEmbeddedDocuments("ActiveEffect", [{
                label: "New Effect",
                icon: "icons/svg/aura.svg",
                origin: owner.uuid,
                disabled: true,
                //   "duration.rounds": li.dataset.effectType === "temporary" ? 1 : undefined,
                //   disabled: li.dataset.effectType === "inactive"
            }]);
        case "edit":
            if (!effect) return
            return effect.sheet.render(true);
        case "delete":
            if (!effect) return
            const confirmed = await Dialog.confirm({
                title: game.i18n.localize("HERO6EFOUNDRYVTTV2.confirms.deleteConfirm.Title") + " [" + effect.name + "]",
                content: game.i18n.localize("HERO6EFOUNDRYVTTV2.confirms.deleteConfirm.Content")
            });

            if (confirmed) {
                await effect.delete()

                let actor = effect.parent instanceof HeroSystem6eActor ? effect.parent : effect.parent.actor

                // Characteristic VALUE should not exceed MAX
                for (let char of Object.keys(actor.system.characteristics)) {
                    if (actor.system.characteristics[char].value > actor.system.characteristics[char].max) {
                        await actor.update({ [`system.characteristics.${char}.value`]: actor.system.characteristics[char].max })
                        //updates.push({[`system.characteristics.${char}.value`]: parseInt(actor.system.characteristics[char].max)});
                    }
                }
            }
            return
        case "toggle":
            if (!effect) return
            onActiveEffectToggle(effect)
            return
    }
}

export async function onActiveEffectToggle(effect, newState) {

    if (newState == undefined) {
        await effect.update({ disabled: !effect.disabled })
        newState = effect.disabled
    } else {
        await effect.update({ disabled: newState })
    }

    // If this is an item update active state
    const origin = await fromUuid(effect.origin);
    const item = origin instanceof HeroSystem6eItem ? origin : effect.parent
    const actor = item?.actor || (item instanceof HeroSystem6eActor ? item : null) //(origin instanceof HeroSystem6eActor ? origin : null)
    if (item) {
        await item.update({ 'system.active': newState })
    }

    let updates = [];

    // Characteristic VALUE should be increased when toggled on
    if (newState == false) { // disabled == false
        for (let change of effect.changes) {
            // system.characteristics.stun.max
            const charMatch = change.key.match("characteristics\.(.+)\.max")
            if (charMatch) {
                const char = charMatch[1]
                await actor.update({
                    [`system.characteristics.${char}.value`]: parseInt(actor.system.characteristics[char].value) + parseInt(change.value)
                })
                //updates.push({[`system.characteristics.${char}.value`]: parseInt(actor.system.characteristics[char].value) + parseInt(change.value)});
            }
        }
    }

    // Characteristic VALUE should not exceed MAX
    for (let char of Object.keys(actor.system.characteristics)) {
        if (actor.system.characteristics[char].value > actor.system.characteristics[char].max) {
            await actor.update({ [`system.characteristics.${char}.value`]: actor.system.characteristics[char].max })
            //updates.push({[`system.characteristics.${char}.value`]: parseInt(actor.system.characteristics[char].max)});
        }
    }

    //await actor.update(changes);
    //await actor.update(updates);

    // Re-render all open HeroSystem6eItemSheets.
    // TODO: Limit to just updating the ItemSheets associated with this actor or ActiveEffect
    // for (const w of Object.values(ui.windows)) {
    //     //if (w instanceof HeroSystem6eItemSheet) {
    //     w.render()
    //     //}
    // }
    // return
}