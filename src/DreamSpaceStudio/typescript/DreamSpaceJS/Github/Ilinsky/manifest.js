/// <reference path="../../manifest.ts" />
// #######################################################################################
var DreamSpace;
(function (DreamSpace) {
    var Scripts;
    (function (Scripts) {
        var Modules;
        (function (Modules) {
            /**
             * Modules by Sergey Ilinsky (https://github.com/ilinsky/xmlhttprequest).
             */
            let Github;
            (function (Github) {
                let Ilinsky;
                (function (Ilinsky) {
                    // ===================================================================================
                    /**
                     * 'XMLHttpRequest' cross-browser wrapper.
                     */
                    Ilinsky.XMLHttpRequest = module([], 'XMLHttpRequest', '~github/ilinsky/XMLHttpRequest-20130624.js');
                    // ===================================================================================
                })(Ilinsky = Github.Ilinsky || (Github.Ilinsky = {}));
            })(Github = Modules.Github || (Modules.Github = {}));
        })(Modules = Scripts.Modules || (Scripts.Modules = {}));
    })(Scripts = DreamSpace.Scripts || (DreamSpace.Scripts = {}));
})(DreamSpace || (DreamSpace = {}));
// #######################################################################################
//# sourceMappingURL=manifest.js.map