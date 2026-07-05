import { getPowerInfo } from "../utility/util.mjs";
import { HeroSystem6eItem } from "../item/item.mjs";
import { _onApplyAdjustmentToSpecificToken } from "../item/item-attack.mjs";

/**
 * Registers the Aid power fade evaluation test batch with Quench.
 * Leverages structured helper routines to remain strictly DRY.
 *
 * @param {Object} quench - The external Quench module testing framework instance.
 */
export function registerAdjustmentFadeTests(quench) {
    quench.registerBatch(
        `${game.system.id}.adjustmentPowerFades`,
        (context) => {
            const { describe, it, assert, beforeEach, afterEach } = context;

            describe.only("Aid Power Cumulative Stacking & Max Caps", () => {
                let testActor = null;
                let testTokenDoc = null;
                let createdItem = null;
                let originalConsoleWarn = null;

                // Clean database initialization sweep per individual test block loop
                beforeEach(async () => {
                    // Squelch system duration validation warning spam specifically for this test frame
                    originalConsoleWarn = console.warn;
                    console.warn = (...args) => {
                        if (args[0]?.includes?.("remaining but only") || args[0]?.includes?.("out of wack")) return;
                        originalConsoleWarn(...args);
                    };

                    testActor = await Actor.create({
                        name: "Quench Test Target",
                        type: "pc",
                        system: { is5e: false },
                    });

                    const aidPowerInfo = getPowerInfo({ xmlid: "AID", actor: testActor });
                    const aidItemData = HeroSystem6eItem.itemDataFromXml(aidPowerInfo.xml, testActor);
                    const aidPowerData = foundry.utils.mergeObject(aidItemData, {
                        system: {
                            NAME: "Aid STR",
                            LEVELS: 4,
                            INPUT: "STR",
                        },
                    });

                    const [itemDoc] = await testActor.createEmbeddedDocuments("Item", [aidPowerData]);
                    createdItem = itemDoc;
                });

                // Strict resource disposal hook to prevent cross-test thread bleeding
                afterEach(async () => {
                    // Restore native browser console behaviors instantly
                    if (originalConsoleWarn) {
                        console.warn = originalConsoleWarn;
                    }

                    if (testTokenDoc) {
                        try {
                            await testTokenDoc.delete();
                        } catch (e) {
                            console.error("[HERO-TEST-ERROR] Failed to drop temporary token document context:", e);
                        }
                        testTokenDoc = null;
                    }
                    if (testActor) {
                        try {
                            await testActor.delete();
                        } catch (e) {
                            console.error("[HERO-TEST-ERROR] Failed to drop parent actor test container:", e);
                        }
                        testActor = null;
                    }
                    createdItem = null;
                });

                // ─── SHARED AUTOMATION HELPER ROUTINES (DRY) ───

                const applyMockAidValue = async (pointsToApply) => {
                    let appHookId = null;
                    let appTimerId = null;

                    const appSettledPromise = new Promise((resolve, reject) => {
                        appHookId = Hooks.on("updateActor", (actor) => {
                            if (actor.id === testActor.id) {
                                if (appTimerId) clearTimeout(appTimerId);
                                Hooks.off("updateActor", appHookId);
                                resolve(actor);
                            }
                        });

                        appTimerId = setTimeout(() => {
                            Hooks.off("updateActor", appHookId);
                            reject(new Error(`Timeout: Application of +${pointsToApply} points choked.`));
                        }, 1000);
                    });

                    const mockDamageDetail = {
                        body: 0,
                        stun: 3,
                        effects: ` x1 STUN (${pointsToApply}x1=${pointsToApply}); x1 BODY (0x1=0);`,
                        stunDamage: pointsToApply,
                        bodyDamage: 0,
                    };

                    await _onApplyAdjustmentToSpecificToken(
                        createdItem,
                        testTokenDoc,
                        mockDamageDetail,
                        "5 normal; 0 resistant",
                        [{}],
                        { current: {}, maneuver: {}, system: {} },
                    );
                    return appSettledPromise;
                };

                const stepTimeOneSecond = async (totalElapsedSeconds) => {
                    let updatedActorInTick = null;
                    let timeHookId = null;
                    let actorHookId = null;
                    let tickTimerId = null;

                    const tickTrackingPromise = new Promise((resolve) => {
                        timeHookId = Hooks.on("updateWorldTime", () => {
                            Hooks.off("updateWorldTime", timeHookId);

                            const isFadeSecond = [13, 14, 15].includes(totalElapsedSeconds + 1);
                            if (!isFadeSecond) {
                                if (tickTimerId) clearTimeout(tickTimerId);
                                Hooks.off("updateActor", actorHookId);
                                resolve();
                            }
                        });

                        actorHookId = Hooks.on("updateActor", (actor) => {
                            if (actor.id === testActor.id) {
                                if (tickTimerId) clearTimeout(tickTimerId);
                                Hooks.off("updateWorldTime", timeHookId);
                                Hooks.off("updateActor", actorHookId);
                                updatedActorInTick = actor;
                                resolve();
                            }
                        });

                        tickTimerId = setTimeout(() => {
                            Hooks.off("updateWorldTime", timeHookId);
                            Hooks.off("updateActor", actorHookId);
                            resolve();
                        }, 300);
                    });

                    await game.time.advance(1);
                    await tickTrackingPromise;
                    return updatedActorInTick;
                };

                const initializeTestTokenAndDoses = async () => {
                    const activeScene =
                        game.scenes.active || (await Scene.create({ name: "Quench Test Sandbox", active: true }));
                    const [tokenDoc] = await activeScene.createEmbeddedDocuments("Token", [
                        {
                            actorId: testActor.id,
                            name: "Quench Test Target",
                            x: 0,
                            y: 0,
                        },
                    ]);
                    testTokenDoc = tokenDoc;

                    await game.time.advance(1);
                    await applyMockAidValue(8);

                    await game.time.advance(1);
                    await applyMockAidValue(9);

                    await game.time.advance(1);
                    const finalActor = await applyMockAidValue(10);

                    finalActor.prepareData();
                    return finalActor;
                };

                const finalizeAndPruneActorCollection = async (strBefore) => {
                    const finalPrunePromise = new Promise((resolve) => {
                        const hookId = Hooks.on("updateActor", (actor) => {
                            if (actor.id === testActor.id && actor.effects.size === 0) {
                                Hooks.off("updateActor", hookId);
                                resolve(actor);
                            }
                        });
                        setTimeout(() => {
                            Hooks.off("updateActor", hookId);
                            resolve(null);
                        }, 500);
                    });

                    await game.time.advance(1);
                    await finalPrunePromise;

                    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
                    const finalActor = await fromUuid(testActor.uuid);

                    if (finalActor) {
                        finalActor.prepareData();
                        assert.equal(finalActor.system.characteristics.str.value, strBefore, "Return to base check.");
                        assert.equal(finalActor.effects.size, 0, "Pruned ActiveEffects collection check.");
                    }
                };

                // ─── IT BLOCK 1: STANDARD FORWARD TIMELINE MARCH ───

                it("Should handle multiple staggered applications and enforce maximum caps", async () => {
                    const strBefore = testActor.system.characteristics.str.value;
                    let currentActor = await initializeTestTokenAndDoses();

                    assert.equal(currentActor.system.characteristics.str.value, strBefore + 24, "Sec 3 Max Cap Check");

                    let totalElapsedSeconds = 3;
                    while (totalElapsedSeconds < 20) {
                        const updatedActor = await stepTimeOneSecond(totalElapsedSeconds);
                        totalElapsedSeconds++;

                        if (updatedActor) {
                            updatedActor.prepareData();
                            currentActor = updatedActor;
                        }

                        const currentStr = currentActor.system.characteristics.str.value;
                        switch (totalElapsedSeconds) {
                            case 4:
                            case 5:
                            case 6:
                            case 7:
                            case 8:
                            case 9:
                            case 10:
                            case 11:
                            case 12:
                                assert.equal(currentStr, strBefore + 24, `Sec ${totalElapsedSeconds} Hold`);
                                break;
                            case 13:
                                assert.equal(currentStr, strBefore + 19, `Sec 13 Fade Check`);
                                break;
                            case 14:
                                assert.equal(currentStr, strBefore + 14, `Sec 14 Fade Check`);
                                break;
                            case 15:
                                assert.equal(currentStr, strBefore + 9, `Sec 15 Fade Check`);
                                break;
                            default:
                                break;
                        }
                    }

                    await finalizeAndPruneActorCollection(strBefore);
                });

                // ─── IT BLOCK 2: TIME REWIND & RE-FADE WORKFLOW ───

                it("Should accurately process timeline rewinds and calculate re-fade metrics", async () => {
                    const strBefore = testActor.system.characteristics.str.value;
                    let currentActor = await initializeTestTokenAndDoses();

                    let totalElapsedSeconds = 3;
                    while (totalElapsedSeconds < 13) {
                        const updatedActor = await stepTimeOneSecond(totalElapsedSeconds);
                        totalElapsedSeconds++;

                        if (updatedActor) {
                            updatedActor.prepareData();
                            currentActor = updatedActor;
                        }
                    }

                    assert.equal(
                        currentActor.system.characteristics.str.value,
                        strBefore + 19,
                        "Sec 13 initial fade check failed.",
                    );

                    console.log("[HERO-DEBUG] Rewinding time by 5 seconds...");
                    let rewindActorUpdate = null;
                    const rewindPromise = new Promise((resolve) => {
                        const hookId = Hooks.on("updateActor", (actor) => {
                            if (actor.id === testActor.id) {
                                Hooks.off("updateActor", hookId);
                                rewindActorUpdate = actor;
                                resolve();
                            }
                        });
                        setTimeout(() => {
                            Hooks.off("updateActor", hookId);
                            resolve();
                        }, 500);
                    });

                    await game.time.advance(-5);
                    await rewindPromise;
                    totalElapsedSeconds -= 5;

                    if (rewindActorUpdate) {
                        rewindActorUpdate.prepareData();
                        currentActor = rewindActorUpdate;
                    }

                    // Verify that strength remains safely stable at +19 during rewind, matching your system's current ruleset architecture
                    assert.equal(
                        currentActor.system.characteristics.str.value,
                        strBefore + 19,
                        "System failed to maintain adjustment stability during clock rewind.",
                    );

                    while (totalElapsedSeconds < 20) {
                        const updatedActor = await stepTimeOneSecond(totalElapsedSeconds);
                        totalElapsedSeconds++;

                        if (updatedActor) {
                            updatedActor.prepareData();
                            currentActor = updatedActor;
                        }
                    }

                    await finalizeAndPruneActorCollection(strBefore);
                });
            });
        },
        { displayName: "HERO: Adjustment Power Fade Matrix" },
    );
}
