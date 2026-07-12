import { waitForElementInChat, waitForTokenDrawn } from "./quench-helper.mjs";
import { getPowerInfo } from "../utility/util.mjs";

export function registerCombatWorkflowTests(quench) {
    quench.registerBatch(
        `${game.system.id}.testing.e2e.combat-workflow`,
        (context) => {
            const { describe, it, before, beforeEach, after, assert } = context;

            // ==========================================
            // ENCAPSULATED UI AUTOMATION HELPERS
            // ==========================================

            /**
             * Resolves token drawing and handles client targeting on the canvas.
             */
            async function targetToken(tokenDoc, fallbackActor) {
                game.user.targets.clear();
                const targetTokenObject = await waitForTokenDrawn(tokenDoc);
                if (targetTokenObject) {
                    game.user.targets.add(targetTokenObject);
                } else {
                    console.warn("Token object not found on active canvas, pushing fallback reference.");
                    game.user.targets.add({ actor: fallbackActor, id: tokenDoc.id });
                }
            }

            /**
             * Renders actor sheet and intercepts the V13/V14 ApplicationV2 lifecycle hooks.
             */
            async function launchAttackForm(actor, item) {
                const sheet = actor.sheet;
                await sheet.render(true);
                const $sheetHtml = $(sheet.element);

                const rowSelector = `[data-document-uuid="Actor.${actor.id}.Item.${item.id}"] .roll-icon, [data-document-uuid="Actor.${actor.id}.Item.${item.id}"] .item-control, [data-document-uuid="Actor.${actor.id}.Item.${item.id}"] .action-button, [data-document-uuid="Actor.${actor.id}.Item.${item.id}"] [data-action="roll"], [data-document-uuid="Actor.${actor.id}.Item.${item.id}"] button[type="submit"][name="roll"]`;
                let $btn = $sheetHtml.find(rowSelector).first();

                if (!$btn.length) {
                    const fallbackSelector = `[data-item-id="${item.id}"] .roll-icon, [data-item-id="${item.id}"] .item-control, [data-item-id="${item.id}"] .action-button, [data-item-id="${item.id}"] [data-action="roll"], [data-item-id="${item.id}"] button[type="submit"][name="roll"]`;
                    $btn = $sheetHtml.find(fallbackSelector).first();
                }

                assert.ok($btn.length, `Attack trigger element located for item: ${item.name}`);

                const appPromise = new Promise((resolve) => {
                    let hookV14Id, hookV13Id;
                    const cleanupAndResolve = (app) => {
                        if (hookV14Id) Hooks.off("renderItemAttackFormApplicationV2", hookV14Id);
                        if (hookV13Id) Hooks.off("renderApplication", hookV13Id);
                        resolve(app);
                    };

                    hookV14Id = Hooks.on("renderItemAttackFormApplicationV2", (app) => cleanupAndResolve(app));
                    hookV13Id = Hooks.on("renderApplication", (app) => {
                        if (app.constructor.name === "ItemAttackFormApplication" || app.id?.includes("attack")) {
                            cleanupAndResolve(app);
                        }
                    });
                });

                $btn.click();
                const appInstance = await appPromise;
                await appInstance.render(true);
                return { appInstance, sheet };
            }

            /**
             * Executes the full automated three-stage click pipeline inside the chat log window.
             */
            async function executeChatCardSequence(attackForm, targetTokenDoc, ocvBonus = 9) {
                const $appHtml = $(attackForm.element);
                const $ocvMod = $appHtml.find(`input[name="ocvMod"]`);
                if ($ocvMod.length) {
                    $ocvMod.val(ocvBonus);
                    $ocvMod.blur();
                }

                let $rollToHitBtn = $appHtml.find(
                    "button:contains('Roll to Hit'), button[data-action='roll-to-hit'], button.roll-to-hit",
                );
                if (!$rollToHitBtn.length) {
                    $rollToHitBtn = $appHtml.find("button").filter(function () {
                        return $(this).text().trim().toLowerCase() === "roll to hit";
                    });
                }

                assert.ok($rollToHitBtn.length, "Found the 'Roll to Hit' actionable element inside config window.");
                $rollToHitBtn.click();

                const { foundElement: rollDamageButton } = await waitForElementInChat(`button.roll-damage`);
                assert.ok(rollDamageButton, "Roll Damage button found within chat card.");
                rollDamageButton.click();

                const { foundElement: applyDamageButton } = await waitForElementInChat(
                    `button.apply-damage[data-highlight-token="${targetTokenDoc.uuid}"]`,
                );
                assert.ok(applyDamageButton, "Apply Damage button found within chat card.");
                applyDamageButton.click();

                const { foundElement: finalSummaryDiv } = await waitForElementInChat(
                    `div.adjustment-summary, div.damage-summary`,
                );
                assert.ok(finalSummaryDiv, "Execution summary element container located successfully.");

                return finalSummaryDiv;
            }

            // Utility helper to wait for any AppV2 sheet/dialog rendering cycle
            // Removed waitForRender function as it will be replaced by Hooks.once and direct await render()
            describe.only("End-to-End Combat Action Workflow", function () {
                let attackerActor = null;
                let defenderActor = null;
                let attackerTokenDoc = null;
                let defenderTokenDoc = null;
                let activeScene = null;

                before(async function () {
                    activeScene = game.scenes.active ?? game.scenes.contents?.[0];
                    if (!activeScene) {
                        activeScene = await Scene.create({ name: "Test Arena", grid: { distance: 1, units: "m" } });
                    }

                    // Ensure the scene is the one rendered on the canvas so created tokens get drawn,
                    // otherwise their placeables never finish _draw() and targeting them throws.
                    if (canvas.scene?.id !== activeScene.id) {
                        await activeScene.view();
                    }

                    attackerActor = await Actor.create({
                        name: "_Quench_Attacker",
                        type: "pc",
                        flags: {
                            core: {
                                sheetClass: "herosystem6e.HeroSystemActorSheetV2",
                            },
                        },
                        img: "icons/svg/sword.svg",
                    });

                    const itemsToCreate = [];

                    // AID
                    const aidPowerInfo = getPowerInfo({ xmlid: "AID", actor: attackerActor });
                    const aidItemData = HeroSystem6eItem.itemDataFromXml(aidPowerInfo.xml, attackerActor);
                    const aidPowerData = foundry.utils.mergeObject(aidItemData, {
                        system: {
                            NAME: "Aid STR",
                            LEVELS: 4,
                            INPUT: "STR",
                        },
                    });
                    itemsToCreate.push(aidPowerData);

                    await attackerActor.createEmbeddedDocuments("Item", itemsToCreate);

                    defenderActor = await Actor.create({
                        name: "_Quench_Defender",
                        type: "pc",
                        flags: {
                            core: {
                                sheetClass: "herosystem6e.HeroSystemActorSheetV2",
                            },
                        },
                        img: "icons/svg/shield.svg",
                    });

                    [attackerTokenDoc] = await activeScene.createEmbeddedDocuments("Token", [
                        await attackerActor.getTokenDocument({ x: 100, y: 100, actorLink: false }),
                    ]);

                    [defenderTokenDoc] = await activeScene.createEmbeddedDocuments("Token", [
                        await defenderActor.getTokenDocument({ x: 300, y: 100, actorLink: false }),
                    ]);
                });

                // Using unlinked actors so we can quickly restore them to actor baseline between tests
                beforeEach(async function () {
                    await attackerTokenDoc.delta.restore();
                    await defenderTokenDoc.delta.restore();
                });

                after(async function () {
                    game.user.targets.clear();
                    if (attackerTokenDoc) await attackerTokenDoc.delete();
                    if (defenderTokenDoc) await defenderTokenDoc.delete();
                    if (attackerActor) await attackerActor.delete();
                    if (defenderActor) await defenderActor.delete();
                });

                it("Strike", async function () {
                    const attackStrike = attackerActor.items.find(
                        (doc) => doc.type === "maneuver" && doc.system?.XMLID === "STRIKE",
                    );

                    assert.ok(attackerActor, "Attacker database record exists.");
                    assert.ok(defenderActor, "Defender database record exists.");
                    assert.ok(attackStrike, "Pre-seeded STRIKE maneuver was successfully located on the actor.");

                    // Simulate Targeting
                    game.user.targets.clear();

                    // Wait for the token placeable to finish drawing before targeting it. Targeting starts the
                    // target-animation ticker (Token#_drawTargetArrows), which needs the targetArrows graphics
                    // created at the end of Token#_draw(); targeting too early throws on targetArrows.clear().
                    const targetTokenObject = await waitForTokenDrawn(defenderTokenDoc);

                    if (targetTokenObject) {
                        game.user.targets.add(targetTokenObject);
                    } else {
                        console.warn("Token object not found on active canvas, pushing fallback reference.");
                        game.user.targets.add({ actor: defenderActor, id: defenderTokenDoc.id });
                    }

                    // Render the Attacker Sheet (ApplicationV2 architecture)
                    const attackerSheet = attackerActor.sheet;
                    await attackerSheet.render(true); // Directly await render for AppV2
                    const $sheetHtml = $(attackerSheet.element);

                    assert.ok(
                        $sheetHtml && $sheetHtml.length,
                        "Attacker sheet rendered successfully into DOM container.",
                    );

                    // Click the first available strike trigger (Since they mirror the same ID across tabs, use .first())
                    let $attackBtn;

                    // Prioritize data-document-uuid for robustness, looking for specific roll/action elements
                    const attackRowSelector = `[data-document-uuid="Actor.${attackerActor.id}.Item.${attackStrike.id}"] .roll-icon, [data-document-uuid="Actor.${attackerActor.id}.Item.${attackStrike.id}"] .item-control, [data-document-uuid="Actor.${attackerActor.id}.Item.${attackStrike.id}"] .action-button, [data-document-uuid="Actor.${attackerActor.id}.Item.${attackStrike.id}"] [data-action="roll"], [data-document-uuid="Actor.${attackerActor.id}.Item.${attackStrike.id}"] button[type="submit"][name="roll"]`;
                    $attackBtn = $sheetHtml.find(attackRowSelector).first();

                    // Fallback to data-item-id if data-document-uuid doesn't yield a result, with specific roll/action elements
                    if (!$attackBtn.length) {
                        const fallbackSelector = `[data-item-id="${attackStrike.id}"] .roll-icon, [data-item-id="${attackStrike.id}"] .item-control, [data-item-id="${attackStrike.id}"] .action-button, [data-item-id="${attackStrike.id}"] [data-action="roll"], [data-item-id="${attackStrike.id}"] button[type="submit"][name="roll"]`;
                        $attackBtn = $sheetHtml.find(fallbackSelector).first();
                    }

                    assert.ok($attackBtn.length, "Attack trigger element located on the sheet.");

                    const attackAppPromise = new Promise((resolve) => {
                        let hookV14Id;
                        let hookV13Id;

                        // Unified cleanup function to prevent memory leaks/duplicate resolves
                        const cleanupAndResolve = (app) => {
                            if (hookV14Id) Hooks.off("renderItemAttackFormApplicationV2", hookV14Id);
                            if (hookV13Id) Hooks.off("renderApplication", hookV13Id);
                            resolve(app);
                        };

                        // V14 Path: Native ApplicationV2 hook
                        hookV14Id = Hooks.on("renderItemAttackFormApplicationV2", (app) => {
                            cleanupAndResolve(app);
                        });

                        // V13 Path: Fallback core Application hook
                        hookV13Id = Hooks.on("renderApplication", (app) => {
                            // Filter out unrelated applications (like sidebars, chat logs, or character sheets)
                            if (app.constructor.name === "ItemAttackFormApplication" || app.id?.includes("attack")) {
                                cleanupAndResolve(app);
                            }
                        });
                    });

                    // Now click the button BEFORE awaiting the Promise
                    $attackBtn.click();

                    const attackAppInstance = await attackAppPromise;
                    assert.ok(attackAppInstance, "ItemAttackApplicationV2 form window detected via Hooks.once.");
                    // Await its rendering and get its HTML
                    await attackAppInstance.render(true);
                    const $appHtml = $(attackAppInstance.element);

                    // ocvMod +9 to guarantee a hit
                    const $ocvMod = $appHtml.find(`input[name="ocvMod"]`);
                    assert.ok(
                        $ocvMod.length,
                        "Found the 'OCV Mod' actionable element inside the configuration window.",
                    );
                    $ocvMod.val(9);
                    $ocvMod.blur();

                    // Inject Click: Trigger "Roll to Hit" on the form
                    let $rollToHitBtn = $appHtml.find(
                        "button:contains('Roll to Hit'), button[data-action='roll-to-hit'], button.roll-to-hit",
                    );
                    if (!$rollToHitBtn.length) {
                        // Context fallbacks based on visual elements
                        $rollToHitBtn = $appHtml.find("button").filter(function () {
                            return $(this).text().trim().toLowerCase() === "roll to hit";
                        });
                    }

                    assert.ok(
                        $rollToHitBtn.length,
                        "Found the 'Roll to Hit' actionable element inside the configuration window.",
                    );
                    $rollToHitBtn.click();

                    const { foundElement: rollDamageButton } = await waitForElementInChat(`button.roll-damage`);
                    assert.ok(rollDamageButton, "Roll Damage button found within chat card.");

                    // Track baseline health metrics directly from database state
                    const baselineStun = defenderActor.system.characteristics?.stun?.value;

                    // Apply damage via the programmatic UI interaction simulation
                    rollDamageButton.click();

                    // Apply Damage Chat Message
                    const { foundElement: applyDamageButton } = await waitForElementInChat(
                        `button.apply-damage[data-highlight-token="${defenderTokenDoc.uuid}"]`,
                    );
                    assert.ok(applyDamageButton, "Apply Damage button found within chat card.");
                    applyDamageButton.click();

                    const { foundElement: damageSpan } = await waitForElementInChat(`.apply-damage-amount span`);
                    assert.ok(damageSpan, "Damage applied and found apply-damage-amount");

                    // Fetch fresh document references from the unlinked actor to avoid working with stale data
                    const updatedDefender = defenderTokenDoc.actor;
                    const finalStun = updatedDefender.system.characteristics?.stun?.value;

                    // Verification: Confirm state change matches automation calculations
                    const stunRawDamage = damageSpan.innerHTML.match(/(\d+) STUN/)[1];
                    const expectedStunDamage = Math.max(0, stunRawDamage - 2);
                    const stunDamageApplied = baselineStun - finalStun;
                    assert.strictEqual(
                        stunDamageApplied,
                        expectedStunDamage,
                        `Defender's STUN should be reduced by ${expectedStunDamage} (Baseline: ${baselineStun}, Final: ${finalStun}).`,
                    );

                    // Clean up open sheets and execution panels
                    await attackAppInstance.close();
                    await attackerSheet.close();
                });

                it("AID", async function () {
                    assert.ok(attackerActor, "Attacker database record exists.");
                    assert.ok(defenderActor, "Defender database record exists.");

                    const attackAid = attackerActor.items.find((item) => item.system?.XMLID === "AID");
                    assert.ok(attackAid, `Pre-seeded ${attackAid?.name} was successfully located on the actor.`);

                    // 1. Establish canvas target layer
                    await targetToken(defenderTokenDoc, defenderActor);
                    const baselineStr = defenderActor.system.characteristics?.str?.value;

                    // 2. Open Attacker Sheet and capture form context
                    const { appInstance, sheet } = await launchAttackForm(attackerActor, attackAid);

                    // 3. Complete chat interaction sequences via encapsulated pipeline
                    const adjustmentSummaryDiv = await executeChatCardSequence(appInstance, defenderTokenDoc, 9);
                    assert.ok(adjustmentSummaryDiv, "Adjustment summary wrapper confirmed.");

                    // 4. Verification calculations against live document database state
                    const updatedDefender = defenderTokenDoc.actor;
                    const finalStr = updatedDefender.system.characteristics?.str?.value;

                    const strAidAmount = Number(adjustmentSummaryDiv.innerHTML.match(/(\d+) STR/)[1]);
                    const expectedStrAfterAid = baselineStr + strAidAmount;

                    assert.strictEqual(
                        finalStr,
                        expectedStrAfterAid,
                        `Defender's STR.value should be ${expectedStrAfterAid} (Baseline: ${baselineStr} + Aid: ${strAidAmount} = Final: ${finalStr}).`,
                    );

                    // 5. Explicit structural window cleanup
                    await appInstance.close();
                    await sheet.close();
                });

                it.skip("ENERGYBLAST", async function () {});

                it.skip("DRAIN", async function () {});

                it.skip("ENTANGLE", async function () {});

                it.skip("FLASH", async function () {});

                it.skip("HTH", async function () {});

                it.skip("HEALING", async function () {});

                it.skip("HKA", async function () {});

                it.skip("MENTALBLAST", async function () {});

                it.skip("MINDSCAN", async function () {});
            });
        },
        { displayName: "End-to-End Combat Execution" },
    );
}
