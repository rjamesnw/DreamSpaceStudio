// CDS specific types.

export interface ISite {
    id: number;
    name: string;
    display: string;
    acronym: string;
    domain: string;
    support_number: string;
    ldap_path: string;
}

export class Staff {
    id?: number;
    username: string;
    prefix?: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    title?: string;
    __title?: string;
    __department?: string;
    employee_number?: string;
    email: string;
    extension?: string;
    phone_number?: string;
    secondary_phone_number?: string;
    tertiary_phone_number?: string;
    staff_type?: string;
    employment_types_id?: string;
    sites_id?: number;
    is_inactive?: boolean;
    name: string;
    display: string;
}

export class Director {
    staff_id: number;
    is_inactive: boolean;
}

export class Supervisor {
    staff_id: number;
    is_inactive: boolean;
}

export interface IDepartment {
    id: number;
    name: string;
    department: string;
    program: string;
}

export interface IDelegate {
    StaffID: number;
    UnitDepartmentID: string;
    CanWrite: string;
}

export interface ISpecialAuthority {
    SpecialAuthorityUserID: number;
    SpecialAuthorityID: number;
    StaffID: number;
    Username: string;
    FirstName: string;
    LastName: string;
    Email: string;
    ReceivesAlerts: string;
    MinimumAlertSeverityRequired: string;
    ReadOnly: string;
}

export interface IIncident {
    IncidentID: number;
    IncidentContextID: number;
    IncidentTypeID: number;
    IncidentSeverityID: number;
    OccurredOn: string;
    ReportCreatedOn: string;
    Description: string;
    SiteID: number;
    Status: string;
    Guid: string;
    IncidentReportVersion: string;
    IsInactive: string;
}

export interface IInvolvedUnitDepartment {
    InvolvedUnitDepartmentID: number;
    IncidentID: number;
    UnitDepartmentID: number;
    AssignedOn: string;
    DoneReviewing: string;
    LastReminderNotificationOn: string;
    InvestigationNotes: string;
    ViewedOn: string;
}

export interface ISpecialAuthorityAssignees {
    SpecialAuthorityAssigneeID?: number;
    IncidentID: number;
    SpecialAuthorityID: number;
    ViewedOn?: string;
    InvestigationNotes?: string;
    DoneReviewing: boolean;
}


export enum AnalysisMessageState {
    NoIssue,
    Warning,
    Error,
    Fixed
}

export interface IAnalysisMessage {
    message: string;
    state: AnalysisMessageState;
}

export class Analysis {
    id = DS.Utilities.createGUID(false)
    username: string;
    incidentNum: number;

    messages: IAnalysisMessage[] = [];

    departments: IDepartment[];

    directorOf: IDepartment[];
    supervisorOf: IDepartment[];

    staff_id?: number;
    specialAuthorityID?: number;
    first_name?: string;
    last_name?: string;
    email?: string;

    directorDepartments?: number[];
    supervisorDepartments?: number[];

    state = AnalysisMessageState.NoIssue; // (global result state)

    static from(analysis: IAnalysis) {
        var analysisClassInstance = new Analysis(Object.assign(new Staff(), analysis?.staff));
        Object.assign(analysisClassInstance, analysis);
        return analysisClassInstance;
    }

    constructor(public staff: Staff) {
    }

    add(message: string, state = AnalysisMessageState.NoIssue) {
        if (state > this.state) this.state = state;
        this.messages.push({ message, state });
    }

    error(message: string) {
        this.add(message, AnalysisMessageState.Error);
    }

    warning(message: string) {
        this.add(message, AnalysisMessageState.Warning);
    }

    actionLink(funcName: string) {
        return `DS.Globals.getValue('SupportWizard', '${funcName}')('${this.id}', ${this.messages.length}, '${funcName}')`;
    }

    correctThisLink(funcName: string) { return `(<a href="#" onclick="${this.actionLink(funcName)}">correct this</a>)`; }
}
export interface IAnalysis extends Analysis { }

export enum Severities {
    NoHarm,
    LostTime,
    FirstAid,
    MedicalAid,
    Mild,
    Minor,
    Moderate,
    Severe,
    Critical,
    Death
}

export enum IncidentStatus {
    Closed,
    Assigned,
    Completed,
}

export function validateNewUserDetails(username: string, firstName: string, lastName: string, email: string): Staff | DS.Exception {
    username = DS.StringUtils.toString(username).trim();
    firstName = DS.StringUtils.toString(firstName).trim();
    lastName = DS.StringUtils.toString(lastName).trim();
    email = DS.StringUtils.toString(email).trim();

    if (!username) return DS.Exception.error("analysis.post()", "Username missing.");
    if (!/^[a-z0-9'.-]+$/gi.test(username)) return DS.Exception.error("analysis.post()", "Username contains invalid characters. Do not add spaces or symbols.");
    if (!firstName) return DS.Exception.error("analysis.post()", "First name is missing.");
    if (!lastName) return DS.Exception.error("analysis.post()", "Last name is missing.");
    if (!DS.Data.Validations.isValidEmailAddress(email)) return DS.Exception.error("analysis.post()", "Email must be a valid email address.");

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

export class WhiteboardUser {
    UserLastName: string;
    UserFirstName: string;
    UserFullName: string;
    UserLoginID: string;
    UserPassword = 'password!';
    Admin = 0;
    Email: string = null;
    SiteID: number = null;
    Sign_off_pin = 0;
    CPSO = 0;
    Signature_image: Uint8Array = null;
    Category = 'Other';
    Office_Full_Address: string = null;
    IsActive = 0;
    Allow_AdminIndicators = 0

    constructor(firstName: string, lastName: string) {
        if (firstName)
            this.UserFirstName = firstName;
        if (lastName)
            this.UserLastName = lastName;
        this.UserFullName = DS.StringUtils.append(firstName, lastName, ' ');
        this.UserLoginID = DS.StringUtils.append(firstName[0], lastName).toLowerCase();
    }
}