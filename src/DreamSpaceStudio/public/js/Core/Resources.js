// ========================================================================================================================================
define(["require", "exports", "./Globals"], function (require, exports, Globals_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /** The most common mime types.  You can easily extend this enum with custom types, or force-cast strings to this type also. */
    /* NOTE: The enums entries MUST be prefixed with '<any>' in order for this mapping to work with 'ResourceExtensions' as well implicitly. */
    var ResourceTypes;
    (function (ResourceTypes) {
        // Application
        ResourceTypes["Application_Script"] = "application/javascript";
        ResourceTypes["Application_ECMAScript"] = "application/ecmascript";
        ResourceTypes["Application_JSON"] = "application/json";
        ResourceTypes["Application_ZIP"] = "application/zip";
        ResourceTypes["Application_GZIP"] = "application/gzip";
        ResourceTypes["Application_PDF"] = "application/pdf";
        ResourceTypes["Application_DefaultFormPost"] = "application/x-www-form-urlencoded";
        ResourceTypes["Application_TTF"] = "application/x-font-ttf";
        // Multipart
        ResourceTypes["Multipart_BinaryFormPost"] = "multipart/form-data";
        // Audio
        ResourceTypes["AUDIO_MP4"] = "audio/mp4";
        ResourceTypes["AUDIO_MPEG"] = "audio/mpeg";
        ResourceTypes["AUDIO_OGG"] = "audio/ogg";
        ResourceTypes["AUDIO_AAC"] = "audio/x-aac";
        ResourceTypes["AUDIO_CAF"] = "audio/x-caf";
        // Image
        ResourceTypes["Image_GIF"] = "image/gif";
        ResourceTypes["Image_JPEG"] = "image/jpeg";
        ResourceTypes["Image_PNG"] = "image/png";
        ResourceTypes["Image_SVG"] = "image/svg+xml";
        ResourceTypes["Image_GIMP"] = "image/x-xcf";
        // Text
        ResourceTypes["Text_CSS"] = "text/css";
        ResourceTypes["Text_CSV"] = "text/csv";
        ResourceTypes["Text_HTML"] = "text/html";
        ResourceTypes["Text_Plain"] = "text/plain";
        ResourceTypes["Text_RTF"] = "text/rtf";
        ResourceTypes["Text_XML"] = "text/xml";
        ResourceTypes["Text_JQueryTemplate"] = "text/x-jquery-tmpl";
        ResourceTypes["Text_MarkDown"] = "text/x-markdown";
        // Video
        ResourceTypes["Video_AVI"] = "video/avi";
        ResourceTypes["Video_MPEG"] = "video/mpeg";
        ResourceTypes["Video_MP4"] = "video/mp4";
        ResourceTypes["Video_OGG"] = "video/ogg";
        ResourceTypes["Video_MOV"] = "video/quicktime";
        ResourceTypes["Video_WMV"] = "video/x-ms-wmv";
        ResourceTypes["Video_FLV"] = "video/x-flv";
    })(ResourceTypes = exports.ResourceTypes || (exports.ResourceTypes = {}));
    /** A map of popular resource extensions to resource enum type names.
      * Example 1: ResourceTypes[ResourceExtensions[ResourceExtensions.Application_Script]] === "application/javascript"
      * Example 2: ResourceTypes[ResourceExtensions[<ResourceExtensions><any>'.JS']] === "application/javascript"
      * Example 3: DreamSpace.Loader.getResourceTypeFromExtension(ResourceExtensions.Application_Script);
      * Example 4: DreamSpace.Loader.getResourceTypeFromExtension(".js");
      */
    /* NOTE: The enums entries MUST be prefixed with '<any>' in order for this mapping to work with 'ResourceTypes' as well implicitly. */
    var ResourceExtensions;
    (function (ResourceExtensions) {
        ResourceExtensions["Application_Script"] = ".js";
        ResourceExtensions["Application_ECMAScript"] = ".es";
        ResourceExtensions["Application_JSON"] = ".json";
        ResourceExtensions["Application_ZIP"] = ".zip";
        ResourceExtensions["Application_GZIP"] = ".gz";
        ResourceExtensions["Application_PDF"] = ".pdf";
        ResourceExtensions["Application_TTF"] = ".ttf";
        // Audio
        ResourceExtensions["AUDIO_MP4"] = ".mp4";
        ResourceExtensions["AUDIO_MPEG"] = ".mpeg";
        ResourceExtensions["AUDIO_OGG"] = ".ogg";
        ResourceExtensions["AUDIO_AAC"] = ".aac";
        ResourceExtensions["AUDIO_CAF"] = ".caf";
        // Image
        ResourceExtensions["Image_GIF"] = ".gif";
        ResourceExtensions["Image_JPEG"] = ".jpeg";
        ResourceExtensions["Image_PNG"] = ".png";
        ResourceExtensions["Image_SVG"] = ".svg";
        ResourceExtensions["Image_GIMP"] = ".xcf";
        // Text
        ResourceExtensions["Text_CSS"] = ".css";
        ResourceExtensions["Text_CSV"] = ".csv";
        ResourceExtensions["Text_HTML"] = ".html";
        ResourceExtensions["Text_Plain"] = ".txt";
        ResourceExtensions["Text_RTF"] = ".rtf";
        ResourceExtensions["Text_XML"] = ".xml";
        ResourceExtensions["Text_JQueryTemplate"] = ".tpl.htm";
        ResourceExtensions["Text_MarkDown"] = ".markdown";
        // Video
        ResourceExtensions["Video_AVI"] = ".avi";
        ResourceExtensions["Video_MPEG"] = ".mpeg";
        ResourceExtensions["Video_MP4"] = ".mp4";
        ResourceExtensions["Video_OGG"] = ".ogg";
        ResourceExtensions["Video_MOV"] = ".qt";
        ResourceExtensions["Video_WMV"] = ".wmv";
        ResourceExtensions["Video_FLV"] = ".flv";
    })(ResourceExtensions = exports.ResourceExtensions || (exports.ResourceExtensions = {}));
    ResourceExtensions['.tpl.html'] = ResourceExtensions[ResourceExtensions.Text_JQueryTemplate]; // (map to the same 'Text_JQueryTemplate' target)
    ResourceExtensions['.tpl'] = ResourceExtensions[ResourceExtensions.Text_JQueryTemplate]; // (map to the same 'Text_JQueryTemplate' target)
    function getResourceTypeFromExtension(ext) {
        if (ext === void 0 || ext === null)
            return void 0;
        var _ext = "" + ext; // (make sure it's a string)
        if (_ext.charAt(0) != '.')
            _ext = '.' + _ext; // (a period is required)
        return ResourceTypes[ResourceExtensions[ext]];
    }
    exports.getResourceTypeFromExtension = getResourceTypeFromExtension;
    var RequestStatuses;
    (function (RequestStatuses) {
        /** The request has not been executed yet. */
        RequestStatuses[RequestStatuses["Pending"] = 0] = "Pending";
        /** The resource failed to load.  Check the request object for the error details. */
        RequestStatuses[RequestStatuses["Error"] = 1] = "Error";
        /** The requested resource is loading. */
        RequestStatuses[RequestStatuses["Loading"] = 2] = "Loading";
        /** The requested resource has loaded (nothing more). */
        RequestStatuses[RequestStatuses["Loaded"] = 3] = "Loaded";
        /** The requested resource is waiting on parent resources to complete. */
        RequestStatuses[RequestStatuses["Waiting"] = 4] = "Waiting";
        /** The requested resource is ready to be used. */
        RequestStatuses[RequestStatuses["Ready"] = 5] = "Ready";
        /** The source is a script, and was executed (this only occurs on demand [not automatic]). */
        RequestStatuses[RequestStatuses["Executed"] = 6] = "Executed";
    })(RequestStatuses = exports.RequestStatuses || (exports.RequestStatuses = {}));
    /**
     * Returns the base path based on the resource type.
     */
    function basePathFromResourceType(resourceType) {
        return (resourceType == ResourceTypes.Application_Script || resourceType == ResourceTypes.Application_ECMAScript) ? Globals_1.DreamSpace.baseScriptsURL :
            resourceType == ResourceTypes.Text_CSS ? Globals_1.DreamSpace.baseCSSURL : Globals_1.DreamSpace.baseURL;
    }
    exports.basePathFromResourceType = basePathFromResourceType;
});
// ========================================================================================================================================
//# sourceMappingURL=Resources.js.map