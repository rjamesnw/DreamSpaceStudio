 // ### THIS FILE IS CREATED DYNAMICALLY AND WILL BE OVERWRITTEN ##

async function $__MOD_REQUIRE__$(path: string, exportName: string) {
    return async () => {
        var mod = await import(path); eval(`exports.${exportName} = mod;`); return mod;
    };
}
var $__REQUIRE__$ = require, exportName: string;
eval("var require; require = function (path) { return $__MOD_REQUIRE__$(path, exportName) };");

// ### START OF MODULES LIST ###

exportName = 'VDOM';
export import VDOM = require("../../2677A76EE8A34818873FB0587B8C3108/shared/VDOM");

exportName = 'Templating';
export import Templating = require("../../2677A76EE8A34818873FB0587B8C3108/shared/Templating");

// ### END OF MODULES LIST ###

require = $__REQUIRE__$; // (make sure to restore it, since a closure above will need a valid reference later)
