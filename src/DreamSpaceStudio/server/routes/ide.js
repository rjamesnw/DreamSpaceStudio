"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * GET home page.
 */
const express = require("express");
const fs = require("fs");
const templateEngine_1 = require("../templateEngine");
const router = express.Router();
router.get('/', (req, res) => {
    var viewPath = DS.Path.combine('ide', req.path);
    var dirTest = DS.Path.combine(templateEngine_1.viewsRootFolder, viewPath);
    fs.exists(dirTest, (exists) => {
        if (exists)
            viewPath = DS.Path.combine(viewPath, 'index'); // (if a directory was found, assume index as default)
        res.render(viewPath, new templateEngine_1.HttpContext(req, res, { title: 'DreamSpace Studio' }, viewPath));
    });
});
exports.default = router;
//# sourceMappingURL=ide.js.map