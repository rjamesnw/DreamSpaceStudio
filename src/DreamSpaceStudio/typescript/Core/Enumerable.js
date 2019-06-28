"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Exception_1 = require("./System/Exception");
/**
 * Supports Iteration for ES5/ES3. To use, create a new type derived from this one, or implement the IEnumerable<T> interface.
 */
class Enumerable {
    next(value) {
        throw Exception_1.Exception.notImplemented('next', this);
    }
    return(value) {
        throw Exception_1.Exception.notImplemented('return', this);
    }
    throw(e) {
        throw Exception_1.Exception.notImplemented('throw', this);
    }
}
exports.Enumerable = Enumerable;
//# sourceMappingURL=Enumerable.js.map