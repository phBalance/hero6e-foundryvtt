import { HeroRoller, ROLL_TYPE } from "../utility/dice.js";

function FixedDieRoll(fixedRollResult) {
    return class extends Die {
        constructor(termData = {}) {
            super(termData);
        }

        /**
         * Roll for this Die, but always roll rollResult (i.e. it's not random)
         */
        _evaluate() {
            for (let i = 0; i < this.number; ++i) {
                const roll = { result: fixedRollResult, active: true };
                this.results.push(roll);
            }

            return this;
        }
    };
}

class RollMock extends Roll {
    static DieClass = Die;

    static fromTerms(terms, options) {
        const newTerms = terms.map((term) => {
            // Replace all Die with a Die class that will always return 1 when rolling
            if (term instanceof Die) {
                return new this.DieClass({
                    number: term.number,
                    faces: term.faces,
                    options: term.options,
                });
            }

            return term;
        });

        const formula = Roll.getFormula(newTerms);

        const mock = new Roll1Mock(formula, options);
        mock.terms = newTerms;

        return mock;
    }

    constructor(formula, data, options) {
        super(formula, data, options);
    }
}

class Roll6Mock extends RollMock {
    static fixedRollResult = 6;
    static DieClass = FixedDieRoll(this.fixedRollResult);
}

class Roll1Mock extends RollMock {
    static fixedRollResult = 1;
    static DieClass = FixedDieRoll(this.fixedRollResult);
}

export function registerDiceTests(quench) {
    quench.registerBatch(
        "hero6efoundryvttv2.utils.dice",
        (context) => {
            const { describe, expect, it } = context;
            describe("HeroRoller", function () {
                describe("chaining", function () {
                    it("should be conditional for make functions with negative and default", function () {
                        const roller = new HeroRoller();

                        roller.makeNormalRoll(0);
                        expect(roller._type).to.equal(ROLL_TYPE.SUCCESS);
                        roller.makeNormalRoll(false);
                        expect(roller._type).to.equal(ROLL_TYPE.SUCCESS);
                        roller.makeNormalRoll(null);
                        expect(roller._type).to.equal(ROLL_TYPE.SUCCESS);
                        roller.makeNormalRoll(undefined);
                        expect(roller._type).to.equal(ROLL_TYPE.NORMAL);

                        roller.make5eKillingRoll(0);
                        expect(roller._type).to.equal(ROLL_TYPE.NORMAL);
                        roller.make5eKillingRoll(false);
                        expect(roller._type).to.equal(ROLL_TYPE.NORMAL);
                        roller.make5eKillingRoll(null);
                        expect(roller._type).to.equal(ROLL_TYPE.NORMAL);
                        roller.make5eKillingRoll(undefined);
                        expect(roller._type).to.equal(ROLL_TYPE.KILLING);

                        roller.makeSuccessRoll();
                        expect(roller._type).to.equal(ROLL_TYPE.SUCCESS);
                        roller.make6eKillingRoll(0);
                        expect(roller._type).to.equal(ROLL_TYPE.SUCCESS);
                        roller.make6eKillingRoll(false);
                        expect(roller._type).to.equal(ROLL_TYPE.SUCCESS);
                        roller.make6eKillingRoll(null);
                        expect(roller._type).to.equal(ROLL_TYPE.SUCCESS);
                        roller.make6eKillingRoll(undefined);
                        expect(roller._type).to.equal(ROLL_TYPE.KILLING);

                        roller.makeAdjustmentRoll(0);
                        expect(roller._type).to.equal(ROLL_TYPE.KILLING);
                        roller.makeAdjustmentRoll(false);
                        expect(roller._type).to.equal(ROLL_TYPE.KILLING);
                        roller.makeAdjustmentRoll(null);
                        expect(roller._type).to.equal(ROLL_TYPE.KILLING);
                        roller.makeAdjustmentRoll(undefined);
                        expect(roller._type).to.equal(ROLL_TYPE.ADJUSTMENT);

                        roller.makeEntangleRoll(0);
                        expect(roller._type).to.equal(ROLL_TYPE.ADJUSTMENT);
                        roller.makeEntangleRoll(false);
                        expect(roller._type).to.equal(ROLL_TYPE.ADJUSTMENT);
                        roller.makeEntangleRoll(null);
                        expect(roller._type).to.equal(ROLL_TYPE.ADJUSTMENT);
                        roller.makeEntangleRoll(undefined);
                        expect(roller._type).to.equal(ROLL_TYPE.ENTANGLE);

                        roller.makeFlashRoll(0);
                        expect(roller._type).to.equal(ROLL_TYPE.ENTANGLE);
                        roller.makeFlashRoll(false);
                        expect(roller._type).to.equal(ROLL_TYPE.ENTANGLE);
                        roller.makeFlashRoll(null);
                        expect(roller._type).to.equal(ROLL_TYPE.ENTANGLE);
                        roller.makeFlashRoll(undefined);
                        expect(roller._type).to.equal(ROLL_TYPE.FLASH);
                    });

                    it("should be conditional for make functions with negative and default", function () {
                        const roller = new HeroRoller();

                        roller.makeNormalRoll(true);
                        expect(roller._type).to.equal(ROLL_TYPE.NORMAL);

                        roller.make5eKillingRoll(true);
                        expect(roller._type).to.equal(ROLL_TYPE.KILLING);

                        roller.makeSuccessRoll(true);
                        expect(roller._type).to.equal(ROLL_TYPE.SUCCESS);

                        roller.make6eKillingRoll(true);
                        expect(roller._type).to.equal(ROLL_TYPE.KILLING);

                        roller.makeAdjustmentRoll(1);
                        expect(roller._type).to.equal(ROLL_TYPE.ADJUSTMENT);

                        roller.makeEntangleRoll("blah");
                        expect(roller._type).to.equal(ROLL_TYPE.ENTANGLE);

                        roller.makeFlashRoll(true);
                        expect(roller._type).to.equal(ROLL_TYPE.FLASH);
                    });
                });

                describe("success roll", function () {
                    const TestRollMock = Roll1Mock;

                    it("should throw if requesting inappropriate pieces of information", async function () {
                        const TestRollMock = Roll6Mock;

                        const roller = new HeroRoller(
                            {},
                            TestRollMock,
                        ).addNumber(1);

                        await roller.roll();

                        expect(() => {
                            return roller.getStunTerms();
                        }).to.throw();
                        expect(() => {
                            return roller.getStunTotal();
                        }).to.throw();
                        expect(() => {
                            return roller.getStunMultiplier();
                        }).to.throw();

                        expect(() => {
                            return roller.getBodyTerms();
                        }).to.throw();
                        expect(() => {
                            return roller.getBodyTotal();
                        }).to.throw();
                    });

                    it("should handle a 1 pip equation", async function () {
                        const roller = new HeroRoller(
                            {},
                            TestRollMock,
                        ).addNumber(1);

                        await roller.roll();

                        expect(roller.getSuccessTerms()).deep.to.equal([[1]]);
                        expect(roller.getSuccessTotal()).to.equal(1);
                    });

                    it("should take a 1 term, 1 die equation", async function () {
                        const roller = new HeroRoller({}, TestRollMock).addDice(
                            1,
                        );

                        await roller.roll();

                        expect(roller.getSuccessTerms()).deep.to.equal([
                            [TestRollMock.fixedRollResult],
                        ]);
                        expect(roller.getSuccessTotal()).to.equal(
                            TestRollMock.fixedRollResult,
                        );
                    });

                    it("should take a 2 term, 1 die equation", async function () {
                        const roller = new HeroRoller({}, TestRollMock)
                            .addDice(1)
                            .addNumber(1);

                        await roller.roll();

                        expect(roller.getSuccessTerms()).deep.to.equal([
                            [TestRollMock.fixedRollResult],
                            [1],
                        ]);
                        expect(roller.getSuccessTotal()).to.equal(
                            TestRollMock.fixedRollResult + 1,
                        );
                    });

                    it("should take a typical attack roll equation", async function () {
                        const roller = new HeroRoller({}, TestRollMock)
                            .addNumber(11)
                            .addNumber(9)
                            .subNumber(2)
                            .addNumber(-2)
                            .addNumber(3)
                            .subDice(3);

                        await roller.roll();

                        expect(roller.getSuccessTerms()).deep.to.equal([
                            [11],
                            [9],
                            [-2],
                            [-2],
                            [3],
                            [
                                -TestRollMock.fixedRollResult,
                                -TestRollMock.fixedRollResult,
                                -TestRollMock.fixedRollResult,
                            ],
                        ]);
                        expect(roller.getSuccessTotal()).deep.to.equal(
                            19 - 3 * TestRollMock.fixedRollResult,
                        );
                    });
                });

                describe("normal roll", function () {
                    it("should throw if requesting inappropriate pieces of information", async function () {
                        const TestRollMock = Roll6Mock;

                        const roller = new HeroRoller({}, TestRollMock)
                            .makeNormalRoll()
                            .addNumber(1);

                        await roller.roll();

                        expect(() => {
                            return roller.getSuccessTerms();
                        }).to.throw();
                        expect(() => {
                            return roller.getSuccessTotal();
                        }).to.throw();
                        expect(() => {
                            return roller.getStunMultiplier();
                        }).to.throw();
                    });

                    it("should handle a 1 pip equation", async function () {
                        const TestRollMock = Roll6Mock;

                        const roller = new HeroRoller({}, TestRollMock)
                            .makeNormalRoll()
                            .addNumber(1);

                        await roller.roll();

                        expect(roller.getStunTerms()).deep.to.equal([[1]]);
                        expect(roller.getStunTotal()).deep.to.equal(1);

                        expect(roller.getBodyTerms()).deep.to.equal([[0]]);
                        expect(roller.getBodyTotal()).deep.to.equal(0);
                    });

                    it("should handle a 1 die equation", async function () {
                        const TestRollMock = Roll6Mock;

                        const roller = new HeroRoller({}, TestRollMock)
                            .makeNormalRoll()
                            .addDice(1);

                        await roller.roll();

                        expect(roller.getStunTerms()).deep.to.equal([
                            [TestRollMock.fixedRollResult],
                        ]);
                        expect(roller.getStunTotal()).deep.to.equal(
                            TestRollMock.fixedRollResult,
                        );

                        expect(roller.getBodyTerms()).deep.to.equal([[2]]);
                        expect(roller.getBodyTotal()).deep.to.equal(2);
                    });

                    it("should handle a 1 die minus 1 equation", async function () {
                        const TestRollMock = Roll6Mock;

                        const roller = new HeroRoller({}, TestRollMock)
                            .makeNormalRoll()
                            .addDieMinus1(1);

                        await roller.roll();

                        expect(roller.getStunTerms()).deep.to.equal([
                            [TestRollMock.fixedRollResult - 1],
                        ]);
                        expect(roller.getStunTotal()).deep.to.equal(
                            TestRollMock.fixedRollResult - 1,
                        );

                        expect(roller.getBodyTerms()).deep.to.equal([[1]]);
                        expect(roller.getBodyTotal()).deep.to.equal(1);
                    });

                    it("should handle a multiple dice equation", async function () {
                        const TestRollMock = Roll6Mock;

                        const roller = new HeroRoller({}, TestRollMock)
                            .makeNormalRoll()
                            .addDice(3);

                        await roller.roll();

                        expect(roller.getStunTerms()).deep.to.equal([
                            [
                                TestRollMock.fixedRollResult,
                                TestRollMock.fixedRollResult,
                                TestRollMock.fixedRollResult,
                            ],
                        ]);
                        expect(roller.getStunTotal()).deep.to.equal(
                            3 * TestRollMock.fixedRollResult,
                        );

                        expect(roller.getBodyTerms()).deep.to.equal([
                            [2, 2, 2],
                        ]);
                        expect(roller.getBodyTotal()).deep.to.equal(6);
                    });

                    it("should handle a multiple dice and a half die equation", async function () {
                        const TestRollMock = Roll6Mock;

                        const roller = new HeroRoller({}, TestRollMock)
                            .makeNormalRoll()
                            .addDice(3)
                            .addHalfDice();

                        await roller.roll();

                        expect(roller.getStunTerms()).deep.to.equal([
                            [
                                TestRollMock.fixedRollResult,
                                TestRollMock.fixedRollResult,
                                TestRollMock.fixedRollResult,
                            ],
                            [Math.ceil(TestRollMock.fixedRollResult / 2)],
                        ]);
                        expect(roller.getStunTotal()).deep.to.equal(
                            3 * TestRollMock.fixedRollResult +
                                Math.ceil(TestRollMock.fixedRollResult / 2),
                        );

                        expect(roller.getBodyTerms()).deep.to.equal([
                            [2, 2, 2],
                            [1],
                        ]);
                        expect(roller.getBodyTotal()).deep.to.equal(7);
                    });

                    it("should handle a multiple dice and a 1 equation", async function () {
                        const TestRollMock = Roll6Mock;

                        const roller = new HeroRoller({}, TestRollMock)
                            .makeNormalRoll()
                            .addDice(3)
                            .addNumber(1);

                        await roller.roll();

                        expect(roller.getStunTerms()).deep.to.equal([
                            [
                                TestRollMock.fixedRollResult,
                                TestRollMock.fixedRollResult,
                                TestRollMock.fixedRollResult,
                            ],
                            [1],
                        ]);
                        expect(roller.getStunTotal()).deep.to.equal(
                            3 * TestRollMock.fixedRollResult + 1,
                        );

                        expect(roller.getBodyTerms()).deep.to.equal([
                            [2, 2, 2],
                            [0],
                        ]);
                        expect(roller.getBodyTotal()).deep.to.equal(6);
                    });

                    it("should handle a multiple dice and a die minus 1 equation", async function () {
                        const TestRollMock = Roll6Mock;

                        const roller = new HeroRoller({}, TestRollMock)
                            .makeNormalRoll()
                            .addDice(3)
                            .addDieMinus1();

                        await roller.roll();

                        expect(roller.getStunTerms()).deep.to.equal([
                            [
                                TestRollMock.fixedRollResult,
                                TestRollMock.fixedRollResult,
                                TestRollMock.fixedRollResult,
                            ],
                            [TestRollMock.fixedRollResult - 1],
                        ]);
                        expect(roller.getStunTotal()).deep.to.equal(
                            3 * TestRollMock.fixedRollResult +
                                TestRollMock.fixedRollResult -
                                1,
                        );

                        expect(roller.getBodyTerms()).deep.to.equal([
                            [2, 2, 2],
                            [1],
                        ]);
                        expect(roller.getBodyTotal()).deep.to.equal(7);
                    });

                    it("should handle a standard effect full roll", async function () {
                        const TestRollMock = Roll6Mock;

                        const roller = new HeroRoller({}, TestRollMock)
                            .makeNormalRoll()
                            .modifyToStandardEffect()
                            .addDice(3)
                            .addHalfDice()
                            .addNumber(1);

                        await roller.roll();

                        expect(roller.getStunTerms()).deep.to.equal([
                            [
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL,
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL,
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL,
                            ],
                            [HeroRoller.STANDARD_EFFECT_HALF_DIE_ROLL],
                            [1],
                        ]);
                        expect(roller.getStunTotal()).deep.to.equal(
                            3 * HeroRoller.STANDARD_EFFECT_DIE_ROLL +
                                HeroRoller.STANDARD_EFFECT_HALF_DIE_ROLL +
                                1,
                        );

                        expect(roller.getBodyTerms()).deep.to.equal([
                            [1, 1, 1],
                            [0],
                            [0],
                        ]);
                        expect(roller.getBodyTotal()).deep.to.equal(3);
                    });

                    it("should handle a standard effect d6 - 1 roll", async function () {
                        const TestRollMock = Roll6Mock;

                        const roller = new HeroRoller({}, TestRollMock)
                            .makeNormalRoll()
                            .modifyToStandardEffect()
                            .addDice(3)
                            .addDieMinus1()
                            .addNumber(1);

                        await roller.roll();

                        expect(roller.getStunTerms()).deep.to.equal([
                            [
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL,
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL,
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL,
                            ],
                            [HeroRoller.STANDARD_EFFECT_DIE_ROLL],
                            [1],
                        ]);
                        expect(roller.getStunTotal()).deep.to.equal(
                            3 * HeroRoller.STANDARD_EFFECT_DIE_ROLL +
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL +
                                1,
                        );

                        expect(roller.getBodyTerms()).deep.to.equal([
                            [1, 1, 1],
                            [1],
                            [0],
                        ]);
                        expect(roller.getBodyTotal()).deep.to.equal(4);
                    });

                    it("should work with hit locations and not apply standard effect", async function () {
                        const TestRollMock = Roll6Mock;

                        const roller = new HeroRoller({}, TestRollMock)
                            .makeNormalRoll()
                            .modifyToStandardEffect()
                            .modifyToHitLocation()
                            .addDice(3)
                            .addDieMinus1()
                            .addNumber(1);

                        await roller.roll();

                        // Should be no difference in BODY and STUN from roll (be standard effect)
                        expect(roller.getStunTerms()).deep.to.equal([
                            [
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL,
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL,
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL,
                            ],
                            [HeroRoller.STANDARD_EFFECT_DIE_ROLL],
                            [1],
                        ]);
                        expect(roller.getStunTotal()).deep.to.equal(
                            3 * HeroRoller.STANDARD_EFFECT_DIE_ROLL +
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL +
                                1,
                        );

                        expect(roller.getBodyTerms()).deep.to.equal([
                            [1, 1, 1],
                            [1],
                            [0],
                        ]);
                        expect(roller.getBodyTotal()).deep.to.equal(4);

                        // But we should be able to get a hit location that is not
                        // determined by standard effect.
                        const hitLocation = roller.getHitLocation();
                        expect(hitLocation).to.deep.equal({
                            name: "Foot",
                            side: "Right",
                            stunMultiplier: 0.5,
                            bodyMultiplier: 0.5,
                        });
                    });

                    it("should work with hit locations", async function () {
                        const TestRollMock = Roll1Mock;

                        const roller = new HeroRoller({}, TestRollMock)
                            .makeNormalRoll()
                            .modifyToHitLocation()
                            .addDice(3)
                            .addDieMinus1()
                            .addNumber(1);

                        await roller.roll();

                        // But we should be able to get a hit location that is not
                        // determined by standard effect.
                        const hitLocation = roller.getHitLocation();
                        expect(hitLocation).to.deep.equal({
                            name: "Head",
                            side: "Left",
                            stunMultiplier: 2,
                            bodyMultiplier: 2,
                        });
                    });
                });

                describe("killing roll", function () {
                    it("should throw if requesting inappropriate pieces of information", async function () {
                        const TestRollMock = Roll6Mock;

                        const roller = new HeroRoller({}, TestRollMock)
                            .make5eKillingRoll()
                            .addNumber(1);

                        await roller.roll();

                        expect(() => {
                            return roller.getSuccessTerms();
                        }).to.throw();
                        expect(() => {
                            return roller.getSuccessTotal();
                        }).to.throw();
                    });

                    it("should handle a pip", async function () {
                        const TestRollMock = Roll6Mock;

                        const roller = new HeroRoller({}, TestRollMock)
                            .make5eKillingRoll()
                            .addNumber(1);

                        await roller.roll();

                        expect(roller.getBodyTerms()).deep.to.equal([[1]]);
                        expect(roller.getBodyTotal()).to.equal(1);

                        expect(roller.getStunMultiplier()).to.equal(
                            TestRollMock.fixedRollResult - 1,
                        );

                        expect(roller.getStunTerms()).deep.to.equal([
                            [1 * (TestRollMock.fixedRollResult - 1)],
                        ]);
                        expect(roller.getStunTotal()).deep.to.equal(
                            1 * (TestRollMock.fixedRollResult - 1),
                        );
                    });

                    it("should handle a half die", async function () {
                        const TestRollMock = Roll6Mock;

                        const roller = new HeroRoller({}, TestRollMock)
                            .make6eKillingRoll()
                            .addHalfDice();

                        await roller.roll();

                        expect(roller.getBodyTerms()).deep.to.equal([
                            [Math.ceil(TestRollMock.fixedRollResult / 2)],
                        ]);
                        expect(roller.getBodyTotal()).to.equal(
                            Math.ceil(TestRollMock.fixedRollResult / 2),
                        );

                        expect(roller.getStunMultiplier()).to.equal(
                            Math.ceil(TestRollMock.fixedRollResult / 2),
                        );

                        expect(roller.getStunTerms()).deep.to.equal([
                            [
                                Math.ceil(TestRollMock.fixedRollResult / 2) *
                                    Math.ceil(TestRollMock.fixedRollResult / 2),
                            ],
                        ]);
                        expect(roller.getStunTotal()).deep.to.equal(
                            Math.ceil(TestRollMock.fixedRollResult / 2) *
                                Math.ceil(TestRollMock.fixedRollResult / 2),
                        );
                    });

                    it("should handle a die", async function () {
                        const TestRollMock = Roll6Mock;

                        const roller = new HeroRoller({}, TestRollMock)
                            .make5eKillingRoll()
                            .addDice(1);

                        await roller.roll();

                        expect(roller.getBodyTerms()).deep.to.equal([
                            [TestRollMock.fixedRollResult],
                        ]);
                        expect(roller.getBodyTotal()).to.equal(
                            TestRollMock.fixedRollResult,
                        );

                        expect(roller.getStunMultiplier()).to.equal(
                            TestRollMock.fixedRollResult - 1,
                        );

                        expect(roller.getStunTerms()).deep.to.equal([
                            [
                                TestRollMock.fixedRollResult *
                                    (TestRollMock.fixedRollResult - 1),
                            ],
                        ]);
                        expect(roller.getStunTotal()).deep.to.equal(
                            TestRollMock.fixedRollResult *
                                (TestRollMock.fixedRollResult - 1),
                        );
                    });

                    it("should handle a die less a pip", async function () {
                        const TestRollMock = Roll6Mock;

                        const roller = new HeroRoller({}, TestRollMock)
                            .make6eKillingRoll()
                            .addDieMinus1();

                        await roller.roll();

                        expect(roller.getBodyTerms()).deep.to.equal([
                            [TestRollMock.fixedRollResult - 1],
                        ]);
                        expect(roller.getBodyTotal()).to.equal(
                            TestRollMock.fixedRollResult - 1,
                        );

                        expect(roller.getStunMultiplier()).to.equal(
                            Math.ceil(TestRollMock.fixedRollResult / 2),
                        );

                        expect(roller.getStunTerms()).deep.to.equal([
                            [
                                (TestRollMock.fixedRollResult - 1) *
                                    Math.ceil(TestRollMock.fixedRollResult / 2),
                            ],
                        ]);
                        expect(roller.getStunTotal()).deep.to.equal(
                            (TestRollMock.fixedRollResult - 1) *
                                Math.ceil(TestRollMock.fixedRollResult / 2),
                        );
                    });

                    it("should handle a die plus a pip", async function () {
                        const TestRollMock = Roll6Mock;

                        const roller = new HeroRoller({}, TestRollMock)
                            .make5eKillingRoll()
                            .addDice(1)
                            .addNumber(1);

                        await roller.roll();

                        expect(roller.getBodyTerms()).deep.to.equal([
                            [TestRollMock.fixedRollResult],
                            [1],
                        ]);
                        expect(roller.getBodyTotal()).to.equal(
                            TestRollMock.fixedRollResult + 1,
                        );

                        expect(roller.getStunMultiplier()).to.equal(
                            TestRollMock.fixedRollResult - 1,
                        );

                        expect(roller.getStunTerms()).deep.to.equal([
                            [
                                TestRollMock.fixedRollResult *
                                    (TestRollMock.fixedRollResult - 1),
                            ],
                            [1 * (TestRollMock.fixedRollResult - 1)],
                        ]);
                        expect(roller.getStunTotal()).deep.to.equal(
                            roller.getBodyTotal() * roller.getStunMultiplier(),
                        );
                    });

                    it("should handle multiple dice", async function () {
                        const TestRollMock = Roll6Mock;

                        const roller = new HeroRoller({}, TestRollMock)
                            .make6eKillingRoll()
                            .addDice(3);

                        await roller.roll();

                        expect(roller.getBodyTerms()).deep.to.equal([
                            [
                                TestRollMock.fixedRollResult,
                                TestRollMock.fixedRollResult,
                                TestRollMock.fixedRollResult,
                            ],
                        ]);
                        expect(roller.getBodyTotal()).to.equal(
                            3 * TestRollMock.fixedRollResult,
                        );

                        expect(roller.getStunMultiplier()).to.equal(
                            Math.ceil(TestRollMock.fixedRollResult / 2),
                        );

                        expect(roller.getStunTerms()).deep.to.equal([
                            [
                                TestRollMock.fixedRollResult *
                                    Math.ceil(TestRollMock.fixedRollResult / 2),
                                TestRollMock.fixedRollResult *
                                    Math.ceil(TestRollMock.fixedRollResult / 2),
                                TestRollMock.fixedRollResult *
                                    Math.ceil(TestRollMock.fixedRollResult / 2),
                            ],
                        ]);
                        expect(roller.getStunTotal()).deep.to.equal(
                            3 *
                                TestRollMock.fixedRollResult *
                                Math.ceil(TestRollMock.fixedRollResult / 2),
                        );
                    });

                    it("should handle multiple dice with increased stun multiplier", async function () {
                        const TestRollMock = Roll6Mock;

                        const roller = new HeroRoller({}, TestRollMock)
                            .make6eKillingRoll()
                            .addStunMultiplier(7)
                            .addDice(3);

                        await roller.roll();

                        expect(roller.getBodyTerms()).deep.to.equal([
                            [
                                TestRollMock.fixedRollResult,
                                TestRollMock.fixedRollResult,
                                TestRollMock.fixedRollResult,
                            ],
                        ]);
                        expect(roller.getBodyTotal()).to.equal(
                            3 * TestRollMock.fixedRollResult,
                        );

                        expect(roller.getStunMultiplier()).to.equal(
                            Math.ceil(TestRollMock.fixedRollResult / 2) + 7,
                        );

                        expect(roller.getStunTerms()).deep.to.equal([
                            [
                                TestRollMock.fixedRollResult *
                                    (Math.ceil(
                                        TestRollMock.fixedRollResult / 2,
                                    ) +
                                        7),
                                TestRollMock.fixedRollResult *
                                    (Math.ceil(
                                        TestRollMock.fixedRollResult / 2,
                                    ) +
                                        7),
                                TestRollMock.fixedRollResult *
                                    (Math.ceil(
                                        TestRollMock.fixedRollResult / 2,
                                    ) +
                                        7),
                            ],
                        ]);
                        expect(roller.getStunTotal()).deep.to.equal(
                            3 *
                                TestRollMock.fixedRollResult *
                                (Math.ceil(TestRollMock.fixedRollResult / 2) +
                                    7),
                        );
                    });

                    it("should handle multiple dice with decreased stun multiplier", async function () {
                        const TestRollMock = Roll6Mock;

                        const roller = new HeroRoller({}, TestRollMock)
                            .make6eKillingRoll()
                            .addStunMultiplier(-1)
                            .addDice(3);

                        await roller.roll();

                        expect(roller.getBodyTerms()).deep.to.equal([
                            [
                                TestRollMock.fixedRollResult,
                                TestRollMock.fixedRollResult,
                                TestRollMock.fixedRollResult,
                            ],
                        ]);
                        expect(roller.getBodyTotal()).to.equal(
                            3 * TestRollMock.fixedRollResult,
                        );

                        expect(roller.getStunMultiplier()).to.equal(
                            Math.max(
                                1,
                                Math.ceil(TestRollMock.fixedRollResult / 2) - 1,
                            ),
                        );

                        expect(roller.getStunTerms()).deep.to.equal([
                            [
                                TestRollMock.fixedRollResult *
                                    Math.max(
                                        1,
                                        Math.ceil(
                                            TestRollMock.fixedRollResult / 2,
                                        ) - 1,
                                    ),
                                TestRollMock.fixedRollResult *
                                    Math.max(
                                        1,
                                        Math.ceil(
                                            TestRollMock.fixedRollResult / 2,
                                        ) - 1,
                                    ),
                                TestRollMock.fixedRollResult *
                                    Math.max(
                                        1,
                                        Math.ceil(
                                            TestRollMock.fixedRollResult / 2,
                                        ) - 1,
                                    ),
                            ],
                        ]);
                        expect(roller.getStunTotal()).deep.to.equal(
                            3 *
                                TestRollMock.fixedRollResult *
                                Math.max(
                                    1,
                                    Math.ceil(
                                        TestRollMock.fixedRollResult / 2,
                                    ) - 1,
                                ),
                        );
                    });

                    it("should clamp decreased stun multiplier to a minimum of 1", async function () {
                        const TestRollMock = Roll6Mock;

                        const roller = new HeroRoller({}, TestRollMock)
                            .make6eKillingRoll()
                            .addStunMultiplier(-7)
                            .addDice(3);

                        await roller.roll();

                        expect(roller.getBodyTerms()).deep.to.equal([
                            [
                                TestRollMock.fixedRollResult,
                                TestRollMock.fixedRollResult,
                                TestRollMock.fixedRollResult,
                            ],
                        ]);
                        expect(roller.getBodyTotal()).to.equal(
                            3 * TestRollMock.fixedRollResult,
                        );

                        expect(roller.getStunMultiplier()).to.equal(1);

                        expect(roller.getStunTerms()).deep.to.equal([
                            [
                                TestRollMock.fixedRollResult * 1,
                                TestRollMock.fixedRollResult * 1,
                                TestRollMock.fixedRollResult * 1,
                            ],
                        ]);
                        expect(roller.getStunTotal()).deep.to.equal(
                            3 * TestRollMock.fixedRollResult * 1,
                        );
                    });

                    it("should handle a standard effect full roll", async function () {
                        const TestRollMock = Roll6Mock;

                        const roller = new HeroRoller({}, TestRollMock)
                            .make5eKillingRoll()
                            .modifyToStandardEffect()
                            .addDice(3)
                            .addHalfDice()
                            .addNumber(1);

                        await roller.roll();

                        expect(roller.getBodyTerms()).deep.to.equal([
                            [
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL,
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL,
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL,
                            ],
                            [HeroRoller.STANDARD_EFFECT_HALF_DIE_ROLL],
                            [1],
                        ]);
                        expect(roller.getBodyTotal()).to.equal(
                            3 * HeroRoller.STANDARD_EFFECT_DIE_ROLL +
                                HeroRoller.STANDARD_EFFECT_HALF_DIE_ROLL +
                                1,
                        );

                        expect(roller.getStunMultiplier()).to.equal(
                            HeroRoller.STANDARD_EFFECT_DIE_ROLL,
                        );

                        expect(roller.getStunTerms()).deep.to.equal([
                            [
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL *
                                    HeroRoller.STANDARD_EFFECT_DIE_ROLL,
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL *
                                    HeroRoller.STANDARD_EFFECT_DIE_ROLL,
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL *
                                    HeroRoller.STANDARD_EFFECT_DIE_ROLL,
                            ],
                            [
                                HeroRoller.STANDARD_EFFECT_HALF_DIE_ROLL *
                                    HeroRoller.STANDARD_EFFECT_DIE_ROLL,
                            ],
                            [1 * HeroRoller.STANDARD_EFFECT_DIE_ROLL],
                        ]);
                        expect(roller.getStunTotal()).deep.to.equal(
                            3 *
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL *
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL +
                                HeroRoller.STANDARD_EFFECT_HALF_DIE_ROLL *
                                    HeroRoller.STANDARD_EFFECT_DIE_ROLL +
                                1 * HeroRoller.STANDARD_EFFECT_DIE_ROLL,
                        );
                    });

                    it("should handle a standard effect d6 - 1 roll", async function () {
                        const TestRollMock = Roll6Mock;

                        const roller = new HeroRoller({}, TestRollMock)
                            .make6eKillingRoll()
                            .modifyToStandardEffect()
                            .addDice(3)
                            .addDieMinus1()
                            .addNumber(1);

                        await roller.roll();

                        expect(roller.getBodyTerms()).deep.to.equal([
                            [
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL,
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL,
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL,
                            ],
                            [HeroRoller.STANDARD_EFFECT_DIE_ROLL],
                            [1],
                        ]);
                        expect(roller.getBodyTotal()).to.equal(
                            3 * HeroRoller.STANDARD_EFFECT_DIE_ROLL +
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL +
                                1,
                        );

                        expect(roller.getStunMultiplier()).to.equal(
                            HeroRoller.STANDARD_EFFECT_HALF_DIE_ROLL,
                        );

                        expect(roller.getStunTerms()).deep.to.equal([
                            [
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL *
                                    HeroRoller.STANDARD_EFFECT_HALF_DIE_ROLL,
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL *
                                    HeroRoller.STANDARD_EFFECT_HALF_DIE_ROLL,
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL *
                                    HeroRoller.STANDARD_EFFECT_HALF_DIE_ROLL,
                            ],
                            [
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL *
                                    HeroRoller.STANDARD_EFFECT_HALF_DIE_ROLL,
                            ],
                            [1 * HeroRoller.STANDARD_EFFECT_HALF_DIE_ROLL],
                        ]);
                        expect(roller.getStunTotal()).deep.to.equal(
                            3 *
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL *
                                HeroRoller.STANDARD_EFFECT_HALF_DIE_ROLL +
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL *
                                    HeroRoller.STANDARD_EFFECT_HALF_DIE_ROLL +
                                1 * HeroRoller.STANDARD_EFFECT_HALF_DIE_ROLL,
                        );
                    });

                    it("should handle hit locations (roll 6) with killing attacks", async function () {
                        const TestRollMock = Roll6Mock;

                        const roller = new HeroRoller({}, TestRollMock)
                            .make6eKillingRoll()
                            .modifyToHitLocation()
                            .addDice(3)
                            .addDieMinus1()
                            .addNumber(1);

                        await roller.roll();

                        const hitLocation = roller.getHitLocation();
                        expect(hitLocation).to.deep.equal({
                            name: "Foot",
                            side: "Right",
                            stunMultiplier: 1,
                            bodyMultiplier: 0.5,
                        });
                    });

                    it("should handle hit locations (roll 1) with killing attacks", async function () {
                        const TestRollMock = Roll1Mock;

                        const roller = new HeroRoller({}, TestRollMock)
                            .make6eKillingRoll()
                            .modifyToHitLocation()
                            .addDice(3)
                            .addDieMinus1()
                            .addNumber(1);

                        await roller.roll();

                        const hitLocation = roller.getHitLocation();
                        expect(hitLocation).to.deep.equal({
                            name: "Head",
                            side: "Left",
                            stunMultiplier: 5,
                            bodyMultiplier: 2,
                        });
                    });
                });
            });
        },
        { displayName: "HERO: Dice" },
    );
}
