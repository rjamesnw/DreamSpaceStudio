// CDS specific types.

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
    sites_id: number;
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
    SpecialAuthorityAssigneeID: number;
    IncidentID: number;
    SpecialAuthorityID: number;
    ViewedOn: string;
    InvestigationNotes: string;
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
    firstName?: string;
    lastName?: string;
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