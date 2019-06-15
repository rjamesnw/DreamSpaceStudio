import { DreamSpace as DS } from "../../../Core/System/Events";
import { Module } from "../../../Core/Scripts";

// ############################################################################################################################

/** jQuery (see http://jquery.com/). */
export default class extends Module {

    scriptInfo = { files: "jquery_2_2_0{min:.min}", basePath: "~JQuery/" };

    onReady() {
        var jQuery = this.getVar<JQueryStatic>("jQuery");
        jQuery.holdReady(true); // (hold events until WE say go. note: doesn't require the system.)
        // ... run the script once all other modules have loaded ...
        DS.onReady.attach(() => {
            setTimeout(() => { jQuery.holdReady(false) }, 0); // (trigger jquery after all 'onready' events have fired, and execution has stopped)
        });
    }
}

// ############################################################################################################################
