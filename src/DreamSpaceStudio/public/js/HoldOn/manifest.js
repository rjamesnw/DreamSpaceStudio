/// <reference path="../manifest.ts" />
// #######################################################################################
var DreamSpace;
(function (DreamSpace) {
    var Scripts;
    (function (Scripts) {
        var Modules;
        (function (Modules) {
            var IO;
            (function (IO) {
                // ===================================================================================
                // ===================================================================================
                /**
                 * HoldOn.js is a useful plugin that allows you to block user interactions using an overlay over the page.
                 * Source: https://sdkcarlos.github.io/sites/holdon.html
                 */
                IO.HoldOn = module(null, 'HoldOn.min', '~HoldOn/')
                    .require(DreamSpace.System.IO.get("~HoldOn/HoldOn.min.css")) // TODO: Support match patterns here also for 'min'.
                    .ready(r => {
                    var holdOn = IO.HoldOn.module.getVar("HoldOn");
                    function wait(msg = "Please wait ...") {
                        holdOn.open({ message: msg, backgroundColor: "#FFFFFF", textColor: "#000000" });
                    }
                    function closeWait() { holdOn.close(); }
                    DreamSpace.System.IO.onBeginWait.attach(m => wait(m));
                    DreamSpace.System.IO.onEndWait.attach(() => closeWait());
                });
                // ===================================================================================
            })(IO = Modules.IO || (Modules.IO = {}));
        })(Modules = Scripts.Modules || (Scripts.Modules = {}));
    })(Scripts = DreamSpace.Scripts || (DreamSpace.Scripts = {}));
})(DreamSpace || (DreamSpace = {}));
// #######################################################################################
//# sourceMappingURL=manifest.js.map