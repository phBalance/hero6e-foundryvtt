// Everything lives inside the `quenchReady` hook. A world without quench therefore
// defines nothing here, and never parses or evaluates the test suites. The hook holds
// the flow; each helper below is called from that flow.
//
// Every test suite this system registers is keyed with the system id first, for example
// `hero6efoundryvttv2.utils.dice`. Callers pass names without that prefix, so a caller
// cannot select another package's test suites.
Hooks.on("quenchReady", async (quench) => {
    // Seconds to wait for an aborted run to wind down before forcing its release.
    const ABORT_GRACE_MS = 15 * 1000;

    // True while this console API drives a run. Set before the first await, so two calls in the
    // same tick cannot both start a run.
    let runInProgress = false;

    const RUN_BUSY_MESSAGE = "A Quench test run is already in progress. Wait for it or abort it first.";

    const testModules = await importTestSuites();

    registerTestSuites(quench, testModules);
    exposeConsoleApi(testModules);

    // Import the test modules only after quench is ready.
    async function importTestSuites() {
        const [
            { registerGlobalSetup, registerGlobalTeardown, GLOBAL_SETUP_SUITE, GLOBAL_TEARDOWN_SUITE },
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
            import("./quench-helper.mjs"),
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

        return {
            registerGlobalSetup,
            registerGlobalTeardown,
            setupSuite: GLOBAL_SETUP_SUITE,
            teardownSuite: GLOBAL_TEARDOWN_SUITE,
            registerAutomatonTests,
            registerBaseTests,
            registerCslTests,
            registerDamageFunctionTests,
            registerDefenseTests,
            registerDiceTests,
            registerEverythingLadLass,
            registerFullTests,
            registerHeroMathTests,
            registerManeuverTests,
            registerRequiresRollCheckTests,
            registerUploadTests,
            registerVehicleTests,
            registerCombatTests,
            registerCombatWorkflowTests,
            registerTypeForceReplaceTests,
            registerStatusEffectTests,
            register5eCalculatedActiveEffectAutomationTests,
            registerActorCharacteristicTests,
            registerAdjustmentFadeTests,
            registerItemEditionTests,
            registerWorldTimeTests,
            registerVisionTests,
            registerActiveEffectTests,
            registerDragAndDropTests,
            registerMovementEndTests,
        };
    }

    // Register every suite. Quench runs batches in registration order, so global setup
    // goes first and global teardown goes last.
    function registerTestSuites(quench, t) {
        t.registerGlobalSetup(quench);
        t.registerAutomatonTests(quench);
        t.registerBaseTests(quench);
        t.registerCslTests(quench);
        t.registerDamageFunctionTests(quench);
        t.registerDefenseTests(quench);
        t.registerDiceTests(quench);
        t.registerEverythingLadLass(quench);
        t.registerFullTests(quench);
        t.registerHeroMathTests(quench);
        registerMainTests(quench);
        t.registerManeuverTests(quench);
        t.registerRequiresRollCheckTests(quench);
        t.registerUploadTests(quench);
        t.registerVehicleTests(quench);
        t.registerActorCharacteristicTests(quench);
        t.registerStatusEffectTests(quench);
        t.registerTypeForceReplaceTests(quench);
        t.registerCombatWorkflowTests(quench);
        t.register5eCalculatedActiveEffectAutomationTests(quench);
        t.registerCombatTests(quench);
        t.registerAdjustmentFadeTests(quench);
        t.registerItemEditionTests(quench);
        t.registerWorldTimeTests(quench);
        t.registerVisionTests(quench);
        t.registerActiveEffectTests(quench);
        t.registerDragAndDropTests(quench);
        t.registerMovementEndTests(quench);
        t.registerGlobalTeardown(quench);
    }

    // Publish the console API. These functions close over `quench` and the global suite names.
    // The public defaults live here, at the boundary. Every internal function requires its
    // arguments, so a caller cannot rely on a default it cannot see.
    function exposeConsoleApi({ setupSuite, teardownSuite }) {
        const hooks = { setupSuite, teardownSuite };

        window.herosystem6eRunTests = (options = {}) =>
            runTests(
                {
                    numLoops: options.numLoops ?? 1,
                    timeoutInMs: options.timeoutInMs ?? 5 * 60 * 1000,
                    jsonReport: options.jsonReport ?? false,
                    suites: options.suites ?? null,
                    tests: options.tests ?? null,
                },
                hooks,
            );

        window.herosystem6eTestSuites = listSuiteNames;
        window.herosystem6eTestNames = (suites = "**") => listTestNames(suites, hooks);
    }

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
    //   // Run two single test cases, from two different suites, in one call.
    //   const reports = await window.herosystem6eRunTests({
    //       tests: {
    //           main: ["HERO 5e powers should have no validation errors"],
    //           "utils.dice": ["*critical*"],
    //       },
    //   });
    //
    // `suites` takes names, not keys. Glob patterns pass through to Quench: `*` and `?` stop at
    // a `.` separator, `**` crosses it. So `"utils.*"` selects `utils.dice` and `utils.defense`.
    // The global setup and teardown suites always run, and never run twice.
    //
    // `tests` maps a suite name to the test cases to run inside it. Each test case is the test
    // title with its `describe` titles in front, joined by single spaces, as Quench shows them.
    // In a test case, `*` matches any run of characters and `?` matches one character, so
    // `"HERO 5e powers *"` selects every test under that `describe`. Pass `suites` and `tests`
    // together to run whole suites plus single test cases. When a selection matches no test,
    // `runTests` returns an Error and names the selections that matched nothing.
    //
    // The default `timeoutInMs` is 5 minutes. Firefox slows these runs down as it runs more of
    // them, so leave headroom in the timeout.
    //
    // Returns one `{ loop, report }` entry per run. `report` holds the parsed Mocha JSON report:
    // `report.stats` carries the counts, `report.failures` carries each failed test. Returns an
    // Error instead of the array when validation fails or a run fails. Pass `jsonReport: true`
    // only when the report must also reach the server as `Data/quench-report.json`.
    async function runTests(options, hooks) {
        if (runInProgress || quench._currentRunner) {
            return fail(RUN_BUSY_MESSAGE);
        }

        runInProgress = true;
        try {
            return await runSelectedTests(options, hooks);
        } finally {
            runInProgress = false;
        }
    }

    async function runSelectedTests({ numLoops, timeoutInMs, jsonReport, suites, tests }, hooks) {
        if (!game.modules.get("quench")?.active) {
            ui.notifications.warn(game.i18n.localize("Warning.Quench.Active"));
            throw new Error("Quench not active. Cannot run tests.");
        }

        const requested = suites === null && tests === null ? { suites: "**" } : { suites, tests };
        const resolved = resolveRunTargets(requested, hooks);
        if (resolved.error) {
            return fail(resolved.error.message);
        }

        const reports = [];
        for (let i = 0; i < numLoops; ++i) {
            try {
                console.log(`Start test run ${i + 1} of ${numLoops} (${resolved.keys.length} test suites)`);
                const report = await runTestSuitesOnce({
                    keys: resolved.keys,
                    grep: resolved.grep,
                    timeoutInMs,
                    jsonReport,
                });

                const unmatched = unmatchedSelections(resolved.matchers, report);
                if (unmatched.length > 0) {
                    return fail(
                        `No test matched: ${unmatched.join(", ")}. ` +
                            "Call window.herosystem6eTestNames() to list test case titles.",
                    );
                }

                reports.push({ loop: i + 1, report });
            } catch (err) {
                console.error(`Test run failed: ${err}`);
                return err instanceof Error ? err : new Error(String(err));
            }
        }

        console.log(`Completed ${reports.length} test runs`);

        return reports;
    }

    function fail(message) {
        console.error(message);
        return new Error(message);
    }

    // List the test suites this system registered. Pass these names in the `suites` option.
    function listSuiteNames() {
        return registeredSuiteKeys()
            .filter((key) => key.startsWith(systemPrefix()))
            .map((key) => key.slice(systemPrefix().length))
            .sort();
    }

    function systemPrefix() {
        return `${game.system.id}.`;
    }

    // Turn the `suites` and `tests` options into the batch keys to run, plus the Mocha grep
    // that narrows the run to the selected test cases. `grep` is null when whole suites run.
    // A `null` `suites` means the caller left the option out, so those batch keys stay out.
    function resolveRunTargets({ suites, tests }, hooks) {
        const whole = suites === null ? { keys: [] } : resolveSuiteKeys(suites, hooks);
        if (whole.error) return whole;
        if (tests == null) return { keys: whole.keys, grep: null, matchers: [] };

        const selection = normalizeTestSelection(tests);
        if (selection.length === 0) {
            return {
                error: new Error(
                    'The "tests" option needs at least one test case title. ' +
                        "Call window.herosystem6eTestNames() to list them.",
                ),
            };
        }

        const keys = new Set(whole.keys);
        const matchers = [];
        const unknownSuites = [];
        for (const { suite, title } of selection) {
            const batchKeys = matchingSuiteKeys(`${systemPrefix()}${suite}`);
            if (batchKeys.length === 0) {
                unknownSuites.push(suite);
                continue;
            }
            for (const key of batchKeys) {
                keys.add(key);
                matchers.push({ label: `${suite} :: ${title}`, re: testCaseRegExp(key, title) });
            }
        }

        if (unknownSuites.length > 0) {
            return {
                error: new Error(
                    `Unknown test suite(s): ${unknownSuites.join(", ")}. ` +
                        "Names exclude the system prefix. Call window.herosystem6eTestSuites() to list them.",
                ),
            };
        }

        // Global setup and teardown must still wrap the run, so match every test in both.
        const hookKeys = [];
        for (const hook of [hooks.setupSuite, hooks.teardownSuite]) {
            const key = `${systemPrefix()}${hook}`;
            if (registeredSuiteKeys().includes(key)) {
                keys.add(key);
                hookKeys.push(key);
            }
        }

        // Whole-suite selections and the global hooks match every test in their batch. The
        // matchers add the single test cases on top.
        const sources = [...new Set([...whole.keys, ...hookKeys])].map(
            (key) => `^${escapeRegExp(batchRootTitle(key))}`,
        );
        sources.push(...matchers.map((matcher) => matcher.re.source));

        return {
            keys: registeredSuiteKeys().filter((key) => keys.has(key)),
            grep: new RegExp(sources.join("|"), "i"),
            matchers,
        };
    }

    // Accept `{ "<suite name>": "<test case>" }` or `{ "<suite name>": ["<test case>", ...] }`.
    function normalizeTestSelection(tests) {
        if (!tests || typeof tests !== "object" || Array.isArray(tests)) return [];

        const selection = [];
        for (const [suite, value] of Object.entries(tests)) {
            const titles = Array.isArray(value) ? value : [value];
            for (const title of titles) {
                const trimmed = String(title).trim();
                if (trimmed.length > 0) selection.push({ suite: suite.trim(), title: trimmed });
            }
        }
        return selection;
    }

    // Build the anchored full-title RegExp for one test case. Quench wraps each batch in a suite
    // named `<batch key>_root`, and Mocha joins suite titles with a space, so the full title of
    // a test reads `<batch key>_root <describe titles> <it title>`.
    function testCaseRegExp(batchKey, title) {
        let source = "";
        for (const char of title) {
            if (char === "*") source += ".*";
            else if (char === "?") source += ".";
            else source += escapeRegExp(char);
        }
        return new RegExp(`^${escapeRegExp(batchRootTitle(batchKey))} ${source}$`, "i");
    }

    function batchRootTitle(batchKey) {
        return `${batchKey}_root`;
    }

    // Report the selections that no executed test matched, so a typo cannot pass silently.
    function unmatchedSelections(matchers, report) {
        if (matchers.length === 0) return [];

        const executed = executedFullTitles(report);
        return matchers.filter((matcher) => !executed.some((title) => matcher.re.test(title))).map((m) => m.label);
    }

    function executedFullTitles(report) {
        if (!report) return [];
        const lists = [report.passes ?? [], report.failures ?? [], report.pending ?? []];
        return lists
            .flat()
            .map((test) => test?.fullTitle)
            .filter(Boolean);
    }

    // Turn the `suites` option into the exact batch keys to run, in registration order.
    // Registration order keeps global setup first and global teardown last.
    function resolveSuiteKeys(suites, { setupSuite, teardownSuite }) {
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
        for (const hook of [setupSuite, teardownSuite]) {
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
                source += escapeRegExp(char);
            }
        }
        return new RegExp(`^${source}$`, "i");
    }

    function escapeRegExp(text) {
        return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    // List the test cases in the given suites. Quench builds the test tree only when a run
    // starts, so this runs the suites in Mocha dry-run mode: it registers every test and skips
    // every test body and hook. Keys and titles drop the system prefix, so they match what the
    // `suites` and `tests` options take.
    async function listTestNames(suites, { setupSuite, teardownSuite }) {
        if (runInProgress || quench._currentRunner) {
            throw new Error(RUN_BUSY_MESSAGE);
        }

        runInProgress = true;
        try {
            const resolved = resolveSuiteKeys(suites, { setupSuite, teardownSuite });
            if (resolved.error) throw resolved.error;

            quench.mocha.dryRun(true);
            try {
                const dryRunner = await quench.runBatches(resolved.keys, {
                    updateSnapshots: false,
                    preSelectedOnly: false,
                });
                const tree = dryRunner.suite;
                await new Promise((resolve) => dryRunner.once("end", resolve));
                return testCasesBySuite(tree);
            } finally {
                quench.mocha.dryRun(false);
            }
        } finally {
            runInProgress = false;
        }
    }

    function testCasesBySuite(rootSuite) {
        const bySuite = {};
        const prefix = systemPrefix();
        for (const batchSuite of rootSuite?.suites ?? []) {
            const key = batchSuite.title.replace(/_root$/, "");
            if (!key.startsWith(prefix)) continue;
            const titles = [];
            batchSuite.eachTest((test) => titles.push(test.fullTitle().slice(batchSuite.title.length + 1)));
            bySuite[key.slice(prefix.length)] = titles.sort();
        }
        return bySuite;
    }

    async function runTestSuitesOnce({ keys, grep, timeoutInMs, jsonReport }) {
        // Mocha copies `options.grep` into its runner when the run starts inside `runBatches`.
        // Set it just before, and clear it as soon as the runner holds its own copy, so a
        // filtered run cannot leak into the next one.
        quench.mocha.grep(grep ?? undefined);
        let mochaRunner;
        try {
            mochaRunner = await quench.runBatches(keys, {
                updateSnapshots: false,
                preSelectedOnly: false,
                json: jsonReport,
            });
        } finally {
            quench.mocha.grep(undefined);
        }

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
});
