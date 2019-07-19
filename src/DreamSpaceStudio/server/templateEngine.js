"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs"); // this engine requires the fs module
exports.viewsRootFolder = "views";
exports.viewsRoot = "../" + exports.viewsRootFolder;
function apply(app, viewsRootPath = exports.viewsRoot) {
    app.engine('t.html', function (filePath, viewData, callback) {
        fs.readFile(filePath, function (err, content) {
            if (err)
                return callback(err);
            try {
                var rendered = content.toString();
                // ... replaced all tokens with the view data ...
                var tokens = rendered.match(/`[^`]*?`|\${.*?}/g);
                if (tokens)
                    for (var i = 0, n = tokens.length; i < n; ++i) {
                        var token = tokens[i];
                        if (token[0] == '$') {
                            var expr = token.substring(2, token.length - 1);
                            var value = DS.safeEval(expr.replace(/(^|[^a-z0-9_$.])\./gmi, '$1p0.'), viewData); //DS.Utilities.dereferencePropertyPath(path, viewData, true);
                            if (value === null || value === void 0)
                                value = "";
                            else
                                value = '' + value;
                            rendered = DS.StringUtils.replace(rendered, token, value);
                        }
                    }
            }
            catch (ex) {
                ex['status'] = 200;
                return callback(ex);
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