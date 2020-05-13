"use strict";
// ----------------------------------------------------------------------------------------------------------------------------
// Trap any uncaught errors so we can better report/display/log them before the window shuts down.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const express = require("express");
const templateEngine = require("./t.html");
const t_html_1 = require("./t.html");
//x import indexRoutes from './routes/index';
//x import ideRoutes from './routes/ide';
// ... get a new express app instance ...
var app = express();
// ... apply the basic templating engine ...
templateEngine.apply(app);
// ... get the virtual file system ...
var fm = DS.VirtualFileSystem.FileManager.current;
(() => __awaiter(this, void 0, void 0, function* () {
    //await ds.init();
    // ... load all existing projects ...
    var solutions = yield DS.Abstracts.Solutions.refresh(); // (this will load the solutions only, and not projects, from the file system)
    var startupSolution = solutions.startupSolution;
    var startupProject; // (can't load this yet until we know for sure what solution actually gets loaded)
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
        app.use('/ide', function (req, res, next) {
            // .. this endpoint will handle work-flow requests ...
            var viewPath = DS.Path.combine('ide', req.path);
            var indexViewPath = DS.Path.combine(viewPath, "index");
            res.render(indexViewPath, new t_html_1.HttpContext(req, res, new t_html_1.ViewData()));
        });
        //x app.use('/', indexRoutes);
        app.use('/ide', function (req, res, next) {
            res.render('ide/index', new t_html_1.HttpContext(req, res, new t_html_1.ViewData()));
            //// ... force load the IDE project as the startup and serve it ...
            //var _ideSolution = solutions.get('31C541D23F2047389256AA479909B8E5');
            //if (_ideSolution)
            //    startupSolution = _ideSolution;
            //else
            //    console.warn('Warning: The IDE solution was not found.'); // (allow this, in case people want to rename/delete the folder for security on prod releases)
            //if (startupSolution)
            //    startupSolution.refreshProjects().then((startingProject: DS.Project) => {
            //        startupProject = startingProject;
            //        next();
            //    }, (err) => next(err));
            //else
            //    next(new DS.Exception("No startup solution could be found."));
        });
        app.use(function (req, res, next) {
            if (!startupProject)
                return next(new DS.Exception("No start-up project could be found."));
            function loadResource() {
                return __awaiter(this, void 0, void 0, function* () {
                    var resources = yield startupProject.getResource(req.path);
                    if (resources && resources.length) {
                        var resource = resources[0]; // (only serve the first one found)
                        var value = yield resource.getValue();
                        res.type(resource.type);
                        res.write(value !== null && value !== void 0 ? value : '');
                        res.end();
                    }
                    else
                        next(); // (resource not found)
                });
            }
            loadResource().catch((err) => next(err));
        });
        // ... allow exiting the server when in dev mode ...
        if (app.get('env') === 'development')
            app.get("/exit", (req, res, next) => __awaiter(this, void 0, void 0, function* () { shutDown(); }));
        // catch 404 and forward to error handler
        app.use(function (req, res, next) {
            var err = new DS.Exception('Not Found');
            err['status'] = 404;
            next(err);
        });
        if (app.get('env') === 'development') {
            // development error handler
            // will print stacktrace
            app.use(((err, req, res, next) => {
                var status = err['status'] || 500;
                if (!(err instanceof DS.Exception)) { // (the error page ALWAYS expects a proper exception instance)
                    err = new DS.Exception(err);
                    if (status)
                        err['status'] = status; // (copy over to root error, just in case)
                }
                res.status(status);
                res.render('error', new templateEngine.HttpContext(req, res, err));
            }));
        }
        else {
            // production error handler
            // TODO: no stack traces leaked to user
            app.use(((err, req, res, next) => {
                var status = err['status'] || 500;
                if (!(err instanceof DS.Exception)) { // (the error page ALWAYS expects a proper exception instance)
                    err = new DS.Exception(err);
                    if (status)
                        err['status'] = status; // (copy over to root error, just in case)
                }
                res.status(status);
                res.render('error', new templateEngine.HttpContext(req, res, err));
            }));
        }
        var port = process.env.PORT || 45000;
        app.set('port', port); // (just for reference using 'app.get('port')')
        var server = app.listen(port, () => {
            console.log(`DreamSpace server running on port ${server.address().port}.`);
            console.log("To exit, simply close this window, or press CTRL-C.");
        });
        let connections = []; // (this allows graceful shutdown)
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
    catch (err) {
        console.log(err);
        wait();
    }
}))();
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
//# sourceMappingURL=app.js.map