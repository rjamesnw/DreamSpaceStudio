/// <reference path="../manifest.ts" />
// #######################################################################################

namespace DreamSpace.Scripts.Modules.IO {
    // ===================================================================================

    export interface IHoldOn {
        open: (options: { message: string, theme?: string, content?: string, backgroundColor?: string, textColor?: string }) => void,
        close: () => void
    }

    // ===================================================================================

    /**
     * HoldOn.js is a useful plugin that allows you to block user interactions using an overlay over the page.
     * Source: https://sdkcarlos.github.io/sites/holdon.html
     */
    export var HoldOn = module(null, 'HoldOn.min', '~HoldOn/')
        .require(DreamSpace.System.IO.get("~HoldOn/HoldOn.min.css")) // TODO: Support match patterns here also for 'min'.
        .ready(r => {
            var holdOn = HoldOn.module.getVar<IHoldOn>("HoldOn");

            function wait(msg = "Please wait ...") {
                holdOn.open({ message: msg, backgroundColor: "#FFFFFF", textColor: "#000000" });
            }

            function closeWait() { holdOn.close(); }

            DreamSpace.System.IO.onBeginWait.attach(m => wait(m));
            DreamSpace.System.IO.onEndWait.attach(() => closeWait());
        });

    // ===================================================================================
}

// #######################################################################################
