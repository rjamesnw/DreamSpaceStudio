import { Module } from "../../../Core/Scripts";
import JQ from "../JQuery/v2_2_0.m";

// ############################################################################################################################

/** The Twitter Bootstrap JS module (the Bootstrap script file only, nothing more).
*/
export default class extends Module {

    scriptInfo = { files: "js/bootstrap{min:.min}", basePath: "./bootstrap", cssFiles: "bootstrap{min:.min}" };

    //// ===================================================================================

    ///** DreamSpace support for Twitter's Bootstrap based UI design.  This module extends the DreamSpace GraphItem to implement the Bootstrap module.
    //* Note: As with most DreamSpace graph objects, the objects are "logical" elements, and thus, a visual layout environment (eg. browser) is not required.
    //*/
    //export var Bootstrap_UI = module([System.UI_HTML], 'DreamSpace.System.Platform.UI.Bootstrap{min:.min}').ready((modInfo) => {
    //    Browser.onReady.attach(() => {
    //        using.Twitter.Bootstrap(null);
    //    });
    //    return true;
    //}); // (some functionality of the bootstrap UI uses jquery)
    //// (note: this is only dependent on the CSS, and has no actual script related dependencies; also note: bootstrap.js must always be loaded LAST [after the app] for event hook-up.)

    //// ===================================================================================
}

// ############################################################################################################################
