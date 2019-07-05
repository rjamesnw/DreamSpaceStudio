define(["require", "exports", "./Factories", "./Resources", "./Path", "./Logging", "./ErrorHandling", "./Query", "./Utilities", "./DreamSpace", "./PrimitiveTypes"], function (require, exports, Factories_1, Resources_1, Path_1, Logging_1, ErrorHandling_1, Query_1, Utilities_1, DreamSpace_1, PrimitiveTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ResourceRequest_1;
    // ===============================================================================================================================
    /**
     * Creates a new resource request object, which allows loaded resources using a "promise" style pattern (this is a custom
     * implementation designed to work better with the DreamSpace system specifically, and to support parallel loading).
     * Note: It is advised to use 'DreamSpace.Loader.loadResource()' to load resources instead of directly creating resource request objects.
     * Inheritance note: When creating via the 'new' factory method, any already existing instance with the same URL will be returned,
     * and NOT the new object instance.  For this reason, you should call 'loadResource()' instead.
     */
    let ResourceRequest = ResourceRequest_1 = class ResourceRequest extends Factories_1.Factory() {
        // ===============================================================================================================================
        /**
         * Creates a new resource request object, which allows loaded resources using a "promise" style pattern (this is a custom
         * implementation designed to work better with the DreamSpace system specifically, and to support parallel loading).
         * Note: It is advised to use 'DreamSpace.Loader.loadResource()' to load resources instead of directly creating resource request objects.
         * Inheritance note: When creating via the 'new' factory method, any already existing instance with the same URL will be returned,
         * and NOT the new object instance.  For this reason, you should call 'loadResource()' instead.
         */
        constructor() {
            super(...arguments);
            /**
               * The HTTP request method to use, such as "GET" (the default), "POST", "PUT", "DELETE", etc.  Ignored for non-HTTP(S) URLs.
               *
               */
            this.method = "GET";
            this.$__transformedData = DreamSpace_1.DreamSpace.noop;
            /** The response code from the XHR response. */
            this.responseCode = 0; // (the response code returned)
            /** The response code message from the XHR response. */
            this.responseMessage = ""; // (the response code message)
            /** The current request status. */
            this.status = Resources_1.RequestStatuses.Pending;
            /** Includes the current message and all previous messages. Use this to trace any silenced errors in the request process. */
            this.messageLog = [];
            /**
             * If true (the default) then a '"_="+Date.now()' query item is added to make sure the browser never uses
             * the cache. To change the variable used, set the 'cacheBustingVar' property also.
             * Note: DreamSpace has its own caching that uses the local storage, where supported.
             */
            this.cacheBusting = ResourceRequest_1.cacheBusting;
            /** See the 'cacheBusting' property. */
            this.cacheBustingVar = ResourceRequest_1.cacheBustingVar;
            /** This is a list of all the callbacks waiting on the status of this request (such as on loaded or error).
            * There's also an 'on finally' which should execute on success OR failure, regardless.
            * For each entry, only ONE of any callback type will be set.
            */
            this._promiseChain = [];
            this._promiseChainIndex = 0; // (the current position in the event chain)
            this._parentCompletedCount = 0; // (when this equals the # of 'dependents', the all parent resources have loaded [just faster than iterating over them])
            this._paused = false;
        }
        /** See the 'cacheBusting' property. */
        static get cacheBustingVar() { return this._cacheBustingVar || '_v_'; }
        ; // (note: ResourceInfo.cs uses this same default)
        static set cacheBustingVar(value) { this._cacheBustingVar = Utilities_1.Utilities.toString(value) || '_v_'; }
        ;
        /** The requested resource URL. If the URL string starts with '~/' then it becomes relative to the content type base path. */
        get url() {
            if (typeof this._url == 'string' && this._url.charAt(0) == "~") {
                var _baseURL = Resources_1.basePathFromResourceType(this.type);
                return Path_1.Path.resolve(this._url, void 0, _baseURL);
            }
            return this._url;
        }
        set url(value) { this._url = value; }
        /** This gets set to data returned from callback handlers as the 'response' property value gets transformed.
          * If no transformations were made, then the value in 'response' is returned.
          */
        get transformedResponse() {
            return this.$__transformedData === DreamSpace_1.DreamSpace.noop ? this.response : this.$__transformedData;
        }
        /**
         * A progress/error message related to the status (may not be the same as the response message).
         * Setting this property sets the local message and updates the local message log. Make sure to set 'this.status' first before setting a message.
         */
        get message() {
            return this._message;
        }
        set message(value) {
            this._message = value;
            this.messageLog.push(this._message);
            if (this.status == Resources_1.RequestStatuses.Error)
                Logging_1.error("ResourceRequest (" + this.url + ")", this._message, this, false); // (send resource loading error messages to the console to aid debugging)
            else
                Logging_1.log("ResourceRequest (" + this.url + ")", this._message, Logging_1.LogTypes.Normal, this);
        }
        _queueDoNext(data) {
            setTimeout(() => {
                // ... before this, fire any handlers that would execute before this ...
                this._doNext();
            }, 0);
        } // (simulate an async response, in case more handlers need to be added next)
        _queueDoError() { setTimeout(() => { this._doError(); }, 0); } // (simulate an async response, in case more handlers need to be added next)
        _requeueHandlersIfNeeded() {
            if (this.status == Resources_1.RequestStatuses.Error)
                this._queueDoError();
            else if (this.status >= Resources_1.RequestStatuses.Waiting) {
                this._queueDoNext(this.response);
            }
            // ... else, not needed, as the chain is still being traversed, so anything added will get run as expected ...
        }
        /** Triggers a success or error callback after the resource loads, or fails to load. */
        then(success, error) {
            if (success !== void 0 && success !== null && typeof success != 'function' || error !== void 0 && error !== null && typeof error !== 'function')
                throw "A handler function given is not a function.";
            else {
                this._promiseChain.push({ onLoaded: success, onError: error });
                this._requeueHandlersIfNeeded();
            }
            if (this.status == Resources_1.RequestStatuses.Waiting || this.status == Resources_1.RequestStatuses.Ready) {
                this.status = Resources_1.RequestStatuses.Loaded; // (back up)
                this.message = "New 'then' handler added.";
            }
            return this;
        }
        /** Adds another request and makes it dependent on the current 'parent' request.  When all parent requests have completed,
          * the dependant request fires its 'onReady' event.
          * Note: The given request is returned, and not the current context, so be sure to complete configurations before hand.
          */
        include(request) {
            if (!request._parentRequests)
                request._parentRequests = [];
            if (!this._dependants)
                this._dependants = [];
            request._parentRequests.push(this);
            this._dependants.push(request);
            return request;
        }
        /** Returns a promise that hooks into this request. This is provided to support the async/await semantics.
         * When the 'ready()' or 'catch' events fire, the promise is given the resource request instance in both cases.
         * On success the value should be in either the 'transformedResponse' or 'response' properties of the request instance. */
        asPromise() { return new Promise((res, rej) => { this.ready((h) => { res(h); }); this.catch((h) => { res(h); }); }); }
        /**
         * Add a call-back handler for when the request completes successfully.
         * This event is triggered after the resource successfully loads and all callbacks in the promise chain get called.
         * @param handler
         */
        ready(handler) {
            if (typeof handler == 'function') {
                if (!this._onReady)
                    this._onReady = [];
                this._onReady.push(handler);
                this._requeueHandlersIfNeeded();
            }
            else
                throw "Handler is not a function.";
            return this;
        }
        /** Adds a hook into the resource load progress event. */
        while(progressHandler) {
            if (typeof progressHandler == 'function') {
                if (!this._onProgress)
                    this._onProgress = [];
                this._onProgress.push(progressHandler);
                this._requeueHandlersIfNeeded();
            }
            else
                throw "Handler is not a function.";
            return this;
        }
        /** Call this anytime while loading is in progress to terminate the request early. An error event will be triggered as well. */
        abort() {
            if (this._xhr.readyState > XMLHttpRequest.UNSENT && this._xhr.readyState < XMLHttpRequest.DONE) {
                this._xhr.abort();
            }
        }
        /**
         * Provide a handler to catch any errors from this request.
         */
        catch(errorHandler) {
            if (typeof errorHandler == 'function') {
                this._promiseChain.push({ onError: errorHandler });
                this._requeueHandlersIfNeeded();
            }
            else
                throw "Handler is not a function.";
            return this;
        }
        /**
         * Provide a handler which should execute on success OR failure, regardless.
         */
        finally(cleanupHandler) {
            if (typeof cleanupHandler == 'function') {
                this._promiseChain.push({ onFinally: cleanupHandler });
                this._requeueHandlersIfNeeded();
            }
            else
                throw "Handler is not a function.";
            return this;
        }
        /**
           * Starts loading the current resource.  If the current resource has dependencies, they are triggered to load first (in proper
           * order).  Regardless of the start order, all scripts are loaded in parallel.
           * Note: This call queues the start request in 'async' mode, which begins only after the current script execution is completed.
           * @param {string} method An optional method to override the default request method set in the 'method' property on this request instance.
           * @param {string} body Optional payload data to send, which overrides any value set in the 'payload' property on this request instance.
           * @param {string} username Optional username value, instead of storing the username in the instance.
           * @param {string} password Optional password value, instead of storing the password in the instance.
           */
        start(method, body, username, password) {
            if (this.async)
                setTimeout(() => { this._Start(method, body, username, password); }, 0);
            else
                this._Start();
            return this;
        }
        _Start(_method, _body, _username, _password) {
            // ... start at the top most parent first, and work down ...
            if (this._parentRequests)
                for (var i = 0, n = this._parentRequests.length; i < n; ++i)
                    this._parentRequests[i].start();
            if (this.status == Resources_1.RequestStatuses.Pending) {
                this.status = Resources_1.RequestStatuses.Loading; // (do this first to protect against any possible cyclical calls)
                this.message = "Loading resource ...";
                // ... this request has not been started yet; attempt to load the resource ...
                // ... 1. see first if this file is cached in the web storage, then load it from there instead ...
                //    (ignore the local caching if in debug or the versions are different)
                if (!DreamSpace_1.DreamSpace.isDebugging && typeof DreamSpace_1.DreamSpace.global.Storage !== void 0)
                    try {
                        var currentAppVersion = DreamSpace_1.DreamSpace.getAppVersion();
                        var versionInLocalStorage = DreamSpace_1.DreamSpace.global.localStorage.getItem("version");
                        var appVersionInLocalStorage = DreamSpace_1.DreamSpace.global.localStorage.getItem("appVersion");
                        if (versionInLocalStorage && appVersionInLocalStorage && DreamSpace_1.DreamSpace.version == versionInLocalStorage && currentAppVersion == appVersionInLocalStorage) {
                            // ... all versions match, just pull from local storage (faster) ...
                            this.response = DreamSpace_1.DreamSpace.global.localStorage.getItem("resource:" + this.url); // (should return 'null' if not found)
                            if (this.response !== null && this.response !== void 0) {
                                this.status = Resources_1.RequestStatuses.Loaded;
                                this._doNext();
                                return;
                            }
                        }
                    }
                    catch (e) {
                        // ... not supported? ...
                    }
                // ... 2. check web SQL for the resource ...
                // TODO: Consider Web SQL Database as well. (though not supported by IE yet, as usual, but could help greatly on the others) //?
                // ... 3. if not in web storage, try loading from a DreamSpace core system, if available ...
                // TODO: Message DreamSpace core system for resource data. // TODO: need to build the bridge class first.
                // ... next, create an XHR object and try to load the resource ...
                if (!this._xhr) {
                    this._xhr = new XMLHttpRequest();
                    var xhr = this._xhr;
                    var loaded = () => {
                        if (xhr.status == 200 || xhr.status == 304) {
                            this.response = xhr.response;
                            this.status == Resources_1.RequestStatuses.Loaded;
                            this.message = xhr.status == 304 ? "Loading completed (from browser cache)." : "Loading completed.";
                            // ... check if the expected mime type matches, otherwise throw an error to be safe ...
                            var responseType = xhr.getResponseHeader('content-type');
                            if (this.type && responseType && this.type != responseType) {
                                this.setError("Resource type mismatch: expected type was '" + this.type + "', but received '" + responseType + "' (XHR type '" + xhr.responseType + "').\r\n");
                            }
                            else {
                                if (!DreamSpace_1.DreamSpace.isDebugging && typeof DreamSpace_1.DreamSpace.global.Storage !== void 0)
                                    try {
                                        DreamSpace_1.DreamSpace.global.localStorage.setItem("version", DreamSpace_1.DreamSpace.version);
                                        DreamSpace_1.DreamSpace.global.localStorage.setItem("appVersion", DreamSpace_1.DreamSpace.getAppVersion());
                                        DreamSpace_1.DreamSpace.global.localStorage.setItem("resource:" + this.url, this.response);
                                        this.message = "Resource cached in local storage.";
                                    }
                                    catch (e) {
                                        // .. failed: out of space? ...
                                        // TODO: consider saving to web SQL as well, or on failure (as a backup; perhaps create a storage class with this support). //?
                                    }
                                else
                                    this.message = "Resource not cached in local storage because of debug mode. Release mode will use local storage to help survive clearing DreamSpace files when temporary content files are deleted.";
                                this._doNext();
                            }
                        }
                        else {
                            this.setError("There was a problem loading the resource (status code " + xhr.status + ": " + xhr.statusText + ").\r\n");
                        }
                    };
                    // ... this script is not cached, so load it ...
                    xhr.onreadystatechange = () => {
                        switch (xhr.readyState) {
                            case XMLHttpRequest.UNSENT: break;
                            case XMLHttpRequest.OPENED:
                                this.message = "Opened connection ...";
                                break;
                            case XMLHttpRequest.HEADERS_RECEIVED:
                                this.message = "Headers received ...";
                                break;
                            case XMLHttpRequest.LOADING: break; // (this will be handled by the progress event)
                            case XMLHttpRequest.DONE:
                                loaded();
                                break;
                        }
                    };
                    xhr.onerror = (ev) => { this.setError(void 0, ev); this._doError(); };
                    xhr.onabort = () => { this.setError("Request aborted."); };
                    xhr.ontimeout = () => { this.setError("Request timed out."); };
                    xhr.onprogress = (evt) => {
                        this.message = Math.round(evt.loaded / evt.total * 100) + "% loaded ...";
                        if (this._onProgress && this._onProgress.length)
                            this._doOnProgress(evt.loaded / evt.total * 100);
                    };
                    // (note: all event 'on...' properties only available in IE10+)
                }
            }
            else { // (this request was already started)
                return;
            }
            if (xhr.readyState != 0)
                xhr.abort(); // (abort existing, just in case)
            var url = this.url;
            try {
                // ... check if we need to bust the cache ...
                if (this.cacheBusting) {
                    var bustVar = this.cacheBustingVar;
                    if (bustVar.indexOf(" ") >= 0)
                        Logging_1.log("start()", "There is a space character in the cache busting query name for resource '" + url + "'.", Logging_1.LogTypes.Warning);
                }
                if (!_method)
                    _method = this.method || "GET";
                xhr.open(_method, url, this.async, _username || this.username || void 0, _password || this.password || void 0);
            }
            catch (ex) {
                Logging_1.error("start()", "Failed to load resource from URL '" + url + "': " + (ex.message || ex), this);
            }
            try {
                var payload = _body || this.body;
                if (typeof payload == 'object' && payload.__proto__ == PrimitiveTypes_1.Object.prototype) {
                    // (can't send object literals! convert to something else ...)
                    if (_method == 'GET') {
                        var q = Query_1.Query.new(payload);
                        payload = q.toString(false);
                    }
                    else {
                        var formData = new FormData(); // TODO: Test if "multipart/form-data" is needed.
                        for (var p in payload)
                            formData.append(p, payload[p]);
                        payload = formData;
                    }
                }
                xhr.send(payload);
            }
            catch (ex) {
                Logging_1.error("start()", "Failed to send request to endpoint for URL '" + url + "': " + (ex.message || ex), this);
            }
            //?if (!this.async && (xhr.status)) doSuccess();
        }
        /** Upon return, the 'then' or 'ready' event chain will pause until 'continue()' is called. */
        pause() {
            if (this.status >= Resources_1.RequestStatuses.Pending && this.status < Resources_1.RequestStatuses.Ready
                || this.status == Resources_1.RequestStatuses.Ready && this._onReady.length)
                this._paused = true;
            return this;
        }
        /** After calling 'pause()', use this function to re-queue the 'then' or 'ready' even chain for continuation.
          * Note: This queues on a timer with a 0 ms delay, and does not call any events before returning to the caller.
          */
        continue() {
            if (this._paused) {
                this._paused = false;
                this._requeueHandlersIfNeeded();
            }
            return this;
        }
        _doOnProgress(percent) {
            // ... notify any handlers as well ...
            if (this._onProgress) {
                for (var i = 0, n = this._onProgress.length; i < n; ++i)
                    try {
                        var cb = this._onProgress[i];
                        if (cb)
                            cb.call(this, this);
                    }
                    catch (e) {
                        this._onProgress[i] = null; // (won't be called again)
                        this.setError("'on progress' callback #" + i + " has thrown an error:", e);
                        // ... do nothing, not important ...
                    }
            }
        }
        setError(message, error) {
            if (error) {
                var errMsg = ErrorHandling_1.getErrorMessage(error);
                if (errMsg) {
                    if (message)
                        message += " \r\n";
                    message += errMsg;
                }
            }
            this.status = Resources_1.RequestStatuses.Error;
            this.message = message; // (automatically adds to 'this.messages' and writes to the console)
        }
        _doNext() {
            if (this.status == Resources_1.RequestStatuses.Error) {
                this._doError(); // (still in an error state, so pass on to trigger error handlers in case new ones were added)
                return;
            }
            if (this._onProgress && this._onProgress.length) {
                this._doOnProgress(100);
                this._onProgress.length = 0;
            }
            for (var n = this._promiseChain.length; this._promiseChainIndex < n; ++this._promiseChainIndex) {
                if (this._paused)
                    return;
                var handlers = this._promiseChain[this._promiseChainIndex]; // (get all the handlers waiting for the result of this request)
                if (handlers.onLoaded) {
                    try {
                        var data = handlers.onLoaded.call(this, this, this.transformedResponse); // (call the handler with the current data and get the resulting data, if any)
                    }
                    catch (e) {
                        this.setError("An 'onLoaded' handler failed.", e);
                        ++this._promiseChainIndex; // (the success callback failed, so trigger the error chain starting at next index)
                        this._doError();
                        return;
                    }
                    if (typeof data === 'object' && data instanceof ResourceRequest_1) {
                        // ... a 'LoadRequest' was returned (see end of post http://goo.gl/9HeBrN#20715224, and also http://goo.gl/qKpcR3), so check it's status ...
                        if (data.status == Resources_1.RequestStatuses.Error) {
                            this.setError("Rejected request returned from 'onLoaded' handler.");
                            ++this._promiseChainIndex;
                            this._doError(); // (cascade the error)
                            return;
                        }
                        else {
                            // ... get the data from the request object ...
                            var newResReq = data;
                            if (newResReq.status >= Resources_1.RequestStatuses.Ready) {
                                if (newResReq === this)
                                    continue; // ('self' [this] was returned, so go directly to the next item)
                                data = newResReq.transformedResponse; // (the data is ready, so read now)
                            }
                            else { // (loading is started, or still in progress, so wait; we simply hook into the request object to get notified when the data is ready)
                                newResReq.ready((sender) => { this.$__transformedData = sender.transformedResponse; this._doNext(); })
                                    .catch((sender) => { this.setError("Resource returned from next handler has failed to load.", sender); this._doError(); });
                                return;
                            }
                        }
                    }
                    if (data !== void 0)
                        this.$__transformedData = data;
                }
                else if (handlers.onFinally) {
                    try {
                        handlers.onFinally.call(this);
                    }
                    catch (e) {
                        this.setError("Cleanup handler failed.", e);
                        ++this._promiseChainIndex; // (the finally callback failed, so trigger the error chain starting at next index)
                        this._doError();
                    }
                }
            }
            this._promiseChain.length = 0;
            this._promiseChainIndex = 0;
            // ... finished: now trigger any "ready" handlers ...
            if (this.status < Resources_1.RequestStatuses.Waiting)
                this.status = Resources_1.RequestStatuses.Waiting; // (default to this next before being 'ready')
            this._doReady(); // (this triggers in dependency order)
        }
        _doReady() {
            if (this._paused)
                return;
            if (this.status < Resources_1.RequestStatuses.Waiting)
                return; // (the 'ready' event must only trigger after the resource loads, AND all handlers have been called)
            // ... check parent dependencies first ...
            if (this.status == Resources_1.RequestStatuses.Waiting)
                if (!this._parentRequests || !this._parentRequests.length) {
                    this.status = Resources_1.RequestStatuses.Ready; // (no parent resource dependencies, so this resource is 'ready' by default)
                    this.message = "Resource has no dependencies, and is now ready.";
                }
                else // ...need to determine if all parent (dependent) resources are completed first ...
                 if (this._parentCompletedCount == this._parentRequests.length) {
                    this.status = Resources_1.RequestStatuses.Ready; // (all parent resource dependencies are now 'ready')
                    this.message = "*** All dependencies for resource have loaded, and are now ready. ***";
                }
                else {
                    this.message = "Resource is waiting on dependencies (" + this._parentCompletedCount + "/" + this._parentRequests.length + " ready so far)...";
                    return; // (nothing more to do yet)
                }
            // ... call the local 'onReady' event, and then trigger the call on the children as required.
            if (this.status == Resources_1.RequestStatuses.Ready) {
                if (this._onReady && this._onReady.length) {
                    try {
                        for (var i = 0, n = this._onReady.length; i < n; ++i) {
                            this._onReady[i].call(this, this);
                            if (this.status < Resources_1.RequestStatuses.Ready)
                                return; // (a callback changed state so stop at this point as we are no longer ready!)
                        }
                        if (this._paused)
                            return;
                    }
                    catch (e) {
                        this.setError("Error in ready handler.", e);
                        if (DreamSpace_1.DreamSpace.isDebugging && (this.type == Resources_1.ResourceTypes.Application_Script || this.type == Resources_1.ResourceTypes.Application_ECMAScript))
                            throw e; // (propagate script errors to the browser for debuggers, if any)
                    }
                }
                if (this._dependants)
                    for (var i = 0, n = this._dependants.length; i < n; ++i) {
                        ++this._dependants[i]._parentCompletedCount;
                        this._dependants[i]._doReady(); // (notify all children that this resource is now 'ready' for use [all events have been run, as opposed to just being loaded])
                        if (this.status < Resources_1.RequestStatuses.Ready)
                            return; // (something changed the "Ready" state so abort!)
                    }
            }
        }
        _doError() {
            if (this._paused)
                return;
            if (this.status != Resources_1.RequestStatuses.Error) {
                this._doNext(); // (still in an error state, so pass on to trigger error handlers in case new ones were added)
                return;
            }
            for (var n = this._promiseChain.length; this._promiseChainIndex < n; ++this._promiseChainIndex) {
                if (this._paused)
                    return;
                var handlers = this._promiseChain[this._promiseChainIndex];
                if (handlers.onError) {
                    try {
                        var newData = handlers.onError.call(this, this, this.message); // (this handler should "fix" the situation and return valid data)
                    }
                    catch (e) {
                        this.setError("Error handler failed.", e);
                    }
                    if (typeof newData === 'object' && newData instanceof ResourceRequest_1) {
                        // ... a 'LoadRequest' was returned (see end of post http://goo.gl/9HeBrN#20715224, and also http://goo.gl/qKpcR3), so check it's status ...
                        if (newData.status == Resources_1.RequestStatuses.Error)
                            return; // (no correction made, still in error; terminate the event chain here)
                        else {
                            var newResReq = newData;
                            if (newResReq.status >= Resources_1.RequestStatuses.Ready)
                                newData = newResReq.transformedResponse;
                            else { // (loading is started, or still in progress, so wait)
                                newResReq.ready((sender) => { this.$__transformedData = sender.transformedResponse; this._doNext(); })
                                    .catch((sender) => { this.setError("Resource returned from error handler has failed to load.", sender); this._doError(); });
                                return;
                            }
                        }
                    }
                    // ... continue with the value from the error handler (even if none) ...
                    this.status = Resources_1.RequestStatuses.Loaded;
                    this._message = void 0; // (clear the current message [but keep history])
                    ++this._promiseChainIndex; // (pass on to next handler in the chain)
                    this.$__transformedData = newData;
                    this._doNext();
                    return;
                }
                else if (handlers.onFinally) {
                    try {
                        handlers.onFinally.call(this);
                    }
                    catch (e) {
                        this.setError("Cleanup handler failed.", e);
                    }
                }
            }
            // ... if this is reached, then there are no following error handlers, so throw the existing message ...
            if (this.status == Resources_1.RequestStatuses.Error) {
                var msgs = this.messageLog.join("\r\n· ");
                if (msgs)
                    msgs = ":\r\n· " + msgs;
                else
                    msgs = ".";
                throw new Error("Unhandled error loading resource " + (typeof this.type == 'string' ? Resources_1.ResourceTypes[this.type] : this.type) + " from '" + this.url + "'" + msgs + "\r\n");
            }
        }
        /** Resets the current resource data, and optionally all dependencies, and restarts the whole loading process.
          * Note: All handlers (including the 'progress' and 'ready' handlers) are cleared and will have to be reapplied (clean slate).
          * @param {boolean} includeDependentResources Reload all resource dependencies as well.
          */
        reload(includeDependentResources = true) {
            if (this.status == Resources_1.RequestStatuses.Error || this.status >= Resources_1.RequestStatuses.Ready) {
                this.response = void 0;
                this.status = Resources_1.RequestStatuses.Pending;
                this.responseCode = 0;
                this.responseMessage = "";
                this._message = "";
                this.messageLog = [];
                if (includeDependentResources)
                    for (var i = 0, n = this._parentRequests.length; i < n; ++i)
                        this._parentRequests[i].reload(includeDependentResources);
                if (this._onProgress)
                    this._onProgress.length = 0;
                if (this._onReady)
                    this._onReady.length = 0;
                if (this._promiseChain)
                    this._promiseChain.length = 0;
                this.start();
            }
            return this;
        }
        static [DreamSpace_1.DreamSpace.constructor](factory) {
            factory.init = (o, isnew, url, type, async = true) => {
                if (url === void 0 || url === null)
                    throw "A resource URL is required.";
                if (type === void 0)
                    throw "The resource type is required.";
                if (ResourceRequest_1._resourceRequestByURL[url])
                    return ResourceRequest_1._resourceRequestByURL[url]; // (abandon this new object instance in favor of the one already existing and returned it)
                o.url = url;
                o.type = type;
                o.async = async;
                o.$__index = ResourceRequest_1._resourceRequests.length;
                ResourceRequest_1._resourceRequests.push(o);
                ResourceRequest_1._resourceRequestByURL[o.url] = o;
            };
        }
    };
    /**
     * If true (the default) then a 'ResourceRequest.cacheBustingVar+"="+Date.now()' query item is added to make sure the browser never uses
     * the cache. To change the variable used, set the 'cacheBustingVar' property also.
     * Each resource request instance can also have its own value set separate from the global one.
     * Note: DreamSpace has its own caching that uses the local storage, where supported.
     */
    ResourceRequest.cacheBusting = true;
    ResourceRequest._cacheBustingVar = '_v_';
    ResourceRequest._resourceRequests = []; // (requests are loaded in parallel, but executed in order of request)
    ResourceRequest._resourceRequestByURL = {}; // (a quick named index lookup into '__loadRequests')
    ResourceRequest = ResourceRequest_1 = __decorate([
        Factories_1.factory(this)
    ], ResourceRequest);
    exports.ResourceRequest = ResourceRequest;
});
// ===============================================================================================================================
//# sourceMappingURL=ResourceRequest.js.map