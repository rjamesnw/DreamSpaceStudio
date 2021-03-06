"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ResourceRequest_1 = require("./ResourceRequest");
const Resources_1 = require("./Resources");
const Logging_1 = require("./Logging");
// ===============================================================================================================================
/** Provides some basic communication functions and types. */
class IO {
}
exports.IO = IO;
(function (IO) {
    /** A shortcut for returning a load request promise-type object for a resource loading operation. */
    function get(url, type, asyc = true) {
        if (url === void 0 || url === null)
            throw "A resource URL is required.";
        url = "" + url;
        if (type === void 0 || type === null) {
            // (make sure it's a string)
            // ... a valid type is required, but try to detect first ...
            var ext = (url.match(/(\.[A-Za-z0-9]+)(?:[\?\#]|$)/i) || []).pop();
            type = Resources_1.getResourceTypeFromExtension(ext);
            if (!type)
                Logging_1.error("Loader.get('" + url + "', type:" + type + ")", "A resource (MIME) type is required, and no resource type could be determined (See DreamSpace.Loader.ResourceTypes). If the resource type cannot be detected by a file extension then you must specify the MIME string manually.");
        }
        var request = ResourceRequest_1.ResourceRequest._resourceRequestByURL[url]; // (try to load any already existing requests)
        if (!request)
            request = ResourceRequest_1.ResourceRequest.new(url, type, asyc);
        return request;
    }
    IO.get = get;
})(IO || (IO = {}));
exports.IO = IO;
// ===============================================================================================================================
//# sourceMappingURL=IO.js.map