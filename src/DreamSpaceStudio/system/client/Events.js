// ############################################################################################################################
var DS;
(function (DS) {
    // ========================================================================================================================
    let Browser;
    (function (Browser) {
        /** Triggered when the DOM has completed loading. */
        Browser.onReady = new DS.EventDispatcher(Browser, "onReady", true);
    })(Browser = DS.Browser || (DS.Browser = {}));
    ///** Triggered when all manifests have loaded. No modules have been executed at this point.
    //  * Note: 'onReady' is not called automatically if 'DreamSpace.System.Diagnostics.debug' is set to 'Debug_Wait'.
    //  */
    //x export var onReady = new EventDispatcher<typeof DS, { (): void }>(DS, "onReady", true); //x DS modules are no longer a thing.
    // ========================================================================================================================
})(DS || (DS = {}));
// ############################################################################################################################
//# sourceMappingURL=Events.js.map