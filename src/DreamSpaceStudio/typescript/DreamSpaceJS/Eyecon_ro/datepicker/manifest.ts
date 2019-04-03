﻿/// <reference path="../../manifest.ts" />
// #######################################################################################

namespace DreamSpace.Scripts.Modules {
    /**
     * Plugins by Stefan Petre (http://www.eyecon.ro/bootstrap-datepicker/).
     */
    export namespace Eyecon_ro {
        using: JQuery.Latest;

        // ===================================================================================

        /**
         * A date picker.
         */
        export var Datepicker = module([JQuery.V2_2_0], 'bootstrap-datepicker', '~Helpers/Eyecon/js/')
            .require(DreamSpace.System.IO.get("~eyecon.ro/css/datepicker.css"));

        // ===================================================================================
    }
}
// #######################################################################################
