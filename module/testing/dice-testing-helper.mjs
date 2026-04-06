import { HeroRoll } from "../utility/dice.mjs";

class SequentialDie extends foundry.dice.terms.Die {
    static fixedRollResult = null;

    static rollArray = [];
    static rollIndex = 0;

    static resetIndex() {
        this.rollIndex = 0;
    }

    constructor(termData) {
        super(termData);

        if (this.constructor.rollArray.length == null || this.constructor.rollArray.length === 0) {
            throw new Error("Invalid rollArray - need to override it");
        }
    }

    /**
     * Roll for this die, but always roll rollResult (i.e. it's not random)
     */
    _evaluate() {
        for (let i = 0; i < this.number; ++i) {
            const result = this.constructor.rollArray[this.constructor.rollIndex];
            this.constructor.rollIndex = (this.constructor.rollIndex + 1) % this.constructor.rollArray.length;
            const roll = { result: result, active: true };
            this.results.push(roll);
        }

        return this;
    }
}

export class DieRolls1 extends SequentialDie {
    static fixedRollResult = 1;

    static rollArray = [1];
}

export class DieRolls2 extends SequentialDie {
    static fixedRollResult = 2;
    static rollArray = [2];
}

export class DieRolls3 extends SequentialDie {
    static fixedRollResult = 3;
    static rollArray = [3];
}

export class DieRolls4 extends SequentialDie {
    static fixedRollResult = 4;
    static rollArray = [4];
}

export class DieRolls5 extends SequentialDie {
    static fixedRollResult = 5;
    static rollArray = [5];
}

export class DieRolls6 extends SequentialDie {
    static fixedRollResult = 6;
    static rollArray = [6];
}

export class DieRolls123456 extends SequentialDie {
    static rollArray = [1, 2, 3, 4, 5, 6];
}

export class DieRolls61 extends SequentialDie {
    static rollArray = [6, 1];
}

export class DieRolls611 extends SequentialDie {
    static rollArray = [6, 1, 1];
}

export class DieRolls661 extends SequentialDie {
    static rollArray = [6, 6, 1];
}

export class DieRolls112 extends SequentialDie {
    static rollArray = [1, 1, 2];
}

export class DieRolls113 extends SequentialDie {
    static rollArray = [1, 1, 3];
}

export class DieRolls114 extends SequentialDie {
    static rollArray = [1, 1, 4];
}

export class DieRolls223 extends SequentialDie {
    static rollArray = [2, 2, 3];
}

export class DieRolls323 extends SequentialDie {
    static rollArray = [3, 2, 3];
}

export class DieRolls433 extends SequentialDie {
    static rollArray = [4, 3, 3];
}

export class DieRolls515 extends SequentialDie {
    static rollArray = [5, 1, 5];
}

export class DieRolls525 extends SequentialDie {
    static rollArray = [5, 2, 5];
}

export class DieRolls446 extends SequentialDie {
    static rollArray = [4, 4, 6];
}

export class DieRolls465 extends SequentialDie {
    static rollArray = [4, 6, 5];
}

export class DieRolls565 extends SequentialDie {
    static rollArray = [5, 6, 5];
}

export class DieRolls566 extends SequentialDie {
    static rollArray = [5, 6, 6];
}

export function DynamicDieRoll(generateRollResult) {
    return class extends foundry.dice.terms.Die {
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

export class RollMock extends HeroRoll {
    static DieClass = foundry.dice.terms.Die;

    static resetIndex() {
        this.DieClass.resetIndex();
    }

    static fromTerms(terms, options) {
        const newTerms = terms.map((term) => {
            // Replace all Die with a DieClass that will always return an expected behavior when rolling
            if (term instanceof foundry.dice.terms.Die) {
                return new this.DieClass({
                    number: term.number,
                    faces: term.faces,
                    options: term.options,
                });
            }

            return term;
        });

        const formula = Roll.getFormula(newTerms);

        const mock = new this(formula, options);
        mock.terms = newTerms;

        return mock;
    }

    toData() {
        // const obj = {};
        // for (const prop in this) {
        //     obj[prop] = JSON.stringify(this[prop]);
        // }
        // return obj;

        return {
            data: this.data,
            formula: this.formula,
            options: this.options,

            terms: JSON.stringify(this.terms),

            _dice: JSON.stringify(this._dice),
            _evaluated: JSON.stringify(this._evaluated),
            _formula: JSON.stringify(this._formula),
            _resolver: JSON.stringify(this._resolver),
            _root: JSON.stringify(this._root),
            _total: JSON.stringify(this._total),
        };
    }

    toJSON() {
        return this.toData();
        // PH: FIXME: toJSON is just data return? If so, fix HeroRoller.
        // return JSON.stringify(this.toData());
    }

    static fromData(dataObj) {
        const formula = dataObj.formula ? JSON.parse(dataObj.formula) : undefined;
        const data = dataObj.data ? JSON.parse(dataObj.data) : undefined;
        const options = dataObj.options ? JSON.parse(dataObj.options) : undefined;
        // PH: FIXME: This needs to be making it based on the invoked function so that it can be inherited without duplication.
        const rollMock = new RollMock(formula, data, options);

        // for (const prop in dataObj) {
        //     rollMock[prop] = dataObj[prop] ? JSON.parse(dataObj[prop]) : undefined;
        // }

        rollMock._dice = dataObj._evaluated ? JSON.parse(dataObj._dice) : undefined;
        rollMock._evaluated = dataObj._evaluated ? JSON.parse(dataObj._evaluated) : undefined;
        rollMock._formula = dataObj._formula ? JSON.parse(dataObj._formula) : undefined;
        rollMock._resolver = dataObj._resolver ? JSON.parse(dataObj._resolver) : undefined;
        rollMock._root = dataObj._root ? JSON.parse(dataObj._root) : undefined;
        rollMock._total = dataObj._total ? JSON.parse(dataObj._total) : undefined;

        return rollMock;
    }

    static fromJSON(json) {
        return RollMock.fromData(JSON.parse(json));
    }

    constructor(formula, data, options) {
        super(formula, data, options);
    }
}

export class Roll6Mock extends RollMock {
    static DieClass = DieRolls6;
}

export class Roll5Mock extends RollMock {
    static DieClass = DieRolls5;
}

export class Roll4Mock extends RollMock {
    static DieClass = DieRolls4;
}

export class Roll3Mock extends RollMock {
    static DieClass = DieRolls3;
}

export class Roll2Mock extends RollMock {
    static DieClass = DieRolls2;
}

export class Roll1Mock extends RollMock {
    static DieClass = DieRolls1;
}

export class Roll1Through6Mock extends RollMock {
    static DieClass = DieRolls123456;
}

export class RollAlternatingLuckAndUnluck extends RollMock {
    static DieClass = DieRolls61;
}

export class Roll1LuckOn3Dice extends RollMock {
    static DieClass = DieRolls611;
}

export class Roll2LuckOn3Dice extends RollMock {
    static DieClass = DieRolls661;
}

export class Roll3LuckOn3Dice extends RollMock {
    static DieClass = DieRolls6;
}

export class Roll3On3Dice extends RollMock {
    static DieClass = DieRolls1;
}

export class Roll4On3Dice extends RollMock {
    static DieClass = DieRolls112;
}

export class Roll5On3Dice extends RollMock {
    static DieClass = DieRolls113;
}

export class Roll6On3Dice extends RollMock {
    static DieClass = DieRolls114;
}

export class Roll7On3Dice extends RollMock {
    static DieClass = DieRolls223;
}

export class Roll8On3Dice extends RollMock {
    static DieClass = DieRolls323;
}

export class Roll9On3Dice extends RollMock {
    static DieClass = DieRolls3;
}

export class Roll10On3Dice extends RollMock {
    static DieClass = DieRolls433;
}

export class Roll11On3Dice extends RollMock {
    static DieClass = DieRolls515;
}

export class Roll12On3Dice extends RollMock {
    static DieClass = DieRolls525;
}

export class Roll13On3Dice extends RollMock {
    static DieClass = DieRolls661;
}

export class Roll14On3Dice extends RollMock {
    static DieClass = DieRolls446;
}

export class Roll15On3Dice extends RollMock {
    static DieClass = DieRolls465;
}

export class Roll16On3Dice extends RollMock {
    static DieClass = DieRolls565;
}

export class Roll17On3Dice extends RollMock {
    static DieClass = DieRolls566;
}

export class Roll18On3Dice extends RollMock {
    static DieClass = DieRolls6;
}

const mockDiceRegistry = {
    RollMock,

    Roll1Mock,
    Roll2Mock,
    Roll3Mock,
    Roll4Mock,
    Roll5Mock,
    Roll6Mock,
    Roll1Through6Mock,

    RollAlternatingLuckAndUnluck,
    Roll1LuckOn3Dice,
    Roll2LuckOn3Dice,
    Roll3LuckOn3Dice,

    Roll7On3Dice,
    Roll8On3Dice,
    Roll9On3Dice,
    Roll10On3Dice,
    Roll11On3Dice,
    Roll12On3Dice,
    Roll13On3Dice,
    Roll14On3Dice,
    Roll15On3Dice,
    Roll16On3Dice,
    Roll17On3Dice,
};

export function testingMockRollInitialize() {
    // PH: FIXME: can only have 1 character denomination (not a string) so don't bother ... we'll just override the "d" denomination
    // for (const fixedDieClass of Object.values(fixedDieRegistry)) {
    //     CONFIG.Dice.terms[fixedDieClass.DENOMINATION] = fixedDieClass;
    // }

    for (const mockDiceClass of Object.values(mockDiceRegistry)) {
        CONFIG.Dice.rolls.push(mockDiceClass);
    }
}
