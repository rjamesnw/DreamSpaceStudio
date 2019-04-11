// ###########################################################################################################################
// Application Windows
// ###########################################################################################################################
define(["require", "exports", "./System.Platform"], function (require, exports, System_Platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Windows;
    (function (Windows) {
        namespace(() => DreamSpace.System.Platform.Windows);
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
        class Window extends FactoryBase(DSObject) {
            /** Creates a new window object.  If null is passed as the root element, then a new pop-up window is created when the window is shown. */
            static 'new'(rootElement, url) { return null; }
            static init(o, isnew, rootElement, url) { }
        }
        Windows.Window = Window;
        (function (Window) {
            class $__type extends FactoryType(DSObject) {
                constructor() {
                    super(...arguments);
                    this._guid = Utilities.createGUID(false);
                }
                // ----------------------------------------------------------------------------------------------------------------
                show() {
                    if (!this._target)
                        this._target = window.open(this._url, this._guid);
                }
                // ----------------------------------------------------------------------------------------------------------------
                moveTo(x, y) { }
                moveby(deltaX, deltaY) { }
                // ----------------------------------------------------------------------------------------------------------------
                static [constructor](factory) {
                    factory.init = (o, isnew, rootElement, url) => {
                        factory.super.init(o, isnew);
                        if (typeof rootElement !== 'object' || !rootElement.style)
                            rootElement = null;
                        if (rootElement != null)
                            rootElement.style.display = "none";
                        o._target = rootElement;
                        o._url = url;
                    };
                }
            }
            Window.$__type = $__type;
            Window.$__register(Platform);
        })(Window = Windows.Window || (Windows.Window = {}));
        // ====================================================================================================================
    })(Windows || (Windows = {}));
    System_Platform_1.DreamSpace.Windows = Windows;
    var DreamSpace = System_Platform_1.DreamSpace;
    exports.default = DreamSpace;
});
//# sourceMappingURL=System.Platform.Windows.js.map