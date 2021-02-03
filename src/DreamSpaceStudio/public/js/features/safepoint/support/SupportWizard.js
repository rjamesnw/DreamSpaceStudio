define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SupportWizard = void 0;
    class SupportWizard {
        constructor(usernameID, incidentNumID, startButtonID, resultsContainerID) {
            this.username = SupportWizard._getElement("usernameID", usernameID);
            this.incidentNum = SupportWizard._getElement("incidentNumID", incidentNumID);
            this.startButton = SupportWizard._getElement("startButtonID", startButtonID);
            this.resultsContainer = SupportWizard._getElement("resultsContainerID", resultsContainerID);
            this.startButton.onclick = () => {
                this.analyze();
            };
        }
        static _getElement(paramname, id) {
            var el = document.getElementById(id);
            if (!el)
                throw DS.Exception.invalidArgument("SupportWizard", paramname, this, `Element with ID '${id}' not found.`);
            return el;
        }
        async analyze() {
            // ... all the backend to do the analysis ...
            // ... connect to the database ...
            var result = await DS.IO.get("/api/safepoint/support/analyze", void 0, void 0, {
                username: this.username.value,
                incidentNum: this.incidentNum.value
            });
            alert("Result: " + JSON.stringify(result));
        }
    }
    exports.SupportWizard = SupportWizard;
});
//# sourceMappingURL=SupportWizard.js.map