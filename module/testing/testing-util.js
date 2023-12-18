import { modifyRollEquation } from "../utility/util.js";

export function registerUtilTests(quench) {
    quench.registerBatch(
        "hero6efoundryvttv2.utils.modifyRollEquation",
        (context) => {
            const { describe, it, assert } = context;

            describe("modifyRollEquation Suite", function () {
                it("1+1", function () {
                    assert.equal(modifyRollEquation("1", "1"), "1 + 1");
                });

                it("1-1", function () {
                    assert.equal(modifyRollEquation("1", "-1"), "1 - 1");
                });

                it("1+0", function () {
                    assert.equal(modifyRollEquation("1", "0"), "1");
                });

                it("1-0", function () {
                    assert.equal(modifyRollEquation("1", "-0"), "1");
                });

                it("1+NaN", function () {
                    assert.equal(modifyRollEquation("1", NaN), "1");
                });
            });
        },
        { displayName: "HERO: Util Testing" },
    );
}
