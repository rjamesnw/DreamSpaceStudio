/*
 * GET home page.
 */
import express = require('express');
import fs = require('fs');
import { viewsRoot, HttpContext } from '../t.html';
const router = express.Router();

router.get('/', (req: express.Request, res: express.Response) => {
    var viewPath = DS.Path.combine('ide', req.path);
    var dirTest = DS.Path.combine(viewsRoot, viewPath);
    fs.exists(dirTest, (exists) => {
        if (exists) {
            viewPath = DS.Path.combine(viewPath, 'index'); // (if a directory was found, assume index as default)
            res.render(viewPath, new HttpContext(req, res, { title: 'DreamSpace Studio' }, viewPath), (err, html) => {
                if (err)
                    req.next(err);
                else {
                    res.type("html");
                    res.write(html.split('\ufeff').join('')); // (the BOM character has no business in any HTML text at this point)
                }
            });
        }
        else throw "View not found: " + viewPath;
    });
});

export default router;

// TODO: Consider using a "features" approach instead, similar to ASP .Net MVC; NodeJS ideas here: https://strongloop.com/strongblog/bypassing-express-view-rendering-for-speed-and-modularity/
