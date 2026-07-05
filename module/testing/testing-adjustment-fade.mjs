import { getPowerInfo } from "../utility/util.mjs";
import { HeroSystem6eItem } from "../item/item.mjs";
import { _onApplyAdjustmentToSpecificToken } from "../item/item-attack.mjs";

/**
 * Registers the Aid power fade evaluation test batch with Quench.
 * Ensures strict switch-case type loops, asynchronous cleanup parity, and keeps titles under 60 characters.
 *
 * @param {Object} quench - The external Quench module testing framework instance.
 */
export function registerAdjustmentFadeTests(quench) {
    quench.registerBatch(
        `${game.system.id}.adjustmentPowerFades`,
        (context) => {
            const { describe, it, assert, after } = context;

            describe.only("Aid Power Baseline Allocation", () => {
                let testActor = null;
                let testTokenDoc = null;
                let createdItem = null;

                after(async () => {
                    if (testTokenDoc) {
                        await testTokenDoc.delete();
                    }
                    if (testActor) {
                        await testActor.delete();
                    }
                });

                it("Should create a PC actor with an embedded Aid STR power", async () => {
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
                    assert.equal(createdItem.name, "Aid STR", "Item metadata matches debugging session.");
                });

                it("Should accurately process debugger mock adjustment value", async () => {
                    assert.ok(testActor, "Verify test actor context placeholder exists.");
                    assert.ok(createdItem, "Verify adjustment power item document exists.");

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

                    const mockDamageDetail = {
                        body: 0,
                        stun: 3,
                        effects: " x1 STUN (8x1=8); x1 BODY (0x1=0);",
                        stunDamage: 8,
                        bodyDamage: 0,
                    };

                    const mockDefense = "5 normal; 0 resistant";
                    const mockDefenseTags = [{}];

                    const mockAction = {
                        current: {},
                        maneuver: {},
                        system: {},
                    };

                    const strBefore = testActor.system.characteristics.str.value;

                    // 1. ADVANCED RACE BOUNDARY CONFIGURATION:
                    // Fixed to guarantee absolute hook unlinking even on a timeout rejection.
                    let appHookId = null;
                    let appTimerId = null;

                    const appSettledPromise = new Promise((resolve, reject) => {
                        appHookId = Hooks.on("updateActor", (actor) => {
                            if (actor.id === testActor.id) {
                                if (appTimerId) clearTimeout(appTimerId);
                                Hooks.off("updateActor", appHookId); // Prune listener on successful database catch
                                resolve(actor);
                            }
                        });

                        appTimerId = setTimeout(() => {
                            Hooks.off("updateActor", appHookId); // CRITICAL FIX: Cleanly prune the listener if the timeout races first!
                            reject(
                                new Error(
                                    "Timeout: System failed to execute updateActor adjustment transaction within 1000ms.",
                                ),
                            );
                        }, 1000);
                    });

                    // 2. Fire your standalone backend function
                    await _onApplyAdjustmentToSpecificToken(
                        createdItem,
                        testTokenDoc,
                        mockDamageDetail,
                        mockDefense,
                        mockDefenseTags,
                        mockAction,
                    );

                    // 3. Pause safely behind the clean defensive race execution net
                    const actorWithAid = await appSettledPromise;

                    actorWithAid.prepareData();
                    const strWithAid = actorWithAid.system.characteristics.str.value;

                    assert.ok(
                        strWithAid > strBefore,
                        "The system successfully adjusted target characteristic values upward.",
                    );

                    // ─── SECOND-BY-SECOND DYNAMIC CLOCK MARCH ───
                    let currentStrTrack = strWithAid;
                    let totalElapsedSeconds = 0;
                    let startingWorldTime = game.time.worldTime;

                    while (currentStrTrack > strBefore) {
                        totalElapsedSeconds++;

                        let recordedWorldTimeInTick = null;
                        let updatedActorInTick = null;
                        let timeHookId = null;
                        let actorHookId = null;
                        let tickTimerId = null;

                        const tickTrackingPromise = new Promise((resolve) => {
                            timeHookId = Hooks.on("updateWorldTime", (currentTime) => {
                                Hooks.off("updateWorldTime", timeHookId);
                                recordedWorldTimeInTick = currentTime;

                                if (totalElapsedSeconds % 12 !== 0) {
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
                            }, 500);
                        });

                        await game.time.advance(1);
                        await tickTrackingPromise;

                        const expectedWorldTime = startingWorldTime + totalElapsedSeconds;
                        assert.equal(
                            recordedWorldTimeInTick ?? game.time.worldTime,
                            expectedWorldTime,
                            `World time clock desynchronization detected at second ${totalElapsedSeconds}.`,
                        );

                        if (updatedActorInTick) {
                            updatedActorInTick.prepareData();
                            currentStrTrack = updatedActorInTick.system.characteristics.str.value;
                        }

                        const relativeSecondInTurn = totalElapsedSeconds % 12;
                        if (relativeSecondInTurn !== 0) {
                            assert.equal(
                                currentStrTrack,
                                strWithAid - Math.floor(totalElapsedSeconds / 12) * 5,
                                `Premature fade detected at second ${totalElapsedSeconds}.`,
                            );
                        } else {
                            const totalTurnsCompleted = totalElapsedSeconds / 12;
                            const expectedStrAfterTurn = Math.max(strBefore, strWithAid - totalTurnsCompleted * 5);

                            assert.equal(
                                currentStrTrack,
                                expectedStrAfterTurn,
                                `Turn boundary verification failed at second ${totalElapsedSeconds}.`,
                            );
                        }
                    }

                    const finalPrunedActor = await fromUuid(testActor.uuid);
                    assert.equal(
                        finalPrunedActor.effects.size,
                        0,
                        "The adjustment active effect document was successfully pruned.",
                    );
                });
            });
        },
        { displayName: "HERO: Adjustment Power Fade Matrix" },
    );
}
