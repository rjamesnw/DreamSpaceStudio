import fs = require('fs') // this engine requires the fs module
import { Request, Response } from 'express-serve-static-core';

/** The root of the views folder. By default this is 'views' (relative from 'DS.webRoot'). */
export var viewsRoot = "views";

export class HttpContext {
    /** The request object for the current request. */
    request: Request;
    /** The response object for the current request. */
    response: Response;
    /** The path to the view being rendered. */
    viewPath?: string;
    /** Optional data for the view being rendered. */
    viewData?: any;
    /** An accumulation of named contexts while parsing a previous view. */
    sectionManager?: SectionManager;

    /** Constructs a new HTTP context using another existing context.
     * @param viewData The data to use for this view.  If not specified, then the view data on the context will be used instead.
     * @param viewPath The relative path and view name to the view being rendered.
     */
    constructor(httpContext: IHttpContext, viewData?: any, viewPath?: string);
    /** Constructs a new HTTP context.
     * @param request The request object for the current request.
     * @param response The response object for the current request.
     * @param viewData The data to use for this view.  If not specified, then the view data on the context will be used instead.
     * @param viewPath The relative path and view name to the view being rendered.
     */
    constructor(request: Request, response: Response, viewData?: any, viewPath?: string);
    constructor(requestOrCtx: Request & IHttpContext, responseOrVewData?: Response | any, viewDataOrPath?: any | string, viewPath?: string) {
        var isHttpCtx = !!(requestOrCtx.request || requestOrCtx.response || 'viewData' in requestOrCtx);
        this.request = isHttpCtx ? requestOrCtx.request : requestOrCtx;
        this.response = isHttpCtx ? requestOrCtx.response : responseOrVewData;
        this.viewData = isHttpCtx ? responseOrVewData || requestOrCtx.viewData : viewDataOrPath;
        this.viewPath = isHttpCtx ? viewDataOrPath || requestOrCtx.viewPath : viewPath;
        if (isHttpCtx && requestOrCtx.sectionManager)
            this.sectionManager = requestOrCtx.sectionManager;
    }
}

export interface IHttpContext extends HttpContext { }

export interface Renderer { (): string | Promise<string> }

var evalExpr = new Function("$", "expr", "return eval(expr);");

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

    /** Returns true if the named section exist. */
    hasSection(name: string) { return this.sections && name in this.sections }
}

function _processExpression(expr: string, dataContext?: object): any {
    try {
        var compiledExpression = expr.replace(/({){|(})}/g, "$1$2").replace(/(^|[^a-z0-9_$.)'"`\/])\./gmi, '$1$.');
        var value = evalExpr(dataContext || {}, compiledExpression); //DS.Utilities.dereferencePropertyPath(path, viewData, true);

        if (value !== null && value !== void 0 && typeof value != 'string')
            value = '' + value;

        return value;
    } catch (ex) {
        throw new DS.Exception(`Failed to evaluate expression '${expr}' rendered as '${compiledExpression}'.`, this, ex);
    }
}

/** Used by express when auto-requiring middleware when rendering templates.
 * By default, Express will 'require()' the engine based on the file extension; for example, "app.engine('ext', require('ext').__express)"
 * for "name.ext".
 * Note: Using this method means, however, you may also have to set up the view folder. It is recommended to call 'apply(expressApp)'
 * to have the defaults configured for most cases.
 */
export var __express = function (filePath: string, httpContext: IHttpContext, callback: { (err: any, response?: any): void }) { // define the template engine
    try {
        if (!httpContext.request)
            throw new DS.Exception("'httpContext.request' (of module type 'express-serve-static-core'.request) is required.");
        if (!httpContext.response)
            throw new DS.Exception("'httpContext.response' (of module type 'express-serve-static-core'.response) is required.");

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

                var tokenRegex = /`(?:[^`]|\\`)*?`|\${(?:{{|}}|[^}])*}/g;
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

                    if (token[0] == '$') {
                        let expr = token.substring(2, token.length - 1).trimRight(); // (don't trim left: ${ /regex/ } is allowed, and ${/etc} is reserved for closing tokens)
                        let processExpr = false, outputExpr = true;
                        let value: string | Renderer = void 0;
                        let priority = 0; // (true when #include or #view is encountered so we can flag to have those rendered with a higher priority)

                        if (expr[0] == '#' || expr[0] == '/') {
                            // ... this is a special command ...
                            let cmdSplitIndex = expr.indexOf(' ');
                            let cmd = cmdSplitIndex >= 0 ? expr.substr(0, cmdSplitIndex).trim() : expr;
                            let argStr = cmdSplitIndex >= 0 ? expr.substr(cmdSplitIndex).trim() : "";
                            //let args = argStr.split(':');

                            try {
                                switch (cmd) {
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
                                        priority = 10;
                                        removeEOL = true;
                                        break;
                                    }
                                    case "#include": // (this means the same as '#view', except it inherits the same HttpContext object)
                                    case "#view": {
                                        // ... the first '|' character will split the view path from any expression ...

                                        let include = cmd == "#include";
                                        let selfClosing = argStr[argStr.length - 1] == '/'; // (if true then the view token will not have a closing token)
                                        if (selfClosing) argStr = argStr.substr(0, argStr.length - 1).trimRight();

                                        let viewPath: string, viewHttpContext = new HttpContext(httpContext, include ? void 0 : {});

                                        if (!include)
                                            viewHttpContext.sectionManager = new SectionManager(); // (this will cause a new section manager to be created [not used with '#include', which does adopt the same manager])

                                        if (!selfClosing) {
                                            viewScopes.push(viewScope);
                                            viewScope = { httpContext: viewHttpContext, childContent: null };
                                            // (all operations on the next loop pass will affect only this nested view)
                                        }

                                        cmdSplitIndex = argStr.indexOf('|');

                                        if (cmdSplitIndex >= 0) {
                                            viewPath = argStr.substr(0, cmdSplitIndex);
                                            expr = argStr.substr(cmdSplitIndex + 1);
                                            viewHttpContext.viewData = {};
                                            _processExpression(expr, viewHttpContext.viewData);
                                        } else viewPath = argStr;

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
                                        break;
                                    }
                                    case "/view": {
                                        if (viewScopes.length < 1)
                                            throw new DS.Exception("You have an extra close-view token (i.e. '${/view}') that does not have a corresponding '${#view ...}' token.");
                                        viewScope = viewScopes.pop();
                                        break;
                                    }
                                    default: {
                                        if (cmd[0] == '#')
                                            throw new DS.Exception(`The command invalid. Please check for typos. Also note that commands are case-sensitive, and usually all lowercase.`);
                                        // (else we will assume this is an expression and evaluate it; i.e. regex expression [because of '/'])
                                        processExpr = true;
                                    }
                                }
                            }
                            catch (ex) {
                                throw new DS.Exception(`Invalid token command '${cmd}' in token '${token}'.`, this, ex);
                            }
                        } else processExpr = true;

                        if (processExpr) {
                            value = _processExpression(expr, httpContext.viewData || {}); //DS.Utilities.dereferencePropertyPath(path, viewData, true);

                            if (!outputExpr)
                                value = void 0;
                        }

                        if (value !== void 0 && value !== null)
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
    viewsRoot = DS.Path.isAbsolute(viewsRootPath[0]) ? viewsRootPath : DS.Path.combine(DS.webRoot, viewsRootPath);
    app.set('views', viewsRoot); // specify the views directory
    app.set('view engine', 't.html') // register the template engine
}
