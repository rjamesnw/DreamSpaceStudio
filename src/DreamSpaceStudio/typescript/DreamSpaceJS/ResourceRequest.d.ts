import { ResourceTypes, RequestStatuses } from "./Resources";
import { IResultCallback, ICallback, IErrorCallback } from "./Globals";
declare const ResourceRequest_base: {
    new (): import("./PrimitiveTypes").Object;
    super: typeof import("./PrimitiveTypes").Object;
    'new'?(...args: any[]): any;
    init?(o: object, isnew: boolean, ...args: any[]): void;
} & {
    prototype: import("./PrimitiveTypes").Object;
    getTypeName: typeof import("./PrimitiveTypes").Object.getTypeName;
    isEmpty: typeof import("./PrimitiveTypes").Object.isEmpty;
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
 * Creates a new resource request object, which allows loaded resources using a "promise" style pattern (this is a custom
 * implementation designed to work better with the DreamSpace system specifically, and to support parallel loading).
 * Note: It is advised to use 'DreamSpace.Loader.loadResource()' to load resources instead of directly creating resource request objects.
 * Inheritance note: When creating via the 'new' factory method, any already existing instance with the same URL will be returned,
 * and NOT the new object instance.  For this reason, you should call 'loadResource()' instead.
 */
export declare class ResourceRequest extends ResourceRequest_base {
    /**
     * If true (the default) then a 'ResourceRequest.cacheBustingVar+"="+Date.now()' query item is added to make sure the browser never uses
     * the cache. To change the variable used, set the 'cacheBustingVar' property also.
     * Each resource request instance can also have its own value set separate from the global one.
     * Note: DreamSpace has its own caching that uses the local storage, where supported.
     */
    static cacheBusting: boolean;
    /** See the 'cacheBusting' property. */
    static cacheBustingVar: string;
    private static _cacheBustingVar;
    /** Returns a new module object only - does not load it. */
    static 'new': (...args: any[]) => IResourceRequest;
    /** Disposes this instance, sets all properties to 'undefined', and calls the constructor again (a complete reset). */
    static init: (o: IResourceRequest, isnew: boolean, url: string, type: ResourceTypes | string, async?: boolean) => void;
    private $__index;
    /** The requested resource URL. If the URL string starts with '~/' then it becomes relative to the content type base path. */
    url: string;
    /** The raw unresolved URL given for this resource. Use the 'url' property to resolve content roots when '~' is used. */
    _url: string;
    /**
       * The HTTP request method to use, such as "GET" (the default), "POST", "PUT", "DELETE", etc.  Ignored for non-HTTP(S) URLs.
       *
       */
    method: string;
    /** Optional data to send with the request, such as for POST operations. */
    body: any;
    /** An optional username to pass to the XHR instance when opening the connecting. */
    username: string;
    /** An optional password to pass to the XHR instance when opening the connecting. */
    password: string;
    /** The requested resource type (to match against the server returned MIME type for data type verification). */
    type: ResourceTypes | string;
    /**
       * The XMLHttpRequest object used for this request.  It's marked private to discourage access, but experienced
       * developers should be able to use it if necessary to further configure the request for advanced reasons.
       */
    _xhr: XMLHttpRequest;
    /**
       * The raw data returned from the HTTP request.
       * Note: This does not change with new data returned from callback handlers (new data is passed on as the first argument to
       * the next call [see 'transformedData']).
       */
    response: any;
    /** This gets set to data returned from callback handlers as the 'response' property value gets transformed.
      * If no transformations were made, then the value in 'response' is returned.
      */
    readonly transformedResponse: any;
    private $__transformedData;
    /** The response code from the XHR response. */
    responseCode: number;
    /** The response code message from the XHR response. */
    responseMessage: string;
    /** The current request status. */
    status: RequestStatuses;
    /**
     * A progress/error message related to the status (may not be the same as the response message).
     * Setting this property sets the local message and updates the local message log. Make sure to set 'this.status' first before setting a message.
     */
    message: string;
    private _message;
    /** Includes the current message and all previous messages. Use this to trace any silenced errors in the request process. */
    messageLog: string[];
    /**
     * If true (default), them this request is non-blocking, otherwise the calling script will be blocked until the request
     * completes loading.  Please note that no progress callbacks can occur during blocked operations (since the thread is
     * effectively 'paused' in this scenario).
     * Note: Depreciated: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Synchronous_and_Asynchronous_Requests#Synchronous_request
     * "Starting with Gecko 30.0 (Firefox 30.0 / Thunderbird 30.0 / SeaMonkey 2.27), Blink 39.0, and Edge 13, synchronous requests on the main thread have been deprecated due to the negative effects to the user experience."
     */
    async: boolean;
    /**
     * If true (the default) then a '"_="+Date.now()' query item is added to make sure the browser never uses
     * the cache. To change the variable used, set the 'cacheBustingVar' property also.
     * Note: DreamSpace has its own caching that uses the local storage, where supported.
     */
    cacheBusting: boolean;
    /** See the 'cacheBusting' property. */
    cacheBustingVar: string;
    private _onProgress;
    private _onReady;
    /** This is a list of all the callbacks waiting on the status of this request (such as on loaded or error).
    * There's also an 'on finally' which should execute on success OR failure, regardless.
    * For each entry, only ONE of any callback type will be set.
    */
    private _promiseChain;
    private _promiseChainIndex;
    /**
     * A list of parent requests that this request is depending upon.
     * When 'start()' is called, all parents are triggered to load first, working downwards.
     * Regardless of order, loading is in parallel asynchronously; however, the 'onReady' event will fire in the expected order.
     * */
    _parentRequests: IResourceRequest[];
    private _parentCompletedCount;
    _dependants: IResourceRequest[];
    private _paused;
    private _queueDoNext;
    private _queueDoError;
    private _requeueHandlersIfNeeded;
    /** Triggers a success or error callback after the resource loads, or fails to load. */
    then(success: IResultCallback<IResourceRequest>, error?: IErrorCallback<IResourceRequest>): this;
    /** Adds another request and makes it dependent on the current 'parent' request.  When all parent requests have completed,
      * the dependant request fires its 'onReady' event.
      * Note: The given request is returned, and not the current context, so be sure to complete configurations before hand.
      */
    include<T extends IResourceRequest>(request: T): T;
    /**
     * Add a call-back handler for when the request completes successfully.
     * This event is triggered after the resource successfully loads and all callbacks in the promise chain get called.
     * @param handler
     */
    ready(handler: ICallback<IResourceRequest>): this;
    /** Adds a hook into the resource load progress event. */
    while(progressHandler: ICallback<IResourceRequest>): this;
    /** Call this anytime while loading is in progress to terminate the request early. An error event will be triggered as well. */
    abort(): void;
    /**
     * Provide a handler to catch any errors from this request.
     */
    catch(errorHandler: IErrorCallback<IResourceRequest>): this;
    /**
     * Provide a handler which should execute on success OR failure, regardless.
     */
    finally(cleanupHandler: ICallback<IResourceRequest>): this;
    /**
       * Starts loading the current resource.  If the current resource has dependencies, they are triggered to load first (in proper
       * order).  Regardless of the start order, all scripts are loaded in parallel.
       * Note: This call queues the start request in 'async' mode, which begins only after the current script execution is completed.
       * @param {string} method An optional method to override the default request method set in the 'method' property on this request instance.
       * @param {string} body Optional payload data to send, which overrides any value set in the 'payload' property on this request instance.
       * @param {string} username Optional username value, instead of storing the username in the instance.
       * @param {string} password Optional password value, instead of storing the password in the instance.
       */
    start(method?: string, body?: string, username?: string, password?: string): this;
    private _Start;
    /** Upon return, the 'then' or 'ready' event chain will pause until 'continue()' is called. */
    pause(): this;
    /** After calling 'pause()', use this function to re-queue the 'then' or 'ready' even chain for continuation.
      * Note: This queues on a timer with a 0 ms delay, and does not call any events before returning to the caller.
      */
    continue(): this;
    private _doOnProgress;
    setError(message: string, error?: {
        name?: string;
        reason?: string;
        message?: string;
        type?: any;
        stack?: string;
    }): void;
    private _doNext;
    private _doReady;
    private _doError;
    /** Resets the current resource data, and optionally all dependencies, and restarts the whole loading process.
      * Note: All handlers (including the 'progress' and 'ready' handlers) are cleared and will have to be reapplied (clean slate).
      * @param {boolean} includeDependentResources Reload all resource dependencies as well.
      */
    reload(includeDependentResources?: boolean): this;
}
export interface IResourceRequest extends ResourceRequest {
}
export {};
