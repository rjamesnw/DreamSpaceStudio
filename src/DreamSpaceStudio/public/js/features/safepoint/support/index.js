define(["require", "exports", "./SupportWizard", "./globals"], function (require, exports, SupportWizard_1, globals_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    globals_1.bootsrap.then(() => {
        var wizard = new SupportWizard_1.SupportWizard("$userID", "$incidentID", "$analyze", "$results");
    });
});
//# sourceMappingURL=index.js.map