"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * GET home page.
 */
const express = require("express");
const fs = require("fs");
const t_html_1 = require("../t.html");
const api_1 = require("./api");
const router = express.Router();
router.get('/', (req, res) => {
    var viewPath = DS.Path.combine('ide', req.path);
    var dirTest = DS.Path.combine(t_html_1.viewsRoot, viewPath);
    fs.exists(dirTest, (exists) => {
        if (exists) {
            viewPath = DS.Path.combine(viewPath, 'index'); // (if a directory was found, assume index as default)
            var viewData = new t_html_1.ViewData({ title: 'DreamSpace Studio' });
            res.render(viewPath, new t_html_1.HttpContext(req, res, viewData, viewPath), (err, html) => {
                if (err)
                    req.next(err);
                else {
                    res.type("html");
                    res.write(html.split('\ufeff').join('')); // (the BOM character has no business in any HTML text at this point)
                    res.end();
                }
            });
        }
        else
            throw "View not found: " + viewPath;
    });
});
router.use('/api', api_1.default);
exports.default = router;
// TODO: Consider using a "features" approach instead, similar to ASP .Net MVC; NodeJS ideas here: https://strongloop.com/strongblog/bypassing-express-view-rendering-for-speed-and-modularity/
//# sourceMappingURL=ide.js.map