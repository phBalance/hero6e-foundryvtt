import { HEROSYS } from "../herosystem6e.mjs";
import { RoundFavorPlayerUp } from "../utility/round.mjs";

export class HeroSystem6eActorActiveEffects extends ActiveEffect {
    static getEffects(module) {
        return Object.keys(HeroSystem6eActorActiveEffects)
            .filter((effectKey) => effectKey.includes("Effect"))
            .sort()
            .map((effectKey) => {
                const heroIcon = HeroSystem6eActorActiveEffects[effectKey].heroIcon;
                if (heroIcon) {
                    HeroSystem6eActorActiveEffects[effectKey].img = `systems/${module}/${heroIcon}`;
                }
                return HeroSystem6eActorActiveEffects[effectKey];
            });
    }

    // A Stunned character’s DCV and DMCV are instantly halved.
    static stunEffect = {
        name: "EFFECT.StatusStunned",
        id: "stunned",
        img: "icons/svg/daze.svg",
        changes: [
            {
                key: "system.characteristics.dcv.value",
                value: 0.5,
                mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY,
            },
            {
                key: "system.characteristics.dmcv.value",
                value: 0.5,
                mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY,
            },
        ],
    };

    static bleedingEffect = {
        name: "EFFECT.StatusBleeding",
        id: "bleeding",
        img: "icons/svg/blood.svg",
    };

    static unconsciousEffect = {
        name: "EFFECT.StatusUnconscious",
        id: "unconscious",
        img: "icons/svg/unconscious.svg",
        changes: [
            {
                key: "system.characteristics.dcv.value",
                value: 0,
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            },
            {
                key: "system.characteristics.dmcv.value",
                value: 0,
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            },
        ],
    };

    static knockedOutEffect = {
        name: "EFFECT.StatusKnockedOut",
        id: "knockedOut",
        img: "icons/svg/stoned.svg",
        changes: [
            {
                key: "system.characteristics.ocv.value",
                value: 0,
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            },
            {
                key: "system.characteristics.omcv.value",
                value: 0,
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            },
            {
                key: "system.characteristics.dcv.value",
                value: 0,
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            },
            {
                key: "system.characteristics.dmcv.value",
                value: 0,
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            },
        ],
    };

    static deadEffect = {
        name: "EFFECT.StatusDead",
        id: "dead",
        img: "icons/svg/skull.svg",
        changes: [
            {
                key: "system.characteristics.ocv.value",
                value: 0,
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            },
            {
                key: "system.characteristics.dcv.value",
                value: 0,
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            },
        ],
    };

    // Temporary BLIND status/effect until enhanced senses can be fully implemented.
    // When a character cannot perceive their opponent with any
    // Targeting Sense, they are at ½ DCV. He’s also at ½ OCV in HTH
    // Combat and 0 OCV in Ranged Combat.
    // As a Half Phase Action, a character can attempt a PER Roll
    // to perceive a particular target with a Nontargeting Sense (at -5 if
    // the Nontargeting Sense is Smell). If successful, then the penalties
    // above are reduced (against that target only) to ½ OCV in HTH or
    // Ranged Combat, and -1 DCV in HTH Combat (full DCV at Range).
    // These effects last until the beginning of the character’s next Phase.
    static blindEffect = {
        name: "EFFECT.StatusBlind",
        id: "blind",
        img: "icons/svg/blind.svg",
        changes: [
            {
                key: "system.characteristics.ocv.value",
                value: 0.5,
                mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY,
            },
            {
                key: "system.characteristics.dcv.value",
                value: 0.5,
                mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY,
            },
        ],
    };

    static asleepEffect = {
        name: "EFFECT.StatusAsleep",
        id: "asleep",
        img: "icons/svg/sleep.svg",
        // changes: [
        //     { key: "system.characteristics.ocv.value", value: 0.5, mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY },
        //     { key: "system.characteristics.dcv.value", value: 0.5, mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY }
        // ]
    };

    static proneEffect = {
        id: "prone",
        name: "EFFECT.StatusProne",
        img: "icons/svg/falling.svg",
        changes: [
            {
                key: "system.characteristics.dcv.value",
                value: 0.5,
                mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY,
            },
        ],
    };

    static entangledEffect = {
        id: "entangled",
        name: "Entangled",
        img: "icons/svg/net.svg",
        changes: [
            {
                key: "system.characteristics.dcv.value",
                value: 0,
                mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY,
            },
            {
                key: "system.characteristics.ocv.value",
                value: 0.5,
                mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY,
            },
        ],
    };

    static paralysisEffect = {
        id: "paralysis",
        name: "EFFECT.StatusParalysis",
        img: "icons/svg/paralysis.svg",
    };

    static flyingEffect = {
        id: "fly",
        name: "EFFECT.StatusFlying",
        img: "icons/svg/wing.svg",
    };

    static deafEffect = {
        id: "deaf",
        name: "EFFECT.StatusDeaf",
        img: "icons/svg/deaf.svg",
    };
    static silencedEffect = {
        id: "silence",
        name: "EFFECT.StatusSilenced",
        img: "icons/svg/silenced.svg",
    };
    static frightenedEffect = {
        id: "fear",
        name: "EFFECT.StatusFear",
        img: "icons/svg/terror.svg",
    };

    static regenEffect = {
        id: "regen",
        name: "EFFECT.StatusRegen",
        img: "icons/svg/regen.svg",
    };

    static aidEffect = {
        id: "upgrade",
        name: "Aid",
        img: "icons/svg/upgrade.svg",
    };

    static drainEffect = {
        id: "downgrade",
        name: "Drain",
        img: "icons/svg/downgrade.svg",
    };

    static invisibleEffect = {
        id: "invisible",
        name: "EFFECT.StatusInvisible",
        img: "icons/svg/invisible.svg",
    };

    static targetedEffect = {
        id: "target",
        name: "EFFECT.StatusTarget",
        img: "icons/svg/target.svg",
    };

    static shieldFireEffect = {
        id: "fireShield",
        name: "Shield: Fire",
        img: "icons/svg/fire-shield.svg",
    };
    static shieldIceEffect = {
        id: "coldShield",
        name: "Shield: Ice",
        img: "icons/svg/ice-shield.svg",
    };
    static shieldMagicEffect = {
        id: "magicShield",
        name: "Shield: Magic",
        img: "icons/svg/mage-shield.svg",
    };
    static shieldHolyEffect = {
        id: "holyShield",
        name: "Shield: holy",
        img: "icons/svg/holy-shield.svg",
    };

    static abortEffect = {
        id: "aborted",
        name: "Aborted",
        heroimg: `icons/aborted.svg`,
    };

    static holdingEffect = {
        id: "holding",
        name: "Holding An Action",
        img: `icons/svg/clockwork.svg`,
    };

    static underwaterEffect = {
        id: "underwater",
        name: "Underwater",
        heroIcon: "icons/underwater.svg",
        changes: [
            {
                key: "system.characteristics.dcv.value",
                value: -2,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            },
        ],
    };

    static standingInWaterEffect = {
        id: "standingInWater",
        name: "Standing In Water",
        heroIcon: "icons/standingInWater.svg",
        changes: [
            {
                key: "system.characteristics.dcv.value",
                value: -2,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            },
        ],
    };

    static holdingBreathEffect = {
        id: "holdingBreath",
        name: "Holding Breath",
        heroIcon: "icons/holdingBreath.svg",
    };

    static grabEffect = {
        id: "grab",
        name: "Grabbed",
        heroIcon: "icons/noun-wrestling-1061808.svg",
        changes: [
            {
                key: "system.characteristics.dcv.value",
                value: 0.5,
                mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY,
            },
        ],
    };

    /**
     * Apply an ActiveEffect that uses a MULTIPLY application mode.
     * Changes which MULTIPLY must be numeric to allow for multiplication.
     * @param {Actor} actor                   The Actor to whom this effect should be applied
     * @param {EffectChangeData} change       The change data being applied
     * @param {*} current                     The current value being modified
     * @param {*} delta                       The parsed value of the change object
     * @param {object} changes                An object which accumulates changes to be applied
     * @private
     */
    _applyMultiply(actor, change, current, delta, changes) {
        let update;
        const ct = foundry.utils.getType(current);
        switch (ct) {
            case "boolean":
                update = current && delta;
                break;
            case "number":
                update = RoundFavorPlayerUp(current * delta);
                break;
        }
        changes[change.key] = update;
    }

    _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);
        game[HEROSYS.module].effectPanel.refresh();
    }

    _onUpdate(options, userId) {
        super._onUpdate(options, userId);
        game[HEROSYS.module].effectPanel.refresh();
    }

    _onDelete(options, userId) {
        super._onDelete(options, userId);
        game[HEROSYS.module].effectPanel.refresh();
    }
}
