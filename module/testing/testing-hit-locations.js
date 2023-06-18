import { HEROSYS } from "../herosystem6e.js";

export function registerHitLocationTests(quench) {
    quench.registerBatch(
        "quench.examples.hitLocations",
        (context) => {
            const { describe, it, assert } = context

            describe("Passing Suite", function () {
                it("Passing Test", function () {
                    assert.ok(true);
                });
            }); 
        },
        { displayName: "HERO: Basic Passing Test" }
    );
}