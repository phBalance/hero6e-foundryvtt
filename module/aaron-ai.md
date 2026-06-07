# Aaron's prompts for google AI

- We are working on a custom Hero System 6e system for Foundry VTT V14 using the ApplicationV2 architecture. When we code, you must strictly follow these rules:
  - Never use legacy document path strings like updateData['combatants.${id}.initiative']. All child updates must use the canonical V14 collection array format: updateData.combatants = [...].
  - Never invent dummy helper methods like effect.\_handleDurationExpiry() or effect.expire(). To remove active effects, explicitly utilize effect.delete() or actor.deleteEmbeddedDocuments() or better use the native ActiveEffect.expiry.refresh()
  - Always preserve our dynamic segment lookahead logic and keep variables cleanly scoped.
  - Use game.system.id instead of hard coded system names.
  - My github repo is https://github.com/aeauseth/hero6efoundryvttv2
  - use const instead of let when possible
  - avoid storing data in memory (with variables or via updateSource) instead of using the database, specifically because there may be multiple GM/user clients.
  - avoid using "item" as a variable name unless it is referring to an FoundryVTT item that might be embedded in an Actor.

  We are developing a Hero System 6th Edition ruleset engine for Foundry VTT supporting both Foundry V13 (Gen 13) and Foundry V14 (Gen 14). We are currently hardening the Speed Chart timeline progression system using Quench integration test suites.

---

CURRENT PROGRESS STATUS:

- Test 1 (Exhaustive 2-Round Forward Clock Pass): PASS (V13 & V14)
- Test 2 (Bidirectional nextTurn / nextRound Gaps Pass): PASS (V13 & V14)
- Test 3 (Combat Boundary Unstarted Reset Thresholds): FAIL (V13 reports "expected 6 to equal 12" during a previousRound() rewind macro pass)

---

THE TECHNICAL ISSUE WE ARE RESOLVING:
During Test 3, the encounter starts at Round 1, Segment 12, advances forward across a segment rollover into Round 2, Segment 3, and then calls `await testCombatDocument.previousRound()`.

The transaction payload successfully decrements the round to 1 and resets turn to 0. However, on Foundry V13, because the database update payload alters top-level fields but does not forcefully update the segment flags, the legacy core's synchronous data-prep loop executes `setupTurns()` under a stale context. It evaluates combatants using Segment 6 (Behemoth's phase), causing the segment getter to report 6 instead of returning cleanly to 12.

---

OUR WORKSPACE UTILITY INTERFACE LAYER (compatibility.mjs):
static async updateEmbedded(parentDoc, embeddedKey, embeddedUpdates, topLevelUpdates = {}, options = {}) {
if (!parentDoc || typeof parentDoc.update !== "function") {
throw new Error(`Invalid parent document provided for embedded mutation.`);
}
if (this.isV14) {
const mergedV14Payload = { ...topLevelUpdates, [embeddedKey]: embeddedUpdates };
return parentDoc.update(mergedV14Payload, options);
}
const flattenedV13Payload = { ...topLevelUpdates };
for (const updateData of embeddedUpdates) {
const { \_id, ...fields } = updateData;
if (!\_id) continue;
for (const [property, value] of Object.entries(fields)) {
flattenedV13Payload[`${embeddedKey}.${_id}.${property}`] = value;
}
}
return parentDoc.update(flattenedV13Payload, options);
}

---

CURRENT TASK OVERVIEW:

1. We need to harden `nextRound()` and `previousRound()` inside `hero-combat-single.mjs` to make sure they forcefully serialize the target segment context (Segment 12) straight into the database updates using our `HeroCompatibility.updateEmbedded` pipeline signature, ensuring `turn: 0` lands accurately on both V13 and V14 without in-memory variables.
2. Maintain clean, universal language, functional scannability, and single-codeblock outputs when updating functions.

Let's begin by reviewing our macro round methods to solve this final tracking desynchronization.
