declare namespace DS {
    /** Represents an event callback function. Handlers should return false to cancel event dispatching if desired (anything else is ignored). */
    interface EventHandler {
        (this: object, ...args: any[]): void | boolean;
    }
    /**
     * The event trigger handler is called to allow custom handling of event handlers when an event occurs.
     * This handler should return false to cancel event dispatching if desired (anything else is ignored).
     */
    interface EventTriggerHandler<TOwner extends object, TCallback extends EventHandler> {
        (event: IEventDispatcher<TOwner, TCallback>, handler: IDelegate<object, TCallback>, args: any[], mode?: EventModes): void | boolean;
    }
    /** Controls how the event progression occurs. */
    enum EventModes {
        /** Trigger event on the way up to the target. */
        Capture = 0,
        /** Trigger event on the way down from the target. */
        Bubble = 1,
        /** Trigger event on both the way up to the target, then back down again. */
        CaptureAndBubble = 2
    }
    /**
      * The EventDispatcher wraps a specific event type, and manages the triggering of "handlers" (callbacks) when that event type
      * must be dispatched. Events are usually registered as static properties first (to prevent having to create and initialize
      * many event objects for every owning object instance. Class implementations contain linked event properties to allow creating
      * instance level event handler registration on the class only when necessary.
      */
    class EventDispatcher<TOwner extends object = object, TCallback extends EventHandler = EventHandler> extends DependentObject {
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
        removeListener(object: Object, func: TCallback): void;
        removeListener(handler: IDelegate<TOwner, TCallback>): void;
        removeAllListeners(): void;
        /** Constructs a new instance of the even dispatcher.
         * @param eventTriggerHandler A global handler per event type that is triggered before any other handlers. This is a hook which is called every time an event triggers.
         * This exists mainly to support handlers called with special parameters, such as those that may need translation, or arguments that need to be injected.
         */
        constructor(owner: TOwner, eventName: string, removeOnTrigger?: boolean, canCancel?: boolean, eventTriggerHandler?: EventTriggerHandler<TOwner, TCallback>);
    }
    interface IEventDispatcher<TOwner extends object, TCallback extends EventHandler> extends EventDispatcher<TOwner, TCallback> {
    }
    interface IPropertyChangingHandler<TSender extends IEventObject> {
        (sender: TSender, newValue: any): boolean;
    }
    interface IPropertyChangedHandler<TSender extends IEventObject> {
        (sender: TSender, oldValue: any): void;
    }
    interface INotifyPropertyChanged<TSender extends IEventObject> {
        /** Triggered when a supported property is about to change.  This does not work for all properties by default, but only those which call 'doPropertyChanging' in their implementation. */
        onPropertyChanging: IEventDispatcher<TSender, IPropertyChangingHandler<TSender>>;
        /** Triggered when a supported property changes.  This does not work for all properties by default, but only those which call 'doPropertyChanged' in their implementation. */
        onPropertyChanged: IEventDispatcher<TSender, IPropertyChangedHandler<TSender>>;
        /** Call this if you wish to implement change events for supported properties. */
        doPropertyChanging(name: string, newValue: any): boolean;
        /** Call this if you wish to implement change events for supported properties. */
        doPropertyChanged(name: string, oldValue: any): void;
    }
    class EventObject implements INotifyPropertyChanged<IEventObject> {
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
    interface IEventObject extends EventObject {
    }
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
