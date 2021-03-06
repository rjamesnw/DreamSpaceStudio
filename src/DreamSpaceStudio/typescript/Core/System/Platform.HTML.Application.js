"use strict";
// ############################################################################################################################
// Types for event management.
// ############################################################################################################################
Object.defineProperty(exports, "__esModule", { value: true });
const DreamSpace_1 = require("../DreamSpace");
const Factories_1 = require("../Factories");
const Platform_Graph_1 = require("./Platform.Graph");
const Exception_1 = require("./Exception");
const Platform_HTML_1 = require("./Platform.HTML");
const Diagnostics_1 = require("./Diagnostics");
const ErrorHandling_1 = require("../ErrorHandling");
const Logging_1 = require("../Logging");
// ========================================================================================================================
//export var HTMLApplication = ClassFactory(Application, UIApplication,
//    (base) => {
//        class HTMLApplication extends base {
//        }
//        return [HTMLApplication, HTMLApplication["ScriptResourceFactory"]];
//    },
//    "HTMLApplication"
//);
//export interface IHTMLApplication extends InstanceType<typeof HTMLApplication.$__type> { }
// ========================================================================================================================
/** An ApplicationElement object is the root object of the graph tree that relates one UIApplication instance. */
class ApplicationElement extends Factories_1.Factory(Platform_HTML_1.HTMLElement) {
    constructor() {
        super(...arguments);
        // --------------------------------------------------------------------------------------------------------------------
        /** A title for the application (required). */
        this.title = Platform_Graph_1.GraphNode.accessor(ApplicationElement.Title);
        /** A short application description (optional). */
        this.description = Platform_Graph_1.GraphNode.accessor(ApplicationElement.Description);
        /** The application version number (i.e. '#.#.#...') in string form. */
        this.version = Platform_Graph_1.GraphNode.accessor(ApplicationElement.Version);
        /** Holds a list of data templates found in the parsed HTML page template.
        * Templates are based on elements within the page which are marked by the 'data--template="someID"' attribute. These
        * elements are stripped out and are not part of the resulting page.
        */
        this.dataTemplates = {};
        // --------------------------------------------------------------------------------------------------------------------
    }
    static 'new'(title, description, targetElement = null) { return null; }
    static init(o, isnew, title, description, targetElement = null) {
        this.super.init(o, isnew, null);
        if (typeof title == "undefined" || "" + title == "")
            throw "An application title is required.";
        o.title(title);
        o.description(description);
        o._targetElement = targetElement || document.getElementsByTagName("body")[0] || null;
    }
    getTargetElement() { return this._targetElement; }
    // --------------------------------------------------------------------------------------------------------------------
    /** This generates/updates the HTML elements required to display the application. */
    updateLayout(recursive = true) {
        var log = DreamSpace_1.DreamSpace.isDebugging() ? Diagnostics_1.Diagnostics.log(ApplicationElement, "Application is updating its layout ...").beginCapture() : null;
        super.updateLayout(recursive);
        if (this.__element != null) {
            var node = this._targetElement.firstChild;
            if (node == null || !node['replaceNode'])
                this._targetElement.appendChild(this.__element);
            else
                node['replaceNode'](this.__element);
        }
        if (log)
            log.write("Application layout updated.").endCapture();
    }
    // --------------------------------------------------------------------------------------------------------------------
    /** Imports an HTML template starting at the given DOM element (a basic DOM system is required for traversing the elements).  Any existing graph items
    * will be merged or replaced.
    * If 'DreamSpace.isServer()' returns true, then you should call 'parseTemplate()'
    * @param {HTMLElement} element HTML root element to traverse.
    */
    applyTemplate(element) {
        // ... 'element' is the application root ...
    }
    /** Parses HTML text to build the visual graph tree.
    * This concept is similar to using XAML to load objects in Silverlight or WPF. You have the option to use an HTML file, or dynamically build your application
    * directly in code (just like with Silverlight/WPF using XAML/C#/VB/etc.).
    *
    * Warning about inline scripts: Script tags will be executed client side (naturally by the DOM), but you cannot rely on them server side.  Try to use
    * HTML for UI DESIGN ONLY.  Expect that any code you place in the HTML will not execute server side. "Business" logic should always be in your script
    * files and NOT inline within the HTML.
    */
    parseTemplate(html = null) {
        var log = Diagnostics_1.Diagnostics.log(ApplicationElement, "Parsing application HTML template ...").beginCapture();
        if (!html)
            if (DreamSpace_1.DreamSpace.host.isClient())
                html = this.loadTemplate(); // (returns "<html>...</html>" from the DOM)
            else
                throw Exception_1.Exception.from("Unable to parse the client side HTML on the server side (no HTML is loaded).  Call 'loadTemplate()' instead.");
        // ... parse the HTML "body" section for the graph tree ("body" is the application root) ...
        // (quickly scan the template text to create the required objects [using <body> as the application root])
        document.body.innerHTML = ""; // (clear this if not already done so [will be dynamically rebuilt using the graph tree before the user sees any changes])
        // (allowing the innterHTML to exist first provides a quick visual view of the page, which will then give time to quickly replace it)
        var result = Platform_HTML_1.HTML.parse(html);
        for (var i = 0, n = result.rootElements.length; i < n; ++i)
            this.addChild(result.rootElements[i]);
        for (var id in result.templates)
            this.dataTemplates[id] = result.templates[id];
        log.write("Application HTML template parsing complete.").endCapture();
    }
    /** Loads the 'htmlFile' file and calls 'parseTemplate()' with the contents.
    * The call is synchronous, and only returns when completed.
    * @param {string} htmlFileURI The URI to the HTML template file. If empty or undefined, then the HTML is pulled from the loaded DOM (see 'parseTemplate()').
    * @param {boolean} fallbackToDOM If true (the default), then the HTML template will be extracted from the currently loaded DOM as a fallback (i.e. if the
    * URI is invalid, or access fails due to a sudden connection failure).
    */
    loadTemplate(htmlFileURI, fallbackToDOM = true) {
        var contents = null;
        var log = Diagnostics_1.Diagnostics.log("Application.loadTemplate()", "Loading template from '" + htmlFileURI + "' ...").beginCapture();
        // ... load the file ...
        if (DreamSpace_1.DreamSpace.host.isClient()) {
            if (htmlFileURI) {
                // ... use AJAX ...
                var request = new XMLHttpRequest();
                request.open("get", htmlFileURI + "!", false);
                request.onerror = (ev) => {
                    Diagnostics_1.Diagnostics.log("Application.loadTemplate()", ErrorHandling_1.getErrorMessage(ev), Logging_1.LogTypes.Error);
                };
                request.onreadystatechange = () => {
                    if (request.readyState == (XMLHttpRequest.DONE || 4)) {
                        var ok = false, response = request.response || request.responseText || request.responseXML || request['responseBody'];
                        if (request.status == 200) {
                            log.write("Template data was loaded from the server.", Logging_1.LogTypes.Success);
                            ok = true;
                        }
                        else if (request.status == 304) {
                            log.write("Template data was loaded from the browser cache.", Logging_1.LogTypes.Success);
                            ok = true;
                        }
                        else
                            log.write("Template data was not loaded. Response: " + response, Logging_1.LogTypes.Error); // (usually at 404)
                        if (ok)
                            contents = response;
                    }
                };
                log.write("Sending request for template ...", Logging_1.LogTypes.Info);
                request.send();
            }
            if (!contents && fallbackToDOM) {
                log.write("Failed to load the template content, or content is empty.  Using the existing DOM content instead.", Logging_1.LogTypes.Warning);
                // ... get HTML from the DOM as a fall back [there should be no reason not to have something!] ...
                contents = document.getElementsByTagName("html")[0].outerHTML;
            }
        }
        else {
            // ... use the host bridge ...
            // contents = loadedContent;
        }
        log.endCapture();
        return contents;
    }
    // --------------------------------------------------------------------------------------------------------------------
    /** Returns a template with the specified ID.  Returns null if nothing was found. */
    getDataTemplate(id) {
        return this.dataTemplates && this.dataTemplates[id] || null;
    }
    // --------------------------------------------------------------------------------------------------------------------
    /** Return the application, and all child graph items, as a single JSON string.  The values are all graph objects and related REGISTERED properties
    * only - direct instance properties are not all persisted, if any.
    * JavaScript 1.7 implements the 'JSON.stringify()' function to convert values into the JSON format.  The implementation looks for a 'toJSON()'
    * function on an object and calls it if found.
    */
    toJSON() {
        return null;
    }
}
ApplicationElement.Title = Platform_Graph_1.GraphNode.registerProperty(ApplicationElement, "title", true);
ApplicationElement.Description = Platform_Graph_1.GraphNode.registerProperty(ApplicationElement, "description", true);
ApplicationElement.Version = Platform_Graph_1.GraphNode.registerProperty(ApplicationElement, "version", true);
exports.ApplicationElement = ApplicationElement;
// ========================================================================================================================
// ############################################################################################################################
//# sourceMappingURL=Platform.HTML.Application.js.map