// ############################################################################################################################
namespace DS {
    // ========================================================================================================================

    export namespace Browser {
        /** Triggered when the DOM has completed loading. */
        export var onReady = new EventDispatcher<typeof Browser, { (): void }>(Browser, "onReady", true);
    }

    /** Triggered when all manifests have loaded. No modules have been executed at this point.
      * Note: 'onReady' is not called automatically if 'DreamSpace.System.Diagnostics.debug' is set to 'Debug_Wait'.
      */
    export var onReady = new EventDispatcher<typeof DS, { (): void }>(DS, "onReady", true);

    // ========================================================================================================================
}
// ############################################################################################################################
