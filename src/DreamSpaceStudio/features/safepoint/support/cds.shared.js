"use strict";
// CDS specific types.
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhiteboardUser = exports.validateNewUserDetails = exports.IncidentStatus = exports.Severities = exports.Analysis = exports.AnalysisMessageState = exports.Supervisor = exports.Director = exports.Staff = void 0;
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
    AnalysisMessageState[AnalysisMessageState["Fixed"] = 3] = "Fixed";
})(AnalysisMessageState = exports.AnalysisMessageState || (exports.AnalysisMessageState = {}));
class Analysis {
    constructor(staff) {
        this.staff = staff;
        this.id = DS.Utilities.createGUID(false);
        this.messages = [];
        this.state = AnalysisMessageState.NoIssue; // (global result state)
    }
    static from(analysis) {
        var analysisClassInstance = new Analysis(Object.assign(new Staff(), analysis === null || analysis === void 0 ? void 0 : analysis.staff));
        Object.assign(analysisClassInstance, analysis);
        return analysisClassInstance;
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
        return `DS.Globals.getValue('SupportWizard', '${funcName}')('${this.id}', ${this.messages.length}, '${funcName}')`;
    }
    correctThisLink(funcName) { return `(<a href="#" onclick="${this.actionLink(funcName)}">correct this</a>)`; }
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
function validateNewUserDetails(username, firstName, lastName, email) {
    username = DS.StringUtils.toString(username).trim();
    firstName = DS.StringUtils.toString(firstName).trim();
    lastName = DS.StringUtils.toString(lastName).trim();
    email = DS.StringUtils.toString(email).trim();
    if (!username)
        return DS.Exception.error("analysis.post()", "Username missing.");
    if (!/^[a-z0-9'.-]+$/gi.test(username))
        return DS.Exception.error("analysis.post()", "Username contains invalid characters. Do not add spaces or symbols.");
    if (!firstName)
        return DS.Exception.error("analysis.post()", "First name is missing.");
    if (!lastName)
        return DS.Exception.error("analysis.post()", "Last name is missing.");
    if (!DS.Data.Validations.isValidEmailAddress(email))
        return DS.Exception.error("analysis.post()", "Email must be a valid email address.");
    return {
        username: username,
        email: email,
        first_name: firstName,
        last_name: lastName,
        display: firstName + " " + lastName,
        name: firstName + lastName,
        is_inactive: false
    };
}
exports.validateNewUserDetails = validateNewUserDetails;
class WhiteboardUser {
    constructor(firstName, lastName) {
        this.UserPassword = 'password!';
        this.Admin = 0;
        this.Email = null;
        this.SiteID = null;
        this.Sign_off_pin = 0;
        this.CPSO = 0;
        this.Signature_image = null;
        this.Category = 'Other';
        this.Office_Full_Address = null;
        this.IsActive = 0;
        this.Allow_AdminIndicators = 0;
        if (firstName)
            this.UserFirstName = firstName;
        if (lastName)
            this.UserLastName = lastName;
        this.UserFullName = DS.StringUtils.append(firstName, lastName, ' ');
        this.UserLoginID = DS.StringUtils.append(firstName[0], lastName).toLowerCase();
    }
}
exports.WhiteboardUser = WhiteboardUser;
//# sourceMappingURL=cds.shared.js.map