/// <reference path="../manifest.ts" />
// #######################################################################################
var DreamSpace;
(function (DreamSpace) {
    var Scripts;
    (function (Scripts) {
        var Modules;
        (function (Modules) {
            // ===================================================================================
            /**
            * Enables Linq based queries, similar to C#. (https://github.com/morrisjdev/Linq4JS).
            * This is included to allow .Net developers who are familiar with Linq to use Linq based
            * nested method calls to work on DreamSpace arrays/collections.
            */
            Modules.Linq4JS = module([], 'linq4js', '~Linq4JS/');
            // ===================================================================================
        })(Modules = Scripts.Modules || (Scripts.Modules = {}));
    })(Scripts = DreamSpace.Scripts || (DreamSpace.Scripts = {}));
})(DreamSpace || (DreamSpace = {}));
// #######################################################################################
//# sourceMappingURL=manifest.js.map