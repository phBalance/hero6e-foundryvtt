import { foundryVttDeleteProperty } from "./util.mjs";

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

    // eslint-disable-next-line no-unused-private-class-members
    #purpose;

    constructor(purpose) {
        this.#purpose = purpose;
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

export const HeroObjectCacheMixin = (Base) =>
    class HeroObjectCache extends Base {
        prepareDerivedData() {
            super.prepareDerivedData();

            // NOTE: Can't define and initialize as an object element as the flows sometimes have prepareDerivedData being called before property initialization
            this._cache ??= {};
            this.restoreAllComposedObjectFunctions();
        }

        _generateMemoizableObjectComposerFunction(funcName, originalFunc) {
            return function (...args) {
                const joinedArgs = args.join("|");
                const cachedValue = foundry.utils.getProperty(
                    this._cache,
                    `composedMemoizableObjectFunctions.${funcName}.${joinedArgs}`,
                );
                if (cachedValue && Object.hasOwn(cachedValue, "retValue")) {
                    foundry.utils.setProperty(
                        this._cache,
                        `composedMemoizableObjectFunctions.${funcName}.${joinedArgs}.cacheHits`,
                        cachedValue.cacheHits + 1,
                    );
                    return cachedValue.retValue;
                }

                const retValue = originalFunc.call(this, ...args);

                foundry.utils.setProperty(this._cache, `composedMemoizableObjectFunctions.${funcName}.${joinedArgs}`, {
                    retValue,
                    cacheHits: 0,
                });

                return retValue;
            };
        }

        composeMemoizableObjectFunction(funcName) {
            const descriptor = foundry.utils.deepClone(
                Reflect.getOwnPropertyDescriptor(this.constructor.prototype, funcName),
            );
            const originalFunc = descriptor.value ?? descriptor.get;
            foundry.utils.setProperty(
                this._cache,
                `composedMemoizableObjectFunctions.${funcName}.origFunc`,
                originalFunc,
            );

            if (descriptor.value) {
                descriptor.value = this._generateMemoizableObjectComposerFunction(funcName, originalFunc);
            } else if (descriptor.get || descriptor.set) {
                descriptor.get = this._generateMemoizableObjectComposerFunction(funcName, originalFunc);
            } else {
                console.error(
                    `Asked to composeObjectFunction for ${funcName} that is not a function or getter - are you sure?`,
                    descriptor,
                );
            }

            Object.defineProperty(this, funcName, descriptor);
        }

        restoreComposedMemoizableObjectFunction(funcName) {
            const originalFunc = foundry.utils.getProperty(
                this._cache,
                `composedMemoizableObjectFunctions.${funcName}.origFunc`,
            );
            if (originalFunc) {
                const descriptor = foundry.utils.deepClone(
                    Reflect.getOwnPropertyDescriptor(this.constructor.prototype, funcName),
                );
                if (descriptor.value) {
                    descriptor.value = originalFunc;
                } else if (descriptor.get) {
                    descriptor.get = originalFunc;
                }

                Object.defineProperty(this, funcName, descriptor);
            }

            foundryVttDeleteProperty(this._cache, `composedMemoizableObjectFunctions.${funcName}`);
        }

        restoreAllComposedObjectFunctions() {
            for (const funcName of Object.keys(this._cache.composedMemoizableObjectFunctions || [])) {
                this.restoreComposedMemoizableObjectFunction(funcName);
            }

            for (const funcName of Object.keys(this._cache.restoreComposedObjectFunction || [])) {
                this.restoreComposedMemoizableObjectFunction(funcName);
            }
        }
    };
