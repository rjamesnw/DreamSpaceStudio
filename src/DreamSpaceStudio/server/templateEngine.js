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
            var rendered = content.toString();
            // ... replaced all tokens with the view data ...
            var tokens = rendered.match(/{{.*?}}/g);
            if (tokens)
                for (var i = 0, n = tokens.length; i < n; ++i) {
                    var token = tokens[i];
                    var path = token.substring(2, token.length - 2);
                    var value = '' + DS.Utilities.dereferencePropertyPath(path, viewData, true);
                    rendered = DS.StringUtils.replace(rendered, tokens[i], value);
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