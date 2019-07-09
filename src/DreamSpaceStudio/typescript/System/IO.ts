// ############################################################################################################################

import { IResourceRequest, ResourceRequest } from "./ResourceRequest";
import { ResourceTypes, getResourceTypeFromExtension } from "./Resources";
import { error } from "./Logging";
import { EventDispatcher } from "./Events";

// ############################################################################################################################

/** Provides some basic communication functions and types. */
export abstract class IO { }
export namespace IO {
    // ========================================================================================================================

    /** A shortcut for returning a load request promise-type object for a resource loading operation. */
    export function get(url: string, type?: ResourceTypes | string, asyc: boolean = true): IResourceRequest {
        if (url === void 0 || url === null) throw "A resource URL is required.";
        url = "" + url;
        if (type === void 0 || type === null) {
            // (make sure it's a string)
            // ... a valid type is required, but try to detect first ...
            var ext = (url.match(/(\.[A-Za-z0-9]+)(?:[\?\#]|$)/i) || []).pop();
            type = getResourceTypeFromExtension(ext);
            if (!type)
                error("Loader.get('" + url + "', type:" + type + ")", "A resource (MIME) type is required, and no resource type could be determined (See DreamSpace.Loader.ResourceTypes). If the resource type cannot be detected by a file extension then you must specify the MIME string manually.");
        }
        var request = ResourceRequest._resourceRequestByURL[url]; // (try to load any already existing requests)
        if (!request)
            request = new ResourceRequest(url, type, asyc);
        return request;
    }

    // ========================================================================================================================

    /** This even is triggered when the user should wait for an action to complete. */
    export var onBeginWait = new EventDispatcher<typeof IO, { (msg: string): void }>(IO, "onBeginWait", true);

    /** This even is triggered when the user no longer needs to wait for an action to complete. */
    export var onEndWait = new EventDispatcher<typeof IO, { (): void }>(IO, "onEndWait", true);

    var __waitRequestCounter = 0; // (allows stacking calls to 'wait()')

    /**
     * Blocks user input until 'closeWait()' is called. Plugins can hook into 'onBeginWait' to receive notifications.
     * Note: Each call stacks, but the 'onBeginWait' event is triggered only once.
     * @param msg An optional message to display (default is 'Please wait...').
     */
    export function wait(msg = "Please wait ...") {
        if (__waitRequestCounter == 0) // (fire only one time)
            onBeginWait.dispatch(msg);
        __waitRequestCounter++;
    }

    /**
     * Unblocks user input if 'wait()' was previously called. The number of 'closeWait()' calls must match the number of wait calls in order to unblock the user.
     * Plugins can hook into the 'onEndWait' event to be notified.
     * @param force If true, then the number of calls to 'wait' is ignored and the block is forcibly removed (default if false).
     */
    export function closeWait(force = false) {
        if (__waitRequestCounter > 0 && (force || --__waitRequestCounter == 0)) {
            __waitRequestCounter = 0;
            onEndWait.dispatch();
        }
    }

    // ========================================================================================================================
}

// ############################################################################################################################
