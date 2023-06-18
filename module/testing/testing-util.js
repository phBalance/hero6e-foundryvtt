import { HEROSYS } from "../herosystem6e.js";

import { modifyRollEquation } from "../utility/util.js"

export function registerUtilTests(quench) {
    HEROSYS.log(false, 'register utils')

    quench.registerBatch(
        "quench.utils.modifyRollEquation",
        (context) => {
            const { describe, it, assert } = context

            describe("modifyRollEquation Suite", function () {
                it("1+1", function () {
                    const equation = "1"
                    const value = "1"

                    assert.equal(modifyRollEquation(equation, value), "1 + 1");
                });

                it("1-1", function () {
                    const equation = "1"
                    const value = "-1"

                    assert.equal(modifyRollEquation(equation, value), "1 - 1");
                });

                it("1+0", function () {
                    const equation = "1"
                    const value = "0"

                    assert.equal(modifyRollEquation(equation, value), "1");
                });

                it("1-0", function () {
                    const equation = "1"
                    const value = "-0"

                    assert.equal(modifyRollEquation(equation, value), "1");
                });
            }); 
        },
        { displayName: "QUENCH: Util Testing" }
    );
}