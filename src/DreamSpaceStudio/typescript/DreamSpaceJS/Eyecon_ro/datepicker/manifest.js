/// <reference path="../../manifest.ts" />
// #######################################################################################
var DreamSpace;
(function (DreamSpace) {
    var Scripts;
    (function (Scripts) {
        var Modules;
        (function (Modules) {
            /**
             * Plugins by Stefan Petre (http://www.eyecon.ro/bootstrap-datepicker/).
             */
            let Eyecon_ro;
            (function (Eyecon_ro) {
                using: Modules.JQuery.Latest;
                // ===================================================================================
                /**
                 * A date picker.
                 */
                Eyecon_ro.Datepicker = module([Modules.JQuery.V2_2_0], 'bootstrap-datepicker', '~Helpers/Eyecon/js/')
                    .require(DreamSpace.System.IO.get("~eyecon.ro/css/datepicker.css"));
                // ===================================================================================
            })(Eyecon_ro = Modules.Eyecon_ro || (Modules.Eyecon_ro = {}));
        })(Modules = Scripts.Modules || (Scripts.Modules = {}));
    })(Scripts = DreamSpace.Scripts || (DreamSpace.Scripts = {}));
})(DreamSpace || (DreamSpace = {}));
// #######################################################################################
//# sourceMappingURL=manifest.js.map