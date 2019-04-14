// ###########################################################################################################################
// Application Windows
// ###########################################################################################################################
define(["require", "exports", "../Types", "../Utilities", "../PrimitiveTypes"], function (require, exports, Types_1, Utilities_1, PrimitiveTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // =======================================================================================================================
    //?export enum WindowTypes {
    //    /** A DOM element, usually a DIV, is the window target.  This is usually for system windows. */
    //    Inline,
    //    /** An embedded window, which is an IFrame using a .  This is used to isolate applications in their own secure environment, 
    //      * with their own global space to prevent conflicts. This also secures the user from malicious applications.
    //      */
    //    Embedded,
    //    /** A native window, opened by calling 'window.open()'.  This follows the same rules surrounding 'Embedded' windows,
    //      * but allows them to "pop out" from the main window.  This may be especially useful for users with multiple monitors.
    //      */
    //    Native
    //}
    class Window extends Types_1.Factory(PrimitiveTypes_1.Object) {
        constructor() {
            super(...arguments);
            this._guid = Utilities_1.Utilities.createGUID(false);
            // ----------------------------------------------------------------------------------------------------------------
        }
        /** Creates a new window object.  If null is passed as the root element, then a new pop-up window is created when the window is shown. */
        static 'new'(rootElement, url) { return null; }
        static init(o, isnew, rootElement, url) {
            this.super.init(o, isnew);
            if (typeof rootElement !== 'object' || !rootElement.style)
                rootElement = null;
            if (rootElement != null)
                rootElement.style.display = "none";
            o._target = rootElement;
            o._url = url;
        }
        // ----------------------------------------------------------------------------------------------------------------
        show() {
            if (!this._target)
                this._target = window.open(this._url, this._guid);
        }
        // ----------------------------------------------------------------------------------------------------------------
        moveTo(x, y) { }
        moveby(deltaX, deltaY) { }
    }
    exports.Window = Window;
});
// ====================================================================================================================
//# sourceMappingURL=Platform.Windows.js.map