define(["require", "exports", "../../../../Core/Scripts"], function (require, exports, Scripts_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // #######################################################################################
    /** Google maps module. */
    class default_1 extends Scripts_1.Module {
        constructor() {
            // ===================================================================================
            super(...arguments);
            this.scriptInfo = { files: "https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=" + this.registerGlobal("onGMapsReady", null) };
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
//# sourceMappingURL=maps.m.js.map