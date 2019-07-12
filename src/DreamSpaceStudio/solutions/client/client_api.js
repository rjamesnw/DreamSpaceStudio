// ############################################################################################################################
// Types for event management.
// ############################################################################################################################
var DS;
(function (DS) {
    // ========================================================================================================================
    ;
    ;
    /** Controls how the event progression occurs. */
    let EventModes;
    (function (EventModes) {
        /** Trigger event on the way up to the target. */
        EventModes[EventModes["Capture"] = 0] = "Capture";
        /** Trigger event on the way down from the target. */
        EventModes[EventModes["Bubble"] = 1] = "Bubble";
        /** Trigger event on both the way up to the target, then back down again. */
        EventModes[EventModes["CaptureAndBubble"] = 2] = "CaptureAndBubble";
    })(EventModes = DS.EventModes || (DS.EventModes = {}));
    ;
    /**
      * The EventDispatcher wraps a specific event type, and manages the triggering of "handlers" (callbacks) when that event type
      * must be dispatched. Events are usually registered as static properties first (to prevent having to create and initialize
      * many event objects for every owning object instance. Class implementations contain linked event properties to allow creating
      * instance level event handler registration on the class only when necessary.
      */
    class EventDispatcher extends DS.DependentObject {
        /** Constructs a new instance of the even dispatcher.
         * @param eventTriggerHandler A global handler per event type that is triggered before any other handlers. This is a hook which is called every time an event triggers.
         * This exists mainly to support handlers called with special parameters, such as those that may need translation, or arguments that need to be injected.
         */
        constructor(owner, eventName, removeOnTrigger = false, canCancel = true, eventTriggerHandler = null) {
            super();
            this.__associations = new WeakMap(); // (a mapping between an external object and this event instance - typically used to associated this event with an external object OTHER than the owner)
            this.__listeners = []; // (this is typed "any object type" to allow using delegate handler function objects later on)
            /** If this is true, then any new handler added will automatically be triggered as well.
            * This is handy in cases where an application state is persisted, and future handlers should always execute. */
            this.autoTrigger = false;
            /** If true, then handlers are called only once, then removed (default is false). */
            this.removeOnTrigger = false;
            /** This is a hook which is called every time a handler needs to be called.  This exists mainly to support handlers called with special parameters. */
            this.eventTriggerHandler = null;
            /** True if the event can be cancelled. */
            this.canCancel = true;
            if (typeof eventName !== 'string')
                eventName = '' + eventName;
            if (!eventName)
                throw "An event name is required.";
            this.__eventName = eventName;
            this.__eventPropertyName = EventDispatcher.createEventPropertyNameFromEventName(eventName); // (fix to support the convention of {item}.on{Event}().
            this.owner = owner;
            this.associate(owner);
            this.__eventTriggerHandler = eventTriggerHandler;
            this.canCancel = canCancel;
        }
        /** Return the underlying event name for this event object. */
        getEventName() { return this.__eventName; }
        /** Returns true if handlers exist on this event object instance. */
        hasHandlers() { return !!this.__listeners.length; }
        /**
           * Registers an event with a class type - typically as a static property.
           * @param type A class reference where the static property will be registered.
           * @param eventName The name of the event to register.
           * @param eventMode Specifies the desired event traveling mode.
           * @param removeOnTrigger If true, the event only fires one time, then clears all event handlers. Attaching handlers once an event fires in this state causes them to be called immediately.
           * @param eventTriggerCallback This is a hook which is called every time a handler needs to be called.  This exists mainly to support handlers called with special parameters.
           * @param customEventPropName The name of the property that will be associated with this event, and expected on parent objects
           * for the capturing and bubbling phases.  If left undefined/null, then the default is assumed to be
           * 'on[EventName]', where the first event character is made uppercase automatically.
           * @param canCancel If true (default), this event can be cancelled (prevented from completing, so no other events will fire).
           */
        static registerEvent(type, eventName, eventMode = EventModes.Capture, removeOnTrigger = false, eventTriggerCallback, customEventPropName, canCancel = true) {
            customEventPropName || (customEventPropName = EventDispatcher.createEventPropertyNameFromEventName(eventName)); // (the default supports the convention of {item}.on{Event}()).
            var privateEventName = EventDispatcher.createPrivateEventName(eventName); // (this name is used to store the new event dispatcher instance, which is created on demand for every instance)
            // ... create a "getter" in the prototype for 'type' so that, when accessed by specific instances, an event object will be created on demand - this greatly reduces memory
            //    allocations when many events exist on a lot of objects) ...
            var onEventProxy = function () {
                var instance = this; // (instance is the object instance on which this event property reference was made)
                if (typeof instance !== 'object') //?  || !(instance instanceof DomainObject.$type))
                    throw DS.Exception.error("{Object}." + eventName, "Must be called on an object instance.", instance);
                // ... check if the instance already created the event property for registering events specific to this instance ...
                var eventProperty = instance[privateEventName];
                if (typeof eventProperty !== 'object') // (undefined or not valid, so attempt to create one now)
                    instance[privateEventName] = eventProperty = new EventDispatcher(instance, eventName, removeOnTrigger, canCancel, eventTriggerCallback);
                eventProperty.__eventPropertyName = customEventPropName;
                eventProperty.__eventPrivatePropertyName = privateEventName;
                return eventProperty;
            };
            //x ... first, set the depreciating cross-browser compatible access method ...
            //x type.prototype["$__" + customEventPropName] = onEventProxy; // (ex: '$__onClick')
            // ... create the event getter property and set the "on event" getter proxy ...
            if (DS.global.Object.defineProperty)
                DS.global.Object.defineProperty(type.prototype, customEventPropName, {
                    configurable: true,
                    enumerable: true,
                    writable: true,
                    get: onEventProxy
                });
            else
                throw DS.Exception.error("registerEvent: " + eventName, "This browser does not support 'Object.defineProperty()'. To support older browsers, call '_" + customEventPropName + "()' instead to get an instance specific reference to the EventDispatcher for that event (i.e. for 'click' event, do 'obj._onClick().attach(...)').", type);
            return { _eventMode: eventMode, _eventName: eventName, _removeOnTrigger: removeOnTrigger }; // (the return doesn't matter at this time)
        }
        /**
            * Creates an instance property name from a given event name by adding 'on' as a prefix.
            * This is mainly used when registering events as static properties on types.
            * @param {string} eventName The event name to create an event property from. If the given event name already starts with 'on', then the given name is used as is (i.e. 'click' becomes 'onClick').
            */
        static createEventPropertyNameFromEventName(eventName) {
            return eventName.match(/^on[^a-z]/) ? eventName : "on" + eventName.charAt(0).toUpperCase() + eventName.substring(1);
        }
        /**
           * Returns a formatted event name in the form of a private event name like '$__{eventName}Event' (eg. 'click' becomes '$__clickEvent').
           * The private event names are used to store event instances on the owning instances so each instance has it's own handlers list to manage.
           */
        static createPrivateEventName(eventName) { return "$__" + eventName + "Event"; }
        dispose() {
            // ... remove all handlers ...
            this.removeAllListeners();
            // TODO: Detach from owner as well? //?
        }
        /**
         * Associates this event instance with an object using a weak map. The owner of the instance is already associated by default.
         * Use this function to associate other external objects other than the owner, such as DOM elements (there should only be one
         * specific event instance per any object).
         */
        associate(obj) {
            this.__associations.set(obj, this);
            return this;
        }
        /** Disassociates this event instance from an object (an internal weak map is used for associations). */
        disassociate(obj) {
            this.__associations.delete(obj);
            return this;
        }
        /** Returns true if this event instance is already associated with the specified object (a weak map is used). */
        isAssociated(obj) {
            return this.__associations.has(obj);
        }
        _getHandlerIndex(handler) {
            if (handler instanceof DS.Delegate) {
                var object = handler.object;
                var func = handler.func;
            }
            else if (handler instanceof Function) {
                object = null;
                func = handler;
            }
            else
                throw DS.Exception.error("_getHandlerIndex()", "The given handler is not valid.  A Delegate type or function was expected.", this);
            for (var i = 0, n = this.__listeners.length; i < n; ++i) {
                var h = this.__listeners[i];
                if (h.object == object && h.func == func)
                    return i;
            }
            return -1;
        }
        attach(handler, eventMode = EventModes.Capture) {
            if (this._getHandlerIndex(handler) == -1) {
                var delegate = handler instanceof DS.Delegate ? handler : new DS.Delegate(this, handler);
                delegate.$__eventMode = eventMode;
                this.__listeners.push(delegate);
            }
            return this;
        }
        /** Dispatch the underlying event. Typically 'dispatch()' is called instead of calling this directly. Returns 'true' if all events completed, and 'false' if any handler cancelled the event.
          * @param {any} triggerState If supplied, the event will not trigger unless the current state is different from the last state.  This is useful in making
          * sure events only trigger once per state.  Pass in null (the default) to always dispatch regardless.  Pass 'undefined' to used the event
          * name as the trigger state (this can be used for a "trigger only once" scenario).
          * @param {boolean} canBubble Set to true to allow the event to bubble (where supported).
          * @param {boolean} canCancel Set to true if handlers can abort the event (false means it has or will occur regardless).
          * @param {string[]} args Custom arguments that will be passed on to the event handlers.
          */
        dispatchEvent(triggerState = null, ...args) {
            if (!this.setTriggerState(triggerState))
                return; // (no change in state, so ignore this request)
            // ... for capture phases, start at the bottom and work up; but need to build the chain first (http://stackoverflow.com/a/10654134/1236397) ...
            // ('this.__parent' checks for event-instance-only chained events, whereas 'this.owner.parent' iterates events using the a parent-child dependency hierarchy from the owner)
            var parent = this.__parent || this.owner && this.owner.parent || null;
            // ... run capture/bubbling phases; first, build the event chain ...
            var eventChain = new Array(this); // ('this' [the current instance] is the last for capture, and first for bubbling)
            if (parent) {
                var eventPropertyName = this.__eventPropertyName; // (if exists, this references the 'on{EventName}' property getter that returns an even dispatcher object)
                while (parent) {
                    var eventInstance = parent[eventPropertyName];
                    if (eventInstance instanceof EventDispatcher)
                        eventChain.push(eventInstance);
                    parent = parent['__parent'];
                }
            }
            var cancelled = false;
            // ... do capture phase (root, towards target) ...
            for (var n = eventChain.length, i = n - 1; i >= 0; --i) {
                if (cancelled)
                    break;
                var dispatcher = eventChain[i];
                if (dispatcher.__listeners.length)
                    cancelled = dispatcher.onDispatchEvent(args, EventModes.Capture);
            }
            // ... do bubbling phase (target, towards root) ...
            for (var i = 0, n = eventChain.length; i < n; ++i) {
                if (cancelled)
                    break;
                var dispatcher = eventChain[i];
                if (dispatcher.__listeners.length)
                    cancelled = dispatcher.onDispatchEvent(args, EventModes.Bubble);
            }
            return !cancelled;
        }
        __exception(msg, error) {
            if (error)
                msg += "\r\nInner error: " + DS.getErrorMessage(error);
            return DS.Exception.error("{EventDispatcher}.dispatchEvent():", "Error in event " + this.__eventName + " on object type '" + DS.getTypeName(this.owner) + "': " + msg, { exception: error, event: this, handler: this.__handlerCallInProgress });
        }
        /** Calls the event handlers that match the event mode on the current event instance. */
        onDispatchEvent(args, mode) {
            args.push(this); // (add this event instance to the end of the arguments list to allow an optional target parameters to get a reference to the calling event)
            this.__cancelled = false;
            this.__dispatchInProgress = true;
            try {
                for (var i = 0, n = this.__listeners.length; i < n; ++i) {
                    var delegate = this.__listeners[i];
                    var cancelled = false;
                    if (delegate.$__eventMode == mode && delegate) {
                        this.__handlerCallInProgress = delegate;
                        if (this.__eventTriggerHandler)
                            cancelled = this.__eventTriggerHandler(this, delegate, args, delegate.$__eventMode) === false; // (call any special trigger handler)
                        else
                            cancelled = delegate.apply(args) === false;
                    }
                    if (cancelled && this.canCancel) {
                        this.__cancelled = true;
                        break;
                    }
                }
            }
            catch (ex) {
                throw this.__exception("Error executing handler #" + i + ".", ex);
            }
            finally {
                this.__dispatchInProgress = false;
                this.__handlerCallInProgress = null;
            }
            return this.__cancelled;
        }
        /** If the given state value is different from the last state value, the internal trigger state value will be updated, and true will be returned.
            * If a state value of null is given, the request will be ignored, and true will always be returned.
            * If you don't specify a value ('triggerState' is 'undefined') then the internal event name becomes the trigger state value (this can be used for a "trigger
            * only once" scenario).  Use 'resetTriggerState()' to reset the internal trigger state when needed.
            */
        setTriggerState(triggerState) {
            if (triggerState === void 0)
                triggerState = this.__eventName;
            if (triggerState !== null)
                if (triggerState === this.__lastTriggerState)
                    return false; // (no change in state, so ignore this request)
                else
                    this.__lastTriggerState = triggerState;
            return true;
        }
        /** Resets the current internal trigger state to null. The next call to 'setTriggerState()' will always return true.
            * This is usually called after a sequence of events have completed, in which it is possible for the cycle to repeat.
            */
        resetTriggerState() { this.__lastTriggerState = null; }
        /** A simple way to pass arguments to event handlers using arguments with static typing (calls 'dispatchEvent(null, false, false, arguments)').
        * If not cancelled, then 'true' is returned.
        * TIP: To prevent triggering the same event multiple times, use a custom state value in a call to 'setTriggerState()', and only call
        * 'dispatch()' if true is returned (example: "someEvent.setTriggerState(someState) && someEvent.dispatch(...);", where the call to 'dispatch()'
        * only occurs if true is returned from the previous statement).
        * Note: Call 'dispatchAsync()' to allow current script execution to complete before any handlers get called.
        * @see dispatchAsync
        */
        dispatch(...args) { return void 0; }
        /** Trigger this event by calling all the handlers.
         * If a handler cancels the process, then the promise is rejected.
         * This method allows scheduling events to fire after current script execution completes.
         */
        dispatchAsync(...args) { return void 0; }
        /** If called within a handler, prevents the other handlers from being called. */
        cancel() {
            if (this.__dispatchInProgress)
                if (this.canCancel)
                    this.__cancelled = true;
                else
                    throw this.__exception("This even dispatcher does not support canceling events.");
        }
        __indexOf(object, handler) {
            for (var i = this.__listeners.length - 1; i >= 0; --i) {
                var d = this.__listeners[i];
                if (d.object == object && d.func == handler)
                    return i;
            }
            return -1;
        }
        __removeListener(i) {
            if (i >= 0 && i < this.__listeners.length) {
                var handlerInfo = (i == this.__listeners.length - 1 ? this.__listeners.pop() : this.__listeners.splice(i, 1)[0]);
                if (this.__dispatchInProgress && this.__handlerCallInProgress === handlerInfo)
                    throw this.__exception("Cannot remove a listener while it is executing.");
                //    --this.__handlerCountBeforeDispatch; // (if the handler being removed is not the current one in progress, then it will never be called, and thus the original count needs to change)
                //if (handlerInfo.addFunctionName == "addEventListener")
                //    document.removeEventListener(this.__eventName, handlerInfo.__internalCallback, false);
                //else if (handlerInfo.addFunctionName == "attachEvent")
                //    (<any>document.documentElement).detachEvent("onpropertychange", handlerInfo.__internalCallback);
                // (else this is most likely the server side, and removing it from the array is good enough)
                //? this[handlerInfo.key] = void 0; // (faster than deleting it, and prevents having to create the property over and over)
                return handlerInfo;
            }
            return void 0;
        }
        removeListener(handler, func) {
            // ... check if a delegate is given, otherwise attempt to create one ...
            if (typeof func == 'function') {
                this.__removeListener(this.__indexOf(handler, func));
            }
            else {
                this.__removeListener(this.__indexOf(handler.object, handler.func));
            }
        }
        removeAllListeners() {
            for (var i = this.__listeners.length - 1; i >= 0; --i)
                this.__removeListener(i);
        }
        static [DS.constructor]() {
            function getTriggerFunc(args) {
                //x args.push(void 0, this); // (add 2 optional items on end)
                //x var dataIndex = args.length - 2; // (set the index where the data should be set when each handler gets called)
                return function _trigger() {
                    //x for (var i = 0, n = this._handlers.length; i < n; ++i) {
                    //    var h = <IEventDispatcherHandlerInfo<any, any>>this._handlers[i];
                    //    args[dataIndex] = h.data;
                    //    var result = this.eventCaller ? this.eventCaller.call(this._owner || this, h.handler, args) : h.handler.apply(this._owner || this, args);
                    //    if (this.canCancel && result === false) return false;
                    //    if (h.removeOnTrigger) { this._handlers.splice(i, 1); --i; --n; }
                    //x }
                    // 
                    //return !this.onCompleted || this.onCompleted.apply(this._owner || this, args) !== false;
                    return this.dispatchEvent.apply(this, (args.unshift(null), args));
                };
            }
            ;
            EventDispatcher.prototype.dispatch = function dispatch(...args) {
                var _trigger = getTriggerFunc.call(this, args);
                if (!this.synchronous && typeof setTimeout == 'function')
                    setTimeout(() => { _trigger.call(this); }, 0);
                else
                    return _trigger.call(this);
            };
            EventDispatcher.prototype.dispatchAsync = function dispatchAsync(...args) {
                var _trigger = getTriggerFunc.call(this, args);
                return new Promise((resolve, reject) => {
                    if (!this.synchronous && typeof setTimeout == 'function')
                        setTimeout(() => { if (_trigger.call(this))
                            resolve();
                        else
                            reject(); }, 0);
                    else if (_trigger.call(this))
                        resolve();
                    else
                        reject();
                });
            };
        }
    }
    DS.EventDispatcher = EventDispatcher;
    EventDispatcher[DS.constructor](); // ('any' is used because the static constructor is private)
    class EventObject {
        /** Call this if you wish to implement 'changing' events for supported properties.
        * If any event handler cancels the event, then 'false' will be returned.
        */
        doPropertyChanging(name, newValue) {
            if (this.onPropertyChanging)
                return this.onPropertyChanging.dispatch(this, newValue);
            else
                return true;
        }
        /** Call this if you wish to implement 'changed' events for supported properties. */
        doPropertyChanged(name, oldValue) {
            if (this.onPropertyChanged)
                this.onPropertyChanged.dispatch(this, oldValue);
        }
    }
    DS.EventObject = EventObject;
    // ========================================================================================================================
    let Browser;
    (function (Browser) {
        /** Triggered when the DOM has completed loading. */
        Browser.onReady = new EventDispatcher(Browser, "onReady", true);
    })(Browser = DS.Browser || (DS.Browser = {}));
    /** Triggered when all manifests have loaded. No modules have been executed at this point.
      * Note: 'onReady' is not called automatically if 'DreamSpace.System.Diagnostics.debug' is set to 'Debug_Wait'.
      */
    DS.onReady = new EventDispatcher(DS, "onReady", true);
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
        var query = DS.Query.new(url);
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
