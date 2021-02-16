/*
 * Logs in the user and sets the site in the session. This is required to lock the user to a site after successful login.
 */
import express = require('express');
import { getSites } from './cds';

export async function post(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    var cmd = req.query.cmd;

    try {
        switch (cmd) {
            case "sites": {
                var sites = await getSites();
                res.status(200).json(sites.response ?? []);
                break;
            }
        }

        res.status(200).json(new DS.IO.Response(null));
        //? res.end();
    }
    catch (ex) {
        return Promise.reject(ex);
    }
};
