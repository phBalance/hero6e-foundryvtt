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

function getPropertyDescriptorUpChain(obj, propName) {
    let current = obj;
    while (current != null) {
        const descriptor = Reflect.getOwnPropertyDescriptor(current, propName);
        if (descriptor) {
            return descriptor; // Found the descriptor
        }

        // Move up the prototype chain
        current = Reflect.getPrototypeOf(current);
    }

    return undefined;
}

export const HeroObjectCacheMixin = (Base) =>
    class HeroObjectCache extends Base {
        prepareDerivedData() {
            super.prepareDerivedData();

            // NOTE: Can't define and initialize as an object element as the flows sometimes have prepareDerivedData being called before property initialization
            this._cache ??= {};

            // Clean out any memoized information about this object
            this.invalidateAllComposedObjectFunctions();
        }

        _generateMemoizableObjectComposerFunction(funcName, originalFunc) {
            return function (...args) {
                const joinedArgs = args.join("|");
                const cachedValue = foundry.utils.getProperty(this._cache, `cmofs.${funcName}.memoized.${joinedArgs}`);
                if (cachedValue && Object.hasOwn(cachedValue, "retValue")) {
                    foundry.utils.setProperty(
                        this._cache,
                        `cmofs.${funcName}.memoized.${joinedArgs}.cacheHits`,
                        cachedValue.cacheHits + 1,
                    );
                    return cachedValue.retValue;
                }

                const retValue = originalFunc.call(this, ...args);

                foundry.utils.setProperty(this._cache, `cmofs.${funcName}.memoized.${joinedArgs}`, {
                    retValue,
                    cacheHits: 0,
                });

                return retValue;
            };
        }

        /**
         * Make the return value of this[funcName] based on the call's arguments be cached.
         *
         * @param {String} funcName
         */
        composeMemoizableObjectFunction(funcName) {
            const descriptor = foundry.utils.deepClone(
                getPropertyDescriptorUpChain(this.constructor.prototype, funcName),
            );
            const originalFunc = descriptor.value ?? descriptor.get;
            foundry.utils.setProperty(this._cache, `cmofs.${funcName}.origFunc`, originalFunc);
            foundry.utils.setProperty(this._cache, `cmofs.${funcName}.memoized`, {});

            // Memoize the existing function or getter using a composing/wrapping function
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

            // Replace the function with the composable function
            Object.defineProperty(this, funcName, descriptor);

            return descriptor.value || descriptor.get;
        }

        /**
         * Reset all the memoized information about the funcName but continue to keep it composed.
         *
         * @param {String} funcName
         */
        invalidateComposedMomoizableObjectFunction(funcName) {
            foundry.utils.setProperty(this._cache, `cmofs.${funcName}.memoized`, {});
        }

        /**
         * Reset all the memoized information for this object but continue to keep any functions composed.
         */
        invalidateAllComposedObjectFunctions() {
            for (const funcName of Object.keys(this._cache.cmofs || [])) {
                this.invalidateComposedMomoizableObjectFunction(funcName);
            }
        }

        /**
         * Restore the original function so that it is no longer memoized.
         *
         * @param {String} funcName
         */
        restoreComposedMemoizableObjectFunction(funcName) {
            const originalFunc = foundry.utils.getProperty(this._cache, `cmofs.${funcName}.origFunc`);
            if (originalFunc) {
                const descriptor = foundry.utils.deepClone(
                    getPropertyDescriptorUpChain(this.constructor.prototype, funcName),
                );
                if (descriptor.value) {
                    descriptor.value = originalFunc;
                } else if (descriptor.get) {
                    descriptor.get = originalFunc;
                }

                Object.defineProperty(this, funcName, descriptor);
            }

            foundryVttDeleteProperty(this._cache, `cmofs.${funcName}`);
        }

        /**
         * Restore all function on this object that were memoized to their original function.
         */
        restoreAllComposedObjectFunctions() {
            for (const funcName of Object.keys(this._cache.cmofs || [])) {
                this.restoreComposedMemoizableObjectFunction(funcName);
            }
        }
    };
