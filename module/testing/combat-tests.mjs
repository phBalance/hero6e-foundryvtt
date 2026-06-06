// module/testing/combat-tests.mjs

/**
 * Registers an exhaustive, edge-case resilient speed chart progression suite with Quench.
 * Validates ultra-high speeds, complete characteristic drains, and recurring Post-Seg 12 boundaries.
 * @param {object} quench - The global Quench test engine instance reference
 */
export function registerCombatTests(quench) {
    quench.registerBatch(
        "hero6efoundryvttv2.combat.speed-chart-progression",
        (context) => {
            const { after, before, describe, expect, it } = context;

            const foundryVersion = game.release?.version ?? "Unknown V13/Prior";
            const generationLabel = game.release?.generation ?? 13;

            describe.only(`Hero System 6e Speed Chart Turn Progression Matrix (Foundry Gen: ${generationLabel})`, function () {
                const actorDocuments = [];
                let testCombatDocument = null;

                before(async function () {
                    console.log(
                        `[hero6efoundryvttv2] QUENCH | Platform Version: ${foundryVersion} (Gen ${generationLabel})`,
                    );
                    console.log(`[hero6efoundryvttv2] QUENCH | Spawning tactical speed chart test entities...`);

                    // 1. Standard Guard (SPD=3, DEX=18) -> Segments: 4, 8, 12
                    actorDocuments.push(
                        await Actor.create({
                            name: "Test Guard (SPD 3)",
                            type: "pc",
                            system: {
                                initiativeCharacteristic: "dex",
                                characteristics: { dex: { value: 18 }, spd: { value: 3 } },
                            },
                        }),
                    );

                    // 2. Standard Behemoth (SPD=4, DEX=8) -> Segments: 3, 6, 9, 12
                    actorDocuments.push(
                        await Actor.create({
                            name: "Test Behemoth (SPD 4)",
                            type: "pc",
                            system: {
                                initiativeCharacteristic: "dex",
                                characteristics: { dex: { value: 8 }, spd: { value: 4 } },
                            },
                        }),
                    );

                    // 3. Cosmic Speedster (SPD=12, DEX=25) -> Acts on EVERY segment (1-12)
                    actorDocuments.push(
                        await Actor.create({
                            name: "Test Speedster (SPD 12)",
                            type: "pc",
                            system: {
                                initiativeCharacteristic: "dex",
                                characteristics: { dex: { value: 25 }, spd: { value: 12 } },
                            },
                        }),
                    );

                    // 4. Sluggish Turret (SPD=1, DEX=5) -> Segments: 7
                    actorDocuments.push(
                        await Actor.create({
                            name: "Test Sluggish (SPD 1)",
                            type: "pc",
                            system: {
                                initiativeCharacteristic: "dex",
                                characteristics: { dex: { value: 5 }, spd: { value: 1 } },
                            },
                        }),
                    );

                    // 5. Aided Mutant (SPD=13, DEX=12) -> Overcapped boundary, acts on EVERY segment (1-12)
                    actorDocuments.push(
                        await Actor.create({
                            name: "Test Overcapped (SPD 13)",
                            type: "pc",
                            system: {
                                initiativeCharacteristic: "dex",
                                characteristics: { dex: { value: 12 }, spd: { value: 13 } },
                            },
                        }),
                    );

                    // 6. Drained Target (SPD=-1, DEX=10) -> Drained below 0, should NEVER act
                    actorDocuments.push(
                        await Actor.create({
                            name: "Test Drained (SPD -1)",
                            type: "pc",
                            system: {
                                initiativeCharacteristic: "dex",
                                characteristics: { dex: { value: 10 }, spd: { value: -1 } },
                            },
                        }),
                    );
                });

                after(async function () {
                    console.log(`[hero6efoundryvttv2] QUENCH | Cleaning up test documents...`);
                    for (const actor of actorDocuments) {
                        await actor.delete();
                    }
                    if (testCombatDocument) {
                        await testCombatDocument.delete();
                    }
                });

                it("Should execute an exhaustive 2-round progression across edge cases and recoveries", async function () {
                    testCombatDocument = await Combat.create({
                        scene: canvas.scene?.id || null,
                        active: true,
                    });

                    const combatantData = actorDocuments.map((actor) => ({
                        actorId: actor.id,
                        tokenId: null,
                        hidden: false,
                    }));
                    await testCombatDocument.createEmbeddedDocuments("Combatant", combatantData);

                    // Force local document sync states
                    testCombatDocument.combatants.forEach((c) => {
                        let targetSpd = 3;
                        if (c.name.includes("SPD 4")) targetSpd = 4;
                        else if (c.name.includes("SPD 12")) targetSpd = 12;
                        else if (c.name.includes("SPD 1")) targetSpd = 1;
                        else if (c.name.includes("SPD 13")) targetSpd = 13;
                        else if (c.name.includes("SPD -1")) targetSpd = -1;

                        if (c.actor?.system?.characteristics?.spd) {
                            c.actor.system.characteristics.spd.value = targetSpd;
                        }
                        c.actor?.prepareData();
                        c.prepareData();
                    });

                    await testCombatDocument.startCombat();

                    // ─── ROUND 1 MATRIX ADVANCEMENT ───
                    expect(testCombatDocument.segment).to.equal(12);
                    expect(testCombatDocument.round).to.equal(1);
                    expect(testCombatDocument.combatant.name).to.include("Speedster");

                    await testCombatDocument.nextTurn();
                    expect(testCombatDocument.combatant.name).to.include("Guard");

                    await testCombatDocument.nextTurn();
                    expect(testCombatDocument.combatant.name).to.include("Overcapped");

                    await testCombatDocument.nextTurn();
                    expect(testCombatDocument.combatant.name).to.include("Behemoth");

                    // Advance out of Segment 12 -> 1st Post-12 Recovery triggers -> Rolls over to Round 2, Segment 1
                    await testCombatDocument.nextTurn();
                    console.log(
                        `[hero6efoundryvttv2] ROUND TRANSITION TRACE | Round: ${testCombatDocument.round}, Seg: ${testCombatDocument.segment}, Actor: ${testCombatDocument.combatant?.name}`,
                    );

                    expect(testCombatDocument.round).to.equal(2);
                    expect(testCombatDocument.segment).to.equal(1);
                    expect(testCombatDocument.combatant.name).to.include("Speedster");

                    // ─── ROUND 2 MATRIX ADVANCEMENT ───
                    await testCombatDocument.nextTurn();
                    expect(testCombatDocument.segment).to.equal(1);
                    expect(testCombatDocument.combatant.name).to.include("Overcapped");

                    // Segment 2
                    await testCombatDocument.nextTurn();
                    expect(testCombatDocument.segment).to.equal(2);
                    expect(testCombatDocument.combatant.name).to.include("Speedster");

                    await testCombatDocument.nextTurn();
                    expect(testCombatDocument.combatant.name).to.include("Overcapped");

                    // Segment 3
                    await testCombatDocument.nextTurn();
                    expect(testCombatDocument.segment).to.equal(3);
                    expect(testCombatDocument.combatant.name).to.include("Speedster");

                    await testCombatDocument.nextTurn();
                    expect(testCombatDocument.combatant.name).to.include("Overcapped");

                    await testCombatDocument.nextTurn();
                    expect(testCombatDocument.combatant.name).to.include("Behemoth");

                    // Segment 4
                    await testCombatDocument.nextTurn();
                    expect(testCombatDocument.segment).to.equal(4);
                    expect(testCombatDocument.combatant.name).to.include("Speedster");

                    await testCombatDocument.nextTurn();
                    expect(testCombatDocument.combatant.name).to.include("Guard");

                    await testCombatDocument.nextTurn();
                    expect(testCombatDocument.combatant.name).to.include("Overcapped");

                    // Fast-forward Segment 5 (2 turns) & Segment 6 (3 turns)
                    await testCombatDocument.nextTurn(); // Speedster Seg 5
                    await testCombatDocument.nextTurn(); // Overcapped Seg 5
                    await testCombatDocument.nextTurn(); // Speedster Seg 6
                    await testCombatDocument.nextTurn(); // Overcapped Seg 6
                    await testCombatDocument.nextTurn(); // Behemoth Seg 6

                    // Enters Segment 7 - Sluggish (SPD 1) acts!
                    await testCombatDocument.nextTurn();
                    expect(testCombatDocument.segment).to.equal(7);
                    expect(testCombatDocument.combatant.name).to.include("Speedster");

                    await testCombatDocument.nextTurn();
                    expect(testCombatDocument.combatant.name).to.include("Overcapped");

                    await testCombatDocument.nextTurn();
                    expect(testCombatDocument.combatant.name).to.include("Sluggish");

                    // Step remaining Round 2 phases (Seg 8 to 11)
                    await testCombatDocument.nextTurn(); // Speedster Seg 8
                    await testCombatDocument.nextTurn(); // Guard Seg 8
                    await testCombatDocument.nextTurn(); // Overcapped Seg 8
                    await testCombatDocument.nextTurn(); // Speedster Seg 9
                    await testCombatDocument.nextTurn(); // Overcapped Seg 9
                    await testCombatDocument.nextTurn(); // Behemoth Seg 9
                    await testCombatDocument.nextTurn(); // Speedster Seg 10
                    await testCombatDocument.nextTurn(); // Overcapped Seg 10
                    await testCombatDocument.nextTurn(); // Speedster Seg 11
                    await testCombatDocument.nextTurn(); // Overcapped Seg 11

                    // Segment 12 (Round 2)
                    await testCombatDocument.nextTurn();
                    expect(testCombatDocument.segment).to.equal(12);
                    expect(testCombatDocument.round).to.equal(2);
                    expect(testCombatDocument.combatant.name).to.include("Speedster");

                    await testCombatDocument.nextTurn(); // Guard
                    await testCombatDocument.nextTurn(); // Overcapped
                    await testCombatDocument.nextTurn(); // Behemoth

                    // ─── 2ND POST-SEGMENT 12 ROLLOVER SUCCESS ───
                    await testCombatDocument.nextTurn();
                    console.log(
                        `[hero6efoundryvttv2] FINAL ROLLOVER SUCCESS | Round: ${testCombatDocument.round}, Seg: ${testCombatDocument.segment}, Actor: ${testCombatDocument.combatant?.name}`,
                    );

                    expect(testCombatDocument.round).to.equal(3);
                    expect(testCombatDocument.segment).to.equal(1);
                    expect(testCombatDocument.combatant.name).to.include("Speedster");

                    // ─── VERIFY DRAIN BARRIER INTEGRITY ───
                    const drainedCombatant = testCombatDocument.combatants.find((c) => c.name.includes("Drained"));
                    expect(drainedCombatant).to.be.ok;

                    testCombatDocument.combatants.forEach((c) => {
                        if (c.name.includes("Drained")) {
                            const activePhasesCount = [];
                            for (let s = 1; s <= 12; s++) {
                                if (c.hasPhaseInSegment?.(s)) activePhasesCount.push(s);
                            }
                            expect(activePhasesCount.length).to.equal(0);
                        }
                    });
                });
            });
        },
        { displayName: "HERO SYSTEM 6E: Speed Chart Combat Validation" },
    );
}
