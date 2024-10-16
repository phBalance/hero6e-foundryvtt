// Turn on Special Vision
export async function activateSpecialVision(item, token) {
    if (!token) return;

    // token might be a PrototypeToken token
    const tokenDocument = token.document || token;

    // Lantern or Torch
    if (item.system.XMLID === "CUSTOMPOWER" && item.system.ALIAS.match(/light/i)) {
        await tokenDocument.update({ "light.bright": parseInt(item.system.QUANTITY) });
    }

    if (!item.baseInfo?.sight) return;

    await tokenDocument.update({
        sight: item.baseInfo.sight,
    });
}

// Remove Special Visions
export async function removeSpecialVisions(token) {
    if (!token) return;

    // token might be a PrototypeToken token
    const tokenDocument = token.document || token;

    // Lantern or Torch
    if (token.actor.items.find((o) => o.system.XMLID === "CUSTOMPOWER" && o.system.ALIAS.match(/light/i))) {
        await tokenDocument.update({ "light.dim": 0, "light.bright": 0 });
    }

    const detectionModes = tokenDocument.detectionModes;
    const basicSight = detectionModes.find((o) => o.id === "basicSight");
    if (basicSight) {
        basicSight.range = 0; // Cannot see things in the dark without special visions
    }
    if (token) {
        await tokenDocument.update({
            sight: { visionMode: "basic", range: 0, color: undefined },
            detectionModes,
        });
    }
}
