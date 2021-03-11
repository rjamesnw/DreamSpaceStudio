// ----------------------------------------------------------------------------------------------------------------------------
// Trap any uncaught errors so we can better report/display/log them before the window shuts down.

process.on('uncaughtException', function (err) {
    console.error("Uncaught Exception: " + (err && err.stack || err));
    //while (true); // not needed, since express keeps the message loop active
});

process.on('unhandledRejection', function (err) {
    console.error("Unhandled Rejection: " + err);
    //wait(); // not needed, since express keeps the message loop active
});

// ----------------------------------------------------------------------------------------------------------------------------

require('../system/server/server_api'); // (adds the global.DS core system namespace API)

DS.registerGlobal(); // (registers the system for managing global properties to prevent cluttering the JS global space)

process.chdir(DS.Path.combine(__dirname, '..')); // (guarantee that we are in the correct working directory)
var cwd = global.process.cwd(); // (current working directory, which should be the project folder)

DS.webRoot = cwd;

import * as env from "./environment";
import fs = require('fs');
import express = require('express');
import * as sessions from './sessions';
import { Socket } from "net";
import * as templateEngine from "./t.html";
import { viewsRoot, HttpContext, ViewData } from './t.html';
import { isNullOrUndefined } from 'util';
import swaggerUI = require('swagger-ui-express');
import { swaggerDocument } from "./swagger";

//x import indexRoutes from './routes/index';
//x import ideRoutes from './routes/ide';

// ... get a new express app instance ...

var app = express();

// ... set up sessions ...

sessions.initializeSessionStorage(app);

// ... apply the basic templating engine ...

templateEngine.apply(app);

 // ... add the swagger docs API ...

app.use('/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// ... get the virtual file system ...

var fm = DS.VirtualFileSystem.FileManager.current;

(async () => {
    //await ds.init();
    // ... load all existing projects ...

    var solutions = await DS.Abstracts.Solutions.refresh(); // (this will load the solutions only, and not projects, from the file system)
    var startupSolution = solutions.startupSolution;
    var startupProject: DS.Abstracts.Project; // (can't load this yet until we know for sure what solution actually gets loaded)

    try {
        // Parse URL-encoded bodies (as sent by HTML forms)
        app.use(express.urlencoded({
            extended: true // (O[K]=1 becomes O:{K:1} when true)
        }));

        // Parse JSON bodies (as sent by API clients)
        app.use(express.json());

        //// view engine setup
        //x app.set('views', path.join(__dirname, 'views'));
        //x app.set('view engine', 'html');

        var publicRoot = DS.Path.combine(cwd, 'public');
        console.log("Static Public Folder: " + publicRoot);
        app.use(express.static(publicRoot));

        var solutionsRoot = DS.Path.combine(cwd, 'solutions');
        console.log("Static Solutions Folder: " + solutionsRoot);
        app.use(express.static(solutionsRoot));

        async function _APIHandler(req: express.Request, res: express.Response, next: express.NextFunction) {
            // .. this endpoint will handle work-flow requests ...
            var pathNames = DS.Path.getPathNames(req.path);
            if (pathNames.length > 1) {
                if (pathNames[0] == 'api') pathNames.shift(); // (this should usually always be the case)
                pathNames[pathNames.length] = pathNames[pathNames.length - 1]; // (push the file name up and insert "api" in the path [we always assume the file is in an 'api' folder])
                pathNames[pathNames.length - 2] = "api";
                var apiPath = DS.Path.combine(templateEngine.viewsRoot, pathNames.join('/'));
                try {
                    var method = req.method.toLowerCase();
                    var module = require(apiPath + ".js");
                } catch (err) {
                    return next(DS.Exception.error("API", `Failed to load API module from '${apiPath}'.`, this, err));
                }
                try {
                    let func = module[method] || module['_' + method] || module[method.toUpperCase()]; // (an underscore or all caps is also used to support conflicting names [for example, 'delete' is a reserved word])
                    if (typeof func == 'function') {
                        let result = func(req, res, next);
                        if (result instanceof Promise) // (support functions that are not async)
                            await result;
                    } else {
                        next(DS.Exception.error("API", `Module at ${apiPath} does not contain an '${method}()' handler function.`));
                    }
                } catch (err) {
                    return next(DS.Exception.error("API", `'${method}()' in module '${apiPath}' threw an error.`, this, err));
                }
            }
        }

        app.use(function (req, res, next) {
            if (req.path.startsWith("/api/"))
                return _APIHandler(req, res, next);
            //?var pathParts = DS.Path.getPathParts(req.path.toLowerCase());
            //?var lastName = pathParts[pathParts.length - 1];
            //?var indexViewPath = lastName != "index" && lastName.indexOf('.') < 0 ? DS.Path.combine(req.path, "index") : req.path; // (only add "index" if not already index, and doesn't contain a period typically used for extensions)
            res.render(req.path.trimLeftChar('/'), { context: new HttpContext(req, res, new ViewData()) });
            //try {
            //    res.render(indexViewPath, new HttpContext(req, res, new ViewData()));
            //} catch (ex) {
            //    next();
            //}
        });

        //app.use('/ide', function (req, res, next) {
        //    // .. this endpoint will handle work-flow requests ...
        //    var viewPath = DS.Path.combine('ide', req.path);
        //    var indexViewPath = DS.Path.combine(viewPath, "index");
        //    res.render(indexViewPath, new HttpContext(req, res, new ViewData()));
        //});

        //x app.use('/', indexRoutes);
        //app.use('/ide', function (req, res, next) {
        //    res.render('ide/index', new HttpContext(req, res, new ViewData()));
        //    //// ... force load the IDE project as the startup and serve it ...
        //    //var _ideSolution = solutions.get('31C541D23F2047389256AA479909B8E5');

        //    //if (_ideSolution)
        //    //    startupSolution = _ideSolution;
        //    //else
        //    //    console.warn('Warning: The IDE solution was not found.'); // (allow this, in case people want to rename/delete the folder for security on prod releases)

        //    //if (startupSolution)
        //    //    startupSolution.refreshProjects().then((startingProject: DS.Project) => {
        //    //        startupProject = startingProject;
        //    //        next();
        //    //    }, (err) => next(err));
        //    //else
        //    //    next(new DS.Exception("No startup solution could be found."));
        //});

        app.use(function (req, res, next) {
            if (!startupProject)
                return next(new DS.Exception("No start-up project could be found."));

            async function loadResource() {
                var resources = await startupProject.getResource(req.path);
                if (resources && resources.length) {
                    var resource = resources[0]; // (only serve the first one found)
                    var value = await resource.getValue();
                    res.type(resource.type);
                    res.write(value !== null && value !== void 0 ? value : '');
                    res.end();
                } else next(); // (resource not found)
            }
            loadResource().catch((err) => next(err));
        });

        // ... allow exiting the server when in dev mode ...
        if (env.isDevelopment)
            app.get("/exit", async (req, res, next) => { shutDown(); });

        // catch 404 and forward to error handler
        app.use(function (req, res, next) {
            var err = new DS.Exception('Not Found');
            (<any>err)['status'] = 404;
            next(err);
        });

        if (env.isDevelopment) {

            // development error handler
            // will print stacktrace
            app.use(<express.ErrorRequestHandler>((err, req, res, next) => {
                var status = err['status'] || 500;
                if (!(err instanceof DS.Exception)) { // (the error page ALWAYS expects a proper exception instance)
                    err = new DS.Exception(err);
                    if (status)
                        err['status'] = status; // (copy over to root error, just in case)
                }
                res.status(status);
                res.render('error', { context: new templateEngine.HttpContext(req, res, err) });
            }));
        }
        else {
            // production error handler
            // TODO: no stack traces leaked to user
            app.use(<express.ErrorRequestHandler>((err, req, res, next) => {
                var status = err['status'] || 500;
                if (!(err instanceof DS.Exception)) { // (the error page ALWAYS expects a proper exception instance)
                    err = new DS.Exception(err);
                    if (status)
                        err['status'] = status; // (copy over to root error, just in case)
                }
                res.status(status);
                res.render('error', { context: new templateEngine.HttpContext(req, res, err) });
            }));
        }

        var port = process.env.PORT || 45000;

        app.set('port', port); // (just for reference using 'app.get('port')')

        var server = app.listen(port, () => {
            console.log(`DreamSpace server running on port ${server.address().port}.`);
            console.log("To exit, simply close this window, or press CTRL-C.");
        });

        let connections: Socket[] = []; // (this allows graceful shutdown)

        server.on('connection', connection => {
            connections.push(connection);
            connection.on('close', () => connections = connections.filter(curr => curr !== connection));
        });

        function shutDown() {
            console.log('Shutting down gracefully ...');

            // ... first we tell express to stop receiving new connections and to close out all existing connections ...

            server.close(() => {
                console.log('Closed out remaining connections.');
                process.exit(0);
            });

            // ... next we attempt to close existing connections forcibly using a timeout ...

            connections.forEach(curr => curr.end());
            setTimeout(() => connections.forEach(curr => curr.destroy()), 3000);

            // ... finally, after a short time, force the application to close ...

            setTimeout(() => {
                console.error('Could not close connections in time, forcefully shutting down ...');
                process.exit(1);
            }, 8000);
        }
    }
    catch (err) { console.log(err); wait(); }
})();

function wait() {
    console.log("Waiting ...");

    //if (!app.taskCompleted)
    //    setTimeout(wait, 1000); // (wait for task to complete, then end)
    //else
    setTimeout(() => { }, 10000); // (final pause before exit)

    console.log("Completed.");
}

//? wait();

// Notes:
// * https://github.com/microsoft/nodejstools/issues/2192
//