// ========================================================================================================================================
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /** The most common mime types.  You can easily extend this enum with custom types, or force-cast strings to this type also. */
    /* NOTE: The enums entries MUST be prefixed with '<any>' in order for this mapping to work with 'ResourceExtensions' as well implicitly. */
    var ResourceTypes;
    (function (ResourceTypes) {
        // Application
        ResourceTypes[ResourceTypes["Application_Script"] = "application/javascript"] = "Application_Script";
        ResourceTypes[ResourceTypes["Application_ECMAScript"] = "application/ecmascript"] = "Application_ECMAScript";
        ResourceTypes[ResourceTypes["Application_JSON"] = "application/json"] = "Application_JSON";
        ResourceTypes[ResourceTypes["Application_ZIP"] = "application/zip"] = "Application_ZIP";
        ResourceTypes[ResourceTypes["Application_GZIP"] = "application/gzip"] = "Application_GZIP";
        ResourceTypes[ResourceTypes["Application_PDF"] = "application/pdf"] = "Application_PDF";
        ResourceTypes[ResourceTypes["Application_DefaultFormPost"] = "application/x-www-form-urlencoded"] = "Application_DefaultFormPost";
        ResourceTypes[ResourceTypes["Application_TTF"] = "application/x-font-ttf"] = "Application_TTF";
        // Multipart
        ResourceTypes[ResourceTypes["Multipart_BinaryFormPost"] = "multipart/form-data"] = "Multipart_BinaryFormPost";
        // Audio
        ResourceTypes[ResourceTypes["AUDIO_MP4"] = "audio/mp4"] = "AUDIO_MP4";
        ResourceTypes[ResourceTypes["AUDIO_MPEG"] = "audio/mpeg"] = "AUDIO_MPEG";
        ResourceTypes[ResourceTypes["AUDIO_OGG"] = "audio/ogg"] = "AUDIO_OGG";
        ResourceTypes[ResourceTypes["AUDIO_AAC"] = "audio/x-aac"] = "AUDIO_AAC";
        ResourceTypes[ResourceTypes["AUDIO_CAF"] = "audio/x-caf"] = "AUDIO_CAF";
        // Image
        ResourceTypes[ResourceTypes["Image_GIF"] = "image/gif"] = "Image_GIF";
        ResourceTypes[ResourceTypes["Image_JPEG"] = "image/jpeg"] = "Image_JPEG";
        ResourceTypes[ResourceTypes["Image_PNG"] = "image/png"] = "Image_PNG";
        ResourceTypes[ResourceTypes["Image_SVG"] = "image/svg+xml"] = "Image_SVG";
        ResourceTypes[ResourceTypes["Image_GIMP"] = "image/x-xcf"] = "Image_GIMP";
        // Text
        ResourceTypes[ResourceTypes["Text_CSS"] = "text/css"] = "Text_CSS";
        ResourceTypes[ResourceTypes["Text_CSV"] = "text/csv"] = "Text_CSV";
        ResourceTypes[ResourceTypes["Text_HTML"] = "text/html"] = "Text_HTML";
        ResourceTypes[ResourceTypes["Text_Plain"] = "text/plain"] = "Text_Plain";
        ResourceTypes[ResourceTypes["Text_RTF"] = "text/rtf"] = "Text_RTF";
        ResourceTypes[ResourceTypes["Text_XML"] = "text/xml"] = "Text_XML";
        ResourceTypes[ResourceTypes["Text_JQueryTemplate"] = "text/x-jquery-tmpl"] = "Text_JQueryTemplate";
        ResourceTypes[ResourceTypes["Text_MarkDown"] = "text/x-markdown"] = "Text_MarkDown";
        // Video
        ResourceTypes[ResourceTypes["Video_AVI"] = "video/avi"] = "Video_AVI";
        ResourceTypes[ResourceTypes["Video_MPEG"] = "video/mpeg"] = "Video_MPEG";
        ResourceTypes[ResourceTypes["Video_MP4"] = "video/mp4"] = "Video_MP4";
        ResourceTypes[ResourceTypes["Video_OGG"] = "video/ogg"] = "Video_OGG";
        ResourceTypes[ResourceTypes["Video_MOV"] = "video/quicktime"] = "Video_MOV";
        ResourceTypes[ResourceTypes["Video_WMV"] = "video/x-ms-wmv"] = "Video_WMV";
        ResourceTypes[ResourceTypes["Video_FLV"] = "video/x-flv"] = "Video_FLV";
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
        ResourceExtensions[ResourceExtensions["Application_Script"] = ".js"] = "Application_Script";
        ResourceExtensions[ResourceExtensions["Application_ECMAScript"] = ".es"] = "Application_ECMAScript";
        ResourceExtensions[ResourceExtensions["Application_JSON"] = ".json"] = "Application_JSON";
        ResourceExtensions[ResourceExtensions["Application_ZIP"] = ".zip"] = "Application_ZIP";
        ResourceExtensions[ResourceExtensions["Application_GZIP"] = ".gz"] = "Application_GZIP";
        ResourceExtensions[ResourceExtensions["Application_PDF"] = ".pdf"] = "Application_PDF";
        ResourceExtensions[ResourceExtensions["Application_TTF"] = ".ttf"] = "Application_TTF";
        // Audio
        ResourceExtensions[ResourceExtensions["AUDIO_MP4"] = ".mp4"] = "AUDIO_MP4";
        ResourceExtensions[ResourceExtensions["AUDIO_MPEG"] = ".mpeg"] = "AUDIO_MPEG";
        ResourceExtensions[ResourceExtensions["AUDIO_OGG"] = ".ogg"] = "AUDIO_OGG";
        ResourceExtensions[ResourceExtensions["AUDIO_AAC"] = ".aac"] = "AUDIO_AAC";
        ResourceExtensions[ResourceExtensions["AUDIO_CAF"] = ".caf"] = "AUDIO_CAF";
        // Image
        ResourceExtensions[ResourceExtensions["Image_GIF"] = ".gif"] = "Image_GIF";
        ResourceExtensions[ResourceExtensions["Image_JPEG"] = ".jpeg"] = "Image_JPEG";
        ResourceExtensions[ResourceExtensions["Image_PNG"] = ".png"] = "Image_PNG";
        ResourceExtensions[ResourceExtensions["Image_SVG"] = ".svg"] = "Image_SVG";
        ResourceExtensions[ResourceExtensions["Image_GIMP"] = ".xcf"] = "Image_GIMP";
        // Text
        ResourceExtensions[ResourceExtensions["Text_CSS"] = ".css"] = "Text_CSS";
        ResourceExtensions[ResourceExtensions["Text_CSV"] = ".csv"] = "Text_CSV";
        ResourceExtensions[ResourceExtensions["Text_HTML"] = ".html"] = "Text_HTML";
        ResourceExtensions[ResourceExtensions["Text_Plain"] = ".txt"] = "Text_Plain";
        ResourceExtensions[ResourceExtensions["Text_RTF"] = ".rtf"] = "Text_RTF";
        ResourceExtensions[ResourceExtensions["Text_XML"] = ".xml"] = "Text_XML";
        ResourceExtensions[ResourceExtensions["Text_JQueryTemplate"] = ".tpl.htm"] = "Text_JQueryTemplate";
        ResourceExtensions[ResourceExtensions["Text_MarkDown"] = ".markdown"] = "Text_MarkDown";
        // Video
        ResourceExtensions[ResourceExtensions["Video_AVI"] = ".avi"] = "Video_AVI";
        ResourceExtensions[ResourceExtensions["Video_MPEG"] = ".mpeg"] = "Video_MPEG";
        ResourceExtensions[ResourceExtensions["Video_MP4"] = ".mp4"] = "Video_MP4";
        ResourceExtensions[ResourceExtensions["Video_OGG"] = ".ogg"] = "Video_OGG";
        ResourceExtensions[ResourceExtensions["Video_MOV"] = ".qt"] = "Video_MOV";
        ResourceExtensions[ResourceExtensions["Video_WMV"] = ".wmv"] = "Video_WMV";
        ResourceExtensions[ResourceExtensions["Video_FLV"] = ".flv"] = "Video_FLV";
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
});
// ========================================================================================================================================
//# sourceMappingURL=Resources.js.map