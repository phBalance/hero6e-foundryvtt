import { registerUtilTests } from "./testing-util.js";
import { registerDamageFunctionTests } from "./testing-damage-functions.js";
import { registerTagTests } from "./testing-tag.js";
import { registerUploadTests } from "./testing-upload.js";
import { registerDefenseTests } from "./testing-defense.js";
import { registerFullTests } from "./testing-full.js";

Hooks.once("ready", async function () {
    if (!game.modules.get("_dev-mode")?.active) {
        return;
    }

    if (!game.modules.get("quench")) {
        ui.notifications.warn(game.i18n.localize("Warning.Quench.Install"));
    }

    if (!game.modules.get("quench")?.active) {
        ui.notifications.warn(game.i18n.localize("Warning.Quench.Active"));
    }
});

Hooks.on("quenchReady", (quench) => {
    registerUtilTests(quench);
    registerDamageFunctionTests(quench);
    registerTagTests(quench);
    registerDefenseTests(quench);
    registerUploadTests(quench);
    registerFullTests(quench);
});

// Helper function to run all tests from browser console.
//
// For browsers that support top level await (e.g. Chrome) you can just:
// console.log(`Test suite result: ${await window.herosystem6eRunTests(100)}`);
//
// For other browsers you can just:
// window.herosystem6eRunTests(100).catch((err) => console.error(`Error with test runs: ${err.message}`)).then((result) => console.log(`Finished test runs`))
//
window.herosystem6eRunTests = async (numLoops = 1) => {
    if (!game.modules.get("quench")?.active) {
        ui.notifications.warn(game.i18n.localize("Warning.Quench.Active"));
        throw new Error("Quench not active. Cannot run tests.");
    }

    for (let i = 0; i < numLoops; ++i) {
        try {
            console.log(`Start test run ${i + 1} of ${numLoops}`);
            await runTestSuiteOnce();
        } catch (err) {
            console.error(`Test run failed: ${err}`);
            return err;
        }
    }

    console.log(`Completed ${numLoops} test runs`);

    return true;
};

async function runTestSuiteOnce() {
    const mochaRunner = await quench.runBatches("hero6efoundryvttv2.**", {
        updateSnapshots: false,
        preSelectedOnly: false,
        json: false,
    });

    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            mochaRunner.abort();
            mochaRunner.dispose();
            reject("Test suite took too long - aborting runs");
        }, 20 * 1000 /* 20 seconds */);

        mochaRunner.on("end", () => {
            // Clean up from the run.
            mochaRunner.dispose();
            clearTimeout(timeoutId);

            resolve(true);
        });
    });
}
