define(["require", "exports", "../Scripts"], function (require, exports, Scripts_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // #######################################################################################
    /**
    * Enables Linq based queries, similar to C#. (https://github.com/morrisjdev/Linq4JS).
    * This is included to allow .Net developers who are familiar with Linq to use Linq based
    * nested method calls to work on DreamSpace arrays/collections.
    */
    class default_1 extends Scripts_1.Module {
        constructor() {
            // ===================================================================================
            super(...arguments);
            this.scriptInfo = { files: "linq4js{min:.min}" };
            // ===================================================================================
        }
    }
    exports.default = default_1;
});
// #######################################################################################
//# sourceMappingURL=Linq4JS.js.map