define(["require", "exports", "../Scripts"], function (require, exports, Scripts_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // #######################################################################################
    /**
    * Module by Matteo Spinelli.
    */
    class default_1 extends Scripts_1.Module {
        onReady() {
            // ===================================================================================
            /**
             * 'Add To Home Screen' bubble prompt for iOS, developed by Matteo Spinelli's (http://cubiq.org/add-to-home-screen).
             */
            export var Add2Home = module([], 'add2home', '~cubiq/AddToHomeScreen-2.0.11/src/');
            // ===================================================================================
        }
    }
    exports.default = default_1;
});
// #######################################################################################
//# sourceMappingURL=manifest.js.map