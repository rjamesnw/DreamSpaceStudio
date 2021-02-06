"use strict";
// CDS specific types.
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentStatus = exports.Severities = exports.Analysis = exports.AnalysisMessageState = exports.Supervisor = exports.Director = exports.Staff = void 0;
class Staff {
}
exports.Staff = Staff;
class Director {
}
exports.Director = Director;
class Supervisor {
}
exports.Supervisor = Supervisor;
var AnalysisMessageState;
(function (AnalysisMessageState) {
    AnalysisMessageState[AnalysisMessageState["NoIssue"] = 0] = "NoIssue";
    AnalysisMessageState[AnalysisMessageState["Warning"] = 1] = "Warning";
    AnalysisMessageState[AnalysisMessageState["Error"] = 2] = "Error";
})(AnalysisMessageState = exports.AnalysisMessageState || (exports.AnalysisMessageState = {}));
class Analysis {
    constructor(staff) {
        this.staff = staff;
        this.id = DS.Utilities.createGUID(false);
        this.messages = [];
        this.state = AnalysisMessageState.NoIssue; // (global result state)
    }
    add(message, state = AnalysisMessageState.NoIssue) {
        if (state > this.state)
            this.state = state;
        this.messages.push({ message, state });
    }
    error(message) {
        this.add(message, AnalysisMessageState.Error);
    }
    warning(message) {
        this.add(message, AnalysisMessageState.Warning);
    }
    actionLink(funcName) {
        return `DS.Globals.getValue('SupportWizard', '${funcName}')('${this.id}', '${funcName}')`;
    }
}
exports.Analysis = Analysis;
var Severities;
(function (Severities) {
    Severities[Severities["NoHarm"] = 0] = "NoHarm";
    Severities[Severities["LostTime"] = 1] = "LostTime";
    Severities[Severities["FirstAid"] = 2] = "FirstAid";
    Severities[Severities["MedicalAid"] = 3] = "MedicalAid";
    Severities[Severities["Mild"] = 4] = "Mild";
    Severities[Severities["Minor"] = 5] = "Minor";
    Severities[Severities["Moderate"] = 6] = "Moderate";
    Severities[Severities["Severe"] = 7] = "Severe";
    Severities[Severities["Critical"] = 8] = "Critical";
    Severities[Severities["Death"] = 9] = "Death";
})(Severities = exports.Severities || (exports.Severities = {}));
var IncidentStatus;
(function (IncidentStatus) {
    IncidentStatus[IncidentStatus["Closed"] = 0] = "Closed";
    IncidentStatus[IncidentStatus["Assigned"] = 1] = "Assigned";
    IncidentStatus[IncidentStatus["Completed"] = 2] = "Completed";
})(IncidentStatus = exports.IncidentStatus || (exports.IncidentStatus = {}));
//# sourceMappingURL=cds.js.map