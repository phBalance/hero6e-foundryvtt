import { HeroSystem6eActorActiveEffects } from "../actor/actor-active-effects.mjs";

export function registerStatusEffectTests(quench) {
    quench.registerBatch(
        `${game.system.id}.testing.statusEffects`,
        (context) => {
            const { describe, it, before, beforeEach, after, assert } = context;

            // Awaitable promise helper that resolves exactly when a specific Foundry hook settles
            const waitForHook = (hookName) =>
                new Promise((resolve) => Hooks.once(hookName, (...args) => resolve(args)));

            describe("Actor Status Effect State Machine Matrix", function () {
                let quenchActor = null;
                let effectsObj = null;

                before(async function () {
                    effectsObj = HeroSystem6eActorActiveEffects.statusEffectsObj;

                    quenchActor = await Actor.create({
                        name: "_Quench_Status_Tester",
                        type: "pc",
                        img: "icons/svg/mystery-man.svg",
                    });
                });

                after(async function () {
                    if (quenchActor) {
                        // Await the hook to track document cleanup safely
                        const hookPromise = waitForHook("deleteActor");
                        await quenchActor.delete();
                        await hookPromise;
                    }
                });

                beforeEach(async function () {
                    const effectIds = quenchActor.effects.map((e) => e.id);
                    if (effectIds.length > 0) {
                        const hookPromise = waitForHook("deleteActiveEffect");
                        await quenchActor.deleteEmbeddedDocuments("ActiveEffect", effectIds);
                        await hookPromise; // Blocks until the collection is completely empty
                    }
                });

                it("Dead Lockout Check", async function () {
                    // Track the effect creation step deterministically
                    let hookPromise = waitForHook("createActiveEffect");
                    await quenchActor.toggleStatusEffect(effectsObj.deadEffect.id, { active: true });
                    await hookPromise;

                    assert.ok(quenchActor.statuses.has(effectsObj.deadEffect.id), "Actor successfully seeded as Dead.");

                    const koResult = await quenchActor.toggleStatusEffect(effectsObj.knockedOutEffect.id, {
                        active: true,
                    });
                    const stunResult = await quenchActor.toggleStatusEffect(effectsObj.stunEffect.id, { active: true });

                    assert.strictEqual(koResult, false, "Toggling knockedOut while dead returns false.");
                    assert.strictEqual(stunResult, false, "Toggling stun while dead returns false.");
                    assert.ok(!quenchActor.statuses.has(effectsObj.knockedOutEffect.id), "KnockedOut status blocked.");
                    assert.ok(!quenchActor.statuses.has(effectsObj.stunEffect.id), "Stunned status blocked.");
                });

                it("Prone Implication Chains (KO)", async function () {
                    const hookPromise = waitForHook("createActiveEffect");
                    await quenchActor.toggleStatusEffect(effectsObj.knockedOutEffect.id, { active: true });
                    await hookPromise;

                    assert.ok(quenchActor.statuses.has(effectsObj.knockedOutEffect.id), "KnockedOut applied.");
                    assert.ok(
                        quenchActor.statuses.has(effectsObj.proneEffect.id),
                        "Prone automatically implied via KO.",
                    );
                });

                it("Prone Implication Chains (Asleep)", async function () {
                    const hookPromise = waitForHook("createActiveEffect");
                    await quenchActor.toggleStatusEffect(effectsObj.asleepEffect.id, { active: true });
                    await hookPromise;

                    assert.ok(quenchActor.statuses.has(effectsObj.asleepEffect.id), "Asleep applied.");
                    assert.ok(
                        quenchActor.statuses.has(effectsObj.proneEffect.id),
                        "Prone automatically implied via Asleep.",
                    );
                });

                it("Prone Implication Chains (Unconscious)", async function () {
                    const hookPromise = waitForHook("createActiveEffect");
                    await quenchActor.toggleStatusEffect(effectsObj.unconsciousEffect.id, { active: true });
                    await hookPromise;

                    assert.ok(quenchActor.statuses.has(effectsObj.unconsciousEffect.id), "Unconscious applied.");
                    assert.ok(
                        quenchActor.statuses.has(effectsObj.proneEffect.id),
                        "Prone automatically implied via Unconscious.",
                    );
                });

                it("KnockedOut Cleans Up Stunned", async function () {
                    let hookPromise = waitForHook("createActiveEffect");
                    await quenchActor.toggleStatusEffect(effectsObj.stunEffect.id, { active: true });
                    await hookPromise;
                    assert.ok(quenchActor.statuses.has(effectsObj.stunEffect.id), "Actor is initially Stunned.");

                    // Moving to KO drops stun (deletes an embedded document)
                    hookPromise = waitForHook("deleteActiveEffect");
                    await quenchActor.toggleStatusEffect(effectsObj.knockedOutEffect.id, { active: true });
                    await hookPromise;

                    assert.ok(
                        quenchActor.statuses.has(effectsObj.knockedOutEffect.id),
                        "KnockedOut applied successfully.",
                    );
                    assert.ok(!quenchActor.statuses.has(effectsObj.stunEffect.id), "Stunned was dropped cleanly.");
                });

                it("Dead Cleans Up KnockedOut", async function () {
                    let hookPromise = waitForHook("createActiveEffect");
                    await quenchActor.toggleStatusEffect(effectsObj.knockedOutEffect.id, { active: true });
                    await hookPromise;
                    assert.ok(
                        quenchActor.statuses.has(effectsObj.knockedOutEffect.id),
                        "Actor is initially KnockedOut.",
                    );

                    hookPromise = waitForHook("deleteActiveEffect");
                    await quenchActor.toggleStatusEffect(effectsObj.deadEffect.id, { active: true });
                    await hookPromise;

                    assert.ok(quenchActor.statuses.has(effectsObj.deadEffect.id), "Dead applied successfully.");
                    assert.ok(
                        !quenchActor.statuses.has(effectsObj.knockedOutEffect.id),
                        "KnockedOut was dropped cleanly.",
                    );
                });

                it("Full Health Cleanup Operations", async function () {
                    const effectsObj = HeroSystem6eActorActiveEffects.statusEffectsObj;

                    await quenchActor.toggleStatusEffect(effectsObj.stunEffect.id, { active: true });
                    await quenchActor.toggleStatusEffect(effectsObj.asleepEffect.id, { active: true });
                    await quenchActor.toggleStatusEffect(effectsObj.unconsciousEffect.id, { active: true });

                    await quenchActor.createEmbeddedDocuments("ActiveEffect", [
                        {
                            name: "_Quench_Maneuver",
                            img: "icons/svg/shield.svg",
                            flags: { [game.system.id]: { type: "maneuverNextPhaseEffect" } },
                        },
                    ]);

                    // Intercept the mass document drop inside fullHealth
                    const hookPromise = waitForHook("deleteActiveEffect");
                    await quenchActor.fullHealth();
                    await hookPromise;

                    assert.strictEqual(quenchActor.effects.size, 0, "All core active effects dropped.");
                    assert.ok(!quenchActor.statuses.has(effectsObj.stunEffect.id), "Stunned cleared.");
                    assert.ok(!quenchActor.statuses.has(effectsObj.asleepEffect.id), "Asleep cleared.");
                    assert.ok(!quenchActor.statuses.has(effectsObj.unconsciousEffect.id), "Unconscious cleared.");
                });

                it("Token HUD Interface Click Simulation and FullHealth Cleanup", async function () {
                    const effectsObj = HeroSystem6eActorActiveEffects.statusEffectsObj;

                    const tokenData = await quenchActor.getTokenDocument({ x: 100, y: 100 });

                    let tokenHook = waitForHook("createToken");
                    const [canvasTokenDoc] = await canvas.scene.createEmbeddedDocuments("Token", [tokenData]);
                    await tokenHook;

                    const canvasTokenInstance = canvasTokenDoc.object;
                    assert.ok(canvasTokenInstance, "Token instance successfully created.");

                    canvas.tokens.hud.bind(canvasTokenInstance);

                    // Wait for the effect update loop to clear the pipeline
                    let hookPromise = waitForHook("createActiveEffect");
                    await canvas.tokens.hud.actor.toggleStatusEffect(effectsObj.stunEffect.id, {
                        active: true,
                        overlay: true,
                    });
                    await hookPromise;

                    assert.ok(
                        quenchActor.statuses.has(effectsObj.stunEffect.id),
                        "Actor records Stunned state via Token HUD.",
                    );

                    canvas.tokens.hud.clear();

                    hookPromise = waitForHook("deleteActiveEffect");
                    await quenchActor.fullHealth();
                    await hookPromise;

                    assert.strictEqual(
                        quenchActor.effects.size,
                        0,
                        "Actor sheet cleared of the HUD-applied ActiveEffect.",
                    );
                    assert.ok(
                        !quenchActor.statuses.has(effectsObj.stunEffect.id),
                        "Stunned state removed from statuses Set.",
                    );
                    assert.strictEqual(
                        canvasTokenDoc.actor.effects.size,
                        0,
                        "Token actor proxy effects list is clean.",
                    );

                    tokenHook = waitForHook("deleteToken");
                    await canvasTokenDoc.delete();
                    await tokenHook;
                });
            });
        },
        { displayName: "HERO: Status Effects Logic" },
    );
}
