// ========================================================================================================================================

/** The most common mime types.  You can easily extend this enum with custom types, or force-cast strings to this type also. */
/* NOTE: The enums entries MUST be prefixed with '<any>' in order for this mapping to work with 'ResourceExtensions' as well implicitly. */
export enum ResourceTypes { // (http://en.wikipedia.org/wiki/Internet_media_type)
    // Application
    Application_Script = <any>"application/javascript", // (note: 'text/javascript' is most common, but is obsolete)
    Application_ECMAScript = <any>"application/ecmascript",
    Application_JSON = <any>"application/json",
    Application_ZIP = <any>"application/zip",
    Application_GZIP = <any>"application/gzip",
    Application_PDF = <any>"application/pdf",
    Application_DefaultFormPost = <any>"application/x-www-form-urlencoded",
    Application_TTF = <any>"application/x-font-ttf",
    // Multipart
    Multipart_BinaryFormPost = <any>"multipart/form-data",
    // Audio
    AUDIO_MP4 = <any>"audio/mp4",
    AUDIO_MPEG = <any>"audio/mpeg",
    AUDIO_OGG = <any>"audio/ogg",
    AUDIO_AAC = <any>"audio/x-aac",
    AUDIO_CAF = <any>"audio/x-caf",
    // Image
    Image_GIF = <any>"image/gif",
    Image_JPEG = <any>"image/jpeg",
    Image_PNG = <any>"image/png",
    Image_SVG = <any>"image/svg+xml",
    Image_GIMP = <any>"image/x-xcf",
    // Text
    Text_CSS = <any>"text/css",
    Text_CSV = <any>"text/csv",
    Text_HTML = <any>"text/html",
    Text_Plain = <any>"text/plain",
    Text_RTF = <any>"text/rtf",
    Text_XML = <any>"text/xml",
    Text_JQueryTemplate = <any>"text/x-jquery-tmpl",
    Text_MarkDown = <any>"text/x-markdown",
    // Video
    Video_AVI = <any>"video/avi",
    Video_MPEG = <any>"video/mpeg",
    Video_MP4 = <any>"video/mp4",
    Video_OGG = <any>"video/ogg",
    Video_MOV = <any>"video/quicktime",
    Video_WMV = <any>"video/x-ms-wmv",
    Video_FLV = <any>"video/x-flv"
}

/** A map of popular resource extensions to resource enum type names.
  * Example 1: ResourceTypes[ResourceExtensions[ResourceExtensions.Application_Script]] === "application/javascript"
  * Example 2: ResourceTypes[ResourceExtensions[<ResourceExtensions><any>'.JS']] === "application/javascript"
  * Example 3: DreamSpace.Loader.getResourceTypeFromExtension(ResourceExtensions.Application_Script);
  * Example 4: DreamSpace.Loader.getResourceTypeFromExtension(".js");
  */
/* NOTE: The enums entries MUST be prefixed with '<any>' in order for this mapping to work with 'ResourceTypes' as well implicitly. */
export enum ResourceExtensions { // (http://tools.ietf.org/html/rfc4329#page-12)
    Application_Script = <any>".js", // (note: 'text/javascript' is most common, but is obsolete)
    Application_ECMAScript = <any>".es",
    Application_JSON = <any>".json",
    Application_ZIP = <any>".zip",
    Application_GZIP = <any>".gz",
    Application_PDF = <any>".pdf",
    Application_TTF = <any>".ttf",
    // Audio
    AUDIO_MP4 = <any>".mp4",
    AUDIO_MPEG = <any>".mpeg",
    AUDIO_OGG = <any>".ogg",
    AUDIO_AAC = <any>".aac",
    AUDIO_CAF = <any>".caf",
    // Image
    Image_GIF = <any>".gif",
    Image_JPEG = <any>".jpeg",
    Image_PNG = <any>".png",
    Image_SVG = <any>".svg",
    Image_GIMP = <any>".xcf",
    // Text
    Text_CSS = <any>".css",
    Text_CSV = <any>".csv",
    Text_HTML = <any>".html",
    Text_Plain = <any>".txt",
    Text_RTF = <any>".rtf",
    Text_XML = <any>".xml",
    Text_JQueryTemplate = <any>".tpl.htm", // (http://encosia.com/using-external-templates-with-jquery-templates/) Note: Not standard!
    Text_MarkDown = <any>".markdown", // (http://daringfireball.net/linked/2014/01/08/markdown-extension)
    // Video
    Video_AVI = <any>".avi",
    Video_MPEG = <any>".mpeg",
    Video_MP4 = <any>".mp4",
    Video_OGG = <any>".ogg",
    Video_MOV = <any>".qt",
    Video_WMV = <any>".wmv",
    Video_FLV = <any>".flv"
}
(<any>ResourceExtensions)[<any>'.tpl.html'] = ResourceExtensions[ResourceExtensions.Text_JQueryTemplate]; // (map to the same 'Text_JQueryTemplate' target)
(<any>ResourceExtensions)[<any>'.tpl'] = ResourceExtensions[ResourceExtensions.Text_JQueryTemplate]; // (map to the same 'Text_JQueryTemplate' target)

/** Return the resource (MIME) type of a given extension (with or without the period). */
export function getResourceTypeFromExtension(ext: string): ResourceTypes;
/** Return the resource (MIME) type of a given extension type. */
export function getResourceTypeFromExtension(ext: ResourceExtensions): ResourceTypes;
export function getResourceTypeFromExtension(ext: any): ResourceTypes {
    if (ext === void 0 || ext === null) return void 0;
    var _ext = "" + ext; // (make sure it's a string)
    if (_ext.charAt(0) != '.') _ext = '.' + _ext; // (a period is required)
    return <any>ResourceTypes[<any>ResourceExtensions[ext]];
}

export enum RequestStatuses {
    /** The request has not been executed yet. */
    Pending,
    /** The resource failed to load.  Check the request object for the error details. */
    Error,
    /** The requested resource is loading. */
    Loading,
    /** The requested resource has loaded (nothing more). */
    Loaded,
    /** The requested resource is waiting on parent resources to complete. */
    Waiting,
    /** The requested resource is ready to be used. */
    Ready,
    /** The source is a script, and was executed (this only occurs on demand [not automatic]). */
    Executed,
}

// ========================================================================================================================================
