import { HEROSYS } from "../herosystem6e.mjs";
import { RoundFavorPlayerUp } from "../utility/round.mjs";

export class HeroSystem6eActorActiveEffects extends ActiveEffect {
    // All status effects
    static statusEffectsObj;

    static initialize(module) {
        HeroSystem6eActorActiveEffects.statusEffectsObj = Object.freeze({
            // A Stunned character’s DCV and DMCV are instantly halved.
            stunEffect: {
                name: game.i18n.localize("EFFECT.StatusStunned"),
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
            },
            bleedingEffect: {
                name: game.i18n.localize("EFFECT.StatusBleeding"),
                id: "bleeding",
                img: "icons/svg/blood.svg",
            },
            unconsciousEffect: {
                name: game.i18n.localize("EFFECT.StatusUnconscious"),
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
            },
            knockedOutEffect: {
                name: game.i18n.localize("EFFECT.StatusKnockedOut"),
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
            },
            deadEffect: {
                name: game.i18n.localize("EFFECT.StatusDead"),
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
            },
            asleepEffect: {
                name: game.i18n.localize("EFFECT.StatusAsleep"),
                id: "asleep",
                img: "icons/svg/sleep.svg",
                // changes: [
                //     { key: "system.characteristics.ocv.value", value: 0.5, mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY },
                //     { key: "system.characteristics.dcv.value", value: 0.5, mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY }
                // ]
            },
            proneEffect: {
                id: "prone",
                name: game.i18n.localize("EFFECT.StatusProne"),
                img: "icons/svg/falling.svg",
                changes: [
                    {
                        key: "system.characteristics.dcv.value",
                        value: 0.5,
                        mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY,
                    },
                ],
            },
            entangledEffect: {
                id: "entangled",
                name: game.i18n.localize("EFFECT.StatusEntangled"),
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
            },
            paralyzedEffect: {
                id: "paralysis",
                name: game.i18n.localize("EFFECT.StatusParalyzed"),
                img: "icons/svg/paralysis.svg",
            },
            flyingEffect: {
                id: "fly",
                name: game.i18n.localize("EFFECT.StatusFlying"),
                img: "icons/svg/wing.svg",
            },
            frightenedEffect: {
                id: "fear",
                name: game.i18n.localize("EFFECT.StatusFear"),
                img: "icons/svg/terror.svg",
            },
            regenerationEffect: {
                id: "regeneration",
                name: game.i18n.localize("EFFECT.StatusRegeneration"),
                img: "icons/svg/regen.svg",
            },
            aidEffect: {
                id: "upgrade",
                name: game.i18n.localize("EFFECT.StatusAdjustmentAid"),
                img: "icons/svg/upgrade.svg",
            },
            drainEffect: {
                id: "downgrade",
                name: game.i18n.localize("EFFECT.StatusAdjustmentDrain"),
                img: "icons/svg/downgrade.svg",
            },
            invisibleEffect: {
                id: "invisible",
                name: game.i18n.localize("EFFECT.StatusInvisible"),
                img: "icons/svg/invisible.svg",
            },
            targetedEffect: {
                id: "target",
                name: game.i18n.localize("EFFECT.StatusTargeted"),
                img: "icons/svg/target.svg",
            },
            abortEffect: {
                id: "aborted",
                name: game.i18n.localize("EFFECT.Aborted"),
                img: `systems/${module}/icons/aborted.svg`,
            },
            holdingEffect: {
                id: "holding",
                name: game.i18n.localize("EFFECT.HoldingAnAction"),
                img: `icons/svg/clockwork.svg`,
            },
            underwaterEffect: {
                id: "underwater",
                name: game.i18n.localize("EFFECT.Underwater"),
                img: `systems/${module}/icons/underwater.svg`,
                changes: [
                    {
                        key: "system.characteristics.dcv.value",
                        value: -2,
                        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    },
                ],
            },
            standingInWaterEffect: {
                id: "standingInWater",
                name: game.i18n.localize("EFFECT.StandingInWater"),
                img: `systems/${module}/icons/standingInWater.svg`,
                changes: [
                    {
                        key: "system.characteristics.dcv.value",
                        value: -2,
                        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    },
                ],
            },
            holdingBreathEffect: {
                id: "holdingBreath",
                name: game.i18n.localize("EFFECT.HoldingBreath"),
                img: `systems/${module}/icons/holdingBreath.svg`,
            },
            grabEffect: {
                id: "grab",
                name: "Grabbed",
                img: `systems/${module}/icons/noun-wrestling-1061808.svg`,
                changes: [
                    {
                        key: "system.characteristics.dcv.value",
                        value: 0.5,
                        mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY,
                    },
                ],
            },
            braceEffect: {
                id: "brace",
                name: "Braced",
                img: "icons/svg/statue.svg",
                changes: [
                    {
                        key: "system.characteristics.dcv.value",
                        value: 0.5,
                        mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY,
                    },
                ],
            },
            nonCombatMovementEffect: {
                id: "nonCombatMovement",
                name: "NonCombat Movement",
                img: `systems/${module}/icons/person-running.svg`,
                changes: [
                    {
                        key: "system.characteristics.dcv.value",
                        value: 0.5,
                        mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY,
                    },
                ],
            },
            haymakerEffect: {
                id: "haymaker",
                name: "Haymaker",
                img: `icons/svg/sword.svg`,
                changes: [
                    {
                        key: "system.characteristics.dcv.value",
                        value: -5,
                        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    },
                ],
            },
            silencedEffect: {
                id: "silence",
                name: game.i18n.localize("EFFECT.StatusSilenced"),
                img: "icons/svg/silenced.svg",
            },
            dangerSenseDisabledEffect: {
                id: "dangerSenseDisabled",
                name: game.i18n.localize("EFFECT.StatusSenseDangerDisabled"),
                img: `systems/${module}/icons/senses/dangerSenseDisabled.svg`,
            },
            detectSenseDisabledEffect: {
                id: "detectSenseDisabled",
                name: game.i18n.localize("EFFECT.StatusSenseDetectDisabled"),
                img: `systems/${module}/icons/senses/detectSenseDisabled.svg`,
            },
            hearingSenseDisabledEffect: {
                id: "hearingSenseDisabled",
                name: game.i18n.localize("EFFECT.StatusSenseHearingDisabled"),
                img: "icons/svg/deaf.svg",
            },
            mentalSenseDisabledEffect: {
                id: "mentalSenseDisabled",
                name: game.i18n.localize("EFFECT.StatusSenseMentalDisabled"),
                img: `systems/${module}/icons/senses/mentalSenseDisabled.svg`,
            },
            radioSenseDisabledEffect: {
                id: "radioSenseDisabled",
                name: game.i18n.localize("EFFECT.StatusSenseRadioDisabled"),
                img: `systems/${module}/icons/senses/radioSenseDisabled.svg`,
            },
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
            sightSenseDisabledEffect: {
                id: "blind",
                name: game.i18n.localize("EFFECT.StatusSenseSightDisabled"),
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
            },
            smellTasteSenseDisabledEffect: {
                id: "smellTasteSenseDisabled",
                name: game.i18n.localize("EFFECT.StatusSenseSmellTasteDisabled"),
                img: `systems/${module}/icons/senses/smellTasteSenseDisabled.svg`,
            },
            sonarSenseDisabledEffect: {
                id: "sonarSenseDisabled",
                name: game.i18n.localize("EFFECT.StatusSenseSonarDisabled"),
                img: `systems/${module}/icons/senses/sonarSenseDisabled.svg`,
            },
            spatialAwarenessSenseDisabledEffect: {
                id: "spatialAwarenessSenseDisabled",
                name: game.i18n.localize("EFFECT.StatusSenseSpatialAwarenessDisabled"),
                img: `systems/${module}/icons/senses/spatialAwarenessSenseDisabled.svg`,
            },
            touchSenseDisabledEffect: {
                id: "touchSenseDisabled",
                name: game.i18n.localize("EFFECT.StatusSenseTouchDisabled"),
                img: `systems/${module}/icons/senses/touchSenseDisabled.svg`,
            },
            burrowEffect: {
                id: "tunneling",
                name: "EFFECT.StatusTunneling",
                img: "icons/svg/mole.svg",
            },
        });

        // Return an array of status effects in alphabetical order
        return Object.keys(HeroSystem6eActorActiveEffects.statusEffectsObj)
            .sort()
            .map((key) => HeroSystem6eActorActiveEffects.statusEffectsObj[key]);
    }

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
