/// <reference path="../manifest.ts" />
///// <reference path="../../../typings/globals/jquery/index.d.ts" />
define(["require", "exports", "../System/Events", "../Scripts"], function (require, exports, Events_1, Scripts_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // #######################################################################################
    /** jQuery (see http://jquery.com/). */
    class default_1 extends Scripts_1.Module {
        constructor() {
            super(...arguments);
            this.scriptInfo = { filename: "jquery_2_2_0{min:.min}", path: "~JQuery/" };
            ///** Selects jQuery version 2.2.0. */
            //export var V2_2_0 = module([], 'jquery_2_2_0{min:.min}', '~JQuery/').ready((mod) => {
            //    return true;
            //});
            ///** Selects any latest version of jQuery (currently version 2.2.0). */
            //export var Latest = V2_2_0;
        }
        onReady() {
            jQuery.holdReady(true); // (hold events until WE say go. note: doesn't require the system.)
            // ... run the script once all other modules have loaded ...
            Events_1.DreamSpace.onReady.attach(() => {
                setTimeout(() => { jQuery.holdReady(false); }, 0); // (trigger jquery after all 'onready' events have fired, and execution has stopped)
            });
        }
    }
    exports.default = default_1;
});
// #######################################################################################
//# sourceMappingURL=v2_2_0.js.map