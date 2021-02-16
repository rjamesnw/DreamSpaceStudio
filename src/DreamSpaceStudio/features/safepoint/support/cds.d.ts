export interface ISite {
    id: number;
    name: string;
    display: string;
    acronym: string;
    domain: string;
    support_number: string;
    ldap_path: string;
}
export declare class Staff {
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
export declare class Director {
    staff_id: number;
    is_inactive: boolean;
}
export declare class Supervisor {
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
export declare enum AnalysisMessageState {
    NoIssue = 0,
    Warning = 1,
    Error = 2,
    Fixed = 3
}
export interface IAnalysisMessage {
    message: string;
    state: AnalysisMessageState;
}
export declare class Analysis {
    staff: Staff;
    id: string;
    username: string;
    incidentNum: number;
    messages: IAnalysisMessage[];
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
    state: AnalysisMessageState;
    static from(analysis: IAnalysis): Analysis;
    constructor(staff: Staff);
    add(message: string, state?: AnalysisMessageState): void;
    error(message: string): void;
    warning(message: string): void;
    actionLink(funcName: string): string;
    correctThisLink(funcName: string): string;
}
export interface IAnalysis extends Analysis {
}
export declare enum Severities {
    NoHarm = 0,
    LostTime = 1,
    FirstAid = 2,
    MedicalAid = 3,
    Mild = 4,
    Minor = 5,
    Moderate = 6,
    Severe = 7,
    Critical = 8,
    Death = 9
}
export declare enum IncidentStatus {
    Closed = 0,
    Assigned = 1,
    Completed = 2
}
//# sourceMappingURL=cds.d.ts.map