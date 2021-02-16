import express = require('express');
import session = require('express-session');
import mysql_session = require('express-mysql-session');

const MySQLStore = mysql_session(session);

export function initializeSessionStorage(app: express.Express) {

    var sessionStoreOptions = {
        host: process.env.SESSION_MYSQL_HOST || 'localhost',
        port: +process.env.SESSION_MYSQL_PORT || 3306,
        user: process.env.SESSION_MYSQL_USER || 'sessions',
        password: process.env.SESSION_MYSQL_PASS,
        database: process.env.SESSION_MYSQL_DB_NAME || 'cds'
    };

    var sessionStore = new MySQLStore(sessionStoreOptions);

    app.use(session({
        name: 'dreamspacesession',
        secret: (process.env.SESSION_SECRETS ?? '').split(',').map(s => s.trim()),
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000
        }
    }));
}
