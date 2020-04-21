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
    var attributesObject: IViewAttributeFunction = <any>function (p1: any, p2: any, p3: any) {
        var s = "", value: any;
        if (typeof p1 == 'string') {
            let attrName: string = p1;
            if (!attrName) throw new DS.Exception("An attribute name is required.");
            value = attributes[attrName];
            let p2Defined = !isNullOrUndefined(p2);
            let p3Defined = !isNullOrUndefined(p3);
            if (p2Defined || p3Defined) {
                if (!isNullOrUndefined(p2))
                    s = DS.StringUtils.append(DS.nud(p2, ''), DS.nud(value, ''), ' ');
                else
                    s = '' + value;
                if (!isNullOrUndefined(p3))
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
            // ... render the name=value attributes ...
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
    /** The path to the view being rendered. */
    viewPath?: string;
    /** Optional data for the view being rendered. */
    viewData?: ViewData;
    /** An accumulation of named contexts while parsing a previous view. */
    sectionManager?: SectionManager;

    /** Constructs a new HTTP context using another existing context.
     * @param viewData The data to use for this view.  If not specified, then the view data on the context will be used instead.
     * @param viewBasePath The relative path to the view being rendered.  This will set a new ROOT path for the view to find other related content (could be useful for theme development)
     * Note: This does not change where the initial view is found, only any included views.
     */
    constructor(httpContext: IHttpContext, viewData?: ViewData, viewBasePath?: string);
    /** Constructs a new HTTP context.
     * @param request The request object for the current request.
     * @param response The response object for the current request.
     * @param viewData The data to use for this view.  If not specified, then the view data on the context will be used instead.
     * @param viewBasePath The relative path to the view being rendered.  This will set a new ROOT path for the view to find other related content (could be useful for theme development)
     * Note: This does not change where the initial view is found, only any included views.
     */
    constructor(request: Request, response: Response, viewData?: ViewData, viewBasePath?: string);
    constructor(requestOrCtx: Request & IHttpContext, responseOrVewData?: Response | any, viewDataOrBasePath?: any | string, viewBasePath?: string) {
        var isHttpCtx = !!(requestOrCtx.request || requestOrCtx.response || 'viewData' in requestOrCtx);
        this.request = isHttpCtx ? requestOrCtx.request : requestOrCtx;
        this.response = isHttpCtx ? requestOrCtx.response : responseOrVewData;
        this.viewData = (isHttpCtx ? responseOrVewData || requestOrCtx.viewData : viewDataOrBasePath) || new ViewData();
        this.viewPath = isHttpCtx ? viewDataOrBasePath && DS.Path.combine(viewDataOrBasePath, '/') || requestOrCtx.viewPath : viewBasePath && DS.Path.combine(viewBasePath, '/');
        if (isHttpCtx && requestOrCtx.sectionManager)
            this.sectionManager = requestOrCtx.sectionManager;
    }
}

export interface IHttpContext extends HttpContext { }

export interface Renderer { (): string | Promise<string> }

var evalExpr = new Function("$", "expr", "httpContext", "var ctx = httpContext; return eval(expr);");

export class Section {
    renderers: { index: number, renderer: (Renderer | string), priority?: number }[]; // (index is used to maintain the correct insert order when combining the final rendered outputs)

    constructor(public readonly manager: SectionManager, public readonly name: string) { }

    /** Adds a new renderer or static string to the list of items to render for this section. */
    add(value: Renderer | string, priority = 0) {
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
}

export class SectionManager {
    static readonly defaultSectionName = "content";
    readonly sections: { [name: string]: Section; } = {};
    activeSection: string;

    /** Adds a new renderer or static string to the list of items to render for the specified section.
     * If a section does not exist then it is created first.
     */
    add(value: Renderer | string, name?: string, priority = 0) {
        name = name || this.activeSection || SectionManager.defaultSectionName;
        var section: Section;
        if (!this.sections[name])
            this.sections[name] = section = new Section(this, name);
        else
            section = this.sections[name];
        section.add(value, priority);
    }

    /** Remove and return a section by name. If not found then the request is ignored. */
    remove(name: string) {
        var section = null;
        if (this.sections)
            (section = this.sections[name], this.sections[name] = void 0);
        return section;
    }

    /** Returns true if the named section exists. */
    hasSection(name: string) { return this.sections && name in this.sections }
}

function _processExpression(httpContext: IHttpContext, expr: string, dataContext?: object): any {
    try {
        var compiledExpression = expr.replace(/({){|(})}/g, "$1$2").replace(/\[@]\./g, "$['@'].attributes.").replace(/\[@]\(/g, "$['@'](")
            .replace(/(\[\[[^\]]*]]|'(?:\\'|[^'])*'|"(?:\\"|[^"])*")|(^|[^a-z0-9_$.)[\]'"`\/\\])(\.|\[(?!\[))/gmi,
                function (match, p1, p2, p3, offset: number, src: string) {
                    return p1 ? p1 : p2 + '$' + p3; // (when p1 exists it is a string to be skipped (or special double square bracket token ([[...]]), otherwise it is valid view data property reference)
                });
        var value = evalExpr(dataContext || {}, compiledExpression, httpContext); //DS.Utilities.dereferencePropertyPath(path, viewData, true);

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
export var __express = function (this: IExpressViewContext, filePath: string, httpContext: IHttpContext, callback: { (err: any, response?: any): void }) { // define the template engine
    try {
        if (!httpContext.request)
            throw new DS.Exception("'httpContext.request' (of module type 'express-serve-static-core'.request) is required. If rendering a view, it is recommended to create and pass a 'HttpContext' object instance.");
        if (!httpContext.response)
            throw new DS.Exception("'httpContext.response' (of module type 'express-serve-static-core'.response) is required. If rendering a view, it is recommended to create and pass a 'HttpContext' object instance.");

        // ... update the views path if not set ...

        //var fileDir = DS.Path.getPath(filePath);

        if (!httpContext.viewPath)
            httpContext.viewPath = this.name;

        //x var viewsRootPath = viewsRoot;
        //x if (!httpContext.viewPath && filePath.toLowerCase().indexOf(viewsRootPath.toLowerCase()) == 0)
        //x    httpContext.viewPath = filePath.substr(viewsRootPath.length + 1);

        fs.readFile(filePath, function (err, fileContent) {
            if (err) return callback(err);

            // ... get any existing section manager, or create a new one ...
            let sectionManager = httpContext.sectionManager || (httpContext.sectionManager = new SectionManager());
            sectionManager.activeSection = void 0;
            // ... get the content from a previous processed view and remove it; the current view will generate new content ...
            let viewScope = {
                httpContext,
                childContent: sectionManager.remove(SectionManager.defaultSectionName) // (if and when requested, the child content will be available for this view only)
            };
            let viewScopes: typeof viewScope[] = [];

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
                    httpContext = viewScope.httpContext;
                    sectionManager = httpContext.sectionManager;

                    var textpart = textParts[i];
                    if (removeEOL) {
                        if (textpart.substr(0, 2) == '\r\n')
                            textpart = textpart.substr(2);
                        else if (textpart[0] == '\n' || textpart[0] == '\r')
                            textpart = textpart.substr(1);
                        removeEOL = false;
                    }

                    if (textpart != "")
                        sectionManager.add(textpart);

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
                        let isCommand = expr[0] == '#';
                        let isServerTag = expr[0] == ':';

                        if (isCommand || isServerTag) {
                            // ... this is a special command ...
                            let cmdSplitIndex = expr.indexOf(' ');
                            let cmd = cmdSplitIndex >= 0 ? expr.substr(0, cmdSplitIndex).trim() : expr, _cmd = cmd; // ('_cmd' is a normalized command string)
                            let argStr = cmdSplitIndex >= 0 ? expr.substr(cmdSplitIndex).trim() : "";
                            //let args = argStr.split(':');

                            if (isServerTag) _cmd = '#' + cmd.substr(1); // (keep things simple and just convert this into a proper command)

                            try {
                                switch (_cmd) {
                                    case "#": expr = argStr; processExpr = true; outputExpr = false; removeEOL = true; break;
                                    case "#layout":
                                        if (layoutViewName)
                                            throw new DS.Exception(`A layout was already specified.`);
                                        layoutViewName = argStr || "/layout"; // (default to the "layout" view when nothing else is specified)
                                        removeEOL = true;
                                        break;
                                    case "#section":
                                        // ... start creating renderers for a specified section ...
                                        sectionManager.activeSection = argStr;
                                        removeEOL = true;
                                        break;
                                    case "#render": {
                                        // ... request to load and render a section in the token's position ...
                                        let sectionNameToRender = argStr || SectionManager.defaultSectionName; // ("let" is important here, since it will be locked only to the next async function expression and not shared across all of them, like 'var' would)
                                        let optional = sectionNameToRender[sectionNameToRender.length - 1] == '?' ?
                                            (sectionNameToRender = sectionNameToRender.substr(0, sectionNameToRender.length - 1), true)
                                            : false;

                                        let _viewScope = viewScope;

                                        value = async () => {
                                            var value: string | Renderer;

                                            if (!_viewScope.httpContext.sectionManager)
                                                if (optional) return "";
                                                else throw new DS.Exception(`There are no sections defined.`);
                                            if (sectionNameToRender == SectionManager.defaultSectionName) {
                                                if (!_viewScope.childContent)
                                                    if (optional) return "";
                                                    else throw new DS.Exception(`The section ''${sectionNameToRender} does not exist or was already rendered.`);
                                                value = await _viewScope.childContent.render();
                                                _viewScope.childContent = null; // (make sure the content is only output once)
                                            } else {
                                                if (!sectionManager.hasSection(sectionNameToRender))
                                                    if (optional) return "";
                                                    else throw new DS.Exception(`There is no section defined with the name '${sectionNameToRender}'. You can append the '?' character to the name if the section is optional.`);
                                                var section = _viewScope.httpContext.sectionManager.sections[sectionNameToRender];
                                                value = await section.render();
                                            }
                                            return value;
                                        };

                                        if (sectionNameToRender == SectionManager.defaultSectionName)
                                            priority = Number.MAX_SAFE_INTEGER - 200; // (after the view and layout max priority, nested 'content' must be next)
                                        else
                                            priority = Number.MAX_SAFE_INTEGER - 300; // (after the view, layout, and nested priorities, all other rendered sections are handled in order)

                                        removeEOL = true;

                                        break;
                                    }
                                    case "#include": // (this means the same as '#view', except it inherits the same HttpContext object)
                                    case "#view": {
                                        if (isEndServerTagToken) {
                                            if (viewScopes.length < 1)
                                                throw new DS.Exception("You have an extra close-view server tag (i.e. '</$:view>') that does not have a corresponding '<$:view ...>' tag.");
                                            viewScope = viewScopes.pop();
                                            if (argStr)
                                                throw new DS.Exception("The end server tag (i.e. '</$:view>') cannot contain any additional attributes or text.");
                                            break;
                                        }

                                        let include = _cmd == "#include";
                                        let selfClosing = isServerTag && argStr[argStr.length - 1] == '/'; // (if true then the view token will not have a closing tag)
                                        if (selfClosing) argStr = argStr.substr(0, argStr.length - 1).trimRight();

                                        let viewPath: string, viewHttpContext = new HttpContext(httpContext, include ? void 0 : new ViewData());

                                        if (!include)
                                            viewHttpContext.sectionManager = new SectionManager(); // (this will cause a new section manager to be created [not used with '#include', which does adopt the same manager])

                                        if (isServerTag && !selfClosing) {
                                            viewScopes.push(viewScope);
                                            viewScope = { httpContext: viewHttpContext, childContent: null };
                                            // (all operations on the next loop pass will affect only this nested view)
                                        }

                                        // ... the first '|' character will split the view path from any expression ...

                                        if (isServerTag) {
                                            // ... process the 'argStr' as name=value attributes ...
                                            var attributes = argStr.match(/[^\t\n\f \/>"'=]*\s*=\s*(?:"[^"]*"|'[^']*')/g); // (https://stackoverflow.com/a/926136/1236397)
                                            for (let i = 0, n = attributes.length; i < n; ++i) {
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
                                                    value = _processExpression(httpContext, value, httpContext.viewData); // (note: here we use the view data of the parent view [this view], then the result is passed as an attribute value)
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
                                                            case '$': case '$expression': _processExpression(viewHttpContext, value, viewHttpContext.viewData); break; // (this runs in the nested view context)
                                                            default: throw new DS.Exception(`The view data parameter '${name}' is not a supported parameter name. Please check for typos.`);
                                                        }
                                                    }
                                                } else
                                                    viewHttpContext.viewData["@"].attributes[name] = value;
                                            }
                                        } else {
                                            // ... process the 'argStr' as a regular view expression token ...
                                            cmdSplitIndex = argStr.indexOf('|');

                                            if (cmdSplitIndex >= 0) {
                                                viewPath = argStr.substr(0, cmdSplitIndex).trim();
                                                expr = argStr.substr(cmdSplitIndex + 1);
                                                _processExpression(httpContext, expr, viewHttpContext.viewData);
                                            } else viewPath = argStr;
                                        }

                                        if (!viewPath)
                                            throw new DS.Exception("No view path was specified. For server tags, use '$path=\"path/to/view\". For inline tokens, the path should immediately follow the '#view' or '#include' commands (i.e. '${#view path/to/view | optional expressions}').");

                                        viewHttpContext.viewPath = DS.Path.combine(DS.Path.getPath(httpContext.viewPath), viewPath);

                                        let _viewScope = viewScope;

                                        value = () => {
                                            return new Promise<string>((res, rej) => {
                                                // ... request to load and render a view in the token's position ...
                                                _viewScope.httpContext.response.render(viewHttpContext.viewPath, viewHttpContext, (err, html) => {
                                                    if (err) return rej(err);
                                                    // ... this HTML is the parent template to this view that is resolved by now and must be returned ...
                                                    res(html);
                                                });
                                            });
                                        };

                                        priority = Number.MAX_SAFE_INTEGER - 100; // (make sure nested views and includes are always rendered first; '-100' is used to allow the user to override if necessary; if and when supported)

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
                            value = _processExpression(httpContext, expr, httpContext.viewData || new ViewData()); //DS.Utilities.dereferencePropertyPath(path, viewData, true);

                            if (!outputExpr)
                                value = void 0;
                        }

                        if (!isNullOrUndefined(value))
                            sectionManager.add(value, void 0, priority);
                    }
                    else
                        sectionManager.add(token); // (not a valid server token, so include this in the rendered output)
                }

                if (viewScopes.length > 0)
                    throw new DS.Exception("You have a missing close-view token (i.e. '${/view}').");

                if (layoutViewName) {
                    // ... get arguments: view:section
                    let viewPath = layoutViewName[0] == '/' ? layoutViewName.substr(1) : DS.Path.combine(DS.Path.getPath(httpContext.viewPath), layoutViewName);
                    httpContext.response.render(viewPath, new HttpContext(httpContext, void 0, viewPath), (err, html) => {
                        if (err) return callback(err);
                        // ... this HTML is the parent template to this view that is resolved by now and must be returned ...
                        callback(null, html);
                    });
                }
                else {
                    let contentSection = sectionManager.sections[SectionManager.defaultSectionName];
                    if (contentSection)
                        contentSection.render().then(val => {
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
                callback(DS.IO.Response.fromError(`Error processing view '${filePath}' file contents. The error was here: \r\n"${htmlsegmentL + tokenSegment + htmlsegmentR} "`, ex, void 0, httpContext).setViewInfo(filePath));
            }
        })
    }
    catch (ex) {
        callback(DS.IO.Response.fromError(`Error processing view '${filePath}'.`, ex, void 0, httpContext).setViewInfo(filePath));
    }
}

export function apply(app: ReturnType<typeof import("express")>, viewsRootPath = viewsRoot) {
    // ... view engine setup ...
    app.engine('t.html', __express);
    viewsRoot = DS.Path.toAbsolute(viewsRootPath);
    app.set('views', viewsRoot); // specify the views directory
    app.set('view engine', 't.html') // register the template engine
}
