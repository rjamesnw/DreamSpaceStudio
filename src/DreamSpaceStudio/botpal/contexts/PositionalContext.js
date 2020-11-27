"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("../core/Context");
/**
 *  Represents the position of subjects in a scene. Positions assume that positive Z is forward, positive Y is up, and
 *  positive X is right (left handed coordinate system).
*/
class PositionalContext extends Context_1.default {
    // --------------------------------------------------------------------------------------------------------------------
    constructor(concept, parent = null) {
        super(concept, parent);
    }
}
exports.default = PositionalContext;
//# sourceMappingURL=PositionalContext.js.map