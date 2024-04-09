import { HEROSYS } from "./herosystem6e.mjs";

export function initializeHandlebarsHelpers() {
    Handlebars.registerHelper("indexOf", indexOf);
    Handlebars.registerHelper("abs", abs);
    Handlebars.registerHelper("increment", increment);
    Handlebars.registerHelper("gameConfigValue", gameConfigValue);

    Handlebars.registerHelper("isdefined", function (value) {
        return value !== undefined;
    });
}

function indexOf(str, searchTerm) {
    return str.indexOf(searchTerm);
}

function abs(str) {
    return Math.abs(parseInt(str));
}

function increment(str, value) {
    return parseInt(str) + parseInt(value);
}

function gameConfigValue(configSetting) {
    return game.settings.get(HEROSYS.getModule(), configSetting);
}
