import { HEROSYS } from "../herosystem6e.js";

export function registerHitLocationTests(quench) {
    HEROSYS.log(false, 'register hit locations')

    quench.registerBatch(
        "quench.examples.basic-pass",
        (context) => {
            const { describe, it, assert } = context

           
            describe("Passing Suite", function () {
                it("Passing Test", function () {
                    assert.ok(true);
                });
            }); 
        },
        { displayName: "QUENCH: Basic Passing Test" }
    );
}