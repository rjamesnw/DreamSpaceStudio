import { Module } from "../../../Core/Scripts";
import { IO } from "../../../Core/System/IO";

// ############################################################################################################################

export interface IHoldOn {
    open: (options: { message: string, theme?: string, content?: string, backgroundColor?: string, textColor?: string }) => void,
    close: () => void
}

/**
 * HoldOn.js is a useful plugin that allows you to block user interactions using an overlay over the page.
 * Source: https://sdkcarlos.github.io/sites/holdon.html
 */
export default class extends Module {
    // ===================================================================================

    scriptInfo = { files: "jHoldOn.min", cssFiles: "HoldOn.min" }; // TODO: Support match patterns here also for 'min.css'.

    onReady() {
        var holdOn = this.getVar<IHoldOn>("HoldOn");

        function wait(msg = "Please wait ...") {
            holdOn.open({ message: msg, backgroundColor: "#FFFFFF", textColor: "#000000" });
        }

        function closeWait() { holdOn.close(); }

        IO.onBeginWait.attach(m => wait(m));
        IO.onEndWait.attach(() => closeWait());
    }
    // ===================================================================================
}

// ############################################################################################################################
