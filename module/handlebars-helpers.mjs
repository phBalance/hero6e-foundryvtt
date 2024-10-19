import { HEROSYS } from "./herosystem6e.mjs";

export function initializeHandlebarsHelpers() {
    Handlebars.registerHelper("abs", abs);
    Handlebars.registerHelper("concat", concat);
    Handlebars.registerHelper("gameConfigValue", gameConfigValue);
    Handlebars.registerHelper("getModulePath", getModulePath);
    Handlebars.registerHelper("includes", includes);
    Handlebars.registerHelper("increment", increment);
    Handlebars.registerHelper("indexOf", indexOf);
    Handlebars.registerHelper("is_active_segment", isActiveSegment);
    Handlebars.registerHelper("isdefined", isDefined);
    Handlebars.registerHelper("toLowerCase", toLowerCase);
    Handlebars.registerHelper("toUpperCase", toUpperCase);
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
    return game.settings.get(HEROSYS.module, configSetting);
}

function getModulePath(templateDirectory) {
    return `systems/${HEROSYS.module}/templates/${templateDirectory}`;
}

function includes(str, searchTerm) {
    return str?.includes(searchTerm);
}

function toLowerCase(str) {
    return str?.toLowerCase();
}

function toUpperCase(str) {
    return str?.toUpperCase();
}

function isActiveSegment(actives, index) {
    return actives?.[index];
}

function concat() {
    var outStr = "";
    for (var arg in arguments) {
        if (typeof arguments[arg] != "object") {
            outStr += arguments[arg];
        }
    }
    return outStr;
}

function isDefined(value) {
    return value !== undefined;
}
