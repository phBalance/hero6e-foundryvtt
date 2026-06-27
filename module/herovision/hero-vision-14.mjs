class HeroUnifiedDetectionModeV14 extends foundry.canvas.perception.DetectionMode {
    static get TYPE() {
        return foundry.canvas.perception.DetectionMode.DETECTION_TYPES.SIGHT;
    }

    /**
     * Evaluates sense groups vs invisibility and flash conditions.
     * @override
     */
    _canDetect(visionSource, target, level) {
        const basicCheck = super._canDetect(visionSource, target, level);

        // 1. Validate documents
        const targetToken = target.document?.documentName === "Token" ? target : null;
        const targetActor = targetToken?.actor;
        if (!targetActor) return basicCheck;

        const sourceToken = visionSource.object?.document?.documentName === "Token" ? visionSource.object : null;
        const sourceActor = sourceToken?.actor;
        if (!sourceActor) return basicCheck;

        // 2. Gather state data using sub-functions
        const senses = this._getObserverSenses(sourceToken, sourceActor);
        const targetingGroups = this._getObserverTargetingGroups(sourceActor);
        const targetInvisibility = this._getTargetInvisibility(targetToken, targetActor);

        // 3. Compute V14 Path Measurements
        const waypoints = [
            { x: sourceToken.center.x, y: sourceToken.center.y },
            { x: targetToken.center.x, y: targetToken.center.y },
        ];
        const pathMeasurement = canvas.grid.measurePath(waypoints);
        const distanceInMeters = pathMeasurement?.distance ?? 0;

        // 4. Resolve sensory processing matrix
        return this._resolveSensoryMatrix(senses, targetingGroups, targetInvisibility, distanceInMeters, basicCheck);
    }

    /**
     * Evaluates if the observer's sense groups are active or disabled by flashes.
     * @protected
     */
    _getObserverSenses(sourceToken, sourceActor) {
        return {
            SIGHT:
                !sourceToken.document.hasStatusEffect("blind") &&
                !sourceActor.getFlag("hero6efoundryvttv2", "sightSenseDisabledEffect"),
            HEARING: !sourceActor.getFlag("hero6efoundryvttv2", "hearingSenseDisabledEffect"),
            RADIO: !sourceActor.getFlag("hero6efoundryvttv2", "radioSenseDisabledEffect"),
            SMELL: !sourceActor.getFlag("hero6efoundryvttv2", "smellSenseDisabledEffect"),
            MENTAL: !sourceActor.getFlag("hero6efoundryvttv2", "mentalSenseDisabled"),
            TOUCH: !sourceActor.getFlag("hero6efoundryvttv2", "touchSenseDisabledEffect"),
        };
    }

    /**
     * Checks items to see which sense groups have active targeting capabilities.
     * @protected
     */
    _getObserverTargetingGroups(sourceActor) {
        const checkTargetingItem = (optionIds) =>
            sourceActor.items.some(
                (item) =>
                    item.system.XMLID === "TARGETINGSENSE" && optionIds.includes(item.system.OPTIONID) && item.isActive,
            );

        return {
            RADIO: sourceActor.items.some((item) => item.system.XMLID === "RADAR" && item.isActive),
            HEARING: checkTargetingItem(["NORMALHEARING", "HEARINGGROUP"]),
            SMELL: checkTargetingItem(["NORMALSMELL", "SMELLGROUP"]),
            TOUCH: checkTargetingItem(["NORMALTOUCH", "TOUCHGROUP"]),
            MENTAL: false, // TODO: Mental Awareness
        };
    }

    /**
     * Gathers active invisibility powers and their modifiers from the target.
     * @protected
     */
    _getTargetInvisibility(targetToken, targetActor) {
        const item = targetActor.items.find((i) => i.system.XMLID === "INVISIBILITY" && i.isActive);

        return {
            SIGHT:
                targetToken.document.hasStatusEffect("invisible") ||
                (item && !item.findModsByXmlid("SIGHTGROUP_EXEMPT")),
            HEARING: !!item?.findModsByXmlid("HEARINGGROUP"),
            RADIO: !!item?.findModsByXmlid("RADIOGROUP"),
            SMELL: !!item?.findModsByXmlid("SMELLGROUP"),
            MENTAL: !!item?.findModsByXmlid("MENTALGROUP"),
            TOUCH: !!item?.findModsByXmlid("TOUCHGROUP"),
            NO_FRINGE: !!item?.findModsByXmlid("NOFRINGE"),
            BRIGHT_FRINGE: !!item?.findModsByXmlid("BRIGHTFRINGE"),
        };
    }

    /**
     * Loops through sense groups sequentially to resolve detection status.
     * @protected
     */
    _resolveSensoryMatrix(senses, targeting, inv, distance, basicCheck) {
        // A. Radio Group Sensing
        if (senses.RADIO && targeting.RADIO && !inv.RADIO && distance <= 100) return true;

        // B. Hearing Group Sensing
        if (senses.HEARING && targeting.HEARING && !inv.HEARING && distance <= 40) return true;

        // C. Mental Group Sensing
        if (senses.MENTAL && targeting.MENTAL && !inv.MENTAL && distance <= 80) return true;

        // D. Smell Group Sensing
        if (senses.SMELL && targeting.SMELL && !inv.SMELL && distance <= 20) return true;

        // E. Touch Group Sensing (Requires physical contact / adjacent hex spacing)
        if (senses.TOUCH && targeting.TOUCH && !inv.TOUCH && distance <= 1) return true;

        // F. Sight Group Base & Fringe Processing
        if (senses.SIGHT) {
            if (inv.SIGHT) {
                if (inv.NO_FRINGE) return false;
                const maxFringeRange = inv.BRIGHT_FRINGE ? 16 : 2;
                return distance <= maxFringeRange;
            }
            return basicCheck;
        }

        return false;
    }
}

// ==========================================
// 3. REGISTRATION INITIALIZATION
// ==========================================
export function initializeHeroVisionV14() {
    const isV14 = game.release ? game.release.generation >= 14 : false;
    if (!isV14) return;

    CONFIG.Canvas.detectionModes["heroUnifiedDetectionV14"] = new HeroUnifiedDetectionModeV14({
        id: "heroUnifiedDetectionV14",
        label: "HERO: Sensory Processor (v14)",
        type: foundry.canvas.perception.DetectionMode.DETECTION_TYPES.SIGHT,
    });

    CONFIG.Canvas.visionModes["heroUnifiedVisionV14"] = new foundry.canvas.perception.VisionMode({
        id: "heroUnifiedVisionV14",
        label: "HERO: Dynamic System Vision",
        tokenConfig: true,
        detectionMode: "heroUnifiedDetectionV14",
        canvas: {},
    });
}
