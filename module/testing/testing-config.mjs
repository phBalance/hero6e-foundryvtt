import { setQuenchTimeout } from "./quench-helper.mjs";

/**
 * Register the smoke-test batch that checks the HERO power tables load without validation errors.
 *
 * @param {object} quench The Quench instance.
 */
export function registerConfigTests(quench) {
    quench.registerBatch(
        `${game.system.id}.main`,
        (context) => {
            const { describe, expect, it } = context;

            describe("HERO", async function () {
                // Mocha's 2000ms default is too short when several actors are created at the same time.
                setQuenchTimeout(this, 20000);

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
        { displayName: "HERO: Config" },
    );
}
