"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("../core/Context");
class ActionContext extends Context_1.default {
    // --------------------------------------------------------------------------------------------------------------------
    constructor(concept, actionName, parent = null) {
        super(concept, parent);
        this.Name = actionName;
    }
}
exports.default = ActionContext;
//# sourceMappingURL=ActionContext.js.map