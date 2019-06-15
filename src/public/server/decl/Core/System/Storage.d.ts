declare abstract class Store {
}
declare namespace Store {
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
export { Store };
