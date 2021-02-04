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
            var _a, _b;
            // ... all the backend to do the analysis ...
            // ... connect to the database ...
            var result = await DS.IO.get("/api/safepoint/support/analyze", void 0, void 0, {
                username: this.username.value,
                incidentNum: this.incidentNum.value
            });
            if (result.length)
                alert("Result:\r\n" + ((_b = (_a = result[0]) === null || _a === void 0 ? void 0 : _a.messages) === null || _b === void 0 ? void 0 : _b.join('\r\n')));
        }
    }
    exports.SupportWizard = SupportWizard;
});
//# sourceMappingURL=SupportWizard.js.map