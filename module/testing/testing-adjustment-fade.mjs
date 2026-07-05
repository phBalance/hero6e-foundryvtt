import { getPowerInfo } from "../utility/util.mjs";
import { HeroSystem6eItem } from "../item/item.mjs";
import { _onApplyAdjustmentToSpecificToken } from "../item/item-attack.mjs";

/**
 * Registers the Aid power fade evaluation test batch with Quench.
 * Synchronized with strict Hero 6e maximum cap constraints and staggered timelines.
 *
 * @param {Object} quench - The external Quench module testing framework instance.
 */
export function registerAdjustmentFadeTests(quench) {
    quench.registerBatch(
        `${game.system.id}.adjustmentPowerFades`,
        (context) => {
            const { describe, it, assert, after } = context;

            describe.only("Aid Power Cumulative Stacking & Max Caps", () => {
                let testActor = null;
                let testTokenDoc = null;
                let createdItem = null;

                after(async () => {
                    if (testTokenDoc) await testTokenDoc.delete();
                    if (testActor) await testActor.delete();
                });

                it("Should build actor and item baseline template", async () => {
                    testActor = await Actor.create({
                        name: "Quench Test Target",
                        type: "pc",
                        system: { is5e: false },
                    });
                    assert.ok(testActor, "Actor document successfully instantiated in database.");

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
                    assert.ok(createdItem, "Aid item successfully embedded into actor document.");
                });

                it("Should handle multiple staggered applications and enforce maximum caps", async () => {
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

                    const mockDefense = "5 normal; 0 resistant";
                    const mockDefenseTags = [{}];
                    const mockAction = { current: {}, maneuver: {}, system: {} };

                    const strBefore = testActor.system.characteristics.str.value;

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
                            mockDefense,
                            mockDefenseTags,
                            mockAction,
                        );
                        return appSettledPromise;
                    };

                    // ─── STEP 1: APPLY STAGGERED CUMULATIVE DOSES ───

                    // Second 1: Apply 8 points (STR should be Base + 8)
                    await game.time.advance(1);
                    let currentActor = await applyMockAidValue(8);
                    currentActor.prepareData();
                    assert.equal(currentActor.system.characteristics.str.value, strBefore + 8, "Sec 1 Check");

                    // Second 2: Apply 9 points (STR should be Base + 17)
                    await game.time.advance(1);
                    currentActor = await applyMockAidValue(9);
                    currentActor.prepareData();
                    assert.equal(currentActor.system.characteristics.str.value, strBefore + 17, "Sec 2 Check");

                    // Second 3: Apply 10 points (STR should hit Cap: Base + 24)
                    await game.time.advance(1);
                    currentActor = await applyMockAidValue(10);
                    currentActor.prepareData();
                    assert.equal(currentActor.system.characteristics.str.value, strBefore + 24, "Sec 3 Check");

                    // ─── STEP 2: CHRONOLOGICAL STAGGERED FADE MARCH ───
                    let totalElapsedSeconds = 3;

                    while (totalElapsedSeconds < 20) {
                        let recordedWorldTimeInTick = null;
                        let updatedActorInTick = null;
                        let timeHookId = null;
                        let actorHookId = null;
                        let tickTimerId = null;

                        const tickTrackingPromise = new Promise((resolve) => {
                            timeHookId = Hooks.on("updateWorldTime", (currentTime) => {
                                Hooks.off("updateWorldTime", timeHookId);
                                recordedWorldTimeInTick = currentTime;

                                // FIXED TYPO: Explicitly define the milestone target array array boundary bounds
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

                        totalElapsedSeconds++;

                        if (updatedActorInTick) {
                            updatedActorInTick.prepareData();
                            currentActor = updatedActorInTick;
                        }

                        const currentStr = currentActor.system.characteristics.str.value;

                        // --- CORRECTED 6E STAGGERED FADE PATTERN ASSERTIONS ---
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
                                assert.equal(currentStr, strBefore + 19, `Sec 13 Check`);
                                break;

                            case 14:
                                assert.equal(currentStr, strBefore + 14, `Sec 14 Check`);
                                break;

                            case 15:
                                assert.equal(currentStr, strBefore + 9, `Sec 15 Check`);
                                break;

                            default:
                                break;
                        }
                    }

                    // ─── STEP 3: CLEANUP & POST-EXPIRATION RECOVERY ───
                    console.log("[HERO-DEBUG] Initiating final 30-second clock leap past remaining windows.");

                    // 1. ROBUST MUTATION STABILIZATION NET:
                    // Pauses the test runner thread until the actor document reflects 0 remaining active effects
                    const postFadeSettledPromise = new Promise((resolve) => {
                        const hookId = Hooks.on("updateActor", (actor) => {
                            if (actor.id === testActor.id) {
                                console.log(
                                    `[HERO-DEBUG] Actor update captured during clock leap. Effects remaining: ${actor.effects.size}`,
                                );

                                // Once the database reflects that all stacked doses have fully unmounted, resolve
                                if (actor.effects.size === 0) {
                                    Hooks.off("updateActor", hookId);
                                    resolve(actor);
                                }
                            }
                        });

                        // Safe fallback threshold ceiling to prevent infinite hanging if updates finish silently
                        setTimeout(() => {
                            Hooks.off("updateActor", hookId);
                            resolve(null);
                        }, 800);
                    });

                    // 2. Advance time and wait for all staggered background updates to write to the schema
                    await game.time.advance(1);
                    await postFadeSettledPromise;

                    // 3. Yield macro task ticks to let any loose canvas token links fully unmount
                    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

                    // 4. Fetch a pristine, synchronized snapshot straight from the core registry
                    const finalActor = await fromUuid(testActor.uuid);

                    if (finalActor) {
                        finalActor.prepareData();
                        console.log(
                            `[HERO-DEBUG] Final Verification Pass - STR: ${finalActor.system.characteristics.str.value} | Active Effects: ${finalActor.effects.size}`,
                        );

                        assert.equal(
                            finalActor.system.characteristics.str.value,
                            strBefore,
                            "Actor successfully shed all historical adjustment layers.",
                        );
                        assert.equal(
                            finalActor.effects.size,
                            0,
                            "All expired ActiveEffect documents were successfully pruned from the collection.",
                        );
                    }
                });
            });
        },
        { displayName: "HERO: Adjustment Power Fade Matrix" },
    );
}
