define(["require", "exports", "../../Scripts"], function (require, exports, Scripts_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // #######################################################################################
    var gmapsCallbackStr = manifest.registerGlobal("onGMapsReady", null);
    /** Google maps module. */
    class default_1 extends Scripts_1.Module {
        constructor() {
            // ===================================================================================
            super(...arguments);
            this.scriptInfo = { files: "https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=" + gmapsCallbackStr };
            // ===================================================================================
        }
        onBeforeLoad() {
            this.setGlobalValue("onGMapsReady", () => {
                this.continue(); // (dependent script now loaded and initialized, so continue calling the rest of the promise handlers ...)
            });
            this.pause();
        }
        onReady() {
        }
    }
    exports.default = default_1;
});
// #######################################################################################
//# sourceMappingURL=maps.js.map