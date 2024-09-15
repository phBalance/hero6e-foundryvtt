import { calculateDistanceBetween } from "./range.mjs";

export class Attack {
    static getAttackerToken(item) {
        const attackerToken = item.actor.getActiveTokens()[0] || canvas.tokens.controlled[0];
        if (!attackerToken) {
            console.error("There is no actor token!");
        }
        return attackerToken;
    }

    static getRangeModifier(item, range) {
        const actor = item.actor;

        if (item.system.range === "self") {
            // TODO: Should not be able to use this on anyone else. Should add a check.
            console.log("item.system.range === self && range:", range);
            return 0;
        }

        // TODO: Should consider if the target's range exceeds the power's range or not and display some kind of warning
        //       in case the system has calculated it incorrectly.

        const noRangeModifiers = !!item.findModsByXmlid("NORANGEMODIFIER");
        const normalRange = !!item.findModsByXmlid("NORMALRANGE");

        // There are no range penalties if this is a line of sight power or it has been bought with
        // no range modifiers.
        if (!(item.system.range === "los" || noRangeModifiers || normalRange)) {
            const factor = actor.system.is5e ? 4 : 8;

            let rangePenalty = -Math.ceil(Math.log2(range / factor)) * 2;
            rangePenalty = rangePenalty > 0 ? 0 : rangePenalty;

            // Brace (+2 OCV only to offset the Range Modifier)
            const braceManeuver = item.actor.items.find(
                (item) => item.type == "maneuver" && item.name === "Brace" && item.system.active,
            );
            if (braceManeuver) {
                //TODO: ???
            }
            return Math.floor(rangePenalty);
        }
        return 0;
    }

    static getAttackInfo(item, targetedTokens, options, system) {
        const targets = [];
        for (let i = 0; i < targetedTokens.length; i++) {
            // these are the targeting data used for the attack(s)
            const targetingData = {
                targetId: targetedTokens[i].id,
                results: [], // todo: for attacks that roll one effect and apply to multiple targets do something different here
            };
            targetingData.range = calculateDistanceBetween(system.attackerToken, targetedTokens[i]);
            targetingData.ocv = Attack.getRangeModifier(system.item, targetingData.range);
            targets.push(targetingData);
        }
        return targets;
    }

    static getMultipleAttackInfo(item, targetedTokens, options, system) {
        const targets = [];
        for (let i = 0; i < targetedTokens.length; i++) {
            // these are the targeting data used for the attack(s)
            const targetingData = {
                targetId: targetedTokens[i].id,
                results: [], // todo: for attacks that roll one effect and apply to multiple targets do something different here
            };
            targetingData.range = calculateDistanceBetween(system.attacker, targetedTokens[i]);
            targetingData.ocv = Attack.getRangeModifier(system.item, targetingData.range);
            targets.push(targetingData);
        }
        return targets;
    }

    static getMultipleAttackManeuverInfo(item, targetedTokens, options, system) {
        const attacks = Attack.getMultipleAttackInfo(item, targetedTokens, options, system);
        return {
            attackerTokenId: system.attackerToken?.id ?? null,
            isMultipleAttack: true,
            attacks,
        };
    }
    static getHaymakerManeuverInfo(item, targetedTokens, options, system) {
        const attacks = Attack.getHaymakerAttackInfo(item, targetedTokens, options, system);
        return {
            attackerTokenId: system.attackerToken?.id ?? null,
            isHaymakerAttack: true,
            attacks,
        };
    }

    static getManeuverInfo(item, targetedTokens, options, system) {
        const isMultipleAttack = item.system.XMLID === "MULTIPLEATTACK";
        const isHaymakerAttack = item.system.XMLID === "HAYMAKER";
        // todo: Combined Attack
        // todo: martial maneuver plus a weapon
        // answer: probably a specialized use case of multiple attack

        if (isMultipleAttack) {
            return Attack.getMultipleAttackManeuverInfo(item, targetedTokens, options, system);
        }
        if (isHaymakerAttack) {
            return Attack.getHaymakerManeuverInfo(item, targetedTokens, options, system);
        }
        return {
            attackerTokenId: system.attackerToken?.id ?? null,
            attacks: Attack.getAttackInfo(item, targetedTokens, options, system),
        };
    }

    static getCurrentManeuverInfo(maneuver, options, system) {
        if (options?.execute !== undefined && maneuver.isMultipleAttack) {
            const attackKey = `attack-${options.execute}`;
            const attackKeys = maneuver[attackKey];
            const maneuverItem = system.item.actor.items.get(attackKeys.itemKey);
            const maneuverTarget = system.targetedTokens.find((token) => token.id === attackKeys.targetKey);
            const current = this.getManeuverInfo(maneuverItem, [maneuverTarget], options);
            current.execute = options.execute;
            current.step = attackKey;
            current.item = maneuverItem; // avoid saving forge objects, except in system
            return current;
        }
        return maneuver;
    }

    static getActionInfo(item, targetedTokens, options) {
        // do I need to safety things here?
        if (!item) {
            console.error("There is no attack item!");
            return null;
        }
        const system = {
            attackerToken: Attack.getAttackerToken(item),
            item,
            targetedTokens,
        };
        const maneuver = Attack.getManeuverInfo(item, targetedTokens, options, system); // this.getManeuverInfo(item, targetedTokens, formData);
        const current = Attack.getCurrentManeuverInfo(maneuver, options, system); // get current attack as a 'maneuver' with just the currently executing attack options
        const action = {
            maneuver,
            current,
            system,
        };
        return action;
    }
}
