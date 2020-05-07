// ###########################################################################################################################
// Application Windows
// ###########################################################################################################################

namespace DS {
    export namespace Store {
        // ------------------------------------------------------------------------------------------------------------------
        // Feature Detection 

        function _storageAvailable(storageType: "localStorage" | "sessionStorage"): boolean { // (https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#Testing_for_support_vs_availability)
            try {
                var storage = window[storageType], x = '$__storage_test__$';
                if (storage.length == 0) { // (if items exist we can skip the test [if even one item exists at max size then the test will cause a false negative])
                    storage.setItem(x, x); // (no items exist, so we should test this)
                    storage.removeItem(x);
                }
                return true;
            }
            catch (e) {
                return false;
            }
        }

        /** Set to true if local storage is available. */
        export var hasLocalStorage: boolean = _storageAvailable("localStorage");

        /** Set to true if session storage is available. */
        export var hasSessionStorage: boolean = _storageAvailable("sessionStorage");

        export enum StorageType {
            /** Use the local storage. This is a permanent store, until data is removed, or it gets cleared by the user. */
            Local,
            /** Use the session storage. This is a temporary store, and only lasts for as long as the current browser session is open. */
            Session
        }

        // ------------------------------------------------------------------------------------------------------------------

        /** Returns the requested storage type, or throws an error if not supported. 
         * @param type The type of storage to return.
         * @param ignoreIfMissing If true, then null is returned if the storage type is not supported (default is false, which throws an exception instead).
         */
        export function getStorage(type: StorageType, ignoreIfMissing = false): Storage { // (known issues source: http://caniuse.com/#search=web%20storage)
            switch (type) {
                case StorageType.Local:
                    if (!hasLocalStorage)
                        if (ignoreIfMissing)
                            return null;
                        else
                            throw "Storage.getStorage(): Local storage is either not supported, or disabled. Note that local storage is sometimes disabled in mobile browsers while in 'private' mode, or in IE when loading files directly from the file system.";
                    return localStorage;
                case StorageType.Session:
                    if (!hasSessionStorage)
                        if (ignoreIfMissing)
                            return null;
                        else
                            throw "Storage.getStorage(): Session storage is either not supported, or disabled. Note that local storage is sometimes disabled in mobile browsers while in 'private' mode, or in IE when loading files directly from the file system.";
                    return sessionStorage;
            }
            throw "Storage.getStorage(): Invalid web storage type value: '" + type + "'";
        }

        // ------------------------------------------------------------------------------------------------------------------

        /** Returns the current size of a selected storage (in bytes).
         * @param type The type of storage to check.
         * @param ignoreErrors If true, 0 is returned instead of an exception if a storage is not supported.
         */
        export function getStorageSize(type: StorageType | Storage, ignoreErrors = false): number { // (known issues source: http://caniuse.com/#search=web%20storage)
            var store = type instanceof Storage ? type : getStorage(type, ignoreErrors);
            if (store == null) return 0;
            var size = 0;
            for (var i = 0, n = store.length, v: any; i < n; ++i)
                size += (store.key(i).length + (v = store.getItem(store.key(i)), typeof v == "string" ? v.length : 0)) * 2; // (*2 since it's Unicode, not ASCII)
            return size;
        }

        /** How far the initial exponential scan goes before the binary search test begins during auto-detection (defaults to 1GB when undefined). */
        export var storageSizeTestLimit: number;

        /** Returns the total storage size allowed for a selected storage (in bytes).
         * WARNIG: This removes all current items, clears the storage, detects the size, and restores the values when done.
         * @param type The type of storage to check.
         * @param ignoreErrors If true, 0 is returned instead of an exception if a storage is not supported.
         */
        export function getStorageTotalSize(type: StorageType | Storage, ignoreErrors = false): number { // (known issues source: http://caniuse.com/#search=web%20storage)
            var store = type instanceof Storage ? type : getStorage(type, ignoreErrors);
            if (store == null) return 0;
            try { var maxsize = +store.getItem("$__fs_maxsize"); if (maxsize > 0) return maxsize; } catch (ex) { } // (return a cached value, which is faster)
            var testkey = "$__fs_test"; // (NOTE: Test key is part of the storage!!! The key length should also be even.)
            var test = function (_size: number) { try { store.removeItem(testkey); store.setItem(testkey, new Array(_size + 1).join('0')); } catch (_ex) { return false; } return true; }
            // ... step 1: backup and clear the storage ...
            var backup = emptyStorage(store), low = 0, high = 1, upperLimit = ~~(((storageSizeTestLimit || 1024 * 1024 * 1024) + 1) / 2), upperTest; // (note: actually buffer size is *2 due to Unicode characters)
            if (testkey in backup) delete backup[testkey]; // (this is only in case of previous failures that may have caused the test entry to remain)
            var error: any = null;
            try {
                // ... step 2: find the upper starting point: start with 1mb and double until we throw, or >=1gb is reached ...
                while ((upperTest = test(high)) && high < upperLimit) {
                    low = high; // (low will start at the last working size)
                    high *= 2;
                }
                if (!upperTest) { // (when 'upperTest' is false, the change from low to high passed the max storage boundary, so now we need to run the binary search detection)
                    var half = ~~((high - low + 1) / 2); // (~~ is a faster Math.floor())
                    // ... step 3: starting with the halfway point and do a binary search ...
                    high -= half;
                    while (half > 0)
                        high += (half = ~~(half / 2)) * (test(high) ? 1 : -1);
                    high = testkey.length + high;
                }
                if (high > upperLimit) high = upperLimit;
            }
            catch (ex) { console.log("getStorageTotalSize(): Error: ", ex); error = ex; high = 0; } // (in case of any unforeseen errors we don't want to lose the backed up data)
            store.removeItem(testkey);
            // ... step 4: restore the cleared items and return the detected size ...
            Store.store(store, backup);
            if (error && !ignoreErrors) throw error;
            if (high > 0 && !error)
                try { store.setItem("$__fs_maxsize", StringUtils.toString(high * 2)); } catch (ex) { console.log("getStorageTotalSize(): Could not cache storage max size - out of space."); }
            return high * 2; // (*2 because of Unicode storage)
        }

        //function getStorageTotalSize(upperLimit/*in bytes*/) {
        //    var store = localStorage, testkey = "$__test"; // (NOTE: Test key is part of the storage!!! It should also be an even number of characters)
        //    var test = function (_size) { try { store.removeItem(testkey); store.setItem(testkey, new Array(_size + 1).join('0')); } catch (_ex) { return false; } return true; }
        //    var backup = {};
        //    for (var i = 0, n = store.length; i < n; ++i) backup[store.key(i)] = store.getItem(store.key(i));
        //    store.clear(); // (you could iterate over the items and backup first then restore later)
        //    var low = 0, high = 1, _upperLimit = (upperLimit || 1024 * 1024 * 1024) / 2, upperTest = true;
        //    while ((upperTest = test(high)) && high < _upperLimit) { low = high; high *= 2; }
        //    if (!upperTest) {
        //        var half = ~~((high - low + 1) / 2); // (~~ is a faster Math.floor())
        //        high -= half;
        //        while (half > 0) high += (half = ~~(half / 2)) * (test(high) ? 1 : -1);
        //        high = testkey.length + high;
        //    }
        //    if (high > _upperLimit) high = _upperLimit;
        //    store.removeItem(testkey);
        //    for (var p in backup) store.setItem(p, backup[p]);
        //    return high * 2; // (*2 because of Unicode storage)
        //}

        /** Returns the remaining storage size not yet used (in bytes).
         * @param type The type of storage to check.
         * @param ignoreErrors If true, 0 is returned instead of an exception if a storage is not supported.
         */
        export function getStorageSizeRemaining(type: StorageType | Storage, ignoreErrors = false): number { // (known issues source: http://caniuse.com/#search=web%20storage)
            var store = type instanceof Storage ? type : getStorage(type, ignoreErrors);
            if (store == null) return 0;
            switch (type) {
                case StorageType.Local: return localStorageMaxSize - getStorageSize(store, ignoreErrors);
                case StorageType.Session: return sessionStorageMaxSize - getStorageSize(store, ignoreErrors);
            }
            return 0;
        }

        // ------------------------------------------------------------------------------------------------------------------

        /** Empties the specified storage and returns a backup of all the items, or null if 'ignoreErrors' is true and the storage is not supported.  */
        export function emptyStorage(type: StorageType | Storage, ignoreErrors = false): Object | null {
            var store = type instanceof Storage ? type : getStorage(type, ignoreErrors);
            if (store == null) return null;
            var o: Object = {};
            for (var i = 0, n = store.length; i < n; ++i)
                o[store.key(i)] = store.getItem(store.key(i));
            store.clear();
            return o;
        }

        /** Adds the specified data to the selected storage target, optionally clearing the whole storage first (does not clear by default).  */
        export function store(type: StorageType | Storage, data: Object, clearFirst = false, ignoreErrors = false): Object {
            if (typeof data == 'object') {
                var store = type instanceof Storage ? type : getStorage(type, ignoreErrors);
                if (store == null) return null;
                if (clearFirst) store.clear();
                for (var p in data)
                    if (data.hasOwnProperty(p))
                        store.setItem(p, data[p]);
            }
            else if (!ignoreErrors)
                throw "Storage.store(): Only an object with keys and values is supported.";
            return data;
        }

        export var localStorageMaxSize = getStorageTotalSize(StorageType.Local, true);
        console.log("Maximum local storage: " + localStorageMaxSize);
        console.log("Local storage used space: " + getStorageSize(StorageType.Local));
        console.log("Free local storage: " + getStorageSizeRemaining(StorageType.Local));

        export var sessionStorageMaxSize = getStorageTotalSize(StorageType.Session, true);
        console.log("Maximum local session storage: " + sessionStorageMaxSize);
        console.log("Local session storage used space: " + getStorageSize(StorageType.Session));
        console.log("Free local session storage: " + getStorageSizeRemaining(StorageType.Session));

        // ------------------------------------------------------------------------------------------------------------------

        /** The delimiter used to separate key name parts and data values in storage. This should be a Unicode character that is usually never used in most cases. */
        export var delimiter = "\uFFFC";

        export var storagePrefix = "fs";

        export function makeKeyName(appName: string, dataName: string) {
            if (!dataName) throw "An data name is required.";
            if (dataName == delimiter) dataName = ""; // (this is a work-around used to get the prefix part only [fs+delimiter or fs+delimiter+appName]])
            return storagePrefix + delimiter + (appName || "") + (dataName ? delimiter + dataName : "");
        }

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
        export function set(type: StorageType, name: string, value: string, appName?: string, appVersion?: string, dataVersion?: string): boolean {
            try {
                var store = getStorage(type);
                name = makeKeyName(appName, name);
                if (value !== void 0)
                    localStorage.setItem(name, ("" + (appVersion || "")) + delimiter + ("" + (dataVersion || "")) + delimiter + value);
                else
                    localStorage.removeItem(name);
                // (note: IE8 has a bug that doesn't allow chars under 0x20 (space): http://caniuse.com/#search=web%20storage)
                return true;
            }
            catch (ex) {
                return false; // (storage is full, or not available for some reason)
            }
        }

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
        export function get(type: StorageType, name: string, appName?: string, appVersion?: string, dataVersion?: string): string {
            var store = getStorage(type);
            var itemKey = makeKeyName(appName, name);
            var value: string = localStorage.getItem(itemKey);
            if (value === null) return null;
            if (value === "") return value;

            var i1 = value.indexOf(delimiter);
            var i2 = value.indexOf(delimiter, i1 + 1);

            if (i1 >= 0 && i2 >= 0) {
                var _appVer = value.substring(0, i1);
                var _datVer = value.substring(i1 + 1, i2);
                value = value.substring(i2 + 1);
                if ((appVersion === void 0 || appVersion === null || appVersion == _appVer) && (dataVersion === void 0 || dataVersion === null || dataVersion == _datVer))
                    return value;
                else
                    return null; // (version mismatch)
            }
            else {
                localStorage.removeItem(itemKey); // (remove the invalid entry)
                return null; // (version read error [this should ALWAYS exist [even if empty], otherwise the data is not correctly stored])
            }
        }

        // ------------------------------------------------------------------------------------------------------------------

        /** Clear all FlowScript data from the specified storage (except save project data). */
        export function clear(type: StorageType): void {
            var store = getStorage(type);
            var sysprefix = makeKeyName(null, delimiter); // (get just the system storage prefix part)
            for (var i = store.length - 1; i >= 0; --i) {
                var key = store.key(i);
                if (key.substring(0, sysprefix.length) == sysprefix) // (note: saved project data starts with "fs-<project_name>:")
                    store.removeItem(key);
            }
        }

        // ------------------------------------------------------------------------------------------------------------------
        // Cleanup web storage if debugging.

        if (DS.isDebugging && hasLocalStorage)
            clear(StorageType.Local);

        // ------------------------------------------------------------------------------------------------------------------
    }
}