"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * GET home page.
 */
const express = require("express");
const router = express.Router();
router.get('/user', (req, res) => {
    var json;
    //fs.exists(dirTest, (exists) => {
    //    if (exists) {
    //        viewPath = DS.Path.combine(viewPath, 'index'); // (if a directory was found, assume index as default)
    //        var viewData = new ViewData({ title: 'DreamSpace Studio' });
    //        res.render(viewPath, new HttpContext(req, res, viewData, viewPath), (err, html) => {
    //            if (err)
    //                req.next(err);
    //            else {
    //            }
    //        });
    //    }
    //    else throw "View not found: " + viewPath;
    //});
    res.status(200).json(json);
    //? res.end();
});
exports.default = router;
//# sourceMappingURL=api.js.map