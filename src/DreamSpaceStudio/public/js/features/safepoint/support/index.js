define(["require", "exports", "./SupportWizard", "../../startup"], function (require, exports, SupportWizard_1, startup_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    startup_1.startup.then(() => {
        var wizard = new SupportWizard_1.SupportWizard("$userID", "$incidentID", "$analyze", "$results");
    });
});
//# sourceMappingURL=index.js.map