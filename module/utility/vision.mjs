export function setPerceptionModes() {
    // CONFIG.Canvas.visionModes.heroSight = new VisionMode({
    //     id: "heroSight",
    //     label: "VISION.HeroSight",
    //     canvas: {
    //         shader: ColorAdjustmentsSamplerShader,
    //         //uniforms: { enable: true, contrast: 0, saturation: -1.0, brightness: 0 },
    //         uniforms: { brightness: 0, contrast: 0, darknessLevel: 0, saturation: -1 },
    //     },
    //     lighting: {
    //         levels: {
    //             // from core-bundled darkvision mode: maybe restore?
    //             //[VisionMode.LIGHTING_LEVELS.DIM]: VisionMode.LIGHTING_LEVELS.BRIGHT,
    //         },
    //         background: { visibility: VisionMode.LIGHTING_VISIBILITY.REQUIRED },
    //     },
    //     vision: {
    //         darkness: { adaptive: false },
    //         defaults: { contrast: 0, saturation: -1, brightness: 0.1 },
    //     },
    // });

    // Hero Generic Sense
    CONFIG.Canvas.detectionModes.heroSense = CONFIG.Canvas.detectionModes.feelTremor.clone();
    CONFIG.Canvas.detectionModes.heroSense.id = "heroSense";
    CONFIG.Canvas.detectionModes.heroSense.label = "Hero Sense";
    CONFIG.Canvas.detectionModes.heroSense.type = DetectionMode.DETECTION_TYPES.SIGHT;
    CONFIG.Canvas.detectionModes.heroSense.walls = true;

    // new DetectionMode({
    //     id: "heroSense",
    //     label: "Hero Sense",
    //     type: DetectionMode.DETECTION_TYPES.SIGHT,
    // });

    // NIGHTVISION
    // Allows a character to see in total darkness as if it were normal
    // daylight. Therefore, this effect does not penetrate the Power
    // Darkness, but it does offset some forms of Change Environment
    // that obscure vision.
    // CONFIG.Canvas.detectionModes.heroNightVision = new DetectionMode({
    //     id: "nightvision",
    //     label: "VISION.NightVision",
    //     type: DetectionMode.DETECTION_TYPES.SIGHT,
    // });
}

// class ThoughtsDetectionMode extends DetectionMode {
//     constructor() {
//         super({
//             id: "thoughtsense",
//             label: "PF2E.Actor.Creature.Sense.Type.Thoughts",
//             walls: false,
//             angle: false,
//             type: DetectionMode.DETECTION_TYPES.OTHER,
//         });
//     }
//     static getDetectionFilter() {
//         const filter2 = (this._detectionFilter ??= OutlineOverlayFilter.create({
//             wave: true,
//             knockout: false,
//         }));
//         return (filter2.thickness = 1), filter2;
//     }
//     _canDetect(visionSource, target) {
//         return (
//             target instanceof CONFIG.Token.objectClass /*TokenPF2e*/ &&
//             !target.document.hidden &&
//             !target.actor?.isOfType("loot") &&
//             !target.actor?.system.traits.value.includes("mindless") &&
//             super._canDetect(visionSource, target)
//         );
//     }
// }

// Turn on Special Vision
// export async function activateSpecialVision(item, token) {
//     if (!token) return;

//     // token might be a PrototypeToken token
//     const tokenDocument = token.document || token;

//     // Lantern or Torch
//     if (item.system.XMLID === "CUSTOMPOWER" && item.system.ALIAS.match(/light/i)) {
//         await tokenDocument.update({ "light.bright": parseInt(item.system.QUANTITY) });
//     }

//     if (!item.baseInfo?.sight) return;

//     const detectionModes = tokenDocument.detectionModes;
//     const basicSight = detectionModes.find((o) => o.id === "basicSight");
//     if (basicSight) {
//         basicSight.range = null; // Cannot see things in the dark without special visions
//     }

//     await tokenDocument.update({
//         sight: item.baseInfo.sight,
//         detectionModes,
//     });
// }

// Remove Special Visions
// export async function removeSpecialVisions(token) {
//     if (!token) return;

//     // token might be a PrototypeToken token
//     const tokenDocument = token.document || token;

//     // Lantern or Torch
//     if (token.actor.items.find((o) => o.system.XMLID === "CUSTOMPOWER" && o.system.ALIAS.match(/light/i))) {
//         await tokenDocument.update({ "light.dim": 0, "light.bright": 0 });
//     }

//     const detectionModes = tokenDocument.detectionModes;
//     const basicSight = detectionModes.find((o) => o.id === "basicSight");
//     if (basicSight) {
//         basicSight.range = 0; // Cannot see things in the dark without special visions
//     }
//     if (token) {
//         await tokenDocument.update({
//             sight: { visionMode: "basic", range: 0, color: undefined },
//             detectionModes,
//         });
//     }
// }
