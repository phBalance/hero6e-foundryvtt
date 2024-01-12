import { HeroRoller } from "../utility/dice.js";

class RollMock {
    static getClass(terms) {
        return RollMock.bind(null, terms);
    }

    constructor(terms, formula) {
        this._terms = terms;
        this._formula = formula;
    }

    async roll() {
        return this;
    }

    get dice() {
        return this._terms.flatMap((term) => {
            return term.results.map((result) => {
                // TODO: Depends on the type of term
                return result.result;
            });
        });
    }

    get total() {
        return this._terms.reduce((total, term) => {
            return total + term.number;
        }, 0);
    }
}

function diceTermCount(number, faces) {
    return {
        number: number,
        faces: faces,
    };
}

function termResult(results) {
    return {
        results: results.map((result) => {
            return {
                result: result,
                active: true,
                count: result,
                success: false,
                failure: true,
                discarded: false,
                rerolled: false,
                exploded: false,
            };
        }),
    };
}

const FROM_1d6_RETURN_1x1 = [
    new DiceTerm({
        ...diceTermCount(1, 6),
        ...termResult([1]),
    }),
];

const FROM_3d6_RETURN_3x1 = [
    new DiceTerm({
        ...diceTermCount(3, 6),
        ...termResult([1, 1, 1]),
    }),
];

const sumTerms = (terms) =>
    terms.reduce((total, term) => {
        return (
            total +
            term.reduce((total, die) => {
                return total + die;
            }, 0)
        );
    }, 0);

export function registerDiceTests(quench) {
    quench.registerBatch(
        "hero6efoundryvttv2.utils.dice",
        (context) => {
            const { describe, expect, it } = context;
            describe("HeroRoller", function () {
                // TODO: add back when actually mocking Roll appropriately
                // it("should take a 1 term, 1 die equation", async function () {
                //     // 1d6 roller
                //     const mockRoll = RollMock.getClass(FROM_1d6_RETURN_1x1);
                //     const roller = new HeroRoller({}, {}, mockRoll)
                //         .addDice(1, 6)
                //         .add(1);

                //     await roller.roll();

                //     expect(roller.getBaseTerms()).deep.to.equal([1]);
                //     expect(roller.getBaseTotal()).to.equal(2);
                // });

                // it("should take a 1 term, 3 die equation", async function () {
                //     // 3d6 roller
                //     const mockRoll = RollMock.getClass(FROM_3d6_RETURN_3x1);
                //     const roller = new HeroRoller({}, {}, mockRoll)
                //         .addDice(3, 6)
                //         .add(1);

                //     await roller.roll();

                //     expect(roller.getBaseTerms()).deep.to.equal([1, 1, 1]);
                //     expect(roller.getBaseTotal()).to.equal(4);
                // });

                it("should roll the dice and return the data for an untyped roll", async function () {
                    const roller = new HeroRoller().addDice(2, 6).add(1);

                    await roller.roll();

                    expect(roller.getBaseTerms().length).to.equal(1);
                    expect(roller.getBaseTotal()).to.equal(
                        sumTerms(roller.getBaseTerms()) + 1,
                    );
                });

                it("should roll the dice and return the data for a single term untyped roll", async function () {
                    const roller = new HeroRoller().addDice(2, 6).add(2);

                    await roller.roll();

                    expect(roller.getBaseTerms().length).to.equal(1);
                    expect(roller.getBaseTotal()).to.equal(
                        sumTerms(roller.getBaseTerms()) + 2,
                    );
                });

                it("should roll the dice and return the data for a multiple term untyped roll", async function () {
                    const roller = new HeroRoller()
                        .addDice(2, 6)
                        .addDice(5, 6)
                        .add(2);

                    await roller.roll();

                    expect(roller.getBaseTerms().length).to.equal(2);
                    expect(roller.getBaseTotal()).to.equal(
                        sumTerms(roller.getBaseTerms()) + 2,
                    );
                });

                it(
                    "should roll the dice and return the data for a normal attack damage roll",
                );

                it(
                    "should roll the dice and return the data for a killing attack damage roll",
                );

                it(
                    "should roll the dice and return the data for an adjustment attack damage roll",
                );

                it(
                    "should roll the dice and return the data for an entangle attack damage roll",
                );

                it(
                    "should roll the dice and return the data for an flash attack damage roll",
                );
            });
        },
        { displayName: "HERO: Dice" },
    );
}
