declare namespace DS {
    namespace Browser {
        /** Triggered when the DOM has completed loading. */
        var onReady: EventDispatcher<typeof Browser, () => void>;
    }
    /** Triggered when all manifests have loaded. No modules have been executed at this point.
      * Note: 'onReady' is not called automatically if 'DreamSpace.System.Diagnostics.debug' is set to 'Debug_Wait'.
      */
    var onReady: EventDispatcher<typeof DS, () => void>;
}
declare namespace DS {
    /** Contains information on the user agent (browser) being used.
      * Note: While it's always better to check objects for supported functions, sometimes an existing function may take different
      * parameters based on the browser (such as 'Worker.postMessage()' using transferable objects with IE vs All Others [as usual]).
      */
    namespace Browser {
        /** Uses cross-browser methods to return the browser window's viewport size. */
        function getViewportSize(): {
            width: number;
            height: number;
        };
        /** Contains utility functions and events related to the browser's Document Object Model (DOM). */
        namespace DOM {
            /** Fired when the HTML has completed loading and was parsed. */
            var onDOMLoaded: EventDispatcher<typeof DOM, EventHandler>;
            /** True when the DOM has completed loading. */
            function isDOMReady(): boolean;
            /** Fired when a page is loaded, but before it gets parsed. */
            var onPageLoaded: EventDispatcher<typeof DOM, EventHandler>;
        }
    }
}
declare namespace DS {
    namespace FileSystem {
        class ClientFile extends File {
            constructor(fileManager: FileManager, parent?: DirectoryItem, content?: string);
            saveToLocal(): void;
            loadFromLocal(): void;
        }
    }
}
interface Function {
    [index: string]: any;
}
interface Object {
    [index: string]: any;
}
interface Array<T> {
    [index: string]: any;
}
interface SymbolConstructor {
    [index: string]: any;
}
interface IStaticGlobals extends Window {
    XMLHttpRequest: typeof XMLHttpRequest;
    Node: typeof Node;
    Element: typeof Element;
    HTMLElement: typeof HTMLElement;
    Text: typeof Text;
    Window: typeof Window;
}
interface Array<T> {
    last: () => T;
    first: () => T;
    append: (items: Array<T>) => Array<T>;
    select: <T2>(selector: {
        (item: T): T2;
    }) => Array<T2>;
    where: (selector: {
        (item: T): boolean;
    }) => Array<T>;
}
declare namespace DS {
    namespace Store {
        /** Set to true if local storage is available. */
        var hasLocalStorage: boolean;
        /** Set to true if session storage is available. */
        var hasSessionStorage: boolean;
        enum StorageType {
            /** Use the local storage. This is a permanent store, until data is removed, or it gets cleared by the user. */
            Local = 0,
            /** Use the session storage. This is a temporary store, and only lasts for as long as the current browser session is open. */
            Session = 1
        }
        /** Returns the requested storage type, or throws an error if not supported.
         * @param type The type of storage to return.
         * @param ignoreIfMissing If true, then null is returned if the storage type is not supported (default is false, which throws an exception instead).
         */
        function getStorage(type: StorageType, ignoreIfMissing?: boolean): Storage;
        /** Returns the current size of a selected storage (in bytes).
         * @param type The type of storage to check.
         * @param ignoreErrors If true, 0 is returned instead of an exception if a storage is not supported.
         */
        function getStorageSize(type: StorageType | Storage, ignoreErrors?: boolean): number;
        /** How far the initial exponential scan goes before the binary search test begins during auto-detection (defaults to 1GB when undefined). */
        var storageSizeTestLimit: number;
        /** Returns the total storage size allowed for a selected storage (in bytes).
         * WARNIG: This removes all current items, clears the storage, detects the size, and restores the values when done.
         * @param type The type of storage to check.
         * @param ignoreErrors If true, 0 is returned instead of an exception if a storage is not supported.
         */
        function getStorageTotalSize(type: StorageType | Storage, ignoreErrors?: boolean): number;
        /** Returns the remaining storage size not yet used (in bytes).
         * @param type The type of storage to check.
         * @param ignoreErrors If true, 0 is returned instead of an exception if a storage is not supported.
         */
        function getStorageSizeRemaining(type: StorageType | Storage, ignoreErrors?: boolean): number;
        /** Empties the specified storage and returns a backup of all the items, or null if 'ignoreErrors' is true and the storage is not supported.  */
        function emptyStorage(type: StorageType | Storage, ignoreErrors?: boolean): Object | null;
        /** Adds the specified data to the selected storage target, optionally clearing the whole storage first (does not clear by default).  */
        function store(type: StorageType | Storage, data: Object, clearFirst?: boolean, ignoreErrors?: boolean): Object;
        var localStorageMaxSize: number;
        var sessionStorageMaxSize: number;
        /** The delimiter used to separate key name parts and data values in storage. This should be a Unicode character that is usually never used in most cases. */
        var delimiter: string;
        var storagePrefix: string;
        function makeKeyName(appName: string, dataName: string): string;
        /** Set a value for the target storage.  For any optional parameter, pass in 'void 0' (without the quotes) to skip/ignore it.
        * If 'appVersion' and/or 'dataVersion' is given, the versions are stored with the data.  If the versions don't match
        * when retrieving the data, then 'null' is returned.
        * Warning: If the storage is full, then 'false' is returned.
        * @param {StorageType} type The type of storage to use.
        * @param {string} name The name of the item to store.
        * @param {string} value The value of the item to store. If this is undefined (void 0) then any existing value is removed instead.
        * @param {string} appName An optional application name to provision the data storage under.
        * @param {string} appVersion An optional application version name to apply to the stored data.  If the given application
        * version is different from the stored data, the data is reloaded.
        * Note: This is NOT the data version, but the version of the application itself.
        * @param {string} dataVersion An optional version for the stored data.  If the given version is different from that of
        * the stored data, the data is reloaded.
        */
        function set(type: StorageType, name: string, value: string, appName?: string, appVersion?: string, dataVersion?: string): boolean;
        /** Get a value from the target storage.  For any optional parameter, pass in 'void 0' (without the quotes) to skip/ignore it.
          * If 'appVersion' and/or 'dataVersion' is given, the versions are checked against the data.  If the versions don't
          * match, then 'null' is returned.
          * @param {StorageType} type The type of storage to use.
          * @param {string} name The name of the item to store.
          * @param {string} value The value of the item to store.
          * @param {string} appName An optional application name to provision the data storage under.
          * @param {string} appVersion An optional application version name to apply to the stored data.  If the given application
          * version is different from the stored data, the data is reloaded.
          * Note: This is NOT the data version, but the version of the application itself.
          * @param {string} dataVersion An optional version for the stored data.  If the given version is different from that of
          * the stored data, the data is reloaded.
          */
        function get(type: StorageType, name: string, appName?: string, appVersion?: string, dataVersion?: string): string;
        /** Clear all FlowScript data from the specified storage (except save project data). */
        function clear(type: StorageType): void;
    }
}
declare namespace DS {
    namespace StringUtils {
    }
}
declare namespace DS {
    namespace IO {
        /** This even is triggered when the user should wait for an action to complete. */
        var onBeginWait: EventDispatcher<typeof IO, (msg: string) => void>;
        /** This even is triggered when the user no longer needs to wait for an action to complete. */
        var onEndWait: EventDispatcher<typeof IO, () => void>;
        /**
         * Blocks user input until 'closeWait()' is called. Plugins can hook into 'onBeginWait' to receive notifications.
         * Note: Each call stacks, but the 'onBeginWait' event is triggered only once.
         * @param msg An optional message to display (default is 'Please wait...').
         */
        function wait(msg?: string): void;
        /**
         * Unblocks user input if 'wait()' was previously called. The number of 'closeWait()' calls must match the number of wait calls in order to unblock the user.
         * Plugins can hook into the 'onEndWait' event to be notified.
         * @param force If true, then the number of calls to 'wait' is ignored and the block is forcibly removed (default if false).
         */
        function closeWait(force?: boolean): void;
    }
}
declare namespace DS {
    /**
       * Redirect the current page to another location.
       * @param {string} url The URL to redirect to.
       * @param {boolean} url If true, the current page query string is merged. The default is false,
       * @param {boolean} bustCache If true, the current page query string is merged. The default is false,
       */
    function setLocation(url: string, includeExistingQuery?: boolean, bustCache?: boolean): void;
    /**
      * Returns true if the page URL contains the given controller and action names (not case sensitive).
      * This only works with typical default routing of "{host}/Controller/Action/etc.".
      * @param action A controller action name.
      * @param controller A controller name (defaults to "home" if not specified)
      */
    function isView(action: string, controller?: string): boolean;
}
