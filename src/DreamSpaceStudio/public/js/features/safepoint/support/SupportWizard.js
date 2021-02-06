define(["require", "exports", "./cds"], function (require, exports, cds_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SupportWizard = void 0;
    var analytics = {};
    class SupportWizard {
        constructor(usernameID, incidentNumID, startButtonID, resultsContainerID) {
            this.username = SupportWizard._getElement("usernameID", usernameID);
            this.incidentNum = SupportWizard._getElement("incidentNumID", incidentNumID);
            this.startButton = SupportWizard._getElement("startButtonID", startButtonID);
            this.resultsContainer = SupportWizard._getElement("resultsContainerID", resultsContainerID);
            DS.Globals.setValue("SupportWizard", "fixMissingSpecialAuth", async (id, serverFuncName) => {
                if (confirm("Add the user as a special authority for the incident?")) {
                    var analysis = analytics[id];
                    if (analysis) {
                        var result = await DS.IO.get(`/api/safepoint/support/analyze?cmd=${serverFuncName}`, void 0, DS.IO.Methods.POST, analysis);
                        if (result.error)
                            alert("Error: " + result.error.message);
                        else if (result.message)
                            alert(result.message);
                        else if (result.status != 200)
                            alert("Success response not received. Could be a server error, please try again later or contact support.");
                        else
                            alert("Corrected.");
                    }
                    else
                        alert(`Internal error: analytics with ID '${id}' not found.`);
                }
            });
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
            var results = await DS.IO.get("/api/safepoint/support/analyze", void 0, void 0, {
                username: this.username.value,
                incidentNum: this.incidentNum.value
            });
            if (results.length) {
                this.resultsContainer.innerHTML = ""; // (clear)
                for (let result of results) {
                    analytics[result.id] = result; // (keep track in order to refer back)
                    var div = document.createElement("div");
                    div.className = "alert alert-" + (result.state == cds_1.AnalysisMessageState.Error ? "danger" : result.state == cds_1.AnalysisMessageState.Warning ? "warning" : "success");
                    div.innerHTML = result.messages.map(v => v.message.replace(/\n/g, "<br/>\r\n")).join("<br/>\r\n");
                    this.resultsContainer.appendChild(div);
                }
            }
        }
    }
    exports.SupportWizard = SupportWizard;
});
//# sourceMappingURL=SupportWizard.js.map