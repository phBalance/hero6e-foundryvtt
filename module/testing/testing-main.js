import { HEROSYS } from "../herosystem6e.js";
import { registerHitLocationTests } from "./testing-hit-locations.js";
import { registerUtilTests } from "./testing-util.js";
import { registerDamageFunctionTests } from "./testing-damage-functions.js";

Hooks.once("ready", async function () {
    if (!game.modules.get('_dev-mode')?.active ) { return; }

    if (!game.modules.get("quench")) {
        ui.notifications.warn(game.i18n.localize("Warning.Quench.Install"));
    }

    if (!game.modules.get("quench")?.active) {
        ui.notifications.warn(game.i18n.localize("Warning.Quench.Active"));
    }
});

Hooks.on("quenchReady", (quench) => {
    registerHitLocationTests(quench);
    registerUtilTests(quench);
    registerDamageFunctionTests(quench);
});