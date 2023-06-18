import { HEROSYS } from "../herosystem6e.js";
import { registerHitLocationTests } from "./testing-hit-locations.js";
import { registerUtilTests } from "./testing-util.js";

Hooks.once("ready", async function () {
    if (!game.modules.get('_dev-mode')?.active ) { return; }

    if (!game.modules.get("quench")) {
        ui.notifications.warn(game.i18n.localize("Warning.Quench.Install"));
        return
    }

    if (!game.modules.get("quench")?.active) {
        ui.notifications.warn(game.i18n.localize("Warning.Quench.Active"));
    }
});

Hooks.on("quenchReady", (quench) => {
    quench.registerBatch(
      "quench.examples.basic-pass",
      (context) => {
        const { describe, it, assert } = context;
  
        describe("Passing Suite", function () {
          it("Passing Test", function () {
            assert.ok(true);
          });
        });
      },
      { displayName: "QUENCH: Basic Passing Test" },
    );
});

Hooks.on("quenchReady", (quench) => {
    registerHitLocationTests(quench);
    registerUtilTests(quench);

    quench.app.render(true);
});