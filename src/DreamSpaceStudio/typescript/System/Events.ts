﻿// ############################################################################################################################
// Types for event management.
// ############################################################################################################################

export * from "./DreamSpace";
import { DreamSpace as DS } from "./DreamSpace";
declare module "./DreamSpace" { namespace DreamSpace { export var onReady: typeof DreamSpace_Ext.onReady; } } // (augmented with a "ready" event)

import { IDelegate, Delegate } from "./Delegate";
import { Exception } from "./Exception";
import { getErrorMessage } from "./ErrorHandling";

import { Browser } from "./Browser";
import { getTypeName } from "./Utilities";
import { DependentObject } from "./DependentObject";
import { EventDefinition } from "./EventDefinition";
declare module "./Browser" { namespace Browser { export var onReady: typeof Browser_Ext.onReady; } } // (augmented with a "ready" event)

// ====================================================================================================================

/** Represents an event callback function. Handlers should return false to cancel event dispatching if desired (anything else is ignored). */
export interface EventHandler { (this: object, ...args: any[]): void | boolean };

/** 
 * The event trigger handler is called to allow custom handling of event handlers when an event occurs. 
 * This handler should return false to cancel event dispatching if desired (anything else is ignored).
 */
export interface EventTriggerHandler<TOwner extends object, TCallback extends EventHandler> {
    (event: IEventDispatcher<TOwner, TCallback>, handler: IDelegate<object, TCallback>, args: any[], mode?: EventModes): void | boolean
};

/** Controls how the event progression occurs. */
export enum EventModes {
    /** Trigger event on the way up to the target. */
    Capture,
    /** Trigger event on the way down from the target. */
    Bubble,
    /** Trigger event on both the way up to the target, then back down again. */
    CaptureAndBubble
};

type THandlerInfo<TCallback extends EventHandler = EventHandler> = IDelegate<object, TCallback> & { $__eventMode?: EventModes };

/** 
  * The EventDispatcher wraps a specific event type, and manages the triggering of "handlers" (callbacks) when that event type
  * must be dispatched. Events are usually registered as static properties first (to prevent having to create and initialize
  * many event objects for every owning object instance. Class implementations contain linked event properties to allow creating
  * instance level event handler registration on the class only when necessary.
  */
export class EventDispatcher<TOwner extends object = object, TCallback extends EventHandler = EventHandler> extends DependentObject {
    readonly owner: TOwner;

    private __eventName: string;
    private __associations = new WeakMap<object, this>(); // (a mapping between an external object and this event instance - typically used to associated this event with an external object OTHER than the owner)
    private __listeners: THandlerInfo<TCallback>[] = []; // (this is typed "any object type" to allow using delegate handler function objects later on)
    /** If a parent value is set, then the event chain will travel the parent hierarchy from this event dispatcher. If not set, the owner is assumed instead. */
    protected __parent: IEventDispatcher<any, EventHandler>; // (this is also declared on the DependencyObject base)
    private __eventTriggerHandler: EventTriggerHandler<TOwner, TCallback>; // (a global handler per registered type that is triggered before any other handlers)
    private __eventPropertyName: string;// (the public 'on{Event}' name on the owning type's prototype used to reference this event instance)
    private __eventPrivatePropertyName: string;// (the '$__{EventName}Event' private name on the owning instance that points to this event instance)
    private __lastTriggerState: string;
    private __cancelled: boolean; // (true if the handler wants to stop further handler calls)
    private __dispatchInProgress: boolean; // (true if a dispatch is in process of calling handlers)
    private __handlerCallInProgress: THandlerInfo<TCallback>; // (the current handler just called, or null if there is no dispatching in progress)

    /** Return the underlying event name for this event object. */
    getEventName() { return this.__eventName; }

    /** If this is true, then any new handler added will automatically be triggered as well.
    * This is handy in cases where an application state is persisted, and future handlers should always execute. */
    autoTrigger: boolean = false;

    /** Returns true if handlers exist on this event object instance. */
    hasHandlers(): boolean { return !!this.__listeners.length; }

    /** If true, then handlers are called only once, then removed (default is false). */
    removeOnTrigger: boolean = false;
    /** This is a hook which is called every time a handler needs to be called.  This exists mainly to support handlers called with special parameters. */
    eventTriggerHandler: EventTriggerHandler<TOwner, TCallback> = null;
    /** True if the event can be cancelled. */
    canCancel: boolean = true;

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
    static registerEvent<TOwner extends object, TCallback extends EventHandler>(type: { new(...args: any[]): TOwner }, eventName: string,
        eventMode: EventModes = EventModes.Capture, removeOnTrigger: boolean = false, eventTriggerCallback?: EventTriggerHandler<TOwner, TCallback>,
        customEventPropName?: string, canCancel: boolean = true)
        : { _eventMode: EventModes; _eventName: string; _removeOnTrigger: boolean; eventFuncType: () => IEventDispatcher<TOwner, TCallback>; eventPropertyType: IEventDispatcher<TOwner, TCallback> } {

        customEventPropName || (customEventPropName = EventDispatcher.createEventPropertyNameFromEventName(eventName)); // (the default supports the convention of {item}.on{Event}()).
        var privateEventName = EventDispatcher.createPrivateEventName(eventName); // (this name is used to store the new event dispatcher instance, which is created on demand for every instance)

        // ... create a "getter" in the prototype for 'type' so that, when accessed by specific instances, an event object will be created on demand - this greatly reduces memory
        //    allocations when many events exist on a lot of objects) ...

        var onEventProxy = function (): IEventDispatcher<object, EventHandler> {
            var instance = <Object>this; // (instance is the object instance on which this event property reference was made)
            if (typeof instance !== 'object') //?  || !(instance instanceof DomainObject.$type))
                throw Exception.error("{Object}." + eventName, "Must be called on an object instance.", instance);
            // ... check if the instance already created the event property for registering events specific to this instance ...
            var eventProperty: EventDispatcher<object, EventHandler> = instance[privateEventName];
            if (typeof eventProperty !== 'object') // (undefined or not valid, so attempt to create one now)
                instance[privateEventName] = eventProperty = new EventDispatcher<object, EventHandler>(instance, eventName, removeOnTrigger, canCancel, eventTriggerCallback);
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
            throw Exception.error("registerEvent: " + eventName, "This browser does not support 'Object.defineProperty()'. To support older browsers, call '_" + customEventPropName + "()' instead to get an instance specific reference to the EventDispatcher for that event (i.e. for 'click' event, do 'obj._onClick().attach(...)').", type);

        return <any>{ _eventMode: eventMode, _eventName: eventName, _removeOnTrigger: removeOnTrigger }; // (the return doesn't matter at this time)
    }

    /**
        * Creates an instance property name from a given event name by adding 'on' as a prefix.
        * This is mainly used when registering events as static properties on types.
        * @param {string} eventName The event name to create an event property from. If the given event name already starts with 'on', then the given name is used as is (i.e. 'click' becomes 'onClick').
        */
    static createEventPropertyNameFromEventName(eventName: string): string {
        return eventName.match(/^on[^a-z]/) ? eventName : "on" + eventName.charAt(0).toUpperCase() + eventName.substring(1);
    }

    /** 
       * Returns a formatted event name in the form of a private event name like '$__{eventName}Event' (eg. 'click' becomes '$__clickEvent'). 
       * The private event names are used to store event instances on the owning instances so each instance has it's own handlers list to manage.
       */
    static createPrivateEventName(eventName: string) { return "$__" + eventName + "Event"; }

    dispose(): void {
        // ... remove all handlers ...
        this.removeAllListeners();
        // TODO: Detach from owner as well? //?
    }

    /** 
     * Associates this event instance with an object using a weak map. The owner of the instance is already associated by default. 
     * Use this function to associate other external objects other than the owner, such as DOM elements (there should only be one
     * specific event instance per any object).
     */
    associate(obj: object): this {
        this.__associations.set(obj, this);
        return this;
    }

    /** Disassociates this event instance from an object (an internal weak map is used for associations). */
    disassociate(obj: object): this {
        this.__associations.delete(obj);
        return this;
    }

    /** Returns true if this event instance is already associated with the specified object (a weak map is used). */
    isAssociated(obj: object): boolean {
        return this.__associations.has(obj);
    }

    _getHandlerIndex(handler: TCallback): number;
    _getHandlerIndex(handler: IDelegate<object, TCallback>): number;
    _getHandlerIndex(handler: TCallback | IDelegate<object, TCallback>): number {
        if (handler instanceof Delegate) {
            var object = handler.object;
            var func = <TCallback>handler.func;
        }
        else if (handler instanceof Function) {
            object = null;
            func = handler;
        } else throw Exception.error("_getHandlerIndex()", "The given handler is not valid.  A Delegate type or function was expected.", this);

        for (var i = 0, n = this.__listeners.length; i < n; ++i) {
            var h = this.__listeners[i];
            if (h.object == object && h.func == func)
                return i;
        }

        return -1;
    }

    /** Adds a handler (callback) to this event.
    * Note: The registered owner of the underlying dispatch handler will be used as the context of all attached handlers.
    */
    attach(handler: TCallback, eventMode?: EventModes): this;
    attach(handler: IDelegate<object, TCallback>, eventMode?: EventModes): this;
    attach(handler: TCallback | IDelegate<object, TCallback>, eventMode: EventModes = EventModes.Capture): this {
        if (this._getHandlerIndex(<any>handler) == -1) {
            var delegate: THandlerInfo<TCallback> = handler instanceof Delegate ? <IDelegate<object, TCallback>>handler : new Delegate(this, <TCallback>handler);
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
    dispatchEvent(triggerState: any = null, ...args: any[]): boolean { // TODO: Don't' use '...args'
        if (!this.setTriggerState(triggerState))
            return; // (no change in state, so ignore this request)

        // ... for capture phases, start at the bottom and work up; but need to build the chain first (http://stackoverflow.com/a/10654134/1236397) ...
        // ('this.__parent' checks for event-instance-only chained events, whereas 'this.owner.parent' iterates events using the a parent-child dependency hierarchy from the owner)

        var parent: DependentObject = this.__parent || this.owner && (<DependentObject><any>this.owner).parent || null;

        // ... run capture/bubbling phases; first, build the event chain ...

        var eventChain: IEventDispatcher<any, any>[] = new Array(this); // ('this' [the current instance] is the last for capture, and first for bubbling)

        if (parent) {
            var eventPropertyName = this.__eventPropertyName; // (if exists, this references the 'on{EventName}' property getter that returns an even dispatcher object)
            while (parent) {
                var eventInstance: IEventDispatcher<any, EventHandler> = parent[eventPropertyName];
                if (eventInstance instanceof EventDispatcher)
                    eventChain.push(eventInstance);
                parent = parent['__parent'];
            }
        }

        var cancelled = false;

        // ... do capture phase (root, towards target) ...
        for (var n = eventChain.length, i = n - 1; i >= 0; --i) {
            if (cancelled) break;
            var dispatcher = eventChain[i];
            if (dispatcher.__listeners.length)
                cancelled = dispatcher.onDispatchEvent(args, EventModes.Capture);
        }

        // ... do bubbling phase (target, towards root) ...
        for (var i = 0, n = eventChain.length; i < n; ++i) {
            if (cancelled) break;
            var dispatcher = eventChain[i];
            if (dispatcher.__listeners.length)
                cancelled = dispatcher.onDispatchEvent(args, EventModes.Bubble);
        }

        return !cancelled;
    }

    protected __exception(msg: string, error?: any) {
        if (error) msg += "\r\nInner error: " + getErrorMessage(error);
        return Exception.error("{EventDispatcher}.dispatchEvent():", "Error in event " + this.__eventName + " on object type '" + getTypeName(this.owner) + "': " + msg, { exception: error, event: this, handler: this.__handlerCallInProgress });
    }

    /** Calls the event handlers that match the event mode on the current event instance. */
    protected onDispatchEvent(args: any[], mode: EventModes): boolean {
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
    setTriggerState(triggerState?: any): boolean {
        if (triggerState === void 0) triggerState = this.__eventName;
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
    dispatch(...args: Parameters<TCallback>): boolean { return void 0; }

    /** Trigger this event by calling all the handlers. 
     * If a handler cancels the process, then the promise is rejected.
     * This method allows scheduling events to fire after current script execution completes.
     */
    dispatchAsync(...args: Parameters<TCallback>): Promise<void> { return void 0; }

    /** If called within a handler, prevents the other handlers from being called. */
    cancel(): void {
        if (this.__dispatchInProgress)
            if (this.canCancel)
                this.__cancelled = true;
            else
                throw this.__exception("This even dispatcher does not support canceling events.");
    }

    private __indexOf(object: object, handler: TCallback) {
        for (var i = this.__listeners.length - 1; i >= 0; --i) {
            var d = this.__listeners[i];
            if (d.object == object && d.func == <any>handler)
                return i;
        }
        return -1;
    }

    private __removeListener(i: number) {
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

    removeListener(object: NativeTypes.IObject, func: TCallback): void;
    removeListener(handler: IDelegate<TOwner, TCallback>): void;
    removeListener(handler: IDelegate<TOwner, TCallback>, func?: TCallback): void {
        // ... check if a delegate is given, otherwise attempt to create one ...
        if (typeof func == 'function') {
            this.__removeListener(this.__indexOf(handler, func));
        } else {
            this.__removeListener(this.__indexOf(handler.object, <TCallback><Function>handler.func));
        }
    }

    removeAllListeners() {
        for (var i = this.__listeners.length - 1; i >= 0; --i)
            this.__removeListener(i);
    }

    /** Constructs a new instance of the even dispatcher.
     * @param eventTriggerHandler A global handler per event type that is triggered before any other handlers. This is a hook which is called every time an event triggers.
     * This exists mainly to support handlers called with special parameters, such as those that may need translation, or arguments that need to be injected.
     */
    constructor(owner: TOwner, eventName: string, removeOnTrigger: boolean = false, canCancel: boolean = true, eventTriggerHandler: EventTriggerHandler<TOwner, TCallback> = null) {
        super();

        if (typeof eventName !== 'string') eventName = '' + eventName;
        if (!eventName) throw "An event name is required.";

        this.__eventName = eventName;
        this.__eventPropertyName = EventDispatcher.createEventPropertyNameFromEventName(eventName); // (fix to support the convention of {item}.on{Event}().

        (<Writeable<EventDispatcher>>this).owner = owner;
        this.associate(owner);

        this.__eventTriggerHandler = eventTriggerHandler;

        this.canCancel = canCancel;
    }

    private static [DS.constructor]() { // (A static constructor that will be executed when the factory is registered)

        function getTriggerFunc(this: EventDispatcher, args: any[]) {
            //x args.push(void 0, this); // (add 2 optional items on end)
            //x var dataIndex = args.length - 2; // (set the index where the data should be set when each handler gets called)
            return function _trigger(this: EventDispatcher) {
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
            }
        };
        (<Writeable<EventDispatcher>>EventDispatcher.prototype).dispatch = function dispatch(this: EventDispatcher, ...args: any[]): boolean {
            var _trigger = getTriggerFunc.call(this, args);
            if (!this.synchronous && typeof setTimeout == 'function')
                setTimeout(() => { _trigger.call(this); }, 0);
            else
                return _trigger.call(this);
        };
        (<Writeable<EventDispatcher>>EventDispatcher.prototype).dispatchAsync = function dispatchAsync(this: EventDispatcher, ...args: any[]): Promise<void> {
            var _trigger = getTriggerFunc.call(this, args);
            return new Promise<void>((resolve, reject) => {
                if (!this.synchronous && typeof setTimeout == 'function')
                    setTimeout(() => { if (_trigger.call(this)) resolve(); else reject(); }, 0);
                else
                    if (_trigger.call(this)) resolve(); else reject();
            });
        };
    }
}

(<any>EventDispatcher)[DS.constructor](); // ('any' is used because the static constructor is private)

export interface IEventDispatcher<TOwner extends object, TCallback extends EventHandler> extends EventDispatcher<TOwner, TCallback> { }

// =======================================================================================================================

export interface IPropertyChangingHandler<TSender extends IEventObject> { (sender: TSender, newValue: any): boolean }
export interface IPropertyChangedHandler<TSender extends IEventObject> { (sender: TSender, oldValue: any): void }

export interface INotifyPropertyChanged<TSender extends IEventObject> {
    /** Triggered when a supported property is about to change.  This does not work for all properties by default, but only those which call 'doPropertyChanging' in their implementation. */
    onPropertyChanging: IEventDispatcher<TSender, IPropertyChangingHandler<TSender>>;

    /** Triggered when a supported property changes.  This does not work for all properties by default, but only those which call 'doPropertyChanged' in their implementation. */
    onPropertyChanged: IEventDispatcher<TSender, IPropertyChangedHandler<TSender>>;

    /** Call this if you wish to implement change events for supported properties. */
    doPropertyChanging(name: string, newValue: any): boolean;

    /** Call this if you wish to implement change events for supported properties. */
    doPropertyChanged(name: string, oldValue: any): void;
}

export class EventObject implements INotifyPropertyChanged<IEventObject> {
    /** Triggered when a supported property is about to change.  This does not work for all properties by default, but only those
     * which call 'doPropertyChanging' in their implementation.
     */
    onPropertyChanging: IEventDispatcher<IEventObject, IPropertyChangingHandler<IEventObject>>;

    /** Triggered when a supported property changes.  This does not work for all properties by default, but only those
      * which call 'doPropertyChanged' in their implementation.
      */
    onPropertyChanged: IEventDispatcher<IEventObject, IPropertyChangedHandler<IEventObject>>;

    /** Call this if you wish to implement 'changing' events for supported properties.
    * If any event handler cancels the event, then 'false' will be returned.
    */
    doPropertyChanging(name: string, newValue: any): boolean {
        if (this.onPropertyChanging)
            return this.onPropertyChanging.dispatch(this, newValue);
        else
            return true;
    }

    /** Call this if you wish to implement 'changed' events for supported properties. */
    doPropertyChanged(name: string, oldValue: any): void {
        if (this.onPropertyChanged)
            this.onPropertyChanged.dispatch(this, oldValue);
    }
}

export interface IEventObject extends EventObject { }

// ========================================================================================================================

namespace Browser_Ext {
    /** Triggered when the DOM has completed loading. */
    export var onReady = new EventDispatcher<typeof Browser, { (): void }>(Browser, "onReady", true);

    Browser.onReady = onReady;
}

namespace DreamSpace_Ext {
    /** Triggered when all manifests have loaded. No modules have been executed at this point.
      * Note: 'onReady' is not called automatically if 'DreamSpace.System.Diagnostics.debug' is set to 'Debug_Wait'.
      */
    export var onReady = new EventDispatcher<typeof DS, { (): void }>(DS, "onReady", true);

    DS.onReady = onReady;
}

// ############################################################################################################################
