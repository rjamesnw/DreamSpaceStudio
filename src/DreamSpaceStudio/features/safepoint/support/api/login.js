"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.post = void 0;
const ldap = require("../../../../server/ldap");
const db_1 = require("./db");
async function post(req, res, next) {
    var _a, _b, _c, _d;
    try {
        var session = req.session;
        var username = (_a = req.query.username) === null || _a === void 0 ? void 0 : _a.trim();
        var password = (_b = req.query.password) === null || _b === void 0 ? void 0 : _b.trim();
        var sites_id = +req.query.site;
        if (!username || /\s/g.test(username))
            return res.status(200).json(DS.IO.Response.fromError("A valid username is requried."));
        if (!password || /\s/g.test(password))
            return res.status(200).json(DS.IO.Response.fromError("A valid password is requried."));
        if (!sites_id)
            return res.status(200).json(DS.IO.Response.fromError("A valid site is requried."));
        // ... user must be registered in the database first ...
        var staffResuts = await db_1.cds_db.query("SELECT * FROM staff where sites_id = @sites_id and username=@username", {
            sites_id,
            username
        });
        if (!((_c = staffResuts.response) === null || _c === void 0 ? void 0 : _c.length))
            return res.status(200).json(DS.IO.Response.fromError("You do not have access to login. Please speak to your management and have them add you."));
        var staff = staffResuts.response[0];
        // ... get the site details ...
        var siteResults = await db_1.cds_db.query("SELECT * FROM sites where id = @sites_id", {
            sites_id,
            username
        });
        if (!((_d = siteResults.response) === null || _d === void 0 ? void 0 : _d.length))
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
}
exports.post = post;
;
//# sourceMappingURL=login.js.map