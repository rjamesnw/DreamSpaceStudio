"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._delete = exports.post = exports.get = void 0;
/**
 * Find and return file details and contents. Set the query parameter 'cmd=peek' to only return the file details without the contents.
 */
async function get(req, res, next) {
    var session = req.session;
    var cmd = req.query.cmd;
}
exports.get = get;
/**
 * Creates or overwrites a file.
 */
async function post(req, res, next) {
    var session = req.session;
    var cmd = req.query.cmd;
    res.status(200).json(new DS.IO.Response());
}
exports.post = post;
/**
 * Deletes a file.
 */
async function _delete(req, res, next) {
}
exports._delete = _delete;
//# sourceMappingURL=files.js.map