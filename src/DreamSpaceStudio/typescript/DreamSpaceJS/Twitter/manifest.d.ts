/// <reference path="../manifest.d.ts" />
/// <reference path="CoreXT.System.Platform.UI.Bootstrap.d.ts" />
/// <reference path="../JQuery/manifest.d.ts" />
declare namespace DreamSpace.Scripts.Modules {
    /** Twitter related plugins. */
    namespace Twitter {
        /** The Twitter Bootstrap JS module (the Bootstrap script file only, nothing more).
        */
        var Bootstrap: any;
        /** DreamSpace support for Twitter's Bootstrap based UI design.  This module extends the DreamSpace GraphItem to implement the Bootstrap module.
        * Note: As with most DreamSpace graph objects, the objects are "logical" elements, and thus, a visual layout environment (eg. browser) is not required.
        */
        var Bootstrap_UI: any;
    }
}
