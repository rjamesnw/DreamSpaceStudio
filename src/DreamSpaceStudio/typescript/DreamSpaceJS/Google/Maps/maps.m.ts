import { DreamSpace as DS } from "../../System/Events";
import { Module } from "../../Scripts";

// #######################################################################################

/** Google maps module. */
export default class extends Module {

    // ===================================================================================

    scriptInfo = { files: "https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=" + this.registerGlobal("onGMapsReady", null) };

    onBeforeLoad() {

        this.setGlobalValue("onGMapsReady", () => {
            this.continue(); // (dependent script now loaded and initialized, so continue calling the rest of the promise handlers ...)
        });

        this.pause();
    }

    onReady() {
    }

    // ===================================================================================
}

// #######################################################################################
