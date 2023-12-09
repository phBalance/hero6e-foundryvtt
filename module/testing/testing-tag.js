import { damageRollToTag } from "../utility/tag.js";

export function registerTagTests(quench) {
    quench.registerBatch(
        "quench.utils.tag",
        (context) => {
            const { describe, it, assert } = context;

            describe("Tag Suite", function () {
                it("1d6", function () {
                    assert.equal(damageRollToTag("1d6"), "1d6");
                });

                it("1d3", function () {
                    assert.equal(damageRollToTag("1d3"), "½");
                });

                it("+1", function () {
                    assert.equal(damageRollToTag("+1"), "+1");
                });
            });
        },
        { displayName: "HERO: Tag Functions" },
    );
}
