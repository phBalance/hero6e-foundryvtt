// TODO: Not sure what this comment means or what the purpose of this is
// TODO: This should probably be returning the new object?
// Finish spoofing terms for die roll
export function spoofDiceRoll(newTerms) {
    for (const idx in newTerms) {
        const term = newTerms[idx];
        switch (term.class) {
            case "Die":
                newTerms[idx] = Object.assign(new Die(), term);
                break;
            case "OperatorTerm":
                newTerms[idx] = Object.assign(new OperatorTerm(), term);
                break;
            case "NumericTerm":
                newTerms[idx] = Object.assign(new NumericTerm(), term);
                break;
            default:
                console.warn(`Unknown dice term class ${term.class}`);
                break;
        }
    }
}

// TODO: Not sure if this is a useful name or method.
export function getSumOfTermsResults(terms) {
    return getAllTermsResults(terms).reduce((sum, current) => {
        return sum + current;
    }, 0);
}

export function getAllTermsResults(terms) {
    return getAllDieTerms(terms).map((resultObj) => resultObj.result);
}

export function getAllDieTerms(terms) {
    return terms
        .filter((term) => term.class === "Die")
        .flatMap((term) => term.results);
}

export function generatePseudoRollFromTerms(terms) {
    spoofDiceRoll(terms);

    const newRoll = Roll.fromTerms(terms);
    newRoll._total = getSumOfTermsResults(terms);
    newRoll.title = getAllTermsResults(terms);
    newRoll._evaluated = true;

    return newRoll;
}

export const ROLL_TYPE = {
    SUCCESS: 0,
    NORMAL: 1,
    KILLING: 2,
    ADJUSTMENT: 3,
    ENTANGLE: 4,
    FLASH: 5,
};

function toSignedString(value) {
    return `${value < 0 ? "" : "+"}${value}`;
}

function sumTerms(terms) {
    return terms.reduce((total, term) => {
        return (
            total +
            term.reduce((subTotal, result) => {
                return subTotal + result;
            }, 0)
        );
    }, 0);
}

function sum(terms) {
    return terms.reduce((total, result) => {
        return total + result;
    }, 0);
}

export class HeroRoller {
    constructor(options, rollClass = Roll) {
        this._buildRollClass = rollClass;
        this._options = options;
        this._rollObj = undefined;

        this._formulaTerms = [];
        this._type = ROLL_TYPE.SUCCESS;
    }

    getType() {
        return this._type;
    }

    makeNormalRoll() {
        this._type = ROLL_TYPE.NORMAL;
        return this;
    }

    makeKillingRoll() {
        this._type = ROLL_TYPE.KILLING;
        return this;
    }

    makeAdjustmentRoll() {
        this._type = ROLL_TYPE.ADJUSTMENT;
        return this;
    }

    makeEntangleRoll() {
        this._type = ROLL_TYPE.ENTANGLE;
        return this;
    }

    makeFlashRoll() {
        this._type = ROLL_TYPE.FLASH;
        return this;
    }

    _linkIfNotFirstTerm(operator = "+") {
        if (this._formulaTerms.length > 0) {
            this._formulaTerms.push(new OperatorTerm({ operator: operator }));
        }
    }

    addDice(numDice) {
        this._linkIfNotFirstTerm();

        this._formulaTerms.push(
            new Die({
                faces: 6,
                number: numDice,
                options: { flavor: "add dice" },
            }),
        );

        return this;
    }

    addHalfDie() {
        this._linkIfNotFirstTerm();

        this._formulaTerms.push(
            new Die({
                faces: 6,
                number: 1,
                options: { flavor: "half die" },
            }),
        );

        return this;
    }

    addDieMinus1() {
        this._linkIfNotFirstTerm();

        this._formulaTerms.push(
            new Die({
                faces: 6,
                number: 1,
                options: { flavor: "less 1 pip" },
            }),
        );

        return this;
    }

    subDice(numDice) {
        this._linkIfNotFirstTerm("-");

        this._formulaTerms.push(
            new Die({
                faces: 6,
                number: numDice,
                options: { flavor: "sub dice" },
            }),
        );

        return this;
    }

    addNumber(value) {
        this._linkIfNotFirstTerm();

        this._formulaTerms.push(
            new NumericTerm({
                number: value,
                options: { flavor: "add number" },
            }),
        );

        return this;
    }

    subNumber(value) {
        this._linkIfNotFirstTerm("-");

        this._formulaTerms.push(
            new NumericTerm({
                number: value,
                options: { flavor: "sub number" },
            }),
        );

        return this;
    }

    async roll(options) {
        this._rollObj = this._buildRollClass.fromTerms(
            this._formulaTerms,
            this._options,
        );

        await this._rollObj.evaluate({ ...options, async: true });

        this._rawBaseTerms = this._rollObj.terms;
        // this._rawBaseTerms = this._rollObj.dice;
        this._baseResult = this._rollObj.result;

        this._calculate();

        return this;
    }

    getSuccessTerms() {
        let terms;

        if (this._type === ROLL_TYPE.SUCCESS) {
            terms = this.getBaseTerms();
        } else {
            console.error(
                `asking for stun from ${this._type} type doesn't make sense`,
            );
            terms = [];
        }

        return terms;
    }
    getSuccessTotal() {
        let total;

        if (this._type === ROLL_TYPE.SUCCESS) {
            total = this.getBaseTotal();
        } else {
            console.error(
                `asking for stun from ${this._type} type doesn't make sense`,
            );
            total = [];
        }

        return total;
    }

    getStunTerms() {
        let terms;

        if (this._type === ROLL_TYPE.NORMAL) {
            terms = this.getBaseTerms();
        } else {
            console.error(
                `asking for stun from ${this._type} type doesn't make sense`,
            );
            terms = [];
        }

        return terms;
    }
    getStunTotal() {
        let total;

        if (this._type === ROLL_TYPE.NORMAL) {
            total = this.getBaseTotal();
        } else {
            console.error(
                `asking for stun from ${this._type} type doesn't make sense`,
            );
            total = [];
        }

        return total;
    }

    getBodyTerms() {
        let terms;

        if (this._type === ROLL_TYPE.NORMAL) {
            terms = this.getCalculatedTerms();
        } else {
            console.error(
                `asking for stun from ${this._type} type doesn't make sense`,
            );
            terms = [];
        }

        return terms;
    }
    getBodyTotal() {
        let total;

        if (this._type === ROLL_TYPE.NORMAL) {
            total = this.getCalculatedTotal();
        } else {
            console.error(
                `asking for stun from ${this._type} type doesn't make sense`,
            );
            total = [];
        }

        return total;
    }

    getBaseTerms() {
        return this._baseTerms;
    }

    getBaseTotal() {
        return this._baseTotal;
    }

    getCalculatedTerms() {
        if (
            this._type === ROLL_TYPE.SUCCESS ||
            this._type === ROLL_TYPE.ENTANGLE ||
            this._type === ROLL_TYPE.FLASH
        ) {
            console.error(
                `attempting to get calculatedTerms for roll type ${this._type}`,
            );
        }

        return this._calculatedTerms;
    }

    getCalculatedTotal() {
        return this._calculatedTotal;
    }

    // TODO: toJSON toObject

    _calculateValue(result) {
        switch (this._type) {
            case ROLL_TYPE.SUCCESS:
            case ROLL_TYPE.ADJUSTMENT:
                // Do nothing as there is no calculated values
                break;

            case ROLL_TYPE.NORMAL:
                // Calculate BODY
                if (result <= 1) {
                    return 0;
                } else if (result === 6) {
                    return 2;
                }

                return 1;

            case ROLL_TYPE.ENTANGLE:
            case ROLL_TYPE.FLASH:
            case ROLL_TYPE.KILLING:
            default:
                console.error(`Unhandled calculation for type ${this._type}`);
        }
    }

    _calculate() {
        this._calculatedTerms = [];

        let lastOperatorMultiplier = 1;

        this._baseTerms = this._rawBaseTerms
            .map((term) => {
                if (term instanceof NumericTerm) {
                    const number = lastOperatorMultiplier * term.number;

                    this._calculatedTerms.push(this._calculateValue(number));

                    return [number];
                } else if (term instanceof OperatorTerm) {
                    // NOTE: No need to handle multiplication and division
                    lastOperatorMultiplier = term.operator === "-" ? -1 : 1;
                } else if (term instanceof Die) {
                    return term.results.map((result) => {
                        let adjustedValue =
                            lastOperatorMultiplier * result.result;

                        if (term.options.flavor === "half die") {
                            adjustedValue = Math.ceil(result / 2);
                        } else if (term.options.flavor === "less 1 pip") {
                            adjustedValue = result - 1;
                        }

                        this._calculatedTerms.push(
                            this._calculateValue(adjustedValue),
                        );

                        return adjustedValue;
                    });
                } else {
                    // Other term types will return undefined and be filtered out
                    // although we shouldn't ever get them.
                }
            })
            .filter(Boolean);

        this._baseTotal = sumTerms(this._baseTerms);
        this._calculatedTotal = sum(this._calculatedTerms);
    }
}
