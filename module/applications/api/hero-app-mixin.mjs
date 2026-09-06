export const HERO_ROOT_CLASS = "herosystem6e";

/**
 * Root class plus the theme classes of the nearest themed ancestor, for stamping onto dialogs.
 * DialogV2 mounts on body and would otherwise ignore a per-sheet theme.
 * @param {foundry.applications.api.ApplicationV2|HTMLElement|null} source
 * @returns {string[]}
 */
export function heroThemeClasses(source) {
    const element = source instanceof HTMLElement ? source : source?.element;
    const themed = element?.closest?.(".themed");
    const classes = [HERO_ROOT_CLASS];
    if (themed) {
        classes.push("themed", ...Array.from(themed.classList).filter((c) => c.startsWith("theme-")));
    }
    return classes;
}

export function heroDialogOptions(source, options = {}) {
    return { ...options, classes: [...new Set([...(options.classes ?? []), ...heroThemeClasses(source)])] };
}

/**
 * Add the system root class and dialog option helpers.
 * @template {typeof foundry.applications.api.ApplicationV2} T
 * @param {T} Base
 * @returns {T}
 */
export const HeroAppMixin = (Base) =>
    class extends Base {
        static DEFAULT_OPTIONS = { classes: [HERO_ROOT_CLASS] };

        get themeClasses() {
            return heroThemeClasses(this);
        }

        dialogOptions(options) {
            return heroDialogOptions(this, options);
        }
    };
