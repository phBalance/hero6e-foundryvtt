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

function sumTerms(terms) {
    return terms.reduce((total, term) => {
        return total + sum(term);
    }, 0);
}

function sum(term) {
    return term.reduce((subTotal, result) => {
        return subTotal + result;
    }, 0);
}

export function signedString(value) {
    return `${value < 0 ? "" : "+"}${value}`;
}

export class HeroRoller {
    static STANDARD_EFFECT_DIE_ROLL = 3;
    static STANDARD_EFFECT_HALF_DIE_ROLL = 1;

    constructor(options, rollClass = Roll) {
        this._buildRollClass = rollClass;
        this._options = options;
        this._rollObj = undefined;

        this._formulaTerms = [];
        this._type = ROLL_TYPE.SUCCESS;
        this._standardEffect = false;
    }

    getType() {
        return this._type;
    }

    makeSuccessRoll(apply = true) {
        if (apply) {
            this._type = ROLL_TYPE.SUCCESS;
        }
        return this;
    }

    makeNormalRoll(apply = true) {
        if (apply) {
            this._type = ROLL_TYPE.NORMAL;
        }
        return this;
    }

    make5eKillingRoll(apply = true) {
        if (apply) {
            this._type = ROLL_TYPE.KILLING;
            this._killingStunMultiplier = "1d6-1";
        }
        return this;
    }
    make6eKillingRoll(apply = true) {
        if (apply) {
            this._type = ROLL_TYPE.KILLING;
            this._killingStunMultiplier = "1d3";
        }
        return this;
    }

    makeAdjustmentRoll(apply = true) {
        if (apply) {
            this._type = ROLL_TYPE.ADJUSTMENT;
        }
        return this;
    }

    makeEntangleRoll(apply = true) {
        if (apply) {
            this._type = ROLL_TYPE.ENTANGLE;
        }
        return this;
    }

    makeFlashRoll(apply = true) {
        if (apply) {
            this._type = ROLL_TYPE.FLASH;
        }
        return this;
    }

    modifyToStandardEffect(apply = true) {
        if (apply) {
            this._standardEffect = true;
        }
        return this;
    }

    _linkIfNotFirstTerm(operator = "+") {
        if (this._formulaTerms.length > 0) {
            this._formulaTerms.push(new OperatorTerm({ operator: operator }));
        }
    }

    // TODO: May wish to add tagging information to each of these. Are tags always 1:1?
    addDice(numDice) {
        if (!numDice) {
            return this;
        }

        this._linkIfNotFirstTerm();

        this._formulaTerms.push(
            new Die({
                faces: 6,
                number: numDice,
                options: { _hrFlavor: "add dice" },
            }),
        );

        return this;
    }

    addHalfDie(numDice = 1) {
        if (!numDice) {
            return this;
        }

        this._linkIfNotFirstTerm();

        this._formulaTerms.push(
            new Die({
                faces: 6,
                number: numDice,
                options: { _hrFlavor: "half die" },
            }),
        );

        return this;
    }

    addDieMinus1(numDice = 1) {
        if (!numDice) {
            return this;
        }

        this._linkIfNotFirstTerm();

        this._formulaTerms.push(
            new Die({
                faces: 6,
                number: numDice,
                options: { _hrFlavor: "less 1 pip" },
            }),
        );

        return this;
    }

    addDieMinus1Min1(numDice = 1) {
        if (!numDice) {
            return this;
        }

        this._linkIfNotFirstTerm();

        this._formulaTerms.push(
            new Die({
                faces: 6,
                number: numDice,
                options: { _hrFlavor: "less 1 pip min 1" },
            }),
        );

        return this;
    }

    subDice(numDice) {
        if (!numDice) {
            return this;
        }

        this._linkIfNotFirstTerm("-");

        this._formulaTerms.push(
            new Die({
                faces: 6,
                number: numDice,
                options: { _hrFlavor: "sub dice" },
            }),
        );

        return this;
    }

    // TODO: Experiment with adding description as flavor and autogenerated tags.
    addNumber(value, description) {
        if (!value) {
            return this;
        }

        this._linkIfNotFirstTerm();

        this._formulaTerms.push(
            new NumericTerm({
                number: value,
                options: {
                    _hrFlavor: "add number",
                    flavor: description,
                    _hrTag: {
                        name: description,
                        value: value,
                    },
                },
            }),
        );

        return this;
    }

    subNumber(value) {
        if (!value) {
            return this;
        }

        this._linkIfNotFirstTerm("-");

        this._formulaTerms.push(
            new NumericTerm({
                number: value,
                options: { _hrFlavor: "sub number" },
            }),
        );

        return this;
    }

    async roll(options) {
        this._rollObj = this._buildRollClass.fromTerms(
            this._formulaTerms,
            this._options,
        );

        await this._rollObj.evaluate({
            ...options,
            async: true,
        });

        // Convert to standard effect if appropriate.
        this._rollObj.terms = this._applyStandardEffectIfAppropriate(
            this._rollObj.terms,
        );

        if (this._type === ROLL_TYPE.KILLING) {
            let hr = new HeroRoller({}, this._buildRollClass)
                .addDieMinus1Min1(
                    this._killingStunMultiplier === "1d6-1" ? 1 : 0,
                )
                .addHalfDie(this._killingStunMultiplier === "1d3" ? 1 : 0);
            hr = this._standardEffect ? hr.modifyToStandardEffect() : hr;

            await hr.roll({ async: true });

            this._baseMultiplier = hr.getSuccessTotal();
        }

        this._rawBaseTerms = this._rollObj.terms;

        this._calculate();

        return this;
    }

    // TODO: May wish to consider our own custom chat template for this.
    // TODO: May wish to consider no flavour, but rather have it be the type of roll?
    async render() {
        const template = this._buildRollClass.CHAT_TEMPLATE;

        // TODO: This is really placeholder
        // TODO: Formula
        const chatData = {
            formula: this._buildFormula(),
            flavor: null,
            user: game.user.id,
            tooltip: this._buildTooltip(),
            total: this._baseTotal,
        };

        return renderTemplate(template, chatData);
    }

    tags() {
        return this._formulaTerms
            .map((term) => {
                return term.options._hrTag;
            })
            .filter(Boolean);
    }

    getSuccessTerms() {
        if (this._type === ROLL_TYPE.SUCCESS) {
            return this.getBaseTerms();
        }

        throw new Error(
            `asking for success from type ${this._type} doesn't make sense`,
        );
    }
    getSuccessTotal() {
        if (this._type === ROLL_TYPE.SUCCESS) {
            return this.getBaseTotal();
        }

        throw new Error(
            `asking for success from type ${this._type} doesn't make sense`,
        );
    }

    getStunTerms() {
        if (this._type === ROLL_TYPE.NORMAL) {
            return this.getBaseTerms();
        } else if (this._type === ROLL_TYPE.KILLING) {
            return this.getCalculatedTerms();
        }

        throw new Error(
            `asking for stun from type ${this._type} doesn't make sense`,
        );
    }
    getStunTotal() {
        if (this._type === ROLL_TYPE.NORMAL) {
            return this.getBaseTotal();
        } else if (this._type === ROLL_TYPE.KILLING) {
            return this.getCalculatedTotal();
        }

        throw new Error(
            `asking for stun from type ${this._type} doesn't make sense`,
        );
    }
    getStunMultiplier() {
        if (this._type === ROLL_TYPE.KILLING) {
            return this.getBaseMultiplier();
        }

        throw new Error(
            `asking for stun multiplier from type ${this._type} doesn't make sense`,
        );
    }

    getBodyTerms() {
        if (this._type === ROLL_TYPE.NORMAL) {
            return this.getCalculatedTerms();
        } else if (this._type === ROLL_TYPE.KILLING) {
            return this.getBaseTerms();
        }

        throw new Error(
            `asking for body from type ${this._type} doesn't make sense`,
        );
    }
    getBodyTotal() {
        if (this._type === ROLL_TYPE.NORMAL) {
            return this.getCalculatedTotal();
        } else if (this._type === ROLL_TYPE.KILLING) {
            return this.getBaseTotal();
        }

        throw new Error(
            `asking for body from type ${this._type} doesn't make sense`,
        );
    }

    getBaseTerms() {
        return this._baseTerms;
    }
    getBaseTotal() {
        return this._baseTotal;
    }
    getBaseMultiplier() {
        return this._baseMultiplier;
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
                // Do nothing as there are no calculated values
                break;

            case ROLL_TYPE.NORMAL:
                // Calculate BODY
                if (result <= 1) {
                    return 0;
                } else if (result === 6) {
                    return 2;
                }

                return 1;

            case ROLL_TYPE.KILLING:
                return result * this._baseMultiplier;

            case ROLL_TYPE.ENTANGLE:
            case ROLL_TYPE.FLASH:
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
                    const hrExtra = {
                        term: "Numeric",
                        flavor: term.options._hrFlavor,
                    };

                    const newCalculatedTerm = [this._calculateValue(number)];
                    newCalculatedTerm._hrExtra = hrExtra;
                    this._calculatedTerms.push(newCalculatedTerm);

                    const newBaseTerm = [number];
                    newBaseTerm._hrExtra = hrExtra;
                    return newBaseTerm;
                } else if (term instanceof OperatorTerm) {
                    // NOTE: No need to handle multiplication and division as
                    //       this class doesn't support it.
                    lastOperatorMultiplier = term.operator === "-" ? -1 : 1;
                } else if (term instanceof Die) {
                    const calculatedTerms = [];
                    const hrExtra = {
                        term: "Dice",
                        flavor: term.options._hrFlavor,
                    };
                    calculatedTerms._hrExtra = hrExtra;

                    const termResults = term.results.map((result) => {
                        let adjustedValue =
                            lastOperatorMultiplier * result.result;

                        if (term.options._hrFlavor === "half die") {
                            adjustedValue = Math.ceil(result.result / 2);
                        } else if (
                            term.options._hrFlavor === "less 1 pip" &&
                            !this._standardEffect
                        ) {
                            adjustedValue = result.result - 1;
                        } else if (
                            term.options._hrFlavor === "less 1 pip min 1" &&
                            !this._standardEffect
                        ) {
                            adjustedValue = Math.max(1, result.result - 1);
                        }

                        calculatedTerms.push(
                            this._calculateValue(adjustedValue),
                        );

                        return adjustedValue;
                    });

                    this._calculatedTerms.push(calculatedTerms);

                    termResults._hrExtra = hrExtra;
                    return termResults;
                } else {
                    // Other term types will return undefined and be filtered out
                    // although we shouldn't ever get them.
                }
            })
            .filter(Boolean);

        this._baseTotal = sumTerms(this._baseTerms);

        if (this._type !== ROLL_TYPE.SUCCESS) {
            this._calculatedTotal = sumTerms(this._calculatedTerms);
        }
    }

    _buildFormula() {
        const formula = this._formulaTerms.reduce((formulaSoFar, term) => {
            // TODO: This will work until we allow modification post evaluation
            // TODO: Will need to fix things like " + " concatenated with "-2"
            return formulaSoFar + term.formula;
        }, "");

        return formula;
    }

    _buildTooltip() {
        // TODO: Need to add in the calculated results too.

        return `<div class="dice-tooltip">
                    <section class="tooltip-part">
                        ${this._buildDiceTooltip()}
                    </section>
                </div>`;
    }

    _buildDiceTooltip() {
        return this._baseTerms.reduce((soFar, term) => {
            if (term._hrExtra.term === "Dice") {
                const total = Math.abs(sum(term));
                const formula = this._buildFormulaForDiceTerm(term);
                return `${soFar}
                        <div class="dice">
                            <header class="part-header flexrow">
                                <span class="part-formula">${formula}</span>
                                
                                <span class="part-total">${total}</span>
                            </header>
                            <ol class="dice-rolls">
                                ${this._buildDiceRollsTooltip(term)}
                            </ol>
                        </div>
                    `;
            }

            return soFar;
        }, "");
    }

    _buildFormulaForDiceTerm(diceTerm) {
        if (diceTerm._hrExtra.flavor === "half die") {
            return `½d6`;
        } else if (
            diceTerm._hrExtra.flavor === "less 1 pip" ||
            diceTerm._hrExtra.flavor === "less 1 pip min 1"
        ) {
            return `d6-1`;
        } else {
            return `${diceTerm.length}d6`;
        }
    }

    _buildDiceRollsTooltip(diceTerm) {
        return diceTerm.reduce((soFar, result) => {
            const absNumber = Math.abs(result);
            return `${soFar}<li class="roll die d6 ${
                absNumber <= 1 ? "min" : absNumber === 6 ? "max" : ""
            }">${absNumber}</li>`;
        }, "");
    }

    _applyStandardEffectIfAppropriate(formulaTerms) {
        if (this._standardEffect) {
            for (let i = 0; i < formulaTerms.length; ++i) {
                if (formulaTerms[i] instanceof Die) {
                    for (let j = 0; j < formulaTerms[i].results.length; ++j) {
                        if (formulaTerms[i].options._hrFlavor === "half die") {
                            formulaTerms[i].results[j].result =
                                HeroRoller.STANDARD_EFFECT_HALF_DIE_ROLL;
                        } else {
                            // NOTE: 5e p. 104 & 6E1 p.133. Full die and (die - 1) count as 3.
                            formulaTerms[i].results[j].result =
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL;
                        }
                    }
                }
            }
        }

        return formulaTerms;
    }
}
