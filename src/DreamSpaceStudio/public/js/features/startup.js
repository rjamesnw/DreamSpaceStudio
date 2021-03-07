define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.startup = void 0;
    DS.appVersion = "1.0.0";
    /** The bootstrap is a chain of promises that are executed when the page is loaded and ready. */
    exports.startup = new Promise((res, rej) => {
        // (always initialize first, then go from there)
        DS.init().then(() => DS.Browser.onReady.attach(res));
        // (wait for the page to load)
    });
});
//# sourceMappingURL=startup.js.map