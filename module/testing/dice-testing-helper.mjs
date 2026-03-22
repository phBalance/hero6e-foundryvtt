const Die = foundry.dice.terms.Die;

export function FixedDieRoll(fixedRollResult) {
    return class extends Die {
        constructor(termData = {}) {
            super(termData);
        }

        /**
         * Roll for this die, but always roll rollResult (i.e. it's not random)
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

export function DynamicDieRoll(generateRollResult) {
    return class extends Die {
        constructor(termData = {}) {
            super(termData);
        }

        /**
         * Roll for this die based on the provided function
         */
        _evaluate() {
            for (let i = 0; i < this.number; ++i) {
                const roll = { result: generateRollResult(), active: true };
                this.results.push(roll);
            }

            return this;
        }
    };
}

export class RollMock extends Roll {
    static DieClass = Die;

    static fromTerms(terms, options) {
        const newTerms = terms.map((term) => {
            // Replace all Die with a DieClass that will always return an expected behavior when rolling
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

        // eslint-disable-next-line no-use-before-define -- Recursive definition should be fine here
        const mock = new Roll1Mock(formula, options);
        mock.terms = newTerms;

        return mock;
    }

    constructor(formula, data, options) {
        super(formula, data, options);
    }
}

export class Roll6Mock extends RollMock {
    static fixedRollResult = 6;
    static DieClass = FixedDieRoll(this.fixedRollResult);
}

export class Roll5Mock extends RollMock {
    static fixedRollResult = 5;
    static DieClass = FixedDieRoll(this.fixedRollResult);
}

export class Roll3Mock extends RollMock {
    static fixedRollResult = 3;
    static DieClass = FixedDieRoll(this.fixedRollResult);
}

export class Roll2Mock extends RollMock {
    static fixedRollResult = 2;
    static DieClass = FixedDieRoll(this.fixedRollResult);
}

export class Roll1Mock extends RollMock {
    static fixedRollResult = 1;
    static DieClass = FixedDieRoll(this.fixedRollResult);
}

export function buildGenerateLinearRollResultFunction(start, end, step) {
    let result = start;

    return {
        generate: function generateRoll() {
            const value = result;
            result = result + step;
            if (result > end) result = start;
            if (result < start) result = end;
            return value;
        },
        reset: function resetRollResult() {
            result = start;
        },
    };
}

export function buildGenerateAlternatingRollResultFunction(first, other) {
    let result = first;

    return {
        generate: function generateRoll() {
            const value = result;
            result = result === first ? other : first;
            return value;
        },
        reset: function resetRollResult() {
            result = first;
        },
    };
}

export class Roll1Through6Mock extends RollMock {
    static generatorInfo = buildGenerateLinearRollResultFunction(1, 6, 1);
    static DieClass = DynamicDieRoll(Roll1Through6Mock.generatorInfo.generate);
}

export class RollAlternatingLuckAndUnluck extends RollMock {
    static generatorInfo = buildGenerateAlternatingRollResultFunction(6, 1);
    static DieClass = DynamicDieRoll(RollAlternatingLuckAndUnluck.generatorInfo.generate);
}
