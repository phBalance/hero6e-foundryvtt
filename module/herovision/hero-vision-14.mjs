// ==========================================
// 1. THE UNIFIED DETECTOR (V14 RESTRICTED)
// ==========================================

class HeroUnifiedDetectionModeV14 extends DetectionMode {
    // static get TYPE() {
    //     return DetectionMode.DETECTION_TYPES.SIGHT;
    // }
    // _canDetect(visionSourceToken, target) {
    //     const basicCheck = super._canDetect(visionSourceToken, target);
    //     const targetToken = target.object;
    //     if (!(targetToken instanceof Token) || !targetToken.actor) return basicCheck;
    //     const sourceActor = visionSourceToken.object?.actor;
    //     if (!sourceActor) return basicCheck;
    //     // HERO Rules Evaluation via Active Effect flags
    //     const hasRadar = !!sourceActor.getFlag("hero6efoundryvttv2", "hasRadarSense");
    //     const isInvisibleToSight =
    //         targetToken.document.statusEffects.includes("invisible") ||
    //         !!targetToken.actor.getFlag("hero6efoundryvttv2", "isInvisibleToSight");
    //     const p1 = { x: visionSourceToken.center.x, y: visionSourceToken.center.y };
    //     const p2 = { x: targetToken.center.x, y: targetToken.center.y };
    //     const distance = canvas.grid.getDistance(p1, p2);
    //     if (hasRadar) {
    //         if (distance <= 60) return true; // Radar range parameters
    //     }
    //     if (isInvisibleToSight) {
    //         return distance <= 14; // Fringe visibility boundary
    //     }
    //     return basicCheck;
    // }
    // _testStatus(visionSourceToken, target) {
    //     return true;
    // }
}

// ==========================================
// 2. V14 SPECIFIC REGISTRATION & INJECTION
// ==========================================

export function initializeHeroVisionV14() {
    // const isV14 = game.release ? game.release.generation >= 14 : false;
    // if (!isV14) return;
    // console.log("HeroSystem6e | Initializing Master V14 Dynamic Vision Engine.");
    // // A. Register Detection Mode logic
    // CONFIG.Canvas.detectionModes["heroUnifiedV14"] = new HeroUnifiedDetectionModeV14({
    //     id: "heroUnifiedV14",
    //     label: "HERO: Sensory Processor (v14)",
    //     type: DetectionMode.DETECTION_TYPES.SIGHT,
    // });
    // // B. Register standard Vision Mode dropdown configuration
    // CONFIG.Canvas.visionModes["heroUnifiedV14"] = new VisionMode({
    //     id: "heroUnifiedV14",
    //     label: "HERO: Dynamic System Vision",
    //     tokenConfig: true,
    //     detectionMode: "heroUnifiedV14",
    //     canvas: {},
    // });
    // // ====================================================================
    // // THE COMPLIANT V14 INJECTION PIPELINE: Intercepting PointVisionSource
    // // Bypasses both database schemas and layer loop conflicts safely!
    // // ====================================================================
    // // Intercept the native initialization step of PointVisionSource in V14
    // const originalInitialize = foundry.canvas.sources.PointVisionSource.prototype._initialize;
    // foundry.canvas.sources.PointVisionSource.prototype._initialize = function (data) {
    //     // 1. Allow the core V14 engine to structure standard source parameters
    //     originalInitialize.call(this, data);
    //     // 2. Fetch the corresponding Token document configuration
    //     const tokenDoc = this.object?.document;
    //     // 3. Inspect if the token is using our custom vision system dropdown option
    //     if (tokenDoc?.sight?.visionMode === "heroUnifiedV14") {
    //         // Ensure the runtime collection exists as a valid array
    //         this.detectionModes = this.detectionModes || [];
    //         // Avoid duplication if the engine performs multiple quick recalcs
    //         const hasProcessor = this.detectionModes.some((m) => m.id === "heroUnifiedV14");
    //         if (!hasProcessor) {
    //             // Push a runtime definition straight into the WebGL vision source profile
    //             this.detectionModes.push({
    //                 id: "heroUnifiedV14",
    //                 range: tokenDoc.sight.range || 100, // Seamless slider matching
    //                 enabled: true,
    //             });
    //         }
    //     }
    // };
}
