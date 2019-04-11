// ############################################################################################################################
// Types for event management.
// ############################################################################################################################
define(["require", "exports", "../Globals", "./Delegate", "../Types", "./Exception", "./PrimitiveTypes", "../ErrorHandling", "./Browser"], function (require, exports, Globals_1, Delegate_1, Types_1, Exception_1, PrimitiveTypes_1, ErrorHandling_1, Browser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var EventDispatcher_1;
    ;
    ;
    /** Controls how the event progression occurs. */
    var EventModes;
    (function (EventModes) {
        /** Trigger event on the way up to the target. */
        EventModes[EventModes["Capture"] = 0] = "Capture";
        /** Trigger event on the way down from the target. */
        EventModes[EventModes["Bubble"] = 1] = "Bubble";
        /** Trigger event on both the way up to the target, then back down again. */
        EventModes[EventModes["CaptureAndBubble"] = 2] = "CaptureAndBubble";
    })(EventModes = exports.EventModes || (exports.EventModes = {}));
    ;
    /**
      * The EventDispatcher wraps a specific event type, and manages the triggering of "handlers" (callbacks) when that event type
      * must be dispatched. Events are usually registered as static properties first (to prevent having to create and initialize
      * many event objects for every owning object instance. Class implementations contain linked event properties to allow creating
      * instance level event handler registration on the class only when necessary.
      */
    let EventDispatcherFactory = class EventDispatcherFactory extends Types_1.Factory(PrimitiveTypes_1.DSObject) {
        /** Creates an event object for a specific even type.
            * @param {TOwner} owner The owner which owns this event object.
            * @param {string} eventName The name of the event which this event object represents.
            * @param {boolean} removeOnTrigger If true, then handlers are called only once, then removed (default is false).
            * @param {Function} eventTriggerHandler This is a hook which is called every time a handler needs to be called.  This exists mainly to support handlers called with special parameters.
            * @param {boolean} canCancel If true, the event can be cancelled (prevented from completing, so no other events will fire).
            */
        static 'new'(owner, eventName, removeOnTrigger = false, eventTriggerHandler = null, canCancel = true) { return null; }
        /** Initializes/reinitializes an EventDispatcher instance. */
        static init(o, isnew, owner, eventName, removeOnTrigger = false, eventTriggerHandler = null, canCancel = true) {
        }
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
            return null;
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
    };
    EventDispatcherFactory = __decorate([
        Types_1.factory(this)
    ], EventDispatcherFactory);
    exports.EventDispatcher = EventDispatcherFactory;
    let EventDispatcher = EventDispatcher_1 = class EventDispatcher extends PrimitiveTypes_1.DependentObject {
        constructor() {
            super(...arguments);
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
        }
        /** Return the underlying event name for this event object. */
        getEventName() { return this.__eventName; }
        /** Returns true if handlers exist on this event object instance. */
        hasHandlers() { return !!this.__listeners.length; }
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
            if (handler instanceof Delegate_1.Delegate) {
                var object = handler.object;
                var func = handler.func;
            }
            else if (handler instanceof Function) {
                object = null;
                func = handler;
            }
            else
                throw Exception_1.Exception.error("_getHandlerIndex()", "The given handler is not valid.  A Delegate type or function was expected.", this);
            for (var i = 0, n = this.__listeners.length; i < n; ++i) {
                var h = this.__listeners[i];
                if (h.object == object && h.func == func)
                    return i;
            }
            return -1;
        }
        attach(handler, eventMode = EventModes.Capture) {
            if (this._getHandlerIndex(handler) == -1) {
                var delegate = handler instanceof Delegate_1.Delegate ? handler : Delegate_1.Delegate.new(this, handler);
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
            var eventChain = PrimitiveTypes_1.Array.new(this); // ('this' [the current instance] is the last for capture, and first for bubbling)
            if (parent) {
                var eventPropertyName = this.__eventPropertyName; // (if exists, this references the 'on{EventName}' property getter that returns an even dispatcher object)
                while (parent) {
                    var eventInstance = parent[eventPropertyName];
                    if (eventInstance instanceof EventDispatcher_1)
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
                msg += "\r\nInner error: " + ErrorHandling_1.getErrorMessage(error);
            return Exception_1.Exception.error("{EventDispatcher}.dispatchEvent():", "Error in event " + this.__eventName + " on object type '" + Types_1.getTypeName(this.owner) + "': " + msg, { exception: error, event: this, handler: this.__handlerCallInProgress });
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
        static [Globals_1.DreamSpace.constructor](factory) {
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
            EventDispatcher_1.prototype.dispatch = function dispatch(...args) {
                var _trigger = getTriggerFunc.call(this, args);
                if (!this.synchronous && typeof setTimeout == 'function')
                    setTimeout(() => { _trigger.call(this); }, 0);
                else
                    return _trigger.call(this);
            };
            EventDispatcher_1.prototype.dispatchAsync = function dispatchAsync(...args) {
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
        static [Globals_1.DreamSpace.constructor](factory) {
            factory.init = (o, isnew, owner, eventName, removeOnTrigger = false, eventTriggerHandler = null, canCancel = true) => {
                factory.super.init(o, isnew);
                if (typeof eventName !== 'string')
                    eventName = '' + eventName;
                if (!eventName)
                    throw "An event name is required.";
                o.__eventName = eventName;
                o.__eventPropertyName = EventDispatcherFactory.createEventPropertyNameFromEventName(eventName); // (fix to support the convention of {item}.on{Event}().
                o.owner = owner;
                o.associate(owner);
                o.__eventTriggerHandler = eventTriggerHandler;
                o.canCancel = canCancel;
                if (!isnew) {
                    o.__listeners.length = 0;
                }
            };
            factory.registerEvent = (type, eventName, eventMode, removeOnTrigger, eventTriggerCallback, customEventPropName, canCancel) => {
                customEventPropName || (customEventPropName = EventDispatcherFactory.createEventPropertyNameFromEventName(eventName)); // (the default supports the convention of {item}.on{Event}()).
                var privateEventName = EventDispatcherFactory.createPrivateEventName(eventName); // (this name is used to store the new event dispatcher instance, which is created on demand for every instance)
                // ... create a "getter" in the prototype for 'type' so that, when accessed by specific instances, an event object will be created on demand - this greatly reduces memory
                //    allocations when many events exist on a lot of objects) ...
                var onEventProxy = function () {
                    var instance = this; // (instance is the object instance on which this event property reference was made)
                    if (typeof instance !== 'object') //?  || !(instance instanceof DomainObject.$type))
                        throw Exception_1.Exception.error("{Object}." + eventName, "Must be called on an object instance.", instance);
                    // ... check if the instance already created the event property for registering events specific to this instance ...
                    var eventProperty = instance[privateEventName];
                    if (typeof eventProperty !== 'object') // (undefined or not valid, so attempt to create one now)
                        instance[privateEventName] = eventProperty = EventDispatcherFactory.new(instance, eventName, removeOnTrigger, eventTriggerCallback, canCancel);
                    eventProperty.__eventPropertyName = customEventPropName;
                    eventProperty.__eventPrivatePropertyName = privateEventName;
                    return eventProperty;
                };
                //x ... first, set the depreciating cross-browser compatible access method ...
                //x type.prototype["$__" + customEventPropName] = onEventProxy; // (ex: '$__onClick')
                // ... create the event getter property and set the "on event" getter proxy ...
                if (global.Object.defineProperty)
                    global.Object.defineProperty(type.prototype, customEventPropName, {
                        configurable: true,
                        enumerable: true,
                        writable: true,
                        get: onEventProxy
                    });
                else
                    throw Exception_1.Exception.error("registerEvent: " + eventName, "This browser does not support 'Object.defineProperty()'. To support older browsers, call '_" + customEventPropName + "()' instead to get an instance specific reference to the EventDispatcher for that event (i.e. for 'click' event, do 'obj._onClick().attach(...)').", type);
                return { _eventMode: eventMode, _eventName: eventName, _removeOnTrigger: removeOnTrigger }; // (the return doesn't matter at this time)
            };
        }
    };
    EventDispatcher = EventDispatcher_1 = __decorate([
        Types_1.usingFactory(EventDispatcherFactory, this)
    ], EventDispatcher);
    exports.EventDispatcherInstance = EventDispatcher;
    class EventObject extends Types_1.Factory(PrimitiveTypes_1.DSObject) {
        /**
        * Constructs a new Delegate object.
        * @param {DSObject} object The instance on which the associated function will be called.  This should be undefined/null for static functions.
        * @param {Function} func The function to be called on the associated object.
        */
        static 'new'() { return null; }
        /**
        * Reinitializes a disposed Delegate instance.
        * @param o The Delegate instance to initialize, or re-initialize.
        * @param isnew If true, this is a new instance, otherwise it is from a cache (and may have some preexisting properties).
        * @param object The instance to bind to the resulting delegate object.
        * @param func The function that will be called for the resulting delegate object.
        */
        static init(o, isnew) {
            this.super.init(o, isnew);
        }
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
        static [Globals_1.DreamSpace.constructor](factory) {
            factory.init = (o, isnew) => {
            };
        }
    }
    exports.EventObject = EventObject;
    // ========================================================================================================================
    var Browser_Ext;
    (function (Browser_Ext) {
        /** Triggered when the DOM has completed loading. */
        Browser_Ext.onReady = EventDispatcherFactory.new(Browser_1.Browser, "onReady", true);
        Browser_1.Browser.onReady = Browser_Ext.onReady;
    })(Browser_Ext || (Browser_Ext = {}));
    var DreamSpace_Ext;
    (function (DreamSpace_Ext) {
        /** Triggered when all manifests have loaded. No modules have been executed at this point.
          * Note: 'onReady' is not called automatically if 'DreamSpace.System.Diagnostics.debug' is set to 'Debug_Wait'.
          */
        DreamSpace_Ext.onReady = EventDispatcherFactory.new(Globals_1.DreamSpace, "onReady", true);
        Globals_1.DreamSpace.onReady = DreamSpace_Ext.onReady;
    })(DreamSpace_Ext || (DreamSpace_Ext = {}));
});
// ############################################################################################################################
//# sourceMappingURL=Events.js.map