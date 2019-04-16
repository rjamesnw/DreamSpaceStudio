/// <reference path="../../manifest.ts" />
// #######################################################################################
define(["require", "exports", "../../IO"], function (require, exports, IO_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Plugins by Stefan Petre (http://www.eyecon.ro/bootstrap-datepicker/).
     */
    var Eyecon_ro;
    (function (Eyecon_ro) {
        // ===================================================================================
        /**
         * A date picker.
         */
        Eyecon_ro.Datepicker = module([JQuery.V2_2_0], 'bootstrap-datepicker', '~Helpers/Eyecon/js/')
            .require(IO_1.IO.get("~eyecon.ro/css/datepicker.css"));
        // ===================================================================================
    })(Eyecon_ro = exports.Eyecon_ro || (exports.Eyecon_ro = {}));
});
// #######################################################################################
//# sourceMappingURL=manifest.js.map