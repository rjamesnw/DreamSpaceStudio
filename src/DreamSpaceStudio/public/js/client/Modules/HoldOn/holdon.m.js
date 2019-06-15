define(["require", "exports", "../../../Core/Scripts", "../../../Core/System/IO"], function (require, exports, Scripts_1, IO_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * HoldOn.js is a useful plugin that allows you to block user interactions using an overlay over the page.
     * Source: https://sdkcarlos.github.io/sites/holdon.html
     */
    class default_1 extends Scripts_1.Module {
        constructor() {
            // ===================================================================================
            super(...arguments);
            this.scriptInfo = { files: "jHoldOn.min", cssFiles: "HoldOn.min" }; // TODO: Support match patterns here also for 'min.css'.
            // ===================================================================================
        }
        onReady() {
            var holdOn = this.getVar("HoldOn");
            function wait(msg = "Please wait ...") {
                holdOn.open({ message: msg, backgroundColor: "#FFFFFF", textColor: "#000000" });
            }
            function closeWait() { holdOn.close(); }
            IO_1.IO.onBeginWait.attach(m => wait(m));
            IO_1.IO.onEndWait.attach(() => closeWait());
        }
    }
    exports.default = default_1;
});
// ############################################################################################################################
//# sourceMappingURL=holdon.m.js.map