export const HERO_ROOT_CLASS = "herosystem6e";

// Keys must match the theme maps in scss/theme/_tokens.scss
export const HERO_SHEET_THEMES = Object.freeze({
    "": "Default",
    light: "Light",
    dark: "Dark",
    hc: "High Contrast",
});

/**
 * Collect root and explicit sheet theme classes for a dialog.
 * Dialogs mount on body. Inherit explicit sheet themes, but exclude sidebar/hotbar interface themes.
 * @param {foundry.applications.api.ApplicationV2|HTMLElement|null} source
 * @returns {string[]}
 */
export function heroThemeClasses(source) {
    const element = source instanceof HTMLElement ? source : source?.element;
    const themed = element?.closest?.(".sheet.themed");
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

        dialogOptions(options = {}) {
            return heroDialogOptions(this, options);
        }
    };

/** System-styled DialogV2. Pass dialogOptions() to preserve the source sheet's theme. */
export class HeroDialogV2 extends HeroAppMixin(foundry.applications.api.DialogV2) {}
