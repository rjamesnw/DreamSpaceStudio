"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs"); // this engine requires the fs module
exports.viewsRootFolder = "views";
exports.viewsRoot = "../" + exports.viewsRootFolder;
class HttpContext {
    constructor(requestOrCtx, responseOrVewPath, viewData, viewPathOrData) {
        var isHttpCtx = !!(requestOrCtx.request || requestOrCtx.response || 'viewData' in requestOrCtx);
        this.request = isHttpCtx ? requestOrCtx.request : requestOrCtx;
        this.response = isHttpCtx ? requestOrCtx.response : responseOrVewPath;
        this.viewPath = isHttpCtx ? responseOrVewPath || requestOrCtx.viewPath : responseOrVewPath;
        this.viewData = isHttpCtx ? viewPathOrData || requestOrCtx.viewData : viewData;
    }
}
exports.HttpContext = HttpContext;
function apply(app, viewsRootPath = exports.viewsRoot) {
    app.engine('t.html', function (filePath, httpContext, callback) {
        fs.readFile(filePath, function (err, content) {
            if (err)
                return callback(err);
            try {
                var html = content.toString();
                var rendered = "";
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
                    rendered += textParts[i];
                    var token = tokens[i];
                    if (!token)
                        continue; // (probably finished, so shortcut here when empty)
                    if (token[0] == '$') {
                        var expr = token.substring(2, token.length - 1);
                        if (expr[0] == '#') {
                            // ... this is a special command ...
                            var cmd = expr.split(/\s+/g);
                            var argStr = cmd[1] || "";
                            switch (cmd[0]) {
                                case "#layout": {
                                    // ... get arguments: view:section
                                    var args = argStr.split(':');
                                    if (args.length < 2)
                                        throw `Invalid token command '${cmd}': 2 arguments were expected (view_name:section_name).`;
                                    var viewName = args[0], sectionName = args[1];
                                    var viewPath = DS.Path.combine(DS.Path.getPath(httpContext.viewPath), viewName);
                                    httpContext.response.render(viewPath, httpContext, (err, html) => {
                                        if (err)
                                            return callback(err);
                                        // ... this HTML is the parent template to this view that is resolved by now and must be returned ...
                                        callback(null, html);
                                    });
                                }
                                case "section": {
                                }
                                default: throw `Unknown token command '${args[0]}' in token '${expr}'.`;
                            }
                        }
                        else {
                            var value = DS.safeEval(expr.replace(/(^|[^a-z0-9_$.])\./gmi, '$1p0.'), httpContext.viewData || {}); //DS.Utilities.dereferencePropertyPath(path, viewData, true);
                            if (value === null || value === void 0)
                                value = "";
                            else
                                value = '' + value;
                            rendered += value;
                        }
                    }
                    else
                        rendered += token; // (not a valid server token, so include this in the rendered output)
                }
            }
            catch (ex) {
                return callback(DS.IO.Response.fromError(`Error processing view '${filePath}': `, ex));
            }
            return callback(null, rendered);
        });
    });
    // ... view engine setup ...
    exports.viewsRoot = viewsRootPath; // (keep track of any changes)
    app.set('views', DS.Path.combine(__dirname, exports.viewsRoot)); // specify the views directory
    app.set('view engine', 't.html'); // register the template engine
}
exports.apply = apply;
//# sourceMappingURL=templateEngine.js.map