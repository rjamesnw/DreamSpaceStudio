import fs = require('fs') // this engine requires the fs module
import { Request, Response } from 'express-serve-static-core';
import { isNullOrUndefined, isUndefined } from 'util';

/** The absolute root path of the views folder. By default this is 'features' (relative from 'DS.webRoot'). 
 * What is features?  You can search more on "Feature Slices for ASP.NET Core MVC" as an example, but the concept of 
 * "features" is very simple: Just group your views and code together!
 * Yes, it doe sort of look like a type of "code behind" scenario, but it solves a typical MVC common issue where the views are
 * dumped into one place, and the code in another. That makes it hard to quickly identify which code belongs to which view.
 * For features, use folders as categories, or with views that contain multiple code files.
 */
export var viewsRoot = DS.Path.combine(DS.webRoot, "features");

interface IViewAttributeFunction {
    attributes: IndexedObject;
    /** Render attributes. */
    (attributesToIgnore?: string[], attributesToInclude?: string[]): string;
    /** Renders a single attribute, in which a user can prepend or append to it. */
    (attributeName: string, prefix?: string, suffix?: string): string | { (): string };
}

export function createCallableViewAttributes(): IViewAttributeFunction {
    var attributes: IndexedObject = {};
    var attributesObject: IViewAttributeFunction = <any>function (p1: any, p2: any, p3: any) { // (p2 inserts string value before attribute p1's value, and p3 inserts after)
        var s = "", value: any;
        if (typeof p1 == 'string') {
            let attrName: string = p1;
            if (!attrName) throw new DS.Exception("An attribute name is required.");
            value = attributes[attrName];
            let p2Defined = !isNullOrUndefined(p2);
            let p3Defined = !isNullOrUndefined(p3);
            if (p2Defined || p3Defined) {
                if (p2Defined)
                    s = DS.StringUtils.append(DS.nud(p2, ''), DS.nud(value, ''), ' ');
                else
                    s = '' + value;
                if (p3Defined)
                    s = DS.StringUtils.append(s, DS.nud(p3, ''), ' ');
            }
            else return {
                value,
                toString: function () { return '' + DS.nud(this.value, ''); },
                valueOf: function () { return this.toString(); },
                add: function (namesListStr: string) {
                    var namesList = DS.StringUtils.toString(namesListStr).split(' ');
                    for (var i = 0, n = namesList.length; i < n; ++i) {
                        var name = namesList[i];
                        if (!isNullOrUndefined(name)) {
                            name = DS.StringUtils.toString(name);
                            var names = this.toString().toLowerCase().split(' ');
                            if (names.indexOf(name.toLowerCase()) < 0)
                                this.value = DS.StringUtils.append(this.toString(), name, ' ')
                        }
                    }
                    return this;
                },
                remove: function (namesListStr: string) {
                    var namesList = DS.StringUtils.toString(namesListStr).split(' ');
                    for (var i = 0, n = namesList.length; i < n; ++i) {
                        var name = namesList[i];
                        if (!isNullOrUndefined(name)) {
                            name = DS.StringUtils.toString(name);
                            let _name_lc = ('' + name).toLowerCase();
                            var names: string[] = this.toString().split(' ');
                            for (let i = names.length - 1; i >= 0; --i)
                                if (names[i].toLowerCase() == _name_lc)
                                    names.splice(i, 1);
                            this.value = names.join(' ');
                        }
                    }
                    return this;
                }
            };

        } else {
            // ... render the name=value attributes; assume p1 is an attribute array to ignore and p2 is one to include ...
            let attributesToIgnore: string[] = p1;
            let attributesToInclude: string[] = p2;
            for (var p in attributes) {
                if (attributesToIgnore && attributesToIgnore.indexOf(p) >= 0) continue;
                if (attributesToInclude && attributesToInclude.indexOf(p) < 0) continue;
                value = attributes[p];
                if (typeof value == 'function') // TODO: consider making this async also; low priority however.
                    value = value();
                s += (s ? ' ' : '') + p + (value !== void 0 && value !== null ? `="${value}"` : '');
            }
        }
        return s;
    }
    attributesObject.attributes = attributes;
    return attributesObject;
}
export class ViewData {
    [index: string]: any;
    '@' = createCallableViewAttributes();
    content?: string | IAsyncFunction;
    /** Constructs a new ViewData object.  You can optionally provide an object to copy properties and their values from. */
    constructor(values?: IndexedObject) {
        if (values)
            for (var p in values)
                if (Object.prototype.hasOwnProperty.call(values, p))
                    this[p] = values[p];
    }
}

export class HttpContext {
    /** The request object for the current request. */
    request: Request;
    /** The response object for the current request. */
    response: Response;
    /** The expanded path to the view being rendered. This is simply a shortcut to calling 'this.expandViewPath(this.viewPath)'. */
    get finalViewPath(): string {
        return this.expandViewPath(this.viewPath);
    }
    /** The unexpanded path to the view being rendered. This includes the name/filename of the view.
     * @see finalViewPath
     */
    viewPath?: string;
    /** Maps a name to a path. If 'viewPath' starts with any of the names it will be expanded in place. This allows using shorter paths for resources. */
    basePaths?: IndexedObject<string> = {};
    /** Optional data for the view being rendered. */
    viewData?: ViewData;
    /** An accumulation of GLOBALLY named contexts while parsing a previous view. 
     * Warning: To e used with layout views only.  Any other view will give an error (to prevent cyclical deadlock errors).
     */
    sectionManager: SectionManager;

    /** @see redirect() */
    _redirectURL?: string;

    /** Set to true if this context is for a layout view. */
    isLayout?: Boolean;

    /** Expands the path against the registered base paths in this view context. 
     * Only the first name in the relative path is expanded if a match is found in 'basePaths'.
     */
    expandViewPath(viewPath: string): string {
        if (typeof viewPath == 'string' && viewPath[0] != '/' && viewPath[0] != '\\') {
            var i = viewPath.indexOf('/');
            i < 0 && (i = viewPath.indexOf('\\'));
            if (i > 0) { // ('i' can't be 0, otherwise the name is empty)
                var name = viewPath.substr(0, i);
                if (name in this.basePaths)
                    return this.basePaths[name] + viewPath.substr(i);
            }
        }
        return viewPath;
    }

    /** Constructs a new HTTP context using another existing context.
     * @param viewData The data to use for this view.  If not specified, then the view data on the context will be used instead.
     * @param viewBasePath The relative path to the view being rendered.  This will set a new ROOT path for the view to find other related content (could be useful for theme development)
     * Note: This does not change where the initial view is found, only any included views.
     */
    constructor(httpContext: HttpContext, viewData?: ViewData, viewBasePath?: string);
    /** Constructs a new HTTP context.
     * @param request The request object for the current request.
     * @param response The response object for the current request.
     * @param viewData The data to use for this view.  If not specified, then the view data on the context will be used instead.
     * @param viewBasePath The relative path to the view being rendered.  This will set a new ROOT path for the view to find other related content (could be useful for theme development)
     * Note: This does not change where the initial view is found, only any included views.
     */
    constructor(request: Request, response: Response, viewData?: ViewData, viewBasePath?: string);
    constructor(requestOrCtx: Request & HttpContext, responseOrVewData?: Response | any, viewDataOrBasePath?: any | string, viewBasePath?: string) {
        var isHttpCtx = !!(requestOrCtx.request || requestOrCtx.response || 'viewData' in requestOrCtx);
        this.request = isHttpCtx ? requestOrCtx.request : requestOrCtx;
        this.response = isHttpCtx ? requestOrCtx.response : responseOrVewData;
        this.viewData = (isHttpCtx ? responseOrVewData : viewDataOrBasePath) || new ViewData(); // (NEVER inherit another contexts view data, as conflicts can occur, such as with '.content')
        this.viewPath = isHttpCtx ? viewDataOrBasePath && DS.Path.combine(viewDataOrBasePath, '/') || requestOrCtx.viewPath : viewBasePath && DS.Path.combine(viewBasePath, '/');
        if (isHttpCtx) {
            if (requestOrCtx.sectionManager)
                this.sectionManager = requestOrCtx.sectionManager; // (inherit the same section manager if exists; this is global to all views, but exclude content, which is specific to views)
            this.basePaths = DS.Utilities.clone(requestOrCtx.basePaths, DS.Utilities.RecursionMode.None); // (inherit the base path mappings also)
        }
        if (!this.sectionManager)
            this.sectionManager = new SectionManager(this);
        this.isLayout = false;
    }

    /** If called then view rendering will cancel and a redirect response will be sent.
     * Note: This must be requested before anything else renders, such as the layout page. Once a response is sent calling this may cause errors.
     */
    redirect(targetPath: string) { this._redirectURL = targetPath; }
}

export interface Renderer { (): string | Promise<string> }

function createAsyncFunction(expr: string) { return new AsyncFunction("$", "httpContext", "var ctx = httpContext; " + expr); }
var evalExpr = new Function("$", "expr", "httpContext", "var ctx = httpContext; return eval(expr);");

export class ViewScope {
    /** The section this view is currently writing to. */
    activeSection: string;

    /** Nothing is rendered right away. Async callbacks are queued to be called later if and when needed. */
    renderers?: {
        index: number,
        renderer: (Renderer | string),
        priority?: number // (causes multiple passes when rendering so nested views can populate sections and data before parent views are rendered, such as the layout view)
    }[]; // (index is used to maintain the correct insert order when combining the final rendered outputs)

    constructor(public section: Section, public httpContext: HttpContext) { }

    /** Adds a new renderer or static string to the list of items to render for this section. */
    add(value: Renderer | string, priority = 0) {
        if (!isNullOrUndefined(value))
            if (this.renderers)
                this.renderers.push({ index: this.renderers.length, renderer: value, priority });
            else
                this.renderers = [{ index: 0, renderer: value, priority }];
    }

    async render() {
        var html = "", value: ReturnType<Renderer> = "";
        if (this.renderers) {
            // (make sure to sort based on priorities: for instance, included views must render first so any sections are properly defined)
            var renderers = this.renderers.slice().sort((a, b) => { return a.priority > b.priority ? -1 : a.priority < b.priority ? 1 : 0; }); // (note: 'slice' is used to sort a copy)
            var finalOutputs: string[] = [];
            for (var i = 0, n = renderers.length; i < n; ++i) {
                if (typeof renderers[i].renderer == 'function') {
                    value = (<Renderer>renderers[i].renderer)();
                    if (value instanceof Promise)
                        value = await value;
                }
                else if (typeof renderers[i].renderer == 'string')
                    value = <string>renderers[i].renderer;
                else
                    value = '' + renderers[i].renderer; // (convert to string)

                finalOutputs[renderers[i].index] = value;
            }
            // ... compile the final results in the CORRECT order ...
            for (i = 0, n = finalOutputs.length; i < n; ++i)
                if (finalOutputs[i] !== void 0 && finalOutputs[i] !== null)
                    html += finalOutputs[i];
        }
        return html;
    }

    /** Returns the 'this.render' function bound to this view scope instance. */
    getRenderer(): { (): Promise<string> } { return this.render.bind(this); }
}

export class Section {

    /** The current view scope being written to. */
    currentViewScope: ViewScope;

    /** The last view popped off the stack. */
    previousViewScope: ViewScope;

    readonly _viewScopes: ViewScope[] = [];

    constructor(public readonly manager: SectionManager, public readonly name: string) { }

    /** Adds a new renderer or static string to the list of items to render for this section. */
    add(value: Renderer | string, priority = 0) {
        if (!isNullOrUndefined(value)) {
            if (!this.currentViewScope)
                this.push(this.manager.httpContext); // (if add is called without a current scope, assume one from the root context by default)
            this.currentViewScope.add(value, priority);
        }
    }

    /** Push the current view scope and make a new one. 
     * @returns The new scope.
     */
    push(httpContext: HttpContext) {
        if (!httpContext)
            throw DS.Exception.argumentRequired("Section.push()", "httpContext", this);

        this._viewScopes.push(this.currentViewScope);
        this.previousViewScope = this.currentViewScope;
        return this.currentViewScope = new ViewScope(this, httpContext);

        //x this.currentViewScope = {
        //    httpContext, // (the global context for the request)
        //    content: new Section(this, 'root_scope')
        //    // (nested content from the previous view; used with '${#render content?}' in child views, is taken from the parent content and made available for this view only)
        //};
    }

    /** Pop the previous view being render from the stack in order to continue. 
     * The current view scope is assigned to 'previousViewScope' before making the switch.
     */
    pop() {
        if (!this._viewScopes || !this._viewScopes.length)
            throw DS.Exception.error("Section.pop()", "Too many calls to pop views. There are no more views to pop from the stack.", this);
        this.previousViewScope = this.currentViewScope;
        return this.currentViewScope = this._viewScopes.pop();
    }

    /** Peeks at the last view on the stack (previous view or element content being rendered). */
    peek() {
        if (!this._viewScopes || !this._viewScopes.length)
            return null;
        return this._viewScopes.last();
    }

    /** Renders the content of the current view scope. */
    render() {
        return this.currentViewScope?.render() ?? Promise.resolve("");
    }
}

/** Controls the current section and view scopes.
 * When a global section is being rendered to, all rendered content are sent to that "bucket".
 * If no section is selected, all content gets rendered to
 */
export class SectionManager {
    /** Main content for the layout page. */
    static readonly CONTENT = "content"; // (while these are common names, any custom name can be used for sections)
    /** CSS content for the layout page. */
    static readonly CSS = "css";
    /** Script content for the layout page. */
    static readonly SCRIPTS = "scripts";
    /** Header content for the layout page. */
    static readonly HEADER = "header";
    /** Footer content for the layout page. */
    static readonly FOOTER = "footer";

    readonly sections: { [name: string]: Section; } = {};

    constructor(
        /** The context of the very first view being rendered. This is because section managers are global to each separate request scope. */
        public readonly httpContext: HttpContext
    ) { }

    /** Adds a new renderer or static string to the list of items to render for the specified section.
     * If a section does not exist then it is created first.
     */
    add(value: Renderer | string, sectionName = SectionManager.CONTENT, priority = 0) {
        var section: Section;
        if (!this.sections[sectionName])
            this.sections[sectionName] = section = new Section(this, sectionName);
        else
            section = this.sections[sectionName];
        section.add(value, priority);
        return section;
    }

    /** Remove and return a section by name. If not found then the request is ignored. */
    remove(sectionName = SectionManager.CONTENT) {
        var section = null;
        if (this.sections)
            (section = this.sections[sectionName], this.sections[sectionName] = void 0);
        return section;
    }

    /** Returns true if the named section exists. */
    hasSection(sectionName = SectionManager.CONTENT) { return this.sections && sectionName in this.sections }

    /** Returns the specified section. */
    getSection(sectionName = SectionManager.CONTENT) { return this.sections && this.sections[sectionName]; }

    /** Returns the current view scope of the specified section. */
    getSectionViewScope(sectionName = SectionManager.CONTENT) { return this.getSection(sectionName)?.currentViewScope; }

    /** Push the current view scope in the active section and make a new one. 
     * If there's no active section, default to content.
     * @param httpContext New view context to push.
     * @param sectionName Push in a specific section by name.
     * @returns The new scope.
     */
    push(httpContext: HttpContext, sectionName = SectionManager.CONTENT) {
        var section = this.sections[sectionName];
        if (!section)
            section = this.add(null, sectionName);
        return section.push(httpContext);
    }

    /** Pop the previous view being render from the stack in the active section in order to continue.
     * @param sectionName Pop from a specific section by name.
     */
    pop(sectionName = SectionManager.CONTENT) {
        var section = this.sections[sectionName];
        if (!section)
            throw DS.Exception.error("SectionManager.pop()", "There is no section instance for the current active section. Push() must be called first.", this);
        return section.pop();
    }

    /** Peeks at the last view on the stack for the current section (previous view or element content being rendered). 
     * Returns undefined if there is no active section, and null if there are no more view scopes.
     * @param sectionName Peek in a specific section by name.
     */
    peek(sectionName = SectionManager.CONTENT) {
        var section = this.sections[sectionName];
        if (!section) return void 0;
        return section.peek();
    }

    //x /**
    // * Creates a new SectionManager instance with the same section references in this section manager, excluding any specified sections.
    // * This exists to allow using the same sections across all views (like css and scripts) while create a new section for some others (like content).
    // * @param exclude Sections to exclude.
    // */
    //x shallowCopy(...exclude: string[]) {
    //    var sec = new SectionManager();
    //    sec.activeSection = this.activeSection;
    //    for (var p in this.sections)
    //        if (exclude.indexOf(p) < 0)
    //            sec.sections[p] = this.sections[p];
    //    return sec;
    //}
}

async function _processExpression(httpContext: HttpContext, expr: string, dataContext?: object): Promise<any> {
    try {
        var compiledExpression = expr.replace(/({){|(})}/g, "$1$2").replace(/\[@]\./g, "$['@'].attributes.").replace(/\[@]\(/g, "$['@'](")
            //.replace(/(\[\[[^\]]*]]|'(?:\\'|[^'])*'|"(?:\\"|[^"])*")|(^|[^a-z0-9_$.)[\]'"`\/\\])(\.|\[(?!\[))/gmi,
            .replace(/(\[\[[^\]]*]]|'(?:\\'|[^'])*'|"(?:\\"|[^"])*"|`(?:\\`|[^`])*`)|(^|[^a-z0-9_$.)[\]'"`\/\\])(\.)/gmi,
                function (match, p1, p2, p3, offset: number, src: string) {
                    return p1 ? p1 : p2 + '$' + p3;
                    // (when p1 exists it is a string to be skipped (or special double square bracket token ([[...]]), otherwise it is valid view data property reference)
                    // (p2 and p3 match when there's no valid identifier in p1 and only "." or "[]" exists in p2)
                });
        if (/[^a-z0-9$_]await[^a-z0-9$_]/gi.test(compiledExpression))
            var value = await createAsyncFunction(compiledExpression)(dataContext || {}, httpContext); // (if any 'await' word is detected this function will be used, but is MUCH slower than the pre-compiled one below, and requires an explicit "return" statement)
        else
            var value = await evalExpr(dataContext || {}, compiledExpression, httpContext); //DS.Utilities.dereferencePropertyPath(path, viewData, true);

        while (typeof value == 'function') {
            value = value();
            while (value instanceof Promise)
                value = await value;
        }

        if (value !== null && value !== void 0 && typeof value != 'string')
            value = '' + value;

        return value;
    } catch (ex) {
        throw new DS.Exception(`Failed to evaluate expression '${expr}' rendered as '${compiledExpression}'.`, this, ex);
    }
}

export interface IExpressViewContext {
    /** The name of the engine used - typically the extension name part without the preceeding dot. */
    defaultEngne: string;
    /** View file extension. */
    ext: string;
    /** The name of the view, which may include relative path information. */
    name: string;
    /** The absolute path to the view file. */
    path: string;
    /** The absolute path to the view file's directory. */
    root: string;
}

/** Used by express when auto-requiring middleware when rendering templates.
 * By default, Express will 'require()' the engine based on the file extension; for example, "app.engine('ext', require('ext').__express)"
 * for "name.ext".
 * Note: Using this method means, however, you may also have to set up the view folder. It is recommended to call 'apply(expressApp)'
 * to have the defaults configured for most cases.
 */
export var __express = function (this: IExpressViewContext, filePath: string, options: { context: HttpContext }, callback: { (err: any, response?: any): void }) { // define the template engine
    try {
        var httpContext = options.context;
        if (!httpContext.request)
            throw new DS.Exception("'httpContext.request' (of module type 'express-serve-static-core'.request) is required. If rendering a view, it is recommended to create and pass a 'HttpContext' object instance.");
        if (!httpContext.response)
            throw new DS.Exception("'httpContext.response' (of module type 'express-serve-static-core'.response) is required. If rendering a view, it is recommended to create and pass a 'HttpContext' object instance.");

        // ... update the views path if not set ...

        //var fileDir = DS.Path.getPath(filePath);

        if (!httpContext.viewPath)
            httpContext.viewPath = this.name;

        // ... if the user did not enter the file name with the path add a '/' to flag the path as a directory-only path (default file 'index.t.html' should be detected already) ...
        var filename = DS.Path.getName(filePath).split('.')[0].toLowerCase();
        if (!httpContext.viewPath.toLowerCase().endsWith(filename))
            httpContext.viewPath = DS.Path.combine(httpContext.viewPath, '/');

        //x var viewsRootPath = viewsRoot;
        //x if (!httpContext.viewPath && filePath.toLowerCase().indexOf(viewsRootPath.toLowerCase()) == 0)
        //x    httpContext.viewPath = filePath.substr(viewsRootPath.length + 1);

        fs.readFile(filePath, async function (err, fileContent) {
            if (err) return callback(err);

            // ... get any existing section manager, or create a new one ...
            let sectionManager = httpContext.sectionManager;
            let activeSection = SectionManager.CONTENT; // (will cause the default content section to be used)
            sectionManager.push(httpContext, activeSection); // (all views should start with a default content scope; this pushes an empty [undefined] scope on the stack and creates a new one; MAKE SURE TO POP BEFORE EXSITING THE RENDERING PROCESS OF THIS VIEW)

            try {
                var html = fileContent.toString();

                // ... replaced all tokens with the view data ...
                // (Note: It is very inefficient to pass around large HTML files in strings while iterating over it using RegExp.exec().
                //  It was determined that the fastest option is to use native match()/split() using regex instead to maintain consistent
                //  speed across the most popular browsers. The template parser does this as well.)

                var tokenRegex = /`(?:\\`|[^`])*?`|\${(?:{{|}}|[^}])*}|<\/?\$:(?:\\>|[^>])*>/g;
                var textParts = html.split(tokenRegex);
                var tokens = html.match(tokenRegex);
                tokens.push(""); // (each iteration will store text+token, and there will always be one less token compared to text parts)
                var removeEOL = false; // (this is true once after some tokens to remove the next character if EOL, then set to false again)
                var layoutViewName: string;

                // ... if we found some tokens to process, iterate over and process them ...

                for (var i = 0, n = textParts.length; i < n; ++i) {
                    var textpart = textParts[i];
                    if (removeEOL) {
                        if (textpart.substr(0, 2) == '\r\n')
                            textpart = textpart.substr(2);
                        else if (textpart[0] == '\n' || textpart[0] == '\r')
                            textpart = textpart.substr(1);
                        removeEOL = false;
                    }

                    if (textpart != "")
                        sectionManager.add(textpart, activeSection);

                    var token = tokens[i];

                    if (!token) continue; // (probably finished, so shortcut here when empty)

                    let extractStartIndex = 2;
                    let isTokenExpression = token[0] == '$';
                    let isStartServerTagToken = token.substr(0, 3) == "<$:";
                    let isEndServerTagToken = token.substr(0, 4) == "</$:" ? (extractStartIndex = 3, true) : false;

                    if (isTokenExpression || isStartServerTagToken || isEndServerTagToken) {
                        let expr = token.substring(extractStartIndex, token.length - 1).trimRight(); // (don't trim left: ${ /regex/ } is allowed, and ${/etc} is reserved for closing tokens)
                        let processExpr = false, outputExpr = true;
                        let value: string | Renderer = void 0;
                        let priority = 0; // (true when #include or #view is encountered so we can flag to have those rendered with a higher priority)
                        let isCommand = expr[0] == '#'; // (true for NON-element tags in the form "${#command}")
                        let isServerTag = expr[0] == ':'; // (true for "<$:tag>" or "</$:tag>" element tags; note: server tags are tread same as commands)

                        if (isCommand || isServerTag) {
                            // ... this is a special command ...
                            let cmdSplitIndex = expr.indexOf(' ');
                            let cmd = cmdSplitIndex >= 0 ? expr.substr(0, cmdSplitIndex).trim() : expr, _cmd = cmd; // ('_cmd' is a normalized command string)
                            let argStr = cmdSplitIndex >= 0 ? expr.substr(cmdSplitIndex).trim() : "";
                            //let args = argStr.split(':');

                            if (isServerTag) _cmd = '#' + cmd.substr(1); // (keep things simple and just convert this into a proper command)

                            try {
                                switch (_cmd) {
                                    case "#": expr = argStr; processExpr = true; outputExpr = false; removeEOL = true; break; // (process expression, but don't render the result)
                                    case "#base": // (maps a name to another path; any names starting with the mapped name is automatically expanded)
                                        let parts = argStr.split(/\s+/g);
                                        if (parts.length != 2)
                                            throw new DS.Exception(`#base expects 2 arguments: one for the name, and one for the path.`);
                                        let viewData = httpContext.viewData || new ViewData();
                                        let name = await _processExpression(httpContext, parts[0], viewData);
                                        let basePath = await _processExpression(httpContext, parts[1], viewData);
                                        httpContext.basePaths[name] = basePath;
                                        removeEOL = true;
                                        break;

                                    case "#layout":
                                        if (layoutViewName)
                                            throw new DS.Exception(`A layout was already specified.`);
                                        layoutViewName = argStr || "/layout"; // (default to the "layout" view when nothing else is specified)
                                        removeEOL = true;
                                        break;

                                    case "#section":
                                        // ... start creating renderers for a specified section ...
                                        activeSection = argStr;
                                        removeEOL = true;
                                        break;

                                    case "#render": {
                                        // ... request to load and render a section in the token's position ...
                                        let sectionNameToRender = argStr || SectionManager.CONTENT; // ("let" is important here, since it will be locked only to the next async function expression and not shared across all of them, like 'var' would)
                                        let optional = sectionNameToRender[sectionNameToRender.length - 1] == '?' ?
                                            (sectionNameToRender = sectionNameToRender.substr(0, sectionNameToRender.length - 1), true)
                                            : false;

                                        // (note: cannot check for sections yet, as child views have to complete first)

                                        value = (async (sectionNameToRender: string, optional: boolean) => { // (prevViewScope is the previous view scope at the time of this request, which should always be element or command content, even if empty)
                                            var value: string | Renderer;

                                            if (!sectionManager.hasSection(sectionNameToRender))
                                                if (optional) return "";
                                                else throw new DS.Exception(`There is no section defined with the name '${sectionNameToRender}'. You can append the '?' character to the name if the section is optional.`);

                                            var section = sectionManager.sections[sectionNameToRender];

                                            if (!section.currentViewScope)
                                                if (optional) return "";
                                                else throw new DS.Exception(`The section '${sectionNameToRender}' was already rendered at the current view scope level. You cannot render a section more than once at the same scope level.`);

                                            value = await section.currentViewScope.render();

                                            section.currentViewScope = null;

                                            return value;
                                        }).bind(null, sectionNameToRender, optional);

                                        if (sectionNameToRender == SectionManager.CONTENT)
                                            priority = Number.MAX_SAFE_INTEGER - 200; // (after the view and layout max priority, nested 'content' must be next)
                                        else
                                            priority = Number.MAX_SAFE_INTEGER - 300; // (after the view, layout, and nested priorities, all other rendered sections are handled in order)

                                        removeEOL = true;

                                        break;
                                    }

                                    case "#include": // (this means the same as '#view', except it inherits the same HttpContext object)
                                    case "#view": {

                                        let include = _cmd == "#include";
                                        let selfClosing = isServerTag && argStr[argStr.length - 1] == '/'; // (if true then the view token will not have a closing tag)
                                        if (selfClosing) argStr = argStr.substr(0, argStr.length - 1).trimRight(); // (remove the slash from args if self closing)

                                        if (isEndServerTagToken) {
                                            if (sectionManager.getSection(activeSection)?._viewScopes.length < 1)
                                                throw new DS.Exception("You have an extra close-view server tag (i.e. '</$:view>') that does not have a corresponding '<$:view ...>' tag.");
                                            sectionManager.pop(activeSection);
                                            if (argStr)
                                                throw new DS.Exception("The end server tag (i.e. '</$:view>') cannot contain any additional attributes or text.");
                                            break;
                                        }
                                        else sectionManager.push(new HttpContext(httpContext, include ? httpContext.viewData : void 0), activeSection); // (all commands and start tags should push the current view and prepare for nested content with a new context and view data; included views render as if in the current view scope)

                                        let viewPath: string, viewHttpContext = sectionManager.getSection(activeSection)?.currentViewScope.httpContext;

                                        // ... the first '|' character will split the view path from any expression ...

                                        if (isServerTag) {
                                            // ... process the 'argStr' as name=value attributes ...
                                            var attributes = argStr.match(/[^\t\n\f \/>"'=]*\s*=\s*(?:"[^"]*"|'[^']*')/g); // (https://stackoverflow.com/a/926136/1236397)
                                            for (let i = 0, n = attributes?.length ?? 0; i < n; ++i) {
                                                let attribute = attributes[i];
                                                let equalIndex = attribute.indexOf('='); // (we don't split in case the user has '=' in the value; just get the first '=' found)
                                                let name = "", value: string;
                                                if (equalIndex >= 0) {
                                                    name = attribute.substring(0, equalIndex).trim();
                                                    value = attribute.substring(equalIndex + 1).trim();
                                                    // ... trim any quotes off the value ...
                                                    let quote = value[0];
                                                    if (quote == '"' || quote == "'") {
                                                        let endQuote = value[value.length - 1];

                                                        if (quote != endQuote)
                                                            throw new DS.Exception(`Invalid attribute value: You started with a ${quote == "'" ? 'single' : 'double'} quote and ended with ${quote == "'" ? 'a single quote' : quote == '"' ? 'a double quote' : `'${endQuote}'`}.`);

                                                        value = value.substring(1, value.length - 1);
                                                    }
                                                } else name = attribute.trim(); // (allow setting names without values; i.e. 'readonly')

                                                // ... if the value is wrapped in braces '{}' then evaluate it (the name="{'{...}'}" format can work-around this if needed)...

                                                if (value && value[0] == '{' && value[value.length - 1] == '}') {
                                                    value = value.substring(1, value.length - 1).trim();
                                                    value = await _processExpression(httpContext, value, httpContext.viewData); // (note: here we use the view data of the parent view [this view], then the result is passed as an attribute value)
                                                }

                                                if (name[0] == '$') {
                                                    // ... this is a special parameter ...

                                                    if (name.substr(0, 6) == '$data-') {
                                                        // ... this is a view-bag (view data) setting ...
                                                        name = name.substr(6);
                                                        viewHttpContext.viewData[name] = value;
                                                    } else {
                                                        // ... this is a view/include parameter ...
                                                        switch (name) {
                                                            case '$path': viewPath = (value || '').trim(); break;
                                                            case '$': case '$expression': await _processExpression(viewHttpContext, value, viewHttpContext.viewData); break; // (this runs in the nested view context)
                                                            default: throw new DS.Exception(`The view data parameter '${name}' is not a supported parameter name. Please check for typos.`);
                                                        }
                                                    }
                                                } else
                                                    viewHttpContext.viewData["@"].attributes[name] = value;
                                            }
                                        } else {
                                            // ... process the 'argStr' as a regular view command expression token (i.e. not a server tag) ...
                                            cmdSplitIndex = argStr.indexOf('|');

                                            if (cmdSplitIndex >= 0) {
                                                viewPath = argStr.substr(0, cmdSplitIndex).trim();
                                                expr = argStr.substr(cmdSplitIndex + 1);
                                                await _processExpression(httpContext, expr, viewHttpContext.viewData);
                                            } else viewPath = argStr;
                                        }

                                        if (!viewPath)
                                            throw new DS.Exception("No view path was specified. For server tags, use '$path=\"path/to/view\". For inline tokens, the path should immediately follow the '#view' or '#include' commands (i.e. '${#view path/to/view | optional expressions}').");

                                        viewHttpContext.viewPath = DS.Path.combine(DS.Path.getPath(httpContext.finalViewPath), httpContext.expandViewPath(viewPath));
                                        viewHttpContext.viewData.content = sectionManager.getSectionViewScope(activeSection)?.getRenderer();
                                        // (every #include and #view will have a nested view scope for nested elements as the content, whether used or not, that the nested element can render if supported)

                                        value = ((_httpCtx: HttpContext) => {
                                            return new Promise<string>((res, rej) => {
                                                // ... request to load and render a view in the token's position ...
                                                _httpCtx.response.render(_httpCtx.finalViewPath, { context: _httpCtx }, (err, html) => {
                                                    if (err) return rej(err);
                                                    // ... this HTML is the parent template to this view that is resolved by now and must be returned ...
                                                    res(html);
                                                });
                                            });
                                        }).bind(null, viewHttpContext);

                                        priority = Number.MAX_SAFE_INTEGER - 100; // (make sure nested views and includes are always rendered first; '-100' is used to allow users to override if necessary; if and when supported)

                                        if (!isServerTag || selfClosing) // (only serer tags render content, so pop now if not)
                                            sectionManager.pop(activeSection);
                                        else {
                                            sectionManager.getSection(activeSection).previousViewScope.add(value, priority);
                                            value = void 0; // (written to the previous view scope, so clear in this pass)
                                        }

                                        break;
                                    }

                                    default: {
                                        if (_cmd[0] == '#')
                                            throw new DS.Exception(`The command invalid. Please check for typos. Also note that commands are case-sensitive, and usually all lowercase.`);
                                        // (else we will assume this is an expression and evaluate it; i.e. regex expression [because of '/'])
                                        processExpr = true;
                                    }
                                }
                            }
                            catch (ex) {
                                throw new DS.Exception(`Invalid token command or server tag '${cmd}' in token '${token}'.`, this, ex);
                            }
                        } else processExpr = true;

                        if (processExpr) {
                            value = await _processExpression(httpContext, expr, httpContext.viewData || new ViewData()); //DS.Utilities.dereferencePropertyPath(path, viewData, true);

                            if (!outputExpr)
                                value = void 0;

                            if (httpContext._redirectURL)
                                return httpContext.response.redirect(httpContext._redirectURL);
                        }

                        if (!isNullOrUndefined(value))
                            sectionManager.add(value, activeSection, priority);
                    }
                    else
                        sectionManager.add(token, activeSection); // (not a valid server token, so include this in the rendered output)
                }

                //? if (sectionManager.currentSection?._viewScopes.length > 1)
                //?     throw new DS.Exception("You have a missing view or include end token (i.e. '${/view}' or '${/include}').");

                let contentSection = sectionManager.sections[SectionManager.CONTENT];

                if (layoutViewName) {
                    // ... get arguments: view:section
                    let finalViewPath = layoutViewName[0] == '/' ? layoutViewName.substr(1) // (ignore absolute paths)
                        : DS.Path.combine(DS.Path.getPath(httpContext.finalViewPath), httpContext.expandViewPath(layoutViewName)); // (add relative layout path to the current view final path)
                    let layoutCtx = new HttpContext(httpContext, void 0, finalViewPath);
                    layoutCtx.isLayout = true;
                    layoutCtx.viewData.content = contentSection?.currentViewScope?.getRenderer();
                    httpContext.response.render(finalViewPath, { context: layoutCtx }, (err, html) => {
                        if (err) return callback(err);
                        // ... this HTML is the parent template to this view that is resolved by now and must be returned ...
                        contentSection.pop();
                        callback(null, html);
                    });
                }
                else {
                    if (contentSection)
                        contentSection.render().then(val => {
                            contentSection.pop(); // (undo the original push at the top when render started for this view so the parent caller scope is restored, if any)
                            callback(null, val);
                        }, err => {
                            callback(err);
                        });
                    else
                        callback(null, "");
                }
            }
            catch (ex) {
                const coderadius = 2, codeTrimLen = 80;
                let _i1 = i >= coderadius ? i - coderadius : 0, _i2 = i + coderadius < textParts.length ? i + coderadius : textParts.length - 1, s: string, htmlsegmentL = "", tokenSegment = "", htmlsegmentR = "";
                for (let _i = _i1; _i <= _i2; ++_i) {
                    s = textParts[_i] || "";
                    if (_i <= i) htmlsegmentL += s; else htmlsegmentR += s;
                    if (_i == i) htmlsegmentL += "[[ERROR]]";
                    s = tokens[_i] || "";
                    if (_i < i) htmlsegmentL += s; else if (_i == i) tokenSegment = s; else htmlsegmentR += s;
                    if (_i == i) htmlsegmentR += "[[/ERROR]]";
                }
                if (htmlsegmentL.length > codeTrimLen)
                    htmlsegmentL = htmlsegmentL.substr(-codeTrimLen);
                if (htmlsegmentR.length > codeTrimLen)
                    htmlsegmentR = htmlsegmentR.substr(0, codeTrimLen);

                let source = DS.IO.Response.fromError(`Error processing view '${filePath}' file contents. The error was here: \r\n"${htmlsegmentL + tokenSegment + htmlsegmentR} "`, ex, void 0, httpContext).setViewInfo(filePath);
                callback(DS.Exception.error('t.html.ts', source.message, source, ex));
            }
        })
    }
    catch (ex) {
        let source = DS.IO.Response.fromError(`Error processing view '${filePath}'.`, ex, void 0, httpContext).setViewInfo(filePath);
        callback(DS.Exception.error('t.html.ts', source.message, source, ex));
    }
}

export function apply(app: ReturnType<typeof import("express")>, viewsRootPath = viewsRoot) {
    // ... view engine setup ...
    app.engine('t.html', __express);
    viewsRoot = DS.Path.toAbsolute(viewsRootPath);
    app.set('views', viewsRoot); // specify the views directory
    app.set('view engine', 't.html') // register the template engine
}
