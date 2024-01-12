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
    UNTYPED: 0,
    NORMAL: 1,
    KILLING: 2,
    ADJUSTMENT: 3,
    ENTANGLE: 4,
    FLASH: 5,
};

function toSignedString(value) {
    return `${value < 0 ? "" : "+"}${value}`;
}

export class HeroRoller {
    constructor(data, options, rollClass = Roll) {
        this._buildRollClass = rollClass;
        this._data = data;
        this._options = options;
        this._rollObj = undefined;

        this._equation = [];
        this._type = ROLL_TYPE.UNTYPED;
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

    addDice(numDice, numFaces) {
        this._equation.push({
            type: "dice",
            faces: numFaces,
            numDice: numDice,
        });
        return this;
    }

    add(value) {
        this._equation.push({ type: "add", value: value });
        return this;
    }

    sub(value) {
        this._equation.push({ type: "sub", value: value });
        return this;
    }

    async roll(options) {
        const formula = this._makeFormula();
        this._rollObj = new this._buildRollClass(
            formula,
            this._data,
            this._options,
        );

        await this._rollObj.roll({ ...options, async: true });

        this._rawBaseTerms = this._rollObj.dice;
        this._baseTotal = this._rollObj.total;
        this._baseResult = this._rollObj.result;

        this._calculate();

        return this;
    }

    getBaseTerms() {
        return this._baseTerms;
    }

    getBaseTotal() {
        return this._baseTotal;
    }

    getCalculatedTerms() {
        if (
            this._type === ROLL_TYPE.UNTYPED ||
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

    _makeFormula() {
        let formula = "";

        for (const [index, term] of this._equation.entries()) {
            switch (term.type) {
                case "dice":
                    formula += `${toSignedString(term.numDice)}d${term.faces}`;
                    break;
                case "add":
                    formula += `${toSignedString(term.value)}`;
                    break;
                case "sub":
                    {
                        const value = -term.value;
                        formula += `${toSignedString(value)}`;
                    }
                    break;
            }
        }

        return formula;
    }

    _calculate() {
        // Convert raw base terms into an array of results
        this._baseTerms = this._rawBaseTerms.map((term) => {
            if (term instanceof DiceTerm) {
                return term.results.map((result) => {
                    return result.result;
                });
            } else {
                console.error(`unimplemented`);
            }
        });

        // TODO: Calculate
        switch (this._type) {
            case ROLL_TYPE.UNTYPED:
                break;

            case ROLL_TYPE.NORMAL:
                this._calculatedTerms = this._baseTerms.map((term) => {
                    if (term === 1) {
                        return 0;
                    } else if (term === 6) {
                        return 2;
                    } else {
                        return 1;
                    }
                });

                this._calculatedTotal = this._calculatedTerms.reduce(
                    (total, term) => {
                        return total + term;
                    },
                    0,
                );
                break;

            default:
                console.error(`unimplemented type ${this._type}`);
                break;
        }
    }
}
