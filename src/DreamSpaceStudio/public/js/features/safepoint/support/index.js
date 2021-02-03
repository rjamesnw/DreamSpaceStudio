define(["require", "exports", "./SupportWizard"], function (require, exports, SupportWizard_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    DS.appVersion = "1.0.0";
    DS.init().then(() => {
        DS.Browser.onReady.attach(() => {
            var wizard = new SupportWizard_1.SupportWizard("$userID", "$incidentID", "$analyze", "$results");
        });
    });
});
//# sourceMappingURL=index.js.map