"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require('fs'); // this engine requires the fs module
function apply(app) {
    app.engine('tmpl.html', function (filePath, options, callback) {
        fs.readFile(filePath, function (err, content) {
            if (err)
                return callback(err);
            // this is an extremely simple template engine
            var rendered = content.toString();
            //    .replace('#title#', '<title>' + options.title + '</title>')
            //    .replace('#message#', '<h1>' + options.message + '</h1>')
            return callback(null, rendered);
        });
    });
    app.set('views', '../views'); // specify the views directory
    app.set('view engine', 'tmpl.html'); // register the template engine
}
exports.apply = apply;
//# sourceMappingURL=templateEngine.js.map