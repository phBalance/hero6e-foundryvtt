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

  We are developing a hybrid Foundry VTT V13/V14 custom Hero System 6e system using ApplicationV2 architecture. Use game.system.id dynamically. We have successfully completed our custom `HeroCompatibility` layer for handling canonical V14 collection arrays vs V13 flat paths, and our `HeroSystem6eCombatTrackerSingle` visual sidebar overrides (including current segment headers and client-side DOM highlight injectors).

We are currently debugging the core turn advancement engine in `HeroSystem6eCombatSingle` (`nextTurn()` and `previousTurn()`).

The core issue we must solve right now is that when jumping between segments (e.g., from Segment 12 to Segment 3), the database pointer (`updateData.turn`) desynchronizes. Because `nextTurn()` executes prior to Foundry's core data-preparation re-sorting pass, saving an index integer based on a simulated array results in an out-of-bounds pointer or targets the wrong character once the new segment array compiles.

To resolve this, we must completely decouple `nextTurn()` and `previousTurn()` from index arithmetic updates. Instead of updating `turn: absoluteTargetTurnIndex` in `this.update()`, we need to investigate how to either:

1. Override the core `Combat.prototype.turns` getter or `setupTurns()` compilation method directly so that data-preparation naturally generates the correct active turn index based on our database flags.
2. Hook into the `updateCombat` workflow or database presave cycle to dynamically catch the incoming segment change and map the turn index safely after the database has re-sorted the collection records.

Let's begin by reviewing the `setupTurns()` and data-preparation overrides for `HeroSystem6eCombatSingle`. Show me how to restructure the data layer so the core document model organically tracks indices when flags shift.
