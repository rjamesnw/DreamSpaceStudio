/// <reference path="../manifest.ts" />
// #######################################################################################
var DreamSpace;
(function (DreamSpace) {
    var Scripts;
    (function (Scripts) {
        var Modules;
        (function (Modules) {
            /**
            * Modules for Scirra's Construct 2 HTML5/JS game development platform (http://scirra.com).
            */
            let Scirra;
            (function (Scirra) {
                // ===================================================================================
                /**
                * DreamSpace support for creating games using Scirra's "Construct 2" HTML5 game engine development platform (see scirra.com for the IDE).
                * Note: You'll need the DreamSpace plugin for Construct 2 for this to work (it's included with DreamSpace files, and named 'DreamSpace_Construct2_Plugin.js').
                * Note: As with most DreamSpace graph objects, the objects are "logical" elements, and thus, a visual layout environment (eg. browser) is not required.
                */
                Scirra.Construct2 = module([Modules.System.UI_HTML], 'Scirra.Construct2{min:.min}');
                // ===================================================================================
            })(Scirra = Modules.Scirra || (Modules.Scirra = {}));
        })(Modules = Scripts.Modules || (Scripts.Modules = {}));
    })(Scripts = DreamSpace.Scripts || (DreamSpace.Scripts = {}));
})(DreamSpace || (DreamSpace = {}));
// #######################################################################################
//# sourceMappingURL=manifest.js.map