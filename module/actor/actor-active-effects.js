export class HeroSystem6eActorActiveEffects extends ActiveEffect {

    // Rhair3 suggestion:
    // First line is Dead / Unconscious/Asleep/Stunned
    // Second Line: Prone/ Entangled/Paralysed/Flying
    // Third Line: Blind/ Deaf/ Mute/Frightened
    // Forth Line: Burning/Frozen/Shocked/Corroding
    // Fith Line: Bleeding/Diseased/Poisoned/Cursed
    // Sixth Line: Regenerating/Degenerationg/Aid/Drain
    // seventh Line: Invisible/ Targeted/ Marked/ Blessed
    // Last Line: Fire Shield/ Ice Shield/ Magic Shield/ Holy Shield

    static getEffects() {
        return Object.keys(HeroSystem6eActorActiveEffects)
            .filter(o => o.includes('Effect'))
            .sort()
            .map(o => HeroSystem6eActorActiveEffects[o])
        // return [
        //     HeroSystem6eActorActiveEffects.blindEffect,
        //     HeroSystem6eActorActiveEffects.bleedingEffect,
        //     HeroSystem6eActorActiveEffects.deadEffect,
        //     HeroSystem6eActorActiveEffects.stunEffect,
        //     HeroSystem6eActorActiveEffects.unconsciousEffect,
        // ];
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

    static knockedOutEffect = {
        label: "EFFECT.StatusKnockedOut",
        id: "knockedOut",
        icon: 'icons/svg/stoned.svg',
        changes: [
            { key: "system.characteristics.ocv.value", value: 0, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE },
            { key: "system.characteristics.omcv.value", value: 0, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE },
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
        // changes: [
        //     { key: "system.characteristics.ocv.value", value: 0.5, mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY },
        //     { key: "system.characteristics.dcv.value", value: 0.5, mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY }
        // ]
    };

    static asleepEffect = {
        label: "EFFECT.StatusAsleep",
        id: "asleep",
        icon: 'icons/svg/sleep.svg',
        // changes: [
        //     { key: "system.characteristics.ocv.value", value: 0.5, mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY },
        //     { key: "system.characteristics.dcv.value", value: 0.5, mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY }
        // ]
    };

    static proneEffect = {
        id: "prone",
        name: "EFFECT.StatusProne",
        icon: "icons/svg/falling.svg"
    };

    static entangledEffect = {
        id: "entangled",
        name: "Entangled",
        icon: "icons/svg/net.svg"
    };

    static paralysisEffect = {
        id: "paralysis",
        name: "EFFECT.StatusParalysis",
        icon: "icons/svg/paralysis.svg"
    };

    static flyingEffect = {
        id: "fly",
        name: "EFFECT.StatusFlying",
        icon: "icons/svg/wing.svg"
    };

    static deafEffect = {
        id: "deaf",
        name: "EFFECT.StatusDeaf",
        icon: "icons/svg/deaf.svg"
    };
    static silencedEffect = {
        id: "silence",
        name: "EFFECT.StatusSilenced",
        icon: "icons/svg/silenced.svg"
    };
    static freightenedEffect = {
        id: "fear",
        name: "EFFECT.StatusFear",
        icon: "icons/svg/terror.svg"
    };

    static regenEffect = {
        id: "regen",
        name: "EFFECT.StatusRegen",
        icon: "icons/svg/regen.svg"
    };

    static aidEffect = {
        id: "upgrade",
        name: "Aid",
        icon: "icons/svg/upgrade.svg"
    };

    static drainEffect = {
        id: "downgrade",
        name: "Drain",
        icon: "icons/svg/downgrade.svg"
    };

    static invisibleEffect = {
        id: "invisible",
        name: "EFFECT.StatusInvisible",
        icon: "icons/svg/invisible.svg"
    };

    static targetedEffect = {
        id: "target",
        name: "EFFECT.StatusTarget",
        icon: "icons/svg/target.svg"
    };

    static shieldFireEffect = {
        id: "fireShield",
        name: "Shield: Fire",
        icon: "icons/svg/fire-shield.svg"
    };
    static shieldIceEffect = {
        id: "coldShield",
        name: "Shield: Ice",
        icon: "icons/svg/ice-shield.svg"
    };
    static shieldMagicEffect = {
        id: "magicShield",
        name: "Shield: Magic",
        icon: "icons/svg/mage-shield.svg"
    };
    static shieldHolyEffect = {
        id: "holyShield",
        name: "Shield: holy",
        icon: "icons/svg/holy-shield.svg"
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