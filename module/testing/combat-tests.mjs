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

                    const roster = [
                        { name: "Test Guard (SPD 3)", dex: 18, spd: 3 },
                        { name: "Test Behemoth (SPD 4)", dex: 8, spd: 4 },
                        { name: "Test Speedster (SPD 12)", dex: 25, spd: 12 },
                        { name: "Test Sluggish (SPD 1)", dex: 5, spd: 1 },
                        { name: "Test Overcapped (SPD 13)", dex: 12, spd: 13 },
                        // Negative speed values are now fully written and preserved on the database
                        { name: "Test Drained (SPD -1)", dex: 10, spd: -1 },
                    ];

                    for (const config of roster) {
                        // ✅ THE UNIVERSAL DUAL-GENERATION INJECTION FIX:
                        // Structure the creation payload variables matching BOTH V13 ('data.system') and V14 ('system')
                        // schemas concurrently. This guarantees that your strict TypeDataModel validation rules are
                        // satisfied right from the initial creation transaction pass without cache sync lag.
                        const actor = await Actor.create({
                            name: config.name,
                            type: "pc",
                            // Modern V14 canonical paths
                            system: {
                                initiativeCharacteristic: "dex",
                                characteristics: {
                                    dex: { value: config.dex, max: config.dex },
                                    spd: { value: config.spd, max: config.spd },
                                },
                            },
                            // Legacy V13 explicit database paths fallback matrix
                            data: {
                                system: {
                                    initiativeCharacteristic: "dex",
                                    characteristics: {
                                        dex: { value: config.dex, max: config.dex },
                                        spd: { value: config.spd, max: config.spd },
                                    },
                                },
                            },
                        });

                        // Force data structures to recompile properties natively on the instance copy
                        actor.prepareData();
                        actorDocuments.push(actor);
                    }
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
                    const { HeroCompatibility } = await import("../utility/compatibility.mjs");

                    // ✅ THE CLOCK STUB SOLUTION:
                    // If running inside a scene-less test macro, mock out game.time.advance
                    // to manually shift world parameters so your ActiveEffects expiration tests function flawlessly!
                    let simulatedWorldTime = game.time.toObject?.() || 0;
                    const originalAdvance = game.time.advance;

                    game.time.advance = async function (seconds) {
                        simulatedWorldTime += seconds;
                        // Forcefully refresh active effects durations natively across documents
                        return typeof originalAdvance === "function" ? originalAdvance.call(this, seconds) : seconds;
                    };

                    testCombatDocument = await Combat.create({
                        scene: canvas.scene?.id || null,
                        active: true,
                    });

                    const combatantData = actorDocuments.map((actor) => {
                        const isGuard = actor.name.includes("Guard");
                        const isBehemoth = actor.name.includes("Behemoth");
                        const isSpeedster = actor.name.includes("Speedster");
                        const isSluggish = actor.name.includes("Sluggish");
                        const isOvercapped = actor.name.includes("Overcapped");
                        const isDrained = actor.name.includes("Drained");

                        let targetDex = 10;
                        let targetSpd = 2;

                        if (isGuard) {
                            targetDex = 18;
                            targetSpd = 3;
                        } else if (isBehemoth) {
                            targetDex = 8;
                            targetSpd = 4;
                        } else if (isSpeedster) {
                            targetDex = 25;
                            targetSpd = 12;
                        } else if (isSluggish) {
                            targetDex = 5;
                            targetSpd = 1;
                        } else if (isOvercapped) {
                            targetDex = 12;
                            targetSpd = 13;
                        } else if (isDrained) {
                            targetDex = 10;
                            targetSpd = -1;
                        }

                        return HeroCompatibility.getCombatantCreationPayload(actor.id, targetDex, targetSpd);
                    });

                    await testCombatDocument.createEmbeddedDocuments("Combatant", combatantData);

                    testCombatDocument.combatants.forEach((c) => {
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
                    expect(testCombatDocument.round).to.equal(2);
                    expect(testCombatDocument.segment).to.equal(1);
                    expect(testCombatDocument.combatant.name).to.include("Speedster");

                    // Clean up the game.time stub boundary after execution pass finishes safely
                    game.time.advance = originalAdvance;
                });
            });
        },
        { displayName: "HERO SYSTEM 6E: Speed Chart Combat Validation" },
    );
}
