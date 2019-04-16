/// <reference path="../manifest.ts" />
///// <reference path="../../../typings/globals/jquery/index.d.ts" />
define(["require", "exports", "../System/Events", "../Scripts"], function (require, exports, Events_1, Scripts_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // #######################################################################################
    /** jQuery (see http://jquery.com/). */
    class default_1 extends Scripts_1.Module {
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
//# sourceMappingURL=manifest.js.map