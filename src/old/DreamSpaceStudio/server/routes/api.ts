/*
 * GET home page.
 */
import express = require('express');
import fs = require('fs');
const router = express.Router();

router.get('/user', (req: express.Request, res: express.Response) => {
    var json: string;

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

export default router;

