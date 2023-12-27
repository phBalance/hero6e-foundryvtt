export function initializeHandlebarsHelpers() {
    Handlebars.registerHelper("filterItem", filterItem);
    Handlebars.registerHelper("indexOf", indexOf);
    Handlebars.registerHelper("abs", abs);
    Handlebars.registerHelper("increment", increment);
}

function filterItem(item, filterString) {
    if (!filterString) return item;

    if (
        item.name.toLowerCase().includes(filterString.toLowerCase()) ||
        (item.system.description &&
            item.system.description
                .toLowerCase()
                .includes(filterString.toLowerCase())) ||
        (item.system.XMLID &&
            item.system.XMLID.toLowerCase().includes(
                filterString.toLowerCase(),
            ))
    ) {
        return item;
    }
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
