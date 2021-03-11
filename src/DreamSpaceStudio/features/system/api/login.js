"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.post = void 0;
async function post(req, res, next) {
    var _a, _b, _c, _d, _e;
    try {
        var session = req.session;
        var username = (_a = req.body.username) === null || _a === void 0 ? void 0 : _a.trim();
        var password = (_b = req.body.password) === null || _b === void 0 ? void 0 : _b.trim();
        var sites_id = +req.body.site;
        if (!username || /\s/g.test(username))
            return res.status(200).json(DS.IO.Response.fromError("A valid username is requried."));
        if (!password || /\s/g.test(password))
            return res.status(200).json(DS.IO.Response.fromError("A valid password is requried."));
        if (!sites_id)
            return res.status(200).json(DS.IO.Response.fromError("A valid site is requried."));
        setSiteID(sites_id);
        // ... user must be registered in the database first ...
        var isAdmin = username == "adventsunsupport";
        if (!isAdmin) {
            let staffResuts = await getStaff(username);
            if (!((_c = staffResuts.response) === null || _c === void 0 ? void 0 : _c.length))
                return res.status(200).json(DS.IO.Response.fromError("You do not have access to login. Please speak to your management and have them add you."));
            let staff = staffResuts.response[0];
            let adminIds = staff && ((_d = process.env.SP_ADMINS) === null || _d === void 0 ? void 0 : _d.split(',').map(s => +s.trim()));
            if (staff && adminIds && adminIds.indexOf(staff.id) >= 0)
                isAdmin = true;
        }
        // ... get the site details ...
        var siteResults = await getSite(username != "adventsunsupport" ? void 0 : 1); // (always authenticate support on the SRHC AD)
        if (!((_e = siteResults.response) === null || _e === void 0 ? void 0 : _e.length))
            return res.status(200).json(DS.IO.Response.fromError("The site ID is not valid."));
        var site = siteResults.response[0];
        // ... check LDAP ...
        //var domainAndUsername = DS.Path.combine(site.domain, username);
        var userEntry = await ldap.login(username, password, site.ldap_path);
        if (!userEntry)
            return res.status(200).json(DS.IO.Response.fromError("Invalid username or password."));
        session.sites_id = sites_id;
        session.isAdmin = isAdmin;
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