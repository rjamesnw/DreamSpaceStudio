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
const express = require("express");
const path = require("path");
const index_1 = require("./routes/index");
const ide_1 = require("./routes/ide");
const user_1 = require("./routes/user");
//? global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
//? import { registerGlobal } from '../Core/DreamSpace';
//? var ds = registerGlobal();
var app = express();
(() => __awaiter(this, void 0, void 0, function* () {
    //await ds.init();
    try {
        // Parse URL-encoded bodies (as sent by HTML forms)
        app.use(express.urlencoded({
            extended: true // (O[K]=1 becomes O:{K:1} when true)
        }));
        // Parse JSON bodies (as sent by API clients)
        app.use(express.json());
        // view engine setup
        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'html');
        app.use(express.static(path.join(__dirname, 'public')));
        app.use('/', index_1.default);
        app.use('/ide', ide_1.default);
        app.use('/users', user_1.default);
        // catch 404 and forward to error handler
        app.use(function (req, res, next) {
            var err = new Error('Not Found');
            err['status'] = 404;
            next(err);
        });
        if (app.get('env') === 'development') {
            // ... allow exiting the server when in dev mode ...
            app.get("/exit", (req, res, next) => __awaiter(this, void 0, void 0, function* () { shutDown(); }));
            // development error handler
            // will print stacktrace
            app.use(((err, req, res, next) => {
                res.status(err['status'] || 500);
                res.render('error', {
                    message: err.message,
                    error: err
                });
            }));
        }
        else {
            // production error handler
            // no stack traces leaked to user
            app.use(((err, req, res, next) => {
                res.status(err.status || 500);
                res.render('error', {
                    message: err.message,
                    error: {}
                });
            }));
        }
        var port = process.env.PORT || 45000;
        app.set('port', port); // (just for reference using 'app.get('port')')
        var server = app.listen(port, () => {
            console.log(`Test server running on port ${server.address().port}.`);
            console.log("Note: this test server is NOT part of the lambda functionality and is for local development only.");
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
//# sourceMappingURL=app.js.map