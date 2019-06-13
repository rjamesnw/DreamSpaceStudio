export * from "../Globals";
import { DreamSpace as DS } from "../Globals";
declare module "../Globals" {
    namespace DreamSpace {
        var onReady: typeof DreamSpace_Ext.onReady;
    }
}
import { IDelegate } from "./Delegate";
import { Exception } from "./Exception";
import { Object, DependentObject } from "../PrimitiveTypes";
import { Browser } from "./Browser";
declare module "./Browser" {
    namespace Browser {
        var onReady: typeof Browser_Ext.onReady;
    }
}
/** Represents an event callback function. Handlers should return false to cancel event dispatching if desired (anything else is ignored). */
export interface EventHandler {
    (this: object, ...args: any[]): void | boolean;
}
/**
 * The event trigger handler is called to allow custom handling of event handlers when an event occurs.
 * This handler should return false to cancel event dispatching if desired (anything else is ignored).
 */
export interface EventTriggerHandler<TOwner extends object, TCallback extends EventHandler> {
    (event: IEventDispatcher<TOwner, TCallback>, handler: IDelegate<object, TCallback>, args: any[], mode?: EventModes): void | boolean;
}
/** Controls how the event progression occurs. */
export declare enum EventModes {
    /** Trigger event on the way up to the target. */
    Capture = 0,
    /** Trigger event on the way down from the target. */
    Bubble = 1,
    /** Trigger event on both the way up to the target, then back down again. */
    CaptureAndBubble = 2
}
declare const EventDispatcherFactory_base: {
    new (): Object;
    super: typeof Object;
    'new'?(...args: any[]): any;
    init?(o: object, isnew: boolean, ...args: any[]): void;
} & {
    prototype: Object;
    getTypeName: typeof Object.getTypeName;
    isEmpty: typeof Object.isEmpty;
    getPrototypeOf: (o: any) => any;
    getOwnPropertyDescriptor: (o: any, p: string | number | symbol) => PropertyDescriptor;
    getOwnPropertyNames: (o: any) => string[];
    create: {
        (o: object): any;
        (o: object, properties: PropertyDescriptorMap & ThisType<any>): any;
    };
    defineProperty: (o: any, p: string | number | symbol, attributes: PropertyDescriptor & ThisType<any>) => any;
    defineProperties: (o: any, properties: PropertyDescriptorMap & ThisType<any>) => any;
    seal: <T>(o: T) => T;
    freeze: {
        <T>(a: T[]): readonly T[];
        <T extends Function>(f: T): T;
        <T>(o: T): Readonly<T>;
    };
    preventExtensions: <T>(o: T) => T;
    isSealed: (o: any) => boolean;
    isFrozen: (o: any) => boolean;
    isExtensible: (o: any) => boolean;
    keys: (o: {}) => string[];
    assign: {
        <T, U>(target: T, source: U): T & U;
        <T, U, V>(target: T, source1: U, source2: V): T & U & V;
        <T, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
        (target: object, ...sources: any[]): any;
    };
    getOwnPropertySymbols: (o: any) => symbol[];
    is: (value1: any, value2: any) => boolean;
    setPrototypeOf: (o: any, proto: object) => any;
};
/**
  * The EventDispatcher wraps a specific event type, and manages the triggering of "handlers" (callbacks) when that event type
  * must be dispatched. Events are usually registered as static properties first (to prevent having to create and initialize
  * many event objects for every owning object instance. Class implementations contain linked event properties to allow creating
  * instance level event handler registration on the class only when necessary.
  */
declare class EventDispatcherFactory extends EventDispatcherFactory_base {
    /** Creates an event object for a specific even type.
        * @param {TOwner} owner The owner which owns this event object.
        * @param {string} eventName The name of the event which this event object represents.
        * @param {boolean} removeOnTrigger If true, then handlers are called only once, then removed (default is false).
        * @param {Function} eventTriggerHandler This is a hook which is called every time a handler needs to be called.  This exists mainly to support handlers called with special parameters.
        * @param {boolean} canCancel If true, the event can be cancelled (prevented from completing, so no other events will fire).
        */
    static 'new'<TOwner extends object, TCallback extends EventHandler>(owner: TOwner, eventName: string, removeOnTrigger?: boolean, eventTriggerHandler?: EventTriggerHandler<TOwner, TCallback>, canCancel?: boolean): IEventDispatcher<TOwner, TCallback>;
    /** Initializes/reinitializes an EventDispatcher instance. */
    static init<TOwner extends object, TCallback extends EventHandler>(o: EventDispatcher<TOwner, TCallback>, isnew: boolean, owner: TOwner, eventName: string, removeOnTrigger?: boolean, eventTriggerHandler?: EventTriggerHandler<TOwner, TCallback>, canCancel?: boolean): void;
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
    static registerEvent<TOwner extends object, TCallback extends EventHandler>(type: {
        new (...args: any[]): TOwner;
    }, eventName: string, eventMode?: EventModes, removeOnTrigger?: boolean, eventTriggerCallback?: EventTriggerHandler<TOwner, TCallback>, customEventPropName?: string, canCancel?: boolean): {
        _eventMode: EventModes;
        _eventName: string;
        _removeOnTrigger: boolean;
        eventFuncType: () => IEventDispatcher<TOwner, TCallback>;
        eventPropertyType: IEventDispatcher<TOwner, TCallback>;
    };
    /**
        * Creates an instance property name from a given event name by adding 'on' as a prefix.
        * This is mainly used when registering events as static properties on types.
        * @param {string} eventName The event name to create an event property from. If the given event name already starts with 'on', then the given name is used as is (i.e. 'click' becomes 'onClick').
        */
    static createEventPropertyNameFromEventName(eventName: string): string;
    /**
       * Returns a formatted event name in the form of a private event name like '$__{eventName}Event' (eg. 'click' becomes '$__clickEvent').
       * The private event names are used to store event instances on the owning instances so each instance has it's own handlers list to manage.
       */
    static createPrivateEventName(eventName: string): string;
}
declare class EventDispatcher<TOwner extends object = object, TCallback extends EventHandler = EventHandler> extends DependentObject {
    readonly owner: TOwner;
    private __eventName;
    private __associations;
    private __listeners;
    /** If a parent value is set, then the event chain will travel the parent hierarchy from this event dispatcher. If not set, the owner is assumed instead. */
    protected __parent: IEventDispatcher<any, EventHandler>;
    private __eventTriggerHandler;
    private __eventPropertyName;
    private __eventPrivatePropertyName;
    private __lastTriggerState;
    private __cancelled;
    private __dispatchInProgress;
    private __handlerCallInProgress;
    /** Return the underlying event name for this event object. */
    getEventName(): string;
    /** If this is true, then any new handler added will automatically be triggered as well.
    * This is handy in cases where an application state is persisted, and future handlers should always execute. */
    autoTrigger: boolean;
    /** Returns true if handlers exist on this event object instance. */
    hasHandlers(): boolean;
    /** If true, then handlers are called only once, then removed (default is false). */
    removeOnTrigger: boolean;
    /** This is a hook which is called every time a handler needs to be called.  This exists mainly to support handlers called with special parameters. */
    eventTriggerHandler: EventTriggerHandler<TOwner, TCallback>;
    /** True if the event can be cancelled. */
    canCancel: boolean;
    dispose(): void;
    /**
     * Associates this event instance with an object using a weak map. The owner of the instance is already associated by default.
     * Use this function to associate other external objects other than the owner, such as DOM elements (there should only be one
     * specific event instance per any object).
     */
    associate(obj: object): this;
    /** Disassociates this event instance from an object (an internal weak map is used for associations). */
    disassociate(obj: object): this;
    /** Returns true if this event instance is already associated with the specified object (a weak map is used). */
    isAssociated(obj: object): boolean;
    _getHandlerIndex(handler: TCallback): number;
    _getHandlerIndex(handler: IDelegate<object, TCallback>): number;
    /** Adds a handler (callback) to this event.
    * Note: The registered owner of the underlying dispatch handler will be used as the context of all attached handlers.
    */
    attach(handler: TCallback, eventMode?: EventModes): this;
    attach(handler: IDelegate<object, TCallback>, eventMode?: EventModes): this;
    /** Dispatch the underlying event. Typically 'dispatch()' is called instead of calling this directly. Returns 'true' if all events completed, and 'false' if any handler cancelled the event.
      * @param {any} triggerState If supplied, the event will not trigger unless the current state is different from the last state.  This is useful in making
      * sure events only trigger once per state.  Pass in null (the default) to always dispatch regardless.  Pass 'undefined' to used the event
      * name as the trigger state (this can be used for a "trigger only once" scenario).
      * @param {boolean} canBubble Set to true to allow the event to bubble (where supported).
      * @param {boolean} canCancel Set to true if handlers can abort the event (false means it has or will occur regardless).
      * @param {string[]} args Custom arguments that will be passed on to the event handlers.
      */
    dispatchEvent(triggerState?: any, ...args: any[]): boolean;
    protected __exception(msg: string, error?: any): Exception;
    /** Calls the event handlers that match the event mode on the current event instance. */
    protected onDispatchEvent(args: any[], mode: EventModes): boolean;
    /** If the given state value is different from the last state value, the internal trigger state value will be updated, and true will be returned.
        * If a state value of null is given, the request will be ignored, and true will always be returned.
        * If you don't specify a value ('triggerState' is 'undefined') then the internal event name becomes the trigger state value (this can be used for a "trigger
        * only once" scenario).  Use 'resetTriggerState()' to reset the internal trigger state when needed.
        */
    setTriggerState(triggerState?: any): boolean;
    /** Resets the current internal trigger state to null. The next call to 'setTriggerState()' will always return true.
        * This is usually called after a sequence of events have completed, in which it is possible for the cycle to repeat.
        */
    resetTriggerState(): void;
    /** A simple way to pass arguments to event handlers using arguments with static typing (calls 'dispatchEvent(null, false, false, arguments)').
    * If not cancelled, then 'true' is returned.
    * TIP: To prevent triggering the same event multiple times, use a custom state value in a call to 'setTriggerState()', and only call
    * 'dispatch()' if true is returned (example: "someEvent.setTriggerState(someState) && someEvent.dispatch(...);", where the call to 'dispatch()'
    * only occurs if true is returned from the previous statement).
    * Note: Call 'dispatchAsync()' to allow current script execution to complete before any handlers get called.
    * @see dispatchAsync
    */
    dispatch(...args: Parameters<TCallback>): boolean;
    /** Trigger this event by calling all the handlers.
     * If a handler cancels the process, then the promise is rejected.
     * This method allows scheduling events to fire after current script execution completes.
     */
    dispatchAsync(...args: Parameters<TCallback>): Promise<void>;
    /** If called within a handler, prevents the other handlers from being called. */
    cancel(): void;
    private __indexOf;
    private __removeListener;
    removeListener(object: NativeTypes.IObject, func: TCallback): void;
    removeListener(handler: IDelegate<TOwner, TCallback>): void;
    removeAllListeners(): void;
}
export interface IEventDispatcher<TOwner extends object, TCallback extends EventHandler> extends EventDispatcher<TOwner, TCallback> {
}
export { EventDispatcherFactory as EventDispatcher, EventDispatcher as EventDispatcherInstance };
export interface IPropertyChangingHandler<TSender extends IEventObject> {
    (sender: TSender, newValue: any): boolean;
}
export interface IPropertyChangedHandler<TSender extends IEventObject> {
    (sender: TSender, oldValue: any): void;
}
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
declare const EventObject_base: {
    new (): Object;
    super: typeof Object;
    'new'?(...args: any[]): any;
    init?(o: object, isnew: boolean, ...args: any[]): void;
} & {
    prototype: Object;
    getTypeName: typeof Object.getTypeName;
    isEmpty: typeof Object.isEmpty;
    getPrototypeOf: (o: any) => any;
    getOwnPropertyDescriptor: (o: any, p: string | number | symbol) => PropertyDescriptor;
    getOwnPropertyNames: (o: any) => string[];
    create: {
        (o: object): any;
        (o: object, properties: PropertyDescriptorMap & ThisType<any>): any;
    };
    defineProperty: (o: any, p: string | number | symbol, attributes: PropertyDescriptor & ThisType<any>) => any;
    defineProperties: (o: any, properties: PropertyDescriptorMap & ThisType<any>) => any;
    seal: <T>(o: T) => T;
    freeze: {
        <T>(a: T[]): readonly T[];
        <T extends Function>(f: T): T;
        <T>(o: T): Readonly<T>;
    };
    preventExtensions: <T>(o: T) => T;
    isSealed: (o: any) => boolean;
    isFrozen: (o: any) => boolean;
    isExtensible: (o: any) => boolean;
    keys: (o: {}) => string[];
    assign: {
        <T, U>(target: T, source: U): T & U;
        <T, U, V>(target: T, source1: U, source2: V): T & U & V;
        <T, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
        (target: object, ...sources: any[]): any;
    };
    getOwnPropertySymbols: (o: any) => symbol[];
    is: (value1: any, value2: any) => boolean;
    setPrototypeOf: (o: any, proto: object) => any;
};
export declare class EventObject extends EventObject_base implements INotifyPropertyChanged<IEventObject> {
    /**
    * Constructs a new Delegate object.
    * @param {Object} object The instance on which the associated function will be called.  This should be undefined/null for static functions.
    * @param {Function} func The function to be called on the associated object.
    */
    static 'new'(): IEventObject;
    /**
    * Reinitializes a disposed Delegate instance.
    * @param o The Delegate instance to initialize, or re-initialize.
    * @param isnew If true, this is a new instance, otherwise it is from a cache (and may have some preexisting properties).
    * @param object The instance to bind to the resulting delegate object.
    * @param func The function that will be called for the resulting delegate object.
    */
    static init(o: IEventObject, isnew: boolean): void;
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
    doPropertyChanging(name: string, newValue: any): boolean;
    /** Call this if you wish to implement 'changed' events for supported properties. */
    doPropertyChanged(name: string, oldValue: any): void;
}
export interface IEventObject extends EventObject {
}
declare namespace Browser_Ext {
    /** Triggered when the DOM has completed loading. */
    var onReady: IEventDispatcher<typeof Browser, () => void>;
}
declare namespace DreamSpace_Ext {
    /** Triggered when all manifests have loaded. No modules have been executed at this point.
      * Note: 'onReady' is not called automatically if 'DreamSpace.System.Diagnostics.debug' is set to 'Debug_Wait'.
      */
    var onReady: IEventDispatcher<typeof DS, () => void>;
}
