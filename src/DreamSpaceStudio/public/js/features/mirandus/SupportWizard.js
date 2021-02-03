define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SupportWizard = void 0;
    class SupportWizard {
        constructor(resultsContainerID) {
            this.resultsContainer = document.getElementById(resultsContainerID);
            if (!this.resultsContainer)
                throw DS.Exception.invalidArgument("SupportWizard", "resultsContainerID", this, `Element with ID '${resultsContainerID}' not found.`);
        }
    }
    exports.SupportWizard = SupportWizard;
});
//# sourceMappingURL=SupportWizard.js.map