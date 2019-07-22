import fs = require('fs') // this engine requires the fs module
import { Request, Response } from 'express-serve-static-core';

export var viewsRootFolder = "views";
export var viewsRoot = "../" + viewsRootFolder;

export class HttpContext {
    /** The request object for the current request. */
    request: Request;
    /** The response object for the current request. */
    response: Response;
    /** The path to the view being rendered. */
    viewPath: string;
    /** Optional data for the view being rendered. */
    viewData?: any;
    /** An accumulation of named contexts while parsing a previous view. */
    sectionManager: SectionManager;

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
    }
}

export interface IHttpContext extends HttpContext { }

export interface Renderer { (): string | Promise<string> }

export class Section {
    renderers: (Renderer | string)[];

    constructor(public readonly manager: SectionManager, public readonly name: string) { }

    /** Adds a new renderer or static string to the list of items to render for this section. */
    add(value: Renderer | string) {
        if (this.renderers)
            this.renderers.push(value);
        else
            this.renderers = [value];
    }

    async render() {
        var html = "", value: ReturnType<Renderer> = "";
        if (this.renderers)
            for (var i = 0, n = this.renderers.length; i < n; ++i) {
                if (typeof this.renderers[i] == 'function') {
                    value = (<Renderer>this.renderers[i])();
                    if (value instanceof Promise)
                        value = await value;
                }
                else if (typeof this.renderers[i] == 'string')
                    value = <string>this.renderers[i];
                else
                    value = '' + this.renderers[i]; // (convert to string)
                html += value;
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
    add(value: Renderer | string, name?: string) {
        name = name || this.activeSection || SectionManager.defaultSectionName;
        var section: Section;
        if (!this.sections[name])
            this.sections[name] = section = new Section(this, name);
        else
            section = this.sections[name];
        section.add(value);
    }

    /** Returns true if the named section exist. */
    hasSection(name: string) { return this.sections && name in this.sections }
}

export function apply(app: ReturnType<typeof import("express")>, viewsRootPath = viewsRoot) {
    app.engine('t.html', function (filePath: string, httpContext: IHttpContext, callback: { (err: any, response?: any): void }) { // define the template engine
        fs.readFile(filePath, function (err, content) {
            if (err) return callback(err);

            // ... get any existing section manager, or create a new one ...
            var sectionManager = httpContext.sectionManager || (httpContext.sectionManager = new SectionManager());

            try {
                var html = content.toString();

                // ... replaced all tokens with the view data ...
                // (Note: It is very inefficient to pass around large HTML files in strings while iterating over it using RegExp.exec().
                //  It was determined that the fastest option is to use native match()/split() using regex instead to maintain consistent
                //  speed across the most popular browsers. The template parser does this as well.)

                var tokenRegex = /`(?:[^`]|\\`)*?`|\${.*?}/g;
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

                    sectionManager.add(textpart);

                    var token = tokens[i];

                    if (!token) continue; // (probably finished, so shortcut here when empty)

                    if (token[0] == '$') {
                        var expr = token.substring(2, token.length - 1);
                        var processExpr = false, outputExpr = true;
                        var value: string | Renderer = "";

                        if (expr[0] == '#') {
                            // ... this is a special command ...
                            let cmdSplitIndex = expr.indexOf(' ');
                            let cmd = cmdSplitIndex >= 0 ? expr.substr(0, cmdSplitIndex) : expr;
                            let argStr = cmdSplitIndex >= 0 ? expr.substr(cmdSplitIndex).trim() : "";
                            //let args = argStr.split(':');

                            switch (cmd) {
                                case "#": expr = argStr; processExpr = true; outputExpr = false; break;
                                case "#layout":
                                    if (layoutViewName)
                                        throw `Invalid token command '${cmd}': A layout was already specified.`;
                                    layoutViewName = argStr || "layout"; // (default to the "layout" view when nothing else is specified)
                                    removeEOL = true;
                                    break;
                                case "#section":
                                    // ... start creating renderers for a specified section ...
                                    sectionManager.activeSection = argStr;
                                    removeEOL = true;
                                    break;
                                case "#render": {
                                    // ... request to load and render a view in the token's position ...
                                    if (!httpContext.sectionManager)
                                        throw `Invalid token command '${cmd}': there are no sections defined.`;
                                    let sectionNameToRender = argStr || SectionManager.defaultSectionName; // ("let" is important here, since it will be locked only to the next async function expression and not shared across all of them, like 'var' would)
                                    if (!sectionManager.hasSection(sectionNameToRender))
                                        throw `Invalid token command '${cmd}': there is no section defined with the name '${sectionNameToRender}'.`;
                                    value = async () => { return await httpContext.sectionManager.sections[sectionNameToRender].render(); };
                                    break;
                                }
                                case "#view": {
                                    let viewPath = argStr;
                                    value = () => {
                                        return new Promise<string>((res, rej) => {
                                            // ... request to load and render a view in the token's position ...
                                            var _viewPath = DS.Path.combine(DS.Path.getPath(httpContext.viewPath), viewPath);
                                            httpContext.response.render(_viewPath, httpContext, (err, html) => {
                                                if (err) return rej(err);
                                                // ... this HTML is the parent template to this view that is resolved by now and must be returned ...
                                                res(html);
                                            });
                                        });
                                    };
                                    break;
                                }
                                default: throw `Unknown token command '${cmd[0]}' in token '${token}'.`
                            }
                        } else processExpr = true;

                        if (processExpr) {
                            value = DS.safeEval(expr.replace(/(^|[^a-z0-9_$.])\./gmi, '$1p0.'), httpContext.viewData || {}); //DS.Utilities.dereferencePropertyPath(path, viewData, true);

                            if (!outputExpr)
                                value = void 0;
                            else if (value !== null && value !== void 0 && typeof value != 'string')
                                value = '' + value;
                        }

                        if (value !== void 0 && value !== null)
                            sectionManager.add(value);
                    }
                    else sectionManager.add(token); // (not a valid server token, so include this in the rendered output)
                }

                // TODO:
                // 1. sections should be stored as async functions that can be rendered as a later time if and when needed.
                // 2. Iterate over the render items and combine sections.

                async function render() {
                }

                if (layoutViewName) {
                    // ... get arguments: view:section
                    var viewPath = DS.Path.combine(DS.Path.getPath(httpContext.viewPath), layoutViewName);
                    httpContext.response.render(viewPath, httpContext, (err, html) => {
                        if (err) return callback(err);
                        // ... this HTML is the parent template to this view that is resolved by now and must be returned ...
                        callback(null, html);
                    });
                }
                else {
                    let contentSection = sectionManager.sections[SectionManager.defaultSectionName];
                    if (contentSection)
                        contentSection.render().then(val => { callback(null, val); }, err => { callback(err); });
                    else
                        callback(null, "");
                }
            }
            catch (ex) {
                return callback(DS.IO.Response.fromError(`Error processing view '${filePath}': `, ex));
            }
        })
    })

    // ... view engine setup ...

    viewsRoot = viewsRootPath; // (keep track of any changes)

    app.set('views', DS.Path.combine(__dirname, viewsRoot)); // specify the views directory
    app.set('view engine', 't.html') // register the template engine
}
