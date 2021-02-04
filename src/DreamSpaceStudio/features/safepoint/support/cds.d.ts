export declare class Staff {
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
export declare class Director {
    staff_id: number;
    is_inactive: boolean;
}
export declare class Supervisor {
    staff_id: number;
    is_inactive: boolean;
}
export interface IDepartment {
    units_departments_id: number;
    program: string;
    department: string;
}
export declare class Analysis {
    staff: Staff;
    messages: string[];
    directorOf: IDepartment[];
    supervisorOf: IDepartment[];
    constructor(staff: Staff);
}
export interface IAnalysis extends Analysis {
}
//# sourceMappingURL=cds.d.ts.map