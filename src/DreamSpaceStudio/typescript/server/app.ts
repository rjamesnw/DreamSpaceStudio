import debug = require('debug');
import express = require('express');
import path = require('path');

import routes from '../../routes/index';
import users from '../../routes/user';

global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

import registerGlobal from '../DreamSpaceJS/Globals';

var ds = registerGlobal();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    (<any>err)['status'] = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(<express.ErrorRequestHandler>((err, req, res, next) => {
        res.status(err['status'] || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    }));
}

// production error handler
// no stacktraces leaked to user
app.use(<express.ErrorRequestHandler>((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
}));

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});
