"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Test = void 0;
const modules_1 = require("../shared/modules");
function __class() {
    // ### USER CLASS CODE START ###
    class Test extends modules_1.VDOM.HTMLElement {
        constructor() {
            super(...arguments);
            this.t = 0;
        }
    }
    ;
    // ### USER CLASS CODE END ###
    return Test;
}
;
exports.Test = async function () {
    // ### MODULE DEPENDENCIES START ###
    await DS.modules(modules_1.VDOM);
    // ### MODULE DEPENDENCIES END ###
    return exports.Test = __class();
};
//# sourceMappingURL=test.js.map