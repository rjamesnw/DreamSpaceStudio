/*
 * Logs in the user and sets the site in the session. This is required to lock the user to a site after successful login.
 */
import express = require('express');
import expressSession = require('express-session');
import * as ldap from '../../../../server/ldap';
import { ISite, Staff } from '../cds.shared';
import { cds_db } from './db';

export async function post(req: express.Request, res: express.Response, next: express.NextFunction): Promise<any> {
    try {
        var session: typeof req.session & IndexedObject = req.session;

        var username = <string>req.query.username?.trim();
        var password = <string>req.query.password?.trim();
        var sites_id = +<string>req.query.site;

        if (!username || /\s/g.test(username))
            return res.status(200).json(DS.IO.Response.fromError("A valid username is requried."));
        if (!password || /\s/g.test(password))
            return res.status(200).json(DS.IO.Response.fromError("A valid password is requried."));
        if (!sites_id)
            return res.status(200).json(DS.IO.Response.fromError("A valid site is requried."));

        // ... user must be registered in the database first ...

        var staffResuts = await <DS.DB.MSSQL.IMSSQLSelectQueryResult<Staff>>cds_db.query("SELECT * FROM staff where sites_id = @sites_id and username=@username", {
            sites_id,
            username
        });

        if (!staffResuts.response?.length)
            return res.status(200).json(DS.IO.Response.fromError("You do not have access to login. Please speak to your management and have them add you."));

        var staff = staffResuts.response[0];

        // ... get the site details ...

        var siteResults = await <DS.DB.MSSQL.IMSSQLSelectQueryResult<ISite>>cds_db.query("SELECT * FROM sites where id = @sites_id", {
            sites_id,
            username
        });

        if (!siteResults.response?.length)
            return res.status(200).json(DS.IO.Response.fromError("The site ID is not valid."));

        var site = siteResults.response[0];

        // ... check LDAP ...

        var domainAndUsername = DS.Path.combine(site.domain, username);
        var userEntry = await ldap.login(domainAndUsername, password, site.ldap_path);

        if (!userEntry)
            return res.status(200).json(DS.IO.Response.fromError("Invalid username or password."));

        session.sites_id = sites_id;

        res.status(200).json(new DS.IO.Response(null));
        //? res.end();
    }
    catch (ex) {
        return Promise.reject(ex);
    }
};
