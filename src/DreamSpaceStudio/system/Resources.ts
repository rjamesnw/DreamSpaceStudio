namespace DS {
    // ========================================================================================================================================

    /** The most common mime types.  You can easily extend this enum with custom types, or force-cast strings to this type also. */
    /* NOTE: The enums entries MUST be prefixed with '<any>' in order for this mapping to work with 'ResourceExtensions' as well implicitly. */
    export enum ResourceTypes { // (http://en.wikipedia.org/wiki/Internet_media_type)
        // Application
        Application_Script = "application/javascript", // (note: 'text/javascript' is most common, but is obsolete)
        Application_ECMAScript = "application/ecmascript",
        Application_JSON = "application/json",
        Application_ZIP = "application/zip",
        Application_GZIP = "application/gzip",
        Application_PDF = "application/pdf",
        Application_DefaultFormPost = "application/x-www-form-urlencoded",
        Application_TTF = "application/x-font-ttf",
        // Multipart
        Multipart_BinaryFormPost = "multipart/form-data",
        // Audio
        AUDIO_MP4 = "audio/mp4",
        AUDIO_MPEG = "audio/mpeg",
        AUDIO_OGG = "audio/ogg",
        AUDIO_AAC = "audio/x-aac",
        AUDIO_CAF = "audio/x-caf",
        // Image
        Image_GIF = "image/gif",
        Image_JPEG = "image/jpeg",
        Image_PNG = "image/png",
        Image_SVG = "image/svg+xml",
        Image_GIMP = "image/x-xcf",
        // Text
        Text_CSS = "text/css",
        Text_CSV = "text/csv",
        Text_HTML = "text/html",
        Text_Plain = "text/plain",
        Text_RTF = "text/rtf",
        Text_XML = "text/xml",
        Text_JQueryTemplate = "text/x-jquery-tmpl",
        Text_MarkDown = "text/x-markdown",
        // Video
        Video_AVI = "video/avi",
        Video_MPEG = "video/mpeg",
        Video_MP4 = "video/mp4",
        Video_OGG = "video/ogg",
        Video_MOV = "video/quicktime",
        Video_WMV = "video/x-ms-wmv",
        Video_FLV = "video/x-flv"
    }

    for (let p in ResourceTypes) (<any>ResourceTypes)[(<any>ResourceTypes)[p]] = p; // (make the values also reference the property names)

    /** A map of popular resource extensions to resource enum type names.
      * Example 1: ResourceTypes[ResourceExtensions[ResourceExtensions.Application_Script]] === "application/javascript"
      * Example 2: ResourceTypes[ResourceExtensions[<ResourceExtensions><any>'.JS']] === "application/javascript"
      * Example 3: DreamSpace.Loader.getResourceTypeFromExtension(ResourceExtensions.Application_Script);
      * Example 4: DreamSpace.Loader.getResourceTypeFromExtension(".js");
      */
    /* NOTE: The enums entries MUST be prefixed with '<any>' in order for this mapping to work with 'ResourceTypes' as well implicitly. */
    export enum ResourceExtensions { // (http://tools.ietf.org/html/rfc4329#page-12)
        Application_Script = ".js", // (note: 'text/javascript' is most common, but is obsolete)
        Application_ECMAScript = ".es",
        Application_JSON = ".json",
        Application_ZIP = ".zip",
        Application_GZIP = ".gz",
        Application_PDF = ".pdf",
        Application_TTF = ".ttf",
        // Audio
        AUDIO_MP4 = ".mp4",
        AUDIO_MPEG = ".mpeg",
        AUDIO_OGG = ".ogg",
        AUDIO_AAC = ".aac",
        AUDIO_CAF = ".caf",
        // Image
        Image_GIF = ".gif",
        Image_JPEG = ".jpeg",
        Image_PNG = ".png",
        Image_SVG = ".svg",
        Image_GIMP = ".xcf",
        // Text
        Text_CSS = ".css",
        Text_CSV = ".csv",
        Text_HTML = ".html",
        Text_Plain = ".txt",
        Text_RTF = ".rtf",
        Text_XML = ".xml",
        Text_JQueryTemplate = ".tpl.htm", // (http://encosia.com/using-external-templates-with-jquery-templates/) Note: Not standard!
        Text_MarkDown = ".markdown", // (http://daringfireball.net/linked/2014/01/08/markdown-extension)
        // Video
        Video_AVI = ".avi",
        Video_MPEG = ".mpeg",
        Video_MP4 = ".mp4",
        Video_OGG = ".ogg",
        Video_MOV = ".qt",
        Video_WMV = ".wmv",
        Video_FLV = ".flv"
    }
    (<IndexedObject<string>>ResourceExtensions)['.tpl.html'] = (<IndexedObject<string>>ResourceExtensions)[ResourceExtensions.Text_JQueryTemplate]; // (map to the same 'Text_JQueryTemplate' target)
    (<IndexedObject<string>>ResourceExtensions)['.tpl'] = (<IndexedObject<string>>ResourceExtensions)[ResourceExtensions.Text_JQueryTemplate]; // (map to the same 'Text_JQueryTemplate' target)

    for (let p in ResourceExtensions) (<any>ResourceExtensions)[(<any>ResourceExtensions)[p]] = p; // (make the values also reference the property names)

    /** Return the resource (MIME) type of a given extension (with or without the period). */
    export function getResourceTypeFromExtension(ext: string): ResourceTypes;
    /** Return the resource (MIME) type of a given extension type. */
    export function getResourceTypeFromExtension(ext: ResourceExtensions): ResourceTypes;
    export function getResourceTypeFromExtension(ext: any): ResourceTypes {
        if (ext === void 0 || ext === null) return void 0;
        var _ext = "" + ext; // (make sure it's a string)
        if (_ext.charAt(0) != '.') _ext = '.' + _ext; // (a period is required)
        return <any>(<IndexedObject<string>>ResourceTypes)[(<IndexedObject<string>>ResourceExtensions)[ext]];
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

    /** 
     * Returns the base path based on the resource type.  
     */
    export function basePathFromResourceType(resourceType: string | ResourceTypes) {
        return (resourceType == ResourceTypes.Application_Script || resourceType == ResourceTypes.Application_ECMAScript) ? DS.baseScriptsURL :
            resourceType == ResourceTypes.Text_CSS ? DS.baseCSSURL : DS.baseURL;
    }

    // ========================================================================================================================================
}