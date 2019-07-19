import fs = require('fs') // this engine requires the fs module

export var viewsRootFolder = "views";
export var viewsRoot = "../" + viewsRootFolder;

export function apply(app: ReturnType<typeof import("express")>, viewsRootPath = viewsRoot) {
    app.engine('t.html', function (filePath: string, viewData: any, callback: { (err: any, response?: any): void }) { // define the template engine
        fs.readFile(filePath, function (err, content) {
            if (err) return callback(err);

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

            return callback(null, rendered)
        })
    })

    // ... view engine setup ...

    viewsRoot = viewsRootPath; // (keep track of any changes)

    app.set('views', DS.Path.combine(__dirname, viewsRoot)); // specify the views directory
    app.set('view engine', 't.html') // register the template engine
}
