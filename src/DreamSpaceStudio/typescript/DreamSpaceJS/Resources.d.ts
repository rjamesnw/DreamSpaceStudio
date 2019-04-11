/** The most common mime types.  You can easily extend this enum with custom types, or force-cast strings to this type also. */
export declare enum ResourceTypes {
    Application_Script,
    Application_ECMAScript,
    Application_JSON,
    Application_ZIP,
    Application_GZIP,
    Application_PDF,
    Application_DefaultFormPost,
    Application_TTF,
    Multipart_BinaryFormPost,
    AUDIO_MP4,
    AUDIO_MPEG,
    AUDIO_OGG,
    AUDIO_AAC,
    AUDIO_CAF,
    Image_GIF,
    Image_JPEG,
    Image_PNG,
    Image_SVG,
    Image_GIMP,
    Text_CSS,
    Text_CSV,
    Text_HTML,
    Text_Plain,
    Text_RTF,
    Text_XML,
    Text_JQueryTemplate,
    Text_MarkDown,
    Video_AVI,
    Video_MPEG,
    Video_MP4,
    Video_OGG,
    Video_MOV,
    Video_WMV,
    Video_FLV
}
/** A map of popular resource extensions to resource enum type names.
  * Example 1: ResourceTypes[ResourceExtensions[ResourceExtensions.Application_Script]] === "application/javascript"
  * Example 2: ResourceTypes[ResourceExtensions[<ResourceExtensions><any>'.JS']] === "application/javascript"
  * Example 3: DreamSpace.Loader.getResourceTypeFromExtension(ResourceExtensions.Application_Script);
  * Example 4: DreamSpace.Loader.getResourceTypeFromExtension(".js");
  */
export declare enum ResourceExtensions {
    Application_Script,
    Application_ECMAScript,
    Application_JSON,
    Application_ZIP,
    Application_GZIP,
    Application_PDF,
    Application_TTF,
    AUDIO_MP4,
    AUDIO_MPEG,
    AUDIO_OGG,
    AUDIO_AAC,
    AUDIO_CAF,
    Image_GIF,
    Image_JPEG,
    Image_PNG,
    Image_SVG,
    Image_GIMP,
    Text_CSS,
    Text_CSV,
    Text_HTML,
    Text_Plain,
    Text_RTF,
    Text_XML,
    Text_JQueryTemplate,
    Text_MarkDown,
    Video_AVI,
    Video_MPEG,
    Video_MP4,
    Video_OGG,
    Video_MOV,
    Video_WMV,
    Video_FLV
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
