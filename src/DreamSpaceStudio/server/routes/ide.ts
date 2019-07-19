/*
 * GET home page.
 */
import express = require('express');
import fs = require('fs');
import { viewsRootFolder } from '../templateEngine';
const router = express.Router();

router.get('/', (req: express.Request, res: express.Response) => {
    var viewPath = DS.Path.combine('ide', req.path);
    var dirTest = DS.Path.combine(viewsRootFolder, viewPath);
    fs.exists(dirTest, (exists) => {
        if (exists)
            viewPath = DS.Path.combine(viewPath, 'index'); // (if a directory was found, assume index as default)
        res.render(viewPath, { title: 'DreamSpace Studio' });
    });
});

export default router;