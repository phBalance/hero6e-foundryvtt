export class HeroSystem6eActorActiveEffects extends ActiveEffect {
    static getEffects() {
        return [
            HeroSystem6eActorActiveEffects.stunEffect,
            HeroSystem6eActorActiveEffects.bleedingEffect,
            HeroSystem6eActorActiveEffects.unconsciousEffect,
            HeroSystem6eActorActiveEffects.deadEffect,
            HeroSystem6eActorActiveEffects.blindEffect,
        ];
    }

    // A Stunned character’s DCV and DMCV are instantly halved.
    static stunEffect = {
        label: "EFFECT.StatusStunned",
        id: "stunned",
        icon: 'icons/svg/daze.svg',
        changes: [
            { key: "system.characteristics.dcv.value", value: 0.5, mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY },
            { key: "system.characteristics.dmcv.value", value: 0.5, mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY }
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
            { key: "system.characteristics.dcv.value", value: 0, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE },
            { key: "system.characteristics.dmcv.value", value: 0, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE }
        ]
    };

    static deadEffect = {
        label: "EFFECT.StatusDead",
        id: "dead",
        icon: 'icons/svg/skull.svg',
        changes: [
            { key: "system.characteristics.ocv.value", value: 0, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE },
            { key: "system.characteristics.dcv.value", value: 0, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE }
        ]
    };

    // Temporary BLIND status/effect until enhanced senses can be fully implemented.
    // When a character cannot perceive his opponent with any
    // Targeting Sense, he is at ½ DCV. He’s also at ½ OCV in HTH
    // Combat and 0 OCV in Ranged Combat.
    // As a Half Phase Action, a character can attempt a PER Roll
    // to perceive a particular target with a Nontargeting Sense (at -5 if
    // the Nontargeting Sense is Smell). If successful, then the penalties
    // above are reduced (against that target only) to ½ OCV in HTH or
    // Ranged Combat, and -1 DCV in HTH Combat (full DCV at Range).
    // These effects last until the beginning of the character’s next Phase.
    static blindEffect = {
        label: "EFFECT.StatusBlind",
        id: "blind",
        icon: 'icons/svg/blind.svg',
        changes: [
            { key: "system.characteristics.ocv.value", value: 0.5, mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY },
            { key: "system.characteristics.dcv.value", value: 0.5, mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY }
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