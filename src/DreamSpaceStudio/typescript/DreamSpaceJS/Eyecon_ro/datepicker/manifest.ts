/// <reference path="../../manifest.ts" />
// #######################################################################################

import { IO } from "../../IO";
import { JQuery } from "../../JQuery/manifest";

/**
 * Plugins by Stefan Petre (http://www.eyecon.ro/bootstrap-datepicker/).
 */
export namespace Eyecon_ro {
    // ===================================================================================

    /**
     * A date picker.
     */
    export var Datepicker = module([JQuery.V2_2_0], 'bootstrap-datepicker', '~Helpers/Eyecon/js/')
        .require(IO.get("~eyecon.ro/css/datepicker.css"));

    // ===================================================================================
}

// #######################################################################################
