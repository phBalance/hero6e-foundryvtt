/**
 * You can't just Object.freeze a Set. Here's a pale substitute that won't let you do stuff with a runtime error.
 */
export class FrozenSet extends Set {
    constructor(iterable) {
        super(iterable);

        this.add = function add() {
            throw new TypeError("Cannot add to a frozen Set");
        };

        // Object.freeze locks the Set object structure itself
        Object.freeze(this);
    }

    delete() {
        throw new TypeError("Cannot delete from a frozen Set");
    }

    clear() {
        throw new TypeError("Cannot clear a frozen Set");
    }
}
