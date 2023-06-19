export class HeroSystem6eActorActiveEffects extends ActiveEffect {
    static getEffects() {
        return [
            HeroSystem6eActorActiveEffects.stunEffect,
            HeroSystem6eActorActiveEffects.bleedingEffect,
            HeroSystem6eActorActiveEffects.unconsciousEffect,
            HeroSystem6eActorActiveEffects.deadEffect,
        ];
    }

    static stunEffect = {
        label: "EFFECT.StatusStunned",
        id: "stunned",
        icon: 'icons/svg/daze.svg',
        changes: [
            { key: "system.characteristics.ocv.modifier", value: 0.5, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE },
            { key: "system.characteristics.dcv.modifier", value: 0.5, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE }
        ]
    };

    static bleedingEffect = {
        label: "EFFECT.StatusBleeding",
        id: "bleeding",
        icon: 'icons/svg/blood.svg',
    };

    static unconsciousEffect = {
        label: "EFFECT.StatusUnconscious",
        id: "unconscious",
        icon: 'icons/svg/unconscious.svg',
        changes: [
            { key: "system.characteristics.ocv.modifier", value: 0, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE },
            { key: "system.characteristics.dcv.modifier", value: 0, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE }
        ]
    };

    static deadEffect = {
        label: "EFFECT.StatusDead",
        id: "dead",
        icon: 'icons/svg/skull.svg',
        changes: [
            { key: "system.characteristics.ocv.modifier", value: 0, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE },
            { key: "system.characteristics.dcv.modifier", value: 0, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE }
        ]
    };

    /** @override */
    // apply(actor, change) {
    //     // super.apply(actor, change)
    //     //console.log("apply", change)

    //     // In Hero if we increase MAX then VALUE increases as well
    //     if (change.key.indexOf('.max') > -1 && actor.name == "Aaron1") 
    //     {
    //         let keyBase = change.key.replace(".max", "")
    //         //console.log(keyBase)
    //         let attr= keyBase + '.value'
    //         let newValue = parseInt(foundry.utils.getProperty(actor, attr))

    //         if (change.mode == CONST.ACTIVE_EFFECT_MODES.ADD)
    //         {
    //             newValue += parseInt(change.value)
    //             console.log(actor, change, newValue)
    //             foundry.utils.setProperty(actor, attr, newValue)
    //             //actor.update({ [attr]: newValue})
    //         }


    //         //actor.update({ [keyValue]: newValue})
    //     }
    //     // change.value = Roll.replaceFormulaData(change.value, actor.data);
    //     // try {
    //     //     change.value = Roll.safeEval(change.value).toString();
    //     // } catch (e) {
    //     //     // this is a valid case, e.g., if the effect change simply is a string
    //     // }
    //     return super.apply(actor, change);
    // }

    // _onUpdate(data, options, userId) {
    //     console.log("_onUpdate")
    //     return super._onUpdate(data, options, userId)
    // }
}