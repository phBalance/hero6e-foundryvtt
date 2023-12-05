export function initializeHandlebarsHelpers() {
    Handlebars.registerHelper('filterItem', function (item, filterString) {
        //console.log("filterItem")
        if (!filterString) return item
        if (
            item.name.toLowerCase().includes(filterString.toLowerCase()) ||
            (item.system.description && item.system.description.toLowerCase().includes(filterString.toLowerCase())) ||
            (item.system.XMLID && item.system.XMLID.toLowerCase().includes(filterString.toLowerCase()))
        ) {
            return item
        }
    })

    Handlebars.registerHelper('indexOf', function (string, searchTerm) {
        return string.indexOf(searchTerm)
    })

    Handlebars.registerHelper('abs', function (string) {
        return Math.abs(parseInt(string))
    })
}
