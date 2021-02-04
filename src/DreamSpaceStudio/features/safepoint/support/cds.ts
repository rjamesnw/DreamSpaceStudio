// CDS specific types.

export class Staff {
    id: number;
    username: string;
    prefix: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    title: string;
    __title: string;
    __department: string;
    employee_number: string;
    email: string;
    extension: string;
    phone_number: string;
    secondary_phone_number: string;
    tertiary_phone_number: string;
    staff_type: string;
    employment_types_id: string;
    sites_id: number;
    is_inactive: string;
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
    units_departments_id: number;
    program: string;
    department: string;
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

export class Analysis {
    messages: string[] = [];
    directorOf: IDepartment[];
    supervisorOf: IDepartment[];
    constructor(public staff: Staff) {
    }
}
export interface IAnalysis extends Analysis { }
