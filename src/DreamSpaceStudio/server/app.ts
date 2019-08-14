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

require('../solutions/server/server_api'); // (adds the global.DS core system namespace API)

DS.registerGlobal(); // (registers the system for managing global properties to prevent cluttering the JS global space)

process.chdir(DS.Path.combine(__dirname, '..')); // (guarantee that we are in the correct working directory)
var cwd = global.process.cwd(); // (current working directory, which should be the project folder)

DS.webRoot = cwd;

//x import debug = require('debug');
//x import path = require('path');
import express = require('express');
import { Socket } from "net";
import * as templateEngine from "./t.html";

import indexRoutes from './routes/index';
import ideRoutes from './routes/ide';

var app = express();

templateEngine.apply(app);

(async () => {
    //await ds.init();

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

        app.use('/', indexRoutes);
        app.use('/ide', ideRoutes);

        // ... allow exiting the server when in dev mode ...
        if (app.get('env') === 'development')
            app.get("/exit", async (req, res, next) => { shutDown(); });

        // catch 404 and forward to error handler
        app.use(function (req, res, next) {
            var err = new Error('Not Found');
            (<any>err)['status'] = 404;
            next(err);
        });

        if (app.get('env') === 'development') {

            // development error handler
            // will print stacktrace
            app.use(<express.ErrorRequestHandler>((err, req, res, next) => {
                res.status(err['status'] || 500);
                res.render('error', new templateEngine.HttpContext(req, res, err));
            }));
        }
        else {
            // production error handler
            // TODO: no stack traces leaked to user
            app.use(<express.ErrorRequestHandler>((err, req, res, next) => {
                res.status(err.status || 500);
                res.render('error', new templateEngine.HttpContext(req, res, err));
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