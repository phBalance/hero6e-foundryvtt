/**
 * A simple in memory cache using objects.
 */
export class HeroSystemGenericSharedCache {
    static _cache = {};

    /**
     *
     * @param {string} purpose
     * @returns {HeroSystemGenericSharedCache}
     */
    static create(purpose) {
        if (HeroSystemGenericSharedCache._cache[purpose]) {
            throw Error(`Trying to create a new cache for existing purpose ${purpose}`);
        }

        HeroSystemGenericSharedCache._cache[purpose] = new HeroSystemGenericSharedCache(purpose);
        return HeroSystemGenericSharedCache._cache[purpose];
    }

    _cachedValue = {};

    // Some simplified cache performance metrics. Move into per id if you want to develop finer grained metrics.
    #gets = 0;
    #sets = 0;
    #invalidated = 0;

    constructor() {
        // nothing special to do for initialization
    }

    setCachedValue(id, newValue) {
        this.#sets = this.#sets + 1;
        this._cachedValue[id] = newValue;
    }

    getCachedValue(id) {
        this.#gets = this.#gets + 1;
        return this._cachedValue[id];
    }

    invalidateCachedValue(id) {
        this._cachedValue[id] = null;
        this.#invalidated = this.#invalidated + 1;
    }
}
