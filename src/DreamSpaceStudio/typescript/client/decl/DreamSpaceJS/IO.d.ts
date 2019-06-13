import { IResourceRequest } from "./ResourceRequest";
import { ResourceTypes } from "./Resources";
/** Provides some basic communication functions and types. */
declare abstract class IO {
}
declare namespace IO {
    /** A shortcut for returning a load request promise-type object for a resource loading operation. */
    function get(url: string, type?: ResourceTypes | string, asyc?: boolean): IResourceRequest;
}
export { IO };
