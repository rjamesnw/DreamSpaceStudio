"use strict";
// ### THIS FILE IS CREATED DYNAMICALLY AND WILL BE OVERWRITTEN ##
Object.defineProperty(exports, "__esModule", { value: true });
function $__MOD_REQUIRE__$(path, exportName) {
    return __awaiter(this, void 0, void 0, function* () {
        return () => __awaiter(this, void 0, void 0, function* () {
            var mod = yield Promise.resolve().then(() => require(path));
            eval(`exports.${exportName} = mod;`);
            return mod;
        });
    });
}
var $__REQUIRE__$ = require, exportName;
eval("var require; require = function (path) { return $__MOD_REQUIRE__$(path, exportName) };");
// ### START OF MODULES LIST ###
exportName = 'VDOM';
exports.VDOM = require("../../2677A76EE8A34818873FB0587B8C3108/shared/VDOM");
exportName = 'Templating';
exports.Templating = require("../../2677A76EE8A34818873FB0587B8C3108/shared/Templating");
// ### END OF MODULES LIST ###
require = $__REQUIRE__$; // (make sure to restore it, since a closure above will need a valid reference later)
//# sourceMappingURL=modules.js.map