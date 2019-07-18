// ############################################################################################################################
var DS;
(function (DS) {
    // ========================================================================================================================
    let Browser;
    (function (Browser) {
        /** Triggered when the DOM has completed loading. */
        Browser.onReady = new DS.EventDispatcher(Browser, "onReady", true);
    })(Browser = DS.Browser || (DS.Browser = {}));
    /** Triggered when all manifests have loaded. No modules have been executed at this point.
      * Note: 'onReady' is not called automatically if 'DreamSpace.System.Diagnostics.debug' is set to 'Debug_Wait'.
      */
    DS.onReady = new DS.EventDispatcher(DS, "onReady", true);
    // ========================================================================================================================
})(DS || (DS = {}));
// ############################################################################################################################
// ############################################################################################################################################
// Browser detection (for special cases).
// ############################################################################################################################################
var DS;
(function (DS) {
    /** Contains information on the user agent (browser) being used.
      * Note: While it's always better to check objects for supported functions, sometimes an existing function may take different
      * parameters based on the browser (such as 'Worker.postMessage()' using transferable objects with IE vs All Others [as usual]).
      */
    let Browser;
    (function (Browser) {
        // ------------------------------------------------------------------------------------------------------------------
        /** Uses cross-browser methods to return the browser window's viewport size. */
        function getViewportSize() {
            var w = window, d = document, e = d.documentElement, g = d.getElementsByTagName('body')[0], x = w.innerWidth || e.clientWidth || g.clientWidth, y = w.innerHeight || e.clientHeight || g.clientHeight;
            return { width: x, height: y };
        }
        Browser.getViewportSize = getViewportSize;
        // ------------------------------------------------------------------------------------------------------------------
        /**
         * Browser benchmarking for various speed tests. The test uses the high-performance clock system, which exists in most modern browsers.
         * The result is returned in milliseconds.
         * @param init The "setup" code, which is only run once.
         * @param code The code to run a test on.
         * @param trialCount The number of times to run the whole test ('init' together with 'code' loops).  The default is 100. The average time of all tests are returned.
         * @param count The number of loops to run the test code in (test 'code' only, and not the 'init' code). The default is 100,000,000.
         */
        function testSpeed(init, code, trialCount = 100, count = 100000000) {
            count = +count || 0;
            trialCount = +trialCount || 0;
            if (code && count && trialCount) {
                var func = new Function(init + ";\r\n"
                    + "var $__fs_t0 = performance.now();\r\n"
                    + "for (var $__fs_i = 0; $__fs_i < " + count + "; $__fs_i++) {\r\n" + code + ";\r\n}\r\n"
                    + "var $__fs_t1 = performance.now();\r\n"
                    + " return $__fs_t1 - $__fs_t0;\r\n");
                console.log(func);
                var totalTime = 0;
                for (var i = 0; i < trialCount; ++i)
                    totalTime += func();
                var elapsed = totalTime / trialCount;
                console.log("Took: " + elapsed + "ms");
            }
            return elapsed || 0;
        }
        // -----------------------------------------------------------------------------------------------------------------------------------
        /** Contains utility functions and events related to the browser's Document Object Model (DOM). */
        let DOM;
        (function (DOM) {
            /** Fired when the HTML has completed loading and was parsed. */
            DOM.onDOMLoaded = new DS.EventDispatcher(DOM, "onDOMLoaded", true);
            var _domLoaded = false;
            /** True when the DOM has completed loading. */
            function isDOMReady() { return _domLoaded; }
            DOM.isDOMReady = isDOMReady;
            var _domReady = false;
            var _pageLoaded = false;
            /** Fired when a page is loaded, but before it gets parsed. */
            DOM.onPageLoaded = new DS.EventDispatcher(DOM, "onPageLoaded", true);
            /** Called when the page has loaded.
              * Returns true if running upon return, or already running, and false if not ready and queued to run later. */
            function onReady() {
                var log = DS.Diagnostics.log("DOM Loading", "Page loading completed; DOM is ready.").beginCapture();
                //??if ($ICE != null) {
                //    $ICE.loadLibraries(); // (load all ICE libraries after the DreamSpace system is ready, but before the ICE libraries are loaded so proper error details can be displayed if required)
                //}
                // (any errors before this point will terminate the 'onReady()' callback)
                // TODO: $ICE loads as a module, and should do this differently.
                //// ... some delay-loaded modules may be hooked into the window 'load' event, which will never fire at this point, so this has to be re-triggered ...
                //??var event = document.createEvent("Event");
                //event.initEvent('load', false, false);
                //window.dispatchEvent(event);
                // ... the system and all modules are loaded and ready ...
                log.write("Dispatching DOM 'onReady event ...", DS.LogTypes.Info);
                Browser.onReady.autoTrigger = true;
                Browser.onReady.dispatchEvent();
                log.write("'DreamSpace.DOM.Loader' completed.", DS.LogTypes.Success);
                log.endCapture();
                return true;
            }
            ;
            /** Implicit request to run only if ready, and not in debug mode. If not ready, or debug mode is set, ignore the request. (used internally) */
            function _doReady() {
                var log = DS.Diagnostics.log("DOM Loading", "Checking if ready...").beginCapture();
                if (_domLoaded && _pageLoaded)
                    onReady();
                log.endCapture();
            }
            ;
            /** Called first when HTML loading completes and is parsed. */
            function _doOnDOMLoaded() {
                if (!_domLoaded) {
                    _domLoaded = true;
                    var log = DS.Diagnostics.log("DOM Loading", "HTML document was loaded and parsed. Loading any sub-resources next (CSS, JS, etc.)...", DS.LogTypes.Success).beginCapture();
                    DOM.onDOMLoaded.autoTrigger = true;
                    DOM.onDOMLoaded.dispatchEvent();
                    log.endCapture();
                }
            }
            ;
            /** Called last when page completes (all sub-resources, such as CSS, JS, etc., have finished loading). */
            function _doOnPageLoaded() {
                if (!_pageLoaded) {
                    _doOnDOMLoaded(); // (just in case - the DOM load must precede the page load!)
                    _pageLoaded = true;
                    var log = DS.Diagnostics.log("DOM Loading", "The document and all sub-resources have finished loading.", DS.LogTypes.Success).beginCapture();
                    DOM.onPageLoaded.autoTrigger = true;
                    DOM.onPageLoaded.dispatchEvent();
                    _doReady();
                    log.endCapture();
                }
            }
            ;
            // Note: $XT is initially created with limited functionality until the system is ready!
            // If on the client side, detect when the document is ready for script downloads - this will allow the UI to show quickly, and download script while the user reads the screen.
            // (note: this is a two phased approach - DOM ready, then PAGE ready.
            if (DS.Environment == DS.Environments.Browser)
                (function () {
                    var readyStateTimer;
                    // ... check document ready events first in case we can get more granular feedback...
                    if (document.addEventListener) {
                        document.addEventListener("DOMContentLoaded", () => {
                            if (!_domLoaded)
                                _doOnDOMLoaded();
                        }); // (Firefox - wait until document loads)
                        // (this event is fired after document and inline script loading, but before everything else loads [css, images, etc.])
                    }
                    else if (document.attachEvent && document.all && !window.opera) {
                        // (DOM loading trick for IE8-, inspired by this article: http://www.javascriptkit.com/dhtmltutors/domready.shtml)
                        document.write('<script type="text/javascript" id="domloadedtag" defer="defer" src="javascript:void(0)"><\/script>');
                        document.getElementById("domloadedtag").onreadystatechange = function () {
                            if (this.readyState == "complete" && !_domLoaded)
                                _doOnDOMLoaded(); // (deferred script loading completes when DOM is finally read)
                        }; // (WARNING: The 'complete' state callback may occur AFTER the page load event if done at the same time [has happened during a debug session])
                    }
                    else if (document.readyState) {
                        // ... fallback to timer based polling ...
                        var checkReadyState = () => {
                            if (document.body) // (readyState states: 0 uninitialized, 1 loading, 2 loaded, 3 interactive, 4 complete)
                                if (!_domLoaded && (document.readyState == 'loaded' || document.readyState == 'interactive')) { // (this event is fired after document and inline script loading, but before everything else loads [css, images, etc.])
                                    _doOnDOMLoaded();
                                }
                                else if (!_pageLoaded && document.readyState == 'complete') { // (this event is fired after ALL resources have loaded on the page)
                                    _doOnPageLoaded();
                                }
                            if (!_pageLoaded && !readyStateTimer)
                                readyStateTimer = setInterval(checkReadyState, 10); // (fall back to timer based polling)
                        };
                        checkReadyState();
                    }
                    //??else throw DreamSpace.exception("Unable to detect and hook into the required 'document load' events for this client browser.");
                    // (NOTE: If unable to detect and hook into the required 'document load' events for this client browser, wait for the page load event instead...)
                    // ... hook into window ready events next which execute when the DOM is ready (all resources have loaded, parsed, and executed))...
                    if (window.addEventListener)
                        window.addEventListener("load", () => { _doOnPageLoaded(); }); // (wait until whole page has loaded)
                    else if (window.attachEvent)
                        window.attachEvent('onload', () => { _doOnPageLoaded(); });
                    else { // (for much older browsers)
                        var oldOnload = window.onload; // (backup any existing event)
                        window.onload = (ev) => {
                            oldOnload && oldOnload.call(window, ev);
                            _doOnPageLoaded();
                        };
                    }
                    // ... finally, a timeout in case things are taking too long (for example, an image is holding things up if only the 'load' event is supported ...
                    // (NOTE: If the user dynamically loads this script file, then the page DOM/load events may not be triggered in time.)
                })();
            else {
                _doOnPageLoaded(); // (no UI to wait for, so do this now)
            }
        })(DOM = Browser.DOM || (Browser.DOM = {}));
        // -----------------------------------------------------------------------------------------------------------------------------------
    })(Browser = DS.Browser || (DS.Browser = {}));
})(DS || (DS = {}));
// ############################################################################################################################################
var DS;
(function (DS) {
    // ############################################################################################################################
    // FileManager
    let FileSystem;
    (function (FileSystem) {
        // ========================================================================================================================
        class ClientFile extends FileSystem.File {
            constructor(fileManager, parent, content) {
                super(fileManager, parent, content);
            }
            saveToLocal() {
                var store = DS.Store.getStorage(DS.Store.StorageType.Local);
                store.setItem(this.absolutePath, this.contents);
            }
            loadFromLocal() {
                var store = DS.Store.getStorage(DS.Store.StorageType.Local);
                this.contents = store.getItem(this.absolutePath);
            }
        }
        FileSystem.ClientFile = ClientFile;
        // ========================================================================================================================
    })(FileSystem = DS.FileSystem || (DS.FileSystem = {}));
    // ############################################################################################################################
})(DS || (DS = {}));
// ###########################################################################################################################
// Browser detection (for special cases).
// This file also adds in any browser-only features as needed by the system within NodeJS (such as setTimeout, etc.).
// ###########################################################################################################################
Array.prototype.last = function () { return this[this.length - 1]; };
Array.prototype.first = function () { return this[0]; };
Array.prototype.append = function (items) { this.push.apply(this, items); return this; };
Array.prototype.select = function (func) { if (!func)
    return this; var _ = [], __; for (var i = 0; i < this.length; ++i)
    _[i] = func(this[i]); return _; };
Array.prototype.where = function (func) { if (!func)
    return this; var _ = [], __; for (var i = 0; i < this.length; ++i)
    if (func(__ = this[i]))
        _.push(__); return _; };
(() => {
    // =======================================================================================================================
    //declare function Symbol(desc?: string): string;
    if (typeof this['Symbol'] == 'undefined') { // (mainly for IE 11)
        // ... create a simple polyfill for this ...
        this['Symbol'] = function Symbol(desc) { var d = new Date().getTime(), dStr = '$' + d; this.valueOf = () => dStr; this.toString = () => dStr; return this; };
    }
    // -------------------------------------------------------------------------------------------------------------------
    //var String = global.String;
    //var Array = global.Array;
    //var RegExp = global.RegExp;
    if (!Number.MAX_SAFE_INTEGER)
        Number.MAX_SAFE_INTEGER = 9007199254740991;
    if (!Number.MIN_SAFE_INTEGER)
        Number.MIN_SAFE_INTEGER = -9007199254740991;
    // -------------------------------------------------------------------------------------------------------------------
    // ... add 'trim()' if missing, which only exists in more recent browser versions, such as IE 9+ ...
    // (source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FString%2FTrim)
    if (!String.prototype.trim) {
        String.prototype.trim = function () {
            if (!this)
                throw new TypeError("'trim()' requires an object instance.");
            return this.replace(/^\s+|\s+$/g, '');
        };
    }
    // -------------------------------------------------------------------------------------------------------------------
    // ... fix head not accessible in IE7/8 ...
    if (document && !document.head)
        document.head = document.getElementsByTagName('head')[0];
    // -------------------------------------------------------------------------------------------------------------------
    // ... add 'now()' if missing (exists as a standard in newer browsers) ...
    // (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now)
    if (!Date.now) { // (used internally for log item times)
        Date.now = function now() {
            return new Date().getTime();
        };
    }
    // -------------------------------------------------------------------------------------------------------------------
    // ... fix the non-standard {string}.split() in older IE browsers, which strips out the empty strings ...
    // (this version accepts an optional third parameter, which is a list of already existing delimiters if available, which then ignores the 'separator' value [more efficient])
    if (":".split(/:/g).length == 0) {
        String.prototype['$__DreamSpace_oldsplit'] = String.prototype.split; // (this is only executed once because of the ext line)
        String.prototype.split = function (separator, limit, delimiterList) {
            var delimiters, nonDelimiters;
            if (!this)
                throw new TypeError("'split()' requires an object instance.");
            if (delimiterList)
                delimiters = delimiterList;
            else if (!(separator instanceof RegExp))
                return String.prototype['$__DreamSpace_oldsplit'](separator, limit); // (old function works find for non-RegExp splits)
            else
                delimiters = this.match(separator);
            nonDelimiters = [];
            // ... since empty spaces get removed, this has to be done manually by scanning across the text and matching the found delimiters ...
            var i, n, delimiter, startdi = 0, enddi = 0;
            if (delimiters) {
                for (i = 0, n = delimiters.length; i < n; ++i) {
                    delimiter = delimiters[i];
                    enddi = this.indexOf(delimiter, startdi);
                    if (enddi == startdi)
                        nonDelimiters.push("");
                    else
                        nonDelimiters.push(this.substring(startdi, enddi));
                    startdi = enddi + delimiter.length;
                }
                if (startdi < this.length)
                    nonDelimiters.push(this.substring(startdi, this.length)); // (get any text past the last delimiter)
                else
                    nonDelimiters.push(""); // (there must always by something after the last delimiter)
            }
            return nonDelimiters;
        };
    }
    // -------------------------------------------------------------------------------------------------------------------
    // ... add support for the new "{Array}.indexOf/.lastIndexOf" standard ...
    // (base on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
    if (!Array.prototype.indexOf)
        Array.prototype['indexOf'] = function (searchElement, fromIndex) {
            if (!this)
                throw new TypeError("'indexOf()' requires an object instance.");
            var i, length = this.length;
            if (!length)
                return -1;
            if (typeof fromIndex === 'undefined')
                fromIndex = 0;
            else {
                fromIndex = +fromIndex; // ('+' converts any boolean or string to a number)
                if (isNaN(fromIndex))
                    return -1;
                if (fromIndex >= length)
                    fromIndex = length - 1;
            }
            if (fromIndex >= length)
                return -1;
            if (fromIndex < 0)
                fromIndex += length;
            for (i = fromIndex; i < length; ++i)
                if (this[i] === searchElement)
                    return i;
            return -1;
        };
    // -------------------------------------------------------------------------------------------------------------------
    if (!Array.prototype.lastIndexOf)
        Array.prototype['lastIndexOf'] = function (searchElement, fromIndex) {
            if (!this)
                throw new TypeError("'lastIndexOf()' requires an object instance.");
            var i, length = this.length;
            if (!length)
                return -1;
            if (typeof fromIndex == 'undefined')
                fromIndex = length - 1;
            else {
                fromIndex = +fromIndex; // ('+' converts any boolean or string to a number)
                if (isNaN(fromIndex))
                    return -1;
                if (fromIndex >= length)
                    fromIndex = length - 1;
            }
            if (fromIndex < 0)
                fromIndex += length;
            for (i = fromIndex; i >= 0; --i)
                if (this[i] === searchElement)
                    return i;
            return -1;
        };
    // -------------------------------------------------------------------------------------------------------------------
    // ... add any missing support for "window.location.origin" ...
    if (typeof window.location !== 'undefined' && !window.location.origin)
        window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
    // -------------------------------------------------------------------------------------------------------------------
    // ... add basic support for 'classList' on elements if missing ...
    if (typeof Element !== 'undefined' && !("classList" in document.createElement("_"))) { //TODO: Needs testing.
        (function () {
            var names = null; // (if 'names' is null, it is updated, and if not, use existing values [more efficient])
            Element.prototype['classList'] = {
                contains(name) {
                    if (!names) {
                        names = this.className.split(' ');
                        var namesUpdated = true;
                    }
                    var exists = names.indexOf(name) >= 0;
                    if (namesUpdated)
                        names = null;
                    return exists;
                },
                add(name) {
                    if (!names) {
                        names = this.className.split(' ');
                        var namesUpdated = true;
                    }
                    if (names.indexOf(name) < 0)
                        this.className += ' ' + name;
                    if (namesUpdated)
                        names = null;
                },
                remove(name) {
                    if (!names) {
                        names = this.className.split(' ');
                        var namesUpdated = true;
                    }
                    var i = names.indexOf(name);
                    if (i >= 0) {
                        names.splice(i);
                        this.className = names.join(' ');
                    }
                    if (namesUpdated)
                        names = null;
                },
                toggle(name, force) {
                    if (!names) {
                        names = this.className.split(' ');
                        var namesUpdated = true;
                    }
                    var exists = this.contains(name);
                    if (typeof force === 'undefined')
                        force = !exists;
                    if (exists) {
                        // ... exists, so remove it ...
                        if (!force) // If force is set to true, the class will be added but not removed.
                            this.remove(name);
                    }
                    else {
                        // ... missing, so add it ...
                        if (force) // If it’s false, the opposite will happen — the class will be removed but not added.
                            this.add(name);
                    }
                    if (namesUpdated)
                        names = null;
                    return !exists;
                },
                toString() {
                    return this.className;
                }
            };
        })();
    }
    ;
    // -------------------------------------------------------------------------------------------------------------------
    // ... add support for "Object.create" if missing ...
    if (typeof Object.create != 'function') {
        (function () {
            var _ = function () { };
            Object.create = function (proto, propertiesObject) {
                if (propertiesObject !== void 0) {
                    throw Error("'propertiesObject' parameter not supported.");
                }
                if (proto === null) {
                    throw Error("'proto' [prototype] parameter cannot be null.");
                }
                if (typeof proto != 'object') {
                    throw TypeError("'proto' [prototype] must be an object.");
                }
                _.prototype = proto;
                return new _();
            };
        })();
    }
    // -------------------------------------------------------------------------------------------------------------------
    if (typeof Array.isArray != 'function') // Performance investigations: http://jsperf.com/array-isarray-vs-instanceof-array/5
        Array.isArray = function (arg) { return typeof arg == 'object' && arg instanceof Array; };
    // -------------------------------------------------------------------------------------------------------------------
    // (Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)
    if (!Function.prototype.bind) {
        Function.prototype.bind = function (oThis) {
            if (typeof this !== 'function') {
                // closest thing possible to the ECMAScript 5
                // internal IsCallable function
                throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
            }
            var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function () { }, fBound = function () {
                return fToBind.apply(this instanceof fNOP
                    ? this
                    : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
            };
            if (this.prototype) {
                // native functions don't have a prototype
                fNOP.prototype = this.prototype;
            }
            fBound.prototype = new fNOP();
            return fBound;
        };
    }
    // -------------------------------------------------------------------------------------------------------------------
    // (prevent links from clicking into mobile safari if launching from a home screen shortcut [native full-screen mode])
    if (window.navigator && ("standalone" in window.navigator) && window.navigator["standalone"]) {
        var noddy, remotes = false;
        document.addEventListener('click', function (event) {
            noddy = event.target;
            // ... locate an anchor parent ...
            while (noddy.nodeName !== "A" && noddy.nodeName !== "HTML") {
                noddy = noddy.parentNode;
            }
            if ('href' in noddy && noddy.href == '#') { // ('#' is a special link used for bootstrap buttons)
                event.preventDefault();
            }
        }, false);
    }
    // ... polyfill some XHR 'readyState' constants ...
    if (!XMLHttpRequest.DONE) {
        XMLHttpRequest.UNSENT = 0;
        XMLHttpRequest.OPENED = 1;
        XMLHttpRequest.HEADERS_RECEIVED = 2;
        XMLHttpRequest.LOADING = 3;
        XMLHttpRequest.DONE = 4;
    }
})();
// #######################################################################################
// ###########################################################################################################################
// Application Windows
// ###########################################################################################################################
var DS;
(function (DS) {
    let Store;
    (function (Store) {
        // ------------------------------------------------------------------------------------------------------------------
        // Feature Detection 
        function _storageAvailable(storageType) {
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
        Store.hasLocalStorage = _storageAvailable("localStorage");
        /** Set to true if session storage is available. */
        Store.hasSessionStorage = _storageAvailable("sessionStorage");
        let StorageType;
        (function (StorageType) {
            /** Use the local storage. This is a permanent store, until data is removed, or it gets cleared by the user. */
            StorageType[StorageType["Local"] = 0] = "Local";
            /** Use the session storage. This is a temporary store, and only lasts for as long as the current browser session is open. */
            StorageType[StorageType["Session"] = 1] = "Session";
        })(StorageType = Store.StorageType || (Store.StorageType = {}));
        // ------------------------------------------------------------------------------------------------------------------
        /** Returns the requested storage type, or throws an error if not supported.
         * @param type The type of storage to return.
         * @param ignoreIfMissing If true, then null is returned if the storage type is not supported (default is false, which throws an exception instead).
         */
        function getStorage(type, ignoreIfMissing = false) {
            switch (type) {
                case StorageType.Local:
                    if (!Store.hasLocalStorage)
                        if (ignoreIfMissing)
                            return null;
                        else
                            throw "Storage.getStorage(): Local storage is either not supported, or disabled. Note that local storage is sometimes disabled in mobile browsers while in 'private' mode, or in IE when loading files directly from the file system.";
                    return localStorage;
                case StorageType.Session:
                    if (!Store.hasSessionStorage)
                        if (ignoreIfMissing)
                            return null;
                        else
                            throw "Storage.getStorage(): Session storage is either not supported, or disabled. Note that local storage is sometimes disabled in mobile browsers while in 'private' mode, or in IE when loading files directly from the file system.";
                    return sessionStorage;
            }
            throw "Storage.getStorage(): Invalid web storage type value: '" + type + "'";
        }
        Store.getStorage = getStorage;
        // ------------------------------------------------------------------------------------------------------------------
        /** Returns the current size of a selected storage (in bytes).
         * @param type The type of storage to check.
         * @param ignoreErrors If true, 0 is returned instead of an exception if a storage is not supported.
         */
        function getStorageSize(type, ignoreErrors = false) {
            var store = type instanceof Storage ? type : getStorage(type, ignoreErrors);
            if (store == null)
                return 0;
            var size = 0;
            for (var i = 0, n = store.length, v; i < n; ++i)
                size += (store.key(i).length + (v = store.getItem(store.key(i)), typeof v == "string" ? v.length : 0)) * 2; // (*2 since it's Unicode, not ASCII)
            return size;
        }
        Store.getStorageSize = getStorageSize;
        /** Returns the total storage size allowed for a selected storage (in bytes).
         * WARNIG: This removes all current items, clears the storage, detects the size, and restores the values when done.
         * @param type The type of storage to check.
         * @param ignoreErrors If true, 0 is returned instead of an exception if a storage is not supported.
         */
        function getStorageTotalSize(type, ignoreErrors = false) {
            var store = type instanceof Storage ? type : getStorage(type, ignoreErrors);
            if (store == null)
                return 0;
            try {
                var maxsize = +store.getItem("$__fs_maxsize");
                if (maxsize > 0)
                    return maxsize;
            }
            catch (ex) { } // (return a cached value, which is faster)
            var testkey = "$__fs_test"; // (NOTE: Test key is part of the storage!!! The key length should also be even.)
            var test = function (_size) { try {
                store.removeItem(testkey);
                store.setItem(testkey, new Array(_size + 1).join('0'));
            }
            catch (_ex) {
                return false;
            } return true; };
            // ... step 1: backup and clear the storage ...
            var backup = emptyStorage(store), low = 0, high = 1, upperLimit = ~~(((Store.storageSizeTestLimit || 1024 * 1024 * 1024) + 1) / 2), upperTest; // (note: actually buffer size is *2 due to Unicode characters)
            if (testkey in backup)
                delete backup[testkey]; // (this is only in case of previous failures that may have caused the test entry to remain)
            var error = null;
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
                if (high > upperLimit)
                    high = upperLimit;
            }
            catch (ex) {
                console.log("getStorageTotalSize(): Error: ", ex);
                error = ex;
                high = 0;
            } // (in case of any unforeseen errors we don't want to lose the backed up data)
            store.removeItem(testkey);
            // ... step 4: restore the cleared items and return the detected size ...
            Store.store(store, backup);
            if (error && !ignoreErrors)
                throw error;
            if (high > 0 && !error)
                try {
                    store.setItem("$__fs_maxsize", '' + (high * 2));
                }
                catch (ex) {
                    console.log("getStorageTotalSize(): Could not cache storage max size - out of space.");
                }
            return high * 2; // (*2 because of Unicode storage)
        }
        Store.getStorageTotalSize = getStorageTotalSize;
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
        function getStorageSizeRemaining(type, ignoreErrors = false) {
            var store = type instanceof Storage ? type : getStorage(type, ignoreErrors);
            if (store == null)
                return 0;
            switch (type) {
                case StorageType.Local: return Store.localStorageMaxSize - getStorageSize(store, ignoreErrors);
                case StorageType.Session: return Store.sessionStorageMaxSize - getStorageSize(store, ignoreErrors);
            }
            return 0;
        }
        Store.getStorageSizeRemaining = getStorageSizeRemaining;
        // ------------------------------------------------------------------------------------------------------------------
        /** Empties the specified storage and returns a backup of all the items, or null if 'ignoreErrors' is true and the storage is not supported.  */
        function emptyStorage(type, ignoreErrors = false) {
            var store = type instanceof Storage ? type : getStorage(type, ignoreErrors);
            if (store == null)
                return null;
            var o = {};
            for (var i = 0, n = store.length; i < n; ++i)
                o[store.key(i)] = store.getItem(store.key(i));
            store.clear();
            return o;
        }
        Store.emptyStorage = emptyStorage;
        /** Adds the specified data to the selected storage target, optionally clearing the whole storage first (does not clear by default).  */
        function store(type, data, clearFirst = false, ignoreErrors = false) {
            if (typeof data == 'object') {
                var store = type instanceof Storage ? type : getStorage(type, ignoreErrors);
                if (store == null)
                    return null;
                if (clearFirst)
                    store.clear();
                for (var p in data)
                    if (data.hasOwnProperty(p))
                        store.setItem(p, data[p]);
            }
            else if (!ignoreErrors)
                throw "Storage.store(): Only an object with keys and values is supported.";
            return data;
        }
        Store.store = store;
        Store.localStorageMaxSize = getStorageTotalSize(StorageType.Local, true);
        console.log("Maximum local storage: " + Store.localStorageMaxSize);
        console.log("Local storage used space: " + getStorageSize(StorageType.Local));
        console.log("Free local storage: " + getStorageSizeRemaining(StorageType.Local));
        Store.sessionStorageMaxSize = getStorageTotalSize(StorageType.Session, true);
        console.log("Maximum local session storage: " + Store.sessionStorageMaxSize);
        console.log("Local session storage used space: " + getStorageSize(StorageType.Session));
        console.log("Free local session storage: " + getStorageSizeRemaining(StorageType.Session));
        // ------------------------------------------------------------------------------------------------------------------
        /** The delimiter used to separate key name parts and data values in storage. This should be a Unicode character that is usually never used in most cases. */
        Store.delimiter = "\uFFFC";
        Store.storagePrefix = "fs";
        function makeKeyName(appName, dataName) {
            if (!dataName)
                throw "An data name is required.";
            if (dataName == Store.delimiter)
                dataName = ""; // (this is a work-around used to get the prefix part only [fs+delimiter or fs+delimiter+appName]])
            return Store.storagePrefix + Store.delimiter + (appName || "") + (dataName ? Store.delimiter + dataName : "");
        }
        Store.makeKeyName = makeKeyName;
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
        function set(type, name, value, appName, appVersion, dataVersion) {
            try {
                var store = getStorage(type);
                name = makeKeyName(appName, name);
                if (value !== void 0)
                    localStorage.setItem(name, ("" + (appVersion || "")) + Store.delimiter + ("" + (dataVersion || "")) + Store.delimiter + value);
                else
                    localStorage.removeItem(name);
                // (note: IE8 has a bug that doesn't allow chars under 0x20 (space): http://caniuse.com/#search=web%20storage)
                return true;
            }
            catch (ex) {
                return false; // (storage is full, or not available for some reason)
            }
        }
        Store.set = set;
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
        function get(type, name, appName, appVersion, dataVersion) {
            var store = getStorage(type);
            var itemKey = makeKeyName(appName, name);
            var value = localStorage.getItem(itemKey);
            if (value === null)
                return null;
            if (value === "")
                return value;
            var i1 = value.indexOf(Store.delimiter);
            var i2 = value.indexOf(Store.delimiter, i1 + 1);
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
        Store.get = get;
        // ------------------------------------------------------------------------------------------------------------------
        /** Clear all FlowScript data from the specified storage (except save project data). */
        function clear(type) {
            var store = getStorage(type);
            var sysprefix = makeKeyName(null, Store.delimiter); // (get just the system storage prefix part)
            for (var i = store.length - 1; i >= 0; --i) {
                var key = store.key(i);
                if (key.substring(0, sysprefix.length) == sysprefix) // (note: saved project data starts with "fs-<project_name>:")
                    store.removeItem(key);
            }
        }
        Store.clear = clear;
        // ------------------------------------------------------------------------------------------------------------------
        // Cleanup web storage if debugging.
        if (DS.isDebugging && Store.hasLocalStorage)
            clear(StorageType.Local);
        // ------------------------------------------------------------------------------------------------------------------
    })(Store = DS.Store || (DS.Store = {}));
})(DS || (DS = {}));
// ###########################################################################################################################
// Text manipulation utility functions.
// ###########################################################################################################################
var DS;
(function (DS) {
    // ========================================================================================================================
    let StringUtils;
    (function (StringUtils) {
        // (this is a more efficient client-side replacement for Chrome)
        StringUtils.replace = function replace(source, replaceWhat, replaceWith, ignoreCase) {
            // (split+join is faster in some browsers, or very close in speed) http://jsperf.com/split-join-vs-regex-replace-the-raven
            if (typeof source !== 'string')
                source = "" + source;
            if (typeof replaceWhat !== 'string')
                replaceWhat = "" + replaceWhat;
            if (typeof replaceWith !== 'string')
                replaceWith = "" + replaceWith;
            if (ignoreCase)
                return source.replace(new RegExp(DS.Utilities.escapeRegex(replaceWhat), 'gi'), replaceWith);
            else if (DS.Browser.type == DS.Browser.BrowserTypes.Chrome)
                return source.split(replaceWhat).join(replaceWith); // (MUCH faster in Chrome [including Chrome mobile])
            else
                return source.replace(new RegExp(DS.Utilities.escapeRegex(replaceWhat), 'g'), replaceWith);
        };
        // ========================================================================================================================
    })(StringUtils = DS.StringUtils || (DS.StringUtils = {}));
    // ############################################################################################################################
})(DS || (DS = {}));
// Contains DreamSpace API functions and types that user code can use to work with the system.
// This API will be a layer of abstraction for the client side only.
var DS;
(function (DS) {
    let IO;
    (function (IO) {
        // ========================================================================================================================
        /** This even is triggered when the user should wait for an action to complete. */
        IO.onBeginWait = new DS.EventDispatcher(IO, "onBeginWait", true);
        /** This even is triggered when the user no longer needs to wait for an action to complete. */
        IO.onEndWait = new DS.EventDispatcher(IO, "onEndWait", true);
        var __waitRequestCounter = 0; // (allows stacking calls to 'wait()')
        /**
         * Blocks user input until 'closeWait()' is called. Plugins can hook into 'onBeginWait' to receive notifications.
         * Note: Each call stacks, but the 'onBeginWait' event is triggered only once.
         * @param msg An optional message to display (default is 'Please wait...').
         */
        function wait(msg = "Please wait ...") {
            if (__waitRequestCounter == 0) // (fire only one time)
                IO.onBeginWait.dispatch(msg);
            __waitRequestCounter++;
        }
        IO.wait = wait;
        /**
         * Unblocks user input if 'wait()' was previously called. The number of 'closeWait()' calls must match the number of wait calls in order to unblock the user.
         * Plugins can hook into the 'onEndWait' event to be notified.
         * @param force If true, then the number of calls to 'wait' is ignored and the block is forcibly removed (default if false).
         */
        function closeWait(force = false) {
            if (__waitRequestCounter > 0 && (force || --__waitRequestCounter == 0)) {
                __waitRequestCounter = 0;
                IO.onEndWait.dispatch();
            }
        }
        IO.closeWait = closeWait;
    })(IO = DS.IO || (DS.IO = {}));
    // ========================================================================================================================
})(DS || (DS = {}));
var DS;
(function (DS) {
    // ==========================================================================================================================
    //! if (pageQuery.getValue('debug', '') == 'true') Diagnostics.debug = Diagnostics.DebugModes.Debug_Run; // (only allow this on the sandbox and development servers)
    //! var demo = demo || pageQuery.getValue('demo', '') == 'true'; // (only allow this on the sandbox and development servers)
    /**
       * Redirect the current page to another location.
       * @param {string} url The URL to redirect to.
       * @param {boolean} url If true, the current page query string is merged. The default is false,
       * @param {boolean} bustCache If true, the current page query string is merged. The default is false,
       */
    function setLocation(url, includeExistingQuery = false, bustCache = false) {
        var query = new DS.Query(url);
        if (bustCache)
            query.values[DS.ResourceRequest.cacheBustingVar] = Date.now().toString();
        if (includeExistingQuery)
            query.addOrUpdate(DS.pageQuery.values);
        if (url.charAt(0) == '/')
            url = DS.Path.resolve(url);
        url = query.appendTo(url);
        if (DS.IO.wait)
            DS.IO.wait();
        setTimeout(() => { DS.global.location.href = url; }, 1); // (let events finish before setting)
    }
    DS.setLocation = setLocation;
    // ==========================================================================================================================
    /**
      * Returns true if the page URL contains the given controller and action names (not case sensitive).
      * This only works with typical default routing of "{host}/Controller/Action/etc.".
      * @param action A controller action name.
      * @param controller A controller name (defaults to "home" if not specified)
      */
    function isView(action, controller = "home") {
        return new RegExp("^\/" + controller + "\/" + action + "(?:[\/?&#])?", "gi").test(DS.global.location.pathname);
    }
    DS.isView = isView;
})(DS || (DS = {}));
