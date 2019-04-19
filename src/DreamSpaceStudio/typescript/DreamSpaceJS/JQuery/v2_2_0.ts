/// <reference path="../manifest.ts" />
///// <reference path="../../../typings/globals/jquery/index.d.ts" />

import { DreamSpace as DS } from "../System/Events";
import { Module } from "../Scripts";

// ############################################################################################################################

/** jQuery (see http://jquery.com/). */
export default class extends Module {

    scriptInfo = { filename: "jquery_2_2_0{min:.min}", path: "~JQuery/" };

    onReady() {
        jQuery.holdReady(true); // (hold events until WE say go. note: doesn't require the system.)
        // ... run the script once all other modules have loaded ...
        DS.onReady.attach(() => {
            setTimeout(() => { jQuery.holdReady(false) }, 0); // (trigger jquery after all 'onready' events have fired, and execution has stopped)
        });
    }
}

// ############################################################################################################################
