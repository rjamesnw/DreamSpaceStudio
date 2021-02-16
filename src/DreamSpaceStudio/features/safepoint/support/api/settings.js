"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.post = void 0;
const cds_1 = require("./cds");
async function post(req, res, next) {
    var _a;
    var cmd = req.query.cmd;
    try {
        switch (cmd) {
            case "sites": {
                var sites = await cds_1.getSites();
                res.status(200).json((_a = sites.response) !== null && _a !== void 0 ? _a : []);
                break;
            }
        }
        res.status(200).json(new DS.IO.Response(null));
        //? res.end();
    }
    catch (ex) {
        return Promise.reject(ex);
    }
}
exports.post = post;
;
//# sourceMappingURL=settings.js.map