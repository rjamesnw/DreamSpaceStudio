import fs = require('fs') // this engine requires the fs module

export function apply(app: ReturnType<typeof import("express")>, viewsRootPath = '../views') {
    app.engine('t.html', function (filePath: string, options: any, callback: { (err: any, response?: any): void }) { // define the template engine
        fs.readFile(filePath, function (err, content) {
            if (err) return callback(err);
            // this is an extremely simple template engine
            var rendered = content.toString();
            //    .replace('#title#', '<title>' + options.title + '</title>')
            //    .replace('#message#', '<h1>' + options.message + '</h1>')
            return callback(null, rendered)
        })
    })

    // view engine setup
    app.set('views', DS.Path.combine(__dirname, viewsRootPath)); // specify the views directory
    app.set('view engine', 't.html') // register the template engine
}