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
    sections: { [name: string]: string };

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
    constructor(requestOrCtx: Request & IHttpContext, responseOrVewPath?: Response | any, viewData?: any, viewPathOrData?: string | any) {
        var isHttpCtx = !!(requestOrCtx.request || requestOrCtx.response || 'viewData' in requestOrCtx);
        this.request = isHttpCtx ? requestOrCtx.request : requestOrCtx;
        this.response = isHttpCtx ? requestOrCtx.response : responseOrVewPath;
        this.viewPath = isHttpCtx ? responseOrVewPath || requestOrCtx.viewPath : responseOrVewPath;
        this.viewData = isHttpCtx ? viewPathOrData || requestOrCtx.viewData : viewData;
    }
}

export interface IHttpContext extends HttpContext { }

export interface Renderer { (): Promise<string> }

export function apply(app: ReturnType<typeof import("express")>, viewsRootPath = viewsRoot) {
    app.engine('t.html', function (filePath: string, httpContext: IHttpContext, callback: { (err: any, response?: any): void }) { // define the template engine
        fs.readFile(filePath, function (err, content) {
            if (err) return callback(err);

            //var renders: { sectionName: string; renderer: Promise<string> | string }[] = []; // (this will hold an array of strings or async operations use to render the view asynchronously - text parts are set directly as strings)
            var sections: { [name: string]: (Renderer | string)[] } = {}; // (keeps track of any sections defined)
            const defaultSectionName = 'content';
            function addToSection(name: string, value: Renderer | string) { name = name || defaultSectionName; sections[name] ? sections[name].push(value) : sections[name] = [value]; }
            var sectionName;

            try {
                var html = content.toString();

                // ... replaced all tokens with the view data ...
                // (Note: It is very inefficient to pass around large HTML files in strings while iterating over it using RegExp.exec().
                //  It was determined that the fastest option is to use native match()/split() using regex instead to maintain consistent
                //  speed across the most popular browsers. The template parser does this as well.)

                var tokenRegex = /`([^`]|\\`)*?`|\${.*?}/g;
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

                    addToSection(sectionName, textpart);

                    var token = tokens[i];

                    if (!token) continue; // (probably finished, so shortcut here when empty)

                    if (token[0] == '$') {
                        var expr = token.substring(2, token.length - 1);
                        var processExpr = true, outputExpr = true;
                        var value: string | Renderer = "";

                        if (expr[0] == '#') {
                            processExpr = false;

                            // ... this is a special command ...
                            var cmd = expr.split(/\s+/g);
                            var argStr = cmd[1] || "";
                            //var args = argStr.split(':');
                            switch (cmd[0]) {
                                case "#": expr = cmd[1]; processExpr = true; outputExpr = false; break;
                                case "#layout": {
                                    if (layoutViewName)
                                        throw `Invalid token command '${cmd}': A layout was already specified.`;
                                    layoutViewName = cmd[1];
                                    removeEOL = true;
                                }
                                case "#section": {
                                    // ... start creating renderers for a specified section ...
                                    sectionName = cmd[1];
                                    removeEOL = true;
                                }
                                case "#render": {
                                    // ... request to load and render a view in the token's position ...
                                    let sectionNameToRender = cmd[1] || defaultSectionName;
                                    if (!httpContext.sections)
                                        throw `Invalid token command '${cmd}': there are no sections defined.`;
                                    if (!(sectionNameToRender in httpContext.sections))
                                        throw `Invalid token command '${cmd}': there is no section defined with the name '${sectionNameToRender}'.`;
                                    value = httpContext.sections[sectionNameToRender] || "";
                                }
                                case "#view": {
                                    value = async () => {
                                        return new Promise<string>((res, rej) => {
                                            // ... request to load and render a view in the token's position ...
                                            // ... get arguments: view:section
                                            var viewPath = DS.Path.combine(DS.Path.getPath(httpContext.viewPath), layoutViewName);
                                            httpContext.response.render(viewPath, httpContext, (err, html) => {
                                                if (err) return rej(err);
                                                // ... this HTML is the parent template to this view that is resolved by now and must be returned ...
                                                res(html);
                                            }); res
                                        });
                                    };

                                }
                                default: throw `Unknown token command '${cmd[0]}' in token '${token}'.`
                            }
                        }

                        if (processExpr) {
                            value = DS.safeEval(expr.replace(/(^|[^a-z0-9_$.])\./gmi, '$1p0.'), httpContext.viewData || {}); //DS.Utilities.dereferencePropertyPath(path, viewData, true);

                            if (!outputExpr)
                                value = void 0;
                            else if (value !== null && value !== void 0 && typeof value != 'string')
                                value = '' + value;
                        }

                        if (value !== void 0 && value !== null)
                            addToSection(sectionName, value);
                    }
                    else addToSection(sectionName, token); // (not a valid server token, so include this in the rendered output)
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
                else callback(null, sections[sectionNameStack[0]]);
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
