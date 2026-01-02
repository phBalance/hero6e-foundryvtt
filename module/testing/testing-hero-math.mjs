import { numberToOneDecimalPlace, RoundFavorPlayerDown, RoundFavorPlayerUp } from "../utility/round.mjs";

export function registerHeroMathTests(quench) {
    quench.registerBatch(
        "hero6efoundryvttv2.hero.rounding",
        (context) => {
            const { describe, expect, it } = context;

            describe("numberToOneDecimalPlace", function () {
                describe("integer numbers", function () {
                    it("should not change -2000000", function () {
                        expect(numberToOneDecimalPlace(-2000000)).to.equal(-2000000);
                    });

                    it("should not change -2", function () {
                        expect(numberToOneDecimalPlace(-2)).to.equal(-2);
                    });

                    it("should not change 0", function () {
                        expect(numberToOneDecimalPlace(0)).to.equal(0);
                    });

                    it("should not change 2", function () {
                        expect(numberToOneDecimalPlace(2)).to.equal(2);
                    });

                    it("should not change 2000000", function () {
                        expect(numberToOneDecimalPlace(2000000)).to.equal(2000000);
                    });
                });

                describe("numbers with 1 decimal", function () {
                    it("should not change -2.1", function () {
                        expect(numberToOneDecimalPlace(-2.1)).to.equal(-2.1);
                    });

                    it("should not change -1.9", function () {
                        expect(numberToOneDecimalPlace(-1.9)).to.equal(-1.9);
                    });

                    it("should not change 0.1", function () {
                        expect(numberToOneDecimalPlace(0.1)).to.equal(0.1);
                    });

                    it("should not change 1.9", function () {
                        expect(numberToOneDecimalPlace(1.9)).to.equal(1.9);
                    });

                    it("should not change 2.1", function () {
                        expect(numberToOneDecimalPlace(2.1)).to.equal(2.1);
                    });
                });

                describe("numbers with 2 decimal", function () {
                    it("should change -1.91", function () {
                        expect(numberToOneDecimalPlace(-1.91)).to.equal(-1.9);
                    });

                    it("should change 1.99", function () {
                        expect(numberToOneDecimalPlace(-1.99)).to.equal(-1.9);
                    });

                    it("should change 1.91", function () {
                        expect(numberToOneDecimalPlace(1.91)).to.equal(1.9);
                    });

                    it("should change 1.99", function () {
                        expect(numberToOneDecimalPlace(1.99)).to.equal(1.9);
                    });
                });
            });

            describe("Hero Rounding", function () {
                describe("RoundFavorPlayerUp", function () {
                    it("should round 0.5 to 1", function () {
                        expect(RoundFavorPlayerUp(0.5)).to.equal(1);
                    });

                    it("should round 10000000.5 to 10000001", function () {
                        expect(RoundFavorPlayerUp(10000000.5)).to.equal(10000001);
                    });
                });

                describe("RoundFavorPlayerDown", function () {
                    it("should round 0.5 to 0", function () {
                        expect(RoundFavorPlayerDown(0.5)).to.equal(0);
                    });

                    it("should round 10000000.5 to 10000000", function () {
                        expect(RoundFavorPlayerDown(10000000.5)).to.equal(10000000);
                    });
                });
            });
        },
        { displayName: "HERO: Math Functionality" },
    );
}
