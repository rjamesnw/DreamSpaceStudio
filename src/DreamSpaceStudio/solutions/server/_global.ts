namespace DS {
    /** The root of the website on the file system. The value defaults to the current working node directory, but the server
     * startup process should determine the web root and set it here before booting up the rest of the server.
     */
    export var webRoot = (<NodeJS.Global><any>global).process.cwd();

    /** The root of the website CONTENT on the file system.
     * This is typically the 'public' or 'www' folder that contains the files exposed to the browser.
     * If not specified this defaults to 'DS.Path.combine(DS.webRoot, "public")'
     */
    export var contentRoot: string;
    var _contentbRoot: string;
    Object.defineProperty(DS, "contentbRoot", {
        configurable: false, enumerable: true,
        get: () => { return _contentbRoot || Path.combine(webRoot, "public"); },
        set: (val: string) => { _contentbRoot = val; }
    });
}