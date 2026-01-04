import { numberToOneDecimalPlace, roundFavorPlayerDown, roundFavorPlayerUp } from "../utility/round.mjs";

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

                describe("numbers with 2 decimals", function () {
                    it("should change -1.91", function () {
                        expect(numberToOneDecimalPlace(-1.91)).to.equal(-1.9);
                    });

                    it("should change -1.99", function () {
                        expect(numberToOneDecimalPlace(-1.99)).to.equal(-1.9);
                    });

                    it("should change 1.91", function () {
                        expect(numberToOneDecimalPlace(1.91)).to.equal(1.9);
                    });

                    it("should change 1.99", function () {
                        expect(numberToOneDecimalPlace(1.99)).to.equal(1.9);
                    });
                });

                describe("numbers with 3 decimals", function () {
                    it("should change -1.501", function () {
                        expect(numberToOneDecimalPlace(-1.501)).to.equal(-1.5);
                    });

                    it("should change -1.499", function () {
                        expect(numberToOneDecimalPlace(-1.499)).to.equal(-1.4);
                    });

                    it("should change 1.499", function () {
                        expect(numberToOneDecimalPlace(1.499)).to.equal(1.4);
                    });

                    it("should not change 1.501", function () {
                        expect(numberToOneDecimalPlace(1.501)).to.equal(1.5);
                    });
                });

                describe("calculations", function () {
                    it("should change 8/1.75", function () {
                        // 8 / 1.75 = 4.571428571428571 => 4.5
                        expect(numberToOneDecimalPlace(8 / 1.75)).to.equal(4.5);
                    });

                    it("should change 8/2.25", function () {
                        // 8 / 2.25 = 3.5556 => 3.5
                        expect(numberToOneDecimalPlace(8 / 2.25)).to.equal(3.5);
                    });

                    it("should change 8/3.25", function () {
                        // 8 / 3.25 = 2.4615 => 2.4
                        expect(numberToOneDecimalPlace(8 / 3.25)).to.equal(2.4);
                    });

                    it("should change 13/1.75", function () {
                        // 13 / 1.75 => 7.4286 => 7.4
                        expect(numberToOneDecimalPlace(13 / 1.75)).to.equal(7.4);
                    });

                    it("should change 29/2.75", function () {
                        // 29 / 2.75 => 10.5455 => 10.5
                        expect(numberToOneDecimalPlace(29 / 2.75)).to.equal(10.5);
                    });
                });
            });

            describe("Hero Rounding", function () {
                describe("roundFavorPlayerUp", function () {
                    it("should round 0.5 to 1", function () {
                        expect(roundFavorPlayerUp(0.5)).to.equal(1);
                    });

                    it("should round 10000000.5 to 10000001", function () {
                        expect(roundFavorPlayerUp(10000000.5)).to.equal(10000001);
                    });
                });

                describe("roundFavorPlayerDown", function () {
                    it("should round 0.5 to 0", function () {
                        expect(roundFavorPlayerDown(0.5)).to.equal(0);
                    });

                    it("should round 10000000.5 to 10000000", function () {
                        expect(roundFavorPlayerDown(10000000.5)).to.equal(10000000);
                    });
                });
            });
        },
        { displayName: "HERO: Math Functionality" },
    );
}
