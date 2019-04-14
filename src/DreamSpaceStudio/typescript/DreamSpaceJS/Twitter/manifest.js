/// <reference path="../manifest.ts" />
/// <reference path="corext.system.platform.ui.bootstrap.ts" />
/// <reference path="../JQuery/manifest.ts" />
// #######################################################################################
var DreamSpace;
(function (DreamSpace) {
    var Scripts;
    (function (Scripts) {
        var Modules;
        (function (Modules) {
            /** Twitter related plugins. */
            let Twitter;
            (function (Twitter) {
                // ===================================================================================
                /** The Twitter Bootstrap JS module (the Bootstrap script file only, nothing more).
                */
                Twitter.Bootstrap = module([JQuery], 'bootstrap{min:.min}', '~js/').then((modInfo) => {
                    return true;
                });
                // ===================================================================================
                /** DreamSpace support for Twitter's Bootstrap based UI design.  This module extends the DreamSpace GraphItem to implement the Bootstrap module.
                * Note: As with most DreamSpace graph objects, the objects are "logical" elements, and thus, a visual layout environment (eg. browser) is not required.
                */
                Twitter.Bootstrap_UI = module([Modules.System.UI_HTML], 'DreamSpace.System.Platform.UI.Bootstrap{min:.min}').ready((modInfo) => {
                    Browser.onReady.attach(() => {
                        using.Twitter.Bootstrap(null);
                    });
                    return true;
                }); // (some functionality of the bootstrap UI uses jquery)
                // (note: this is only dependent on the CSS, and has no actual script related dependencies; also note: bootstrap.js must always be loaded LAST [after the app] for event hook-up.)
                // ===================================================================================
            })(Twitter = Modules.Twitter || (Modules.Twitter = {}));
        })(Modules = Scripts.Modules || (Scripts.Modules = {}));
    })(Scripts = DreamSpace.Scripts || (DreamSpace.Scripts = {}));
})(DreamSpace || (DreamSpace = {}));
// #######################################################################################
//# sourceMappingURL=manifest.js.map