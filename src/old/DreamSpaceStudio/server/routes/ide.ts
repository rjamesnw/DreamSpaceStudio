/*
 * GET home page.
 */
import express = require('express');
import fs = require('fs');
import { viewsRoot, HttpContext, ViewData } from '../t.html';
import apiRoutes from './api';
const router = express.Router();

router.get('/', (req: express.Request, res: express.Response) => {
    var viewPath = DS.Path.combine('ide', req.path);
    var dirTest = DS.Path.combine(viewsRoot, viewPath);
    fs.exists(dirTest, (exists) => {
        if (exists) {
            viewPath = DS.Path.combine(viewPath, 'index'); // (if a directory was found, assume index as default)
            var viewData = new ViewData({ title: 'DreamSpace Studio'});
            res.render(viewPath, new HttpContext(req, res, viewData, viewPath), (err, html) => {
                if (err)
                    req.next(err);
                else {
                    res.type("html");
                    res.write(html.split('\ufeff').join('')); // (the BOM character has no business in any HTML text at this point)
                    res.end();
                }
            });
        }
        else throw "View not found: " + viewPath;
    });
});

router.use('/api', apiRoutes);


export default router;

// TODO: Consider using a "features" approach instead, similar to ASP .Net MVC; NodeJS ideas here: https://strongloop.com/strongblog/bypassing-express-view-rendering-for-speed-and-modularity/
