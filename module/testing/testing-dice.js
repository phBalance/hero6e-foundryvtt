import { HeroRoller } from "../utility/dice.js";

class MinRollDie extends Die {
    constructor(termData = {}) {
        super(termData);
    }

    /**
     * Roll for this Die, but always roll a 1.
     */
    _evaluate() {
        for (let i = 0; i < this.number; ++i) {
            const roll = { result: 1, active: true };
            this.results.push(roll);
        }

        return this;
    }
}

class RollMock extends Roll {
    static fromTerms(terms, options) {
        const newTerms = terms.map((term) => {
            // Replace all Die with a Die class that will always return 1 when rolling
            if (term instanceof Die) {
                return new MinRollDie({
                    number: term.number,
                    faces: term.faces,
                });
            }

            return term;
        });

        const formula = Roll.getFormula(newTerms);

        const mock = new RollMock(formula, options);
        mock.terms = newTerms;

        return mock;
    }

    constructor(formula, data, options) {
        super(formula, data, options);
    }
}

export function registerDiceTests(quench) {
    quench.registerBatch(
        "hero6efoundryvttv2.utils.dice",
        (context) => {
            const { describe, expect, it } = context;
            describe("HeroRoller", function () {
                describe("success roll", function () {
                    it("should handle a 1 pip equation", async function () {
                        const roller = new HeroRoller({}, RollMock).addNumber(
                            1,
                        );

                        await roller.roll();

                        expect(roller.getSuccessTerms()).deep.to.equal([[1]]);
                        expect(roller.getSuccessTotal()).to.equal(1);
                    });

                    it("should take a 1 term, 1 die equation", async function () {
                        const roller = new HeroRoller({}, RollMock).addDice(
                            1,
                            6,
                        );

                        await roller.roll();

                        expect(roller.getSuccessTerms()).deep.to.equal([[1]]);
                        expect(roller.getSuccessTotal()).to.equal(1);
                    });

                    it("should take a 2 term, 1 die equation", async function () {
                        const roller = new HeroRoller({}, RollMock)
                            .addDice(1)
                            .addNumber(1);

                        await roller.roll();

                        expect(roller.getSuccessTerms()).deep.to.equal([
                            [1],
                            [1],
                        ]);
                        expect(roller.getSuccessTotal()).to.equal(2);
                    });

                    it("should take a typical attack roll equation", async function () {
                        const roller = new HeroRoller({}, RollMock)
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
                            [-1, -1, -1],
                        ]);
                        expect(roller.getSuccessTotal()).deep.to.equal(16);
                    });
                });
            });
        },
        { displayName: "HERO: Dice" },
    );
}
