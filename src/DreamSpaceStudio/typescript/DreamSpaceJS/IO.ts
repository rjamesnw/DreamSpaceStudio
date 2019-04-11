import { IResourceRequest } from "./ResourceRequest";
import { ResourceTypes } from "./Resources";

// ===============================================================================================================================

/** Provides some basic communication functions and types. */
abstract class IO { }
namespace IO {

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
        var request = _resourceRequestByURL[url]; // (try to load any already existing requests)
        if (!request)
            request = ResourceRequest.new(url, type, asyc);
        return request;
    }
}

export { IO };

// ===============================================================================================================================
