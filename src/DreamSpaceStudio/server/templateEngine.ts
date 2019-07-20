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

export function apply(app: ReturnType<typeof import("express")>, viewsRootPath = viewsRoot) {
    app.engine('t.html', function (filePath: string, httpContext: IHttpContext, callback: { (err: any, response?: any): void }) { // define the template engine
        fs.readFile(filePath, function (err, content) {
            if (err) return callback(err);

            var sections: { [name: string]: string } = {}; // (keeps track of any sections defined)
            var sectionNameStack = ['content'];

            try {
                var html = content.toString();

                // ... replaced all tokens with the view data ...
                // (Note: It is very inefficient to pass around large HTML files in strings while iterating over it using RegExp.exec().
                //  It was determined that the fastest option is to use native match()/split() using regex instead to maintain consistent
                //  speed across the most popular browsers. The template parser does this as well.)

                var tokenRegex = /`[^`]*?`|\${.*?}/g;
                var textParts = html.split(tokenRegex);
                var tokens = html.match(tokenRegex);
                tokens.push(""); // (each iteration will store text+token, and there will always be one less token compared to text parts)
                var lastIndex = 0;

                // ... if we found some tokens to process, iterate over and process them ...

                for (var i = 0, n = textParts.length; i < n; ++i) {

                    var sectionName = sectionNameStack[sectionNameStack.length - 1];
                    sections[sectionName] += textParts[i];

                    var token = tokens[i];

                    if (!token) continue; // (probably finished, so shortcut here when empty)

                    if (token[0] == '$') {
                        var expr = token.substring(2, token.length - 1);

                        if (expr[0] == '#') {
                            // ... this is a special command ...
                            var cmd = expr.split(/\s+/g);
                            var argStr = cmd[1] || "";
                            var args = argStr.split(':');
                            switch (cmd[0]) {
                                case "#layout": {
                                    // ... get arguments: view:section
                                    if (args.length < 2) throw `Invalid token command '${cmd}': 2 arguments were expected (view_name:section_name).`;
                                    var viewName = args[0];
                                    var viewPath = DS.Path.combine(DS.Path.getPath(httpContext.viewPath), viewName);
                                    httpContext.response.render(viewPath, httpContext, (err, html) => {
                                        if (err) return callback(err);
                                        // ... this HTML is the parent template to this view that is resolved by now and must be returned ...
                                        callback(null, html);
                                    });
                                }
                                case "#section": {
                                    // ... get arguments: view:section
                                    if (args.length < 2) throw `Invalid token command '${cmd}': 2 arguments were expected (view_name:section_name).`;
                                    sectionNameStack.push(args[0]);
                                }
                                case "#view": {
                                }
                                default: throw `Unknown token command '${args[0]}' in token '${expr}'.`
                            }
                        }
                        else {
                            var value = DS.safeEval(expr.replace(/(^|[^a-z0-9_$.])\./gmi, '$1p0.'), httpContext.viewData || {}); //DS.Utilities.dereferencePropertyPath(path, viewData, true);
                            if (value === null || value === void 0)
                                value = "";
                            else
                                value = '' + value;

                            sections[sectionName] += value;
                        }
                    }
                    else sections[sectionName] += token; // (not a valid server token, so include this in the rendered output)
                }
            }
            catch (ex) {
                return callback(DS.IO.Response.fromError(`Error processing view '${filePath}': `, ex));
            }

            return callback(null, sections[sectionNameStack[0]]);
        })
    })

    // ... view engine setup ...

    viewsRoot = viewsRootPath; // (keep track of any changes)

    app.set('views', DS.Path.combine(__dirname, viewsRoot)); // specify the views directory
    app.set('view engine', 't.html') // register the template engine
}
