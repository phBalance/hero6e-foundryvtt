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

Hooks.on("quenchReady", async (quench) => {
    // Only load the test suites once quench is ready so their code is never
    // parsed or evaluated in worlds without quench installed and active.
    const [
        { registerAutomatonTests },
        { registerBaseTests },
        { registerCslTests },
        { registerDamageFunctionTests },
        { registerDefenseTests },
        { registerDiceTests },
        { registerEverythingLadLass },
        { registerFullTests },
        { registerHeroMathTests },
        { registerManeuverTests },
        { registerRequiresRollCheckTests },
        { registerUploadTests },
        { registerVehicleTests },
        { registerCombatTests },
        { registerGlobalSetup, registerGlobalTeardown },
        { registerCombatWorkflowTests },
        { registerTypeForceReplaceTests },
        { registerStatusEffectTests },
        { register5eCalculatedActiveEffectAutomationTests },
        { registerActorCharacteristicTests },
        { registerAdjustmentFadeTests },
        { registerItemEditionTests },
        { registerWorldTimeTests },
        { registerVisionTests },
        { registerActiveEffectTests },
        { registerDragAndDropTests },
        { registerMovementEndTests },
    ] = await Promise.all([
        import("./testing-automaton.mjs"),
        import("./testing-base.mjs"),
        import("./testing-csl.mjs"),
        import("./testing-damage-functions.mjs"),
        import("./testing-defense.mjs"),
        import("./testing-dice.mjs"),
        import("./testing-everything-lad-lass.mjs"),
        import("./testing-full.mjs"),
        import("./testing-hero-math.mjs"),
        import("./testing-maneuvers.mjs"),
        import("./testing-requires-roll-check.mjs"),
        import("./testing-upload.mjs"),
        import("./testing-vehicles.mjs"),
        import("./testing-combat-tracker.mjs"),
        import("./quench-helper.mjs"),
        import("./testing-combat-workflow.mjs"),
        import("./testing-type-force-replace.mjs"),
        import("./testing-status-effects.mjs"),
        import("./testing-5e-calculated-active-effect.mjs"),
        import("./testing-default-characteristics.mjs"),
        import("./testing-adjustment-fade.mjs"),
        import("./testing-item-edition.mjs"),
        import("./testing-world-time.mjs"),
        import("./testing-vision.mjs"),
        import("./testing-active-effects.mjs"),
        import("./testing-drag-and-drop.mjs"),
        import("./testing-movement-end.mjs"),
    ]);

    registerGlobalSetup(quench);
    registerAutomatonTests(quench);
    registerBaseTests(quench);
    registerCslTests(quench);
    registerDamageFunctionTests(quench);
    registerDefenseTests(quench);
    registerDiceTests(quench);
    registerEverythingLadLass(quench);
    registerFullTests(quench);
    registerHeroMathTests(quench);
    registerMainTests(quench);
    registerManeuverTests(quench);
    registerRequiresRollCheckTests(quench);
    registerUploadTests(quench);
    registerVehicleTests(quench);
    registerActorCharacteristicTests(quench);
    registerStatusEffectTests(quench);
    registerTypeForceReplaceTests(quench);
    registerCombatWorkflowTests(quench);
    register5eCalculatedActiveEffectAutomationTests(quench);
    registerCombatTests(quench);
    registerAdjustmentFadeTests(quench);
    registerItemEditionTests(quench);
    registerWorldTimeTests(quench);
    registerVisionTests(quench);
    registerActiveEffectTests(quench);
    registerDragAndDropTests(quench);
    registerMovementEndTests(quench);

    registerGlobalTeardown(quench);
});

// Every test suite this system registers is keyed with the system id first, for example
// `hero6efoundryvttv2.utils.dice`. Callers pass names without that prefix. This file
// adds the prefix, so a caller cannot select another package's test suites.
const GLOBAL_SETUP_SUITE = "a.global-setup";
const GLOBAL_TEARDOWN_SUITE = "z.global-teardown";

// Run test suites from the browser console and return the Mocha JSON report of every run.
//
//   // Run every suite once.
//   const reports = await window.herosystem6eRunTests();
//
//   // Run two suites, five times, and upload the report to Data/quench-report.json.
//   const reports = await window.herosystem6eRunTests({
//       suites: ["main", "utils.dice"],
//       numLoops: 5,
//       timeoutInMs: 60 * 1000,
//       jsonReport: true,
//   });
//
// `suites` takes names, not keys. Glob patterns pass through to Quench: `*` and `?` stop at
// a `.` separator, `**` crosses it. So `"utils.*"` selects `utils.dice` and `utils.defense`.
// The global setup and teardown suites always run, and never run twice.
//
// The default `timeoutInMs` is 5 minutes. Firefox slows these runs down as it runs more of
// them, so leave headroom in the timeout.
//
// Returns one `{ loop, report }` entry per run. `report` holds the parsed Mocha JSON report:
// `report.stats` carries the counts, `report.failures` carries each failed test. Returns an
// Error instead of the array when validation fails or a run fails. Pass `jsonReport: true`
// only when the report must also reach the server as `Data/quench-report.json`.
window.herosystem6eRunTests = async ({
    numLoops = 1,
    timeoutInMs = 5 * 60 * 1000,
    jsonReport = false,
    suites = "**",
} = {}) => {
    if (!game.modules.get("quench")?.active) {
        ui.notifications.warn(game.i18n.localize("Warning.Quench.Active"));
        throw new Error("Quench not active. Cannot run tests.");
    }

    const resolved = resolveSuiteKeys(suites);
    if (resolved.error) {
        console.error(resolved.error.message);
        return resolved.error;
    }

    const reports = [];
    for (let i = 0; i < numLoops; ++i) {
        try {
            console.log(`Start test run ${i + 1} of ${numLoops} (${resolved.keys.length} test suites)`);
            const report = await runTestSuitesOnce({ keys: resolved.keys, timeoutInMs, jsonReport });
            reports.push({ loop: i + 1, report });
        } catch (err) {
            console.error(`Test run failed: ${err}`);
            return err instanceof Error ? err : new Error(String(err));
        }
    }

    console.log(`Completed ${reports.length} test runs`);

    return reports;
};

// List the test suites this system registered. Pass these names in the `suites` option.
window.herosystem6eTestSuites = () =>
    registeredSuiteKeys()
        .filter((key) => key.startsWith(systemPrefix()))
        .map((key) => key.slice(systemPrefix().length))
        .sort();

function systemPrefix() {
    return `${game.system.id}.`;
}

// Turn the `suites` option into the exact batch keys to run, in registration order.
// Registration order keeps global setup first and global teardown last.
function resolveSuiteKeys(suites) {
    const requested = normalizeSuiteNames(suites);
    if (requested.length === 0) {
        return {
            error: new Error(
                'No test suites specified. Pass names such as { suites: ["main"] }, ' +
                    "or call window.herosystem6eTestSuites() to list them.",
            ),
        };
    }

    const names = [...requested];
    for (const hook of [GLOBAL_SETUP_SUITE, GLOBAL_TEARDOWN_SUITE]) {
        if (!names.includes(hook)) names.push(hook);
    }

    const matched = new Set();
    const unknown = [];
    for (const name of names) {
        const keys = matchingSuiteKeys(`${systemPrefix()}${name}`);
        if (keys.length === 0) {
            unknown.push(name);
        } else {
            keys.forEach((key) => matched.add(key));
        }
    }

    if (unknown.length > 0) {
        return {
            error: new Error(
                `Unknown test suite(s): ${unknown.join(", ")}. ` +
                    "Names exclude the system prefix. Call window.herosystem6eTestSuites() to list them.",
            ),
        };
    }

    return { keys: registeredSuiteKeys().filter((key) => matched.has(key)) };
}

function normalizeSuiteNames(suites) {
    const list = Array.isArray(suites) ? suites : [suites];
    return list.map((name) => String(name).trim()).filter((name) => name.length > 0);
}

// Quench matches batch keys with wildcard-match. Use its own matcher when available so
// validation cannot disagree with the run. Fall back to an equivalent matcher otherwise.
function matchingSuiteKeys(pattern) {
    if (typeof quench?._filterBatches === "function") {
        return quench._filterBatches(pattern, { preSelectedOnly: false });
    }
    return registeredSuiteKeys().filter((key) => globToRegExp(pattern).test(key));
}

function registeredSuiteKeys() {
    const batches = quench?._testBatches;
    if (!batches) return [];
    if (typeof batches.keys === "function") return Array.from(batches.keys());
    return Array.from(batches, ([key]) => key);
}

// Translate a Quench glob into a RegExp. `**` crosses the `.` separator, `*` and `?` do not.
function globToRegExp(pattern) {
    let source = "";
    for (let i = 0; i < pattern.length; ++i) {
        const char = pattern[i];
        if (char === "*") {
            if (pattern[i + 1] === "*") {
                source += ".*";
                ++i;
            } else {
                source += "[^.]*";
            }
        } else if (char === "?") {
            source += "[^.]";
        } else {
            source += char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        }
    }
    return new RegExp(`^${source}$`, "i");
}

// Seconds to wait for an aborted run to wind down before forcing its release.
const ABORT_GRACE_MS = 15 * 1000;

async function runTestSuitesOnce({ keys, timeoutInMs, jsonReport }) {
    const mochaRunner = await quench.runBatches(keys, {
        updateSnapshots: false,
        preSelectedOnly: false,
        json: jsonReport,
    });

    let timedOut = false;
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            timedOut = true;
            mochaRunner.abort();
            releaseRunner(mochaRunner).then(() => {
                reject(new Error(`Test suite took too long (${timeoutInMs} ms) - aborted and runner released`));
            });
        }, timeoutInMs);

        mochaRunner.on("end", () => {
            if (timedOut) return;

            // Clean up from the run.
            clearTimeout(timeoutId);
            mochaRunner.dispose();

            // Quench's reporter stores the JSON report before this handler runs.
            resolve(readJsonReport());
        });
    });
}

// Release an aborted runner so a later run can start.
//
// Quench clears its own runner reference inside its `end` handler. Calling `dispose()`
// before that handler runs removes the handler and leaves the reference set forever, which
// makes every later `runBatches` fail with "Mocha instance is currently running tests".
// So abort, let the run end, then dispose. Force the release if the run never ends.
function releaseRunner(mochaRunner) {
    return new Promise((resolve) => {
        let released = false;
        const release = () => {
            if (released) return;
            released = true;
            if (quench._currentRunner === mochaRunner) {
                quench._currentRunner = undefined;
            }
            mochaRunner.dispose();
            resolve();
        };

        mochaRunner.once("end", release);
        setTimeout(release, ABORT_GRACE_MS);
    });
}

// Read the Mocha JSON report Quench stored after the last run. Returns null when absent.
function readJsonReport() {
    const raw = quench?.reports?.json;
    if (!raw) return null;
    return JSON.parse(raw);
}

function registerMainTests(quench) {
    quench.registerBatch(
        `${game.system.id}.main`,
        (context) => {
            const { describe, expect, it } = context;

            describe("HERO", async function () {
                describe("5e powers", async function () {
                    it("should have no validation errors", function () {
                        expect(CONFIG.HERO.powers5e.validate()).to.equal(0);
                    });
                });

                describe("6e powers", async function () {
                    it("should have no validation errors", function () {
                        expect(CONFIG.HERO.powers6e.validate()).to.equal(0);
                    });
                });
            });
        },
        { displayName: "HERO: Main" },
    );
}
