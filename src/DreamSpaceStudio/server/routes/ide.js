"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * GET home page.
 */
const express = require("express");
const router = express.Router();
router.get('/', (req, res) => {
    res.render('ide', { title: 'DreamSpace Studio' });
});
exports.default = router;
//# sourceMappingURL=ide.js.map