/** The most common mime types.  You can easily extend this enum with custom types, or force-cast strings to this type also. */
export declare enum ResourceTypes {
    Application_Script = "application/javascript",
    Application_ECMAScript = "application/ecmascript",
    Application_JSON = "application/json",
    Application_ZIP = "application/zip",
    Application_GZIP = "application/gzip",
    Application_PDF = "application/pdf",
    Application_DefaultFormPost = "application/x-www-form-urlencoded",
    Application_TTF = "application/x-font-ttf",
    Multipart_BinaryFormPost = "multipart/form-data",
    AUDIO_MP4 = "audio/mp4",
    AUDIO_MPEG = "audio/mpeg",
    AUDIO_OGG = "audio/ogg",
    AUDIO_AAC = "audio/x-aac",
    AUDIO_CAF = "audio/x-caf",
    Image_GIF = "image/gif",
    Image_JPEG = "image/jpeg",
    Image_PNG = "image/png",
    Image_SVG = "image/svg+xml",
    Image_GIMP = "image/x-xcf",
    Text_CSS = "text/css",
    Text_CSV = "text/csv",
    Text_HTML = "text/html",
    Text_Plain = "text/plain",
    Text_RTF = "text/rtf",
    Text_XML = "text/xml",
    Text_JQueryTemplate = "text/x-jquery-tmpl",
    Text_MarkDown = "text/x-markdown",
    Video_AVI = "video/avi",
    Video_MPEG = "video/mpeg",
    Video_MP4 = "video/mp4",
    Video_OGG = "video/ogg",
    Video_MOV = "video/quicktime",
    Video_WMV = "video/x-ms-wmv",
    Video_FLV = "video/x-flv"
}
/** A map of popular resource extensions to resource enum type names.
  * Example 1: ResourceTypes[ResourceExtensions[ResourceExtensions.Application_Script]] === "application/javascript"
  * Example 2: ResourceTypes[ResourceExtensions[<ResourceExtensions><any>'.JS']] === "application/javascript"
  * Example 3: DreamSpace.Loader.getResourceTypeFromExtension(ResourceExtensions.Application_Script);
  * Example 4: DreamSpace.Loader.getResourceTypeFromExtension(".js");
  */
export declare enum ResourceExtensions {
    Application_Script = ".js",
    Application_ECMAScript = ".es",
    Application_JSON = ".json",
    Application_ZIP = ".zip",
    Application_GZIP = ".gz",
    Application_PDF = ".pdf",
    Application_TTF = ".ttf",
    AUDIO_MP4 = ".mp4",
    AUDIO_MPEG = ".mpeg",
    AUDIO_OGG = ".ogg",
    AUDIO_AAC = ".aac",
    AUDIO_CAF = ".caf",
    Image_GIF = ".gif",
    Image_JPEG = ".jpeg",
    Image_PNG = ".png",
    Image_SVG = ".svg",
    Image_GIMP = ".xcf",
    Text_CSS = ".css",
    Text_CSV = ".csv",
    Text_HTML = ".html",
    Text_Plain = ".txt",
    Text_RTF = ".rtf",
    Text_XML = ".xml",
    Text_JQueryTemplate = ".tpl.htm",
    Text_MarkDown = ".markdown",
    Video_AVI = ".avi",
    Video_MPEG = ".mpeg",
    Video_MP4 = ".mp4",
    Video_OGG = ".ogg",
    Video_MOV = ".qt",
    Video_WMV = ".wmv",
    Video_FLV = ".flv"
}
/** Return the resource (MIME) type of a given extension (with or without the period). */
export declare function getResourceTypeFromExtension(ext: string): ResourceTypes;
/** Return the resource (MIME) type of a given extension type. */
export declare function getResourceTypeFromExtension(ext: ResourceExtensions): ResourceTypes;
export declare enum RequestStatuses {
    /** The request has not been executed yet. */
    Pending = 0,
    /** The resource failed to load.  Check the request object for the error details. */
    Error = 1,
    /** The requested resource is loading. */
    Loading = 2,
    /** The requested resource has loaded (nothing more). */
    Loaded = 3,
    /** The requested resource is waiting on parent resources to complete. */
    Waiting = 4,
    /** The requested resource is ready to be used. */
    Ready = 5,
    /** The source is a script, and was executed (this only occurs on demand [not automatic]). */
    Executed = 6
}
/**
 * Returns the base path based on the resource type.
 */
export declare function basePathFromResourceType(resourceType: string | ResourceTypes): string;
