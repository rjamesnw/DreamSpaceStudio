/*
 * Logs in the user and sets the site in the session. This is required to lock the user to a site after successful login.
 */
import express = require('express');
import expressSession = require('express-session');

/**
 * Find and return file details and contents. Set the query parameter 'cmd=peek' to only return the file details without the contents.
 */
export async function get(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    var session: typeof req.session & IndexedObject = req.session;
    var cmd = req.query.cmd;
}

/**
 * Creates or overwrites a file.
 */
export async function post(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    var session: typeof req.session & IndexedObject = req.session;
    var cmd = req.query.cmd;
    res.status(200).json(new DS.IO.Response());
}

/**
 * Deletes a file.
 */
export async function _delete(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
}

