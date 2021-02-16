import { cds_db, sp_db, getCDSConnection, getSPConnection } from './db';
import {
    Analysis, Director, IDepartment, IDelegate, ISpecialAuthority, IIncident, Staff, Supervisor, Severities,
    IncidentStatus, IInvolvedUnitDepartment, ISpecialAuthorityAssignees, AnalysisMessageState, IAnalysis, ISite
} from '../cds.shared';

export var sites_id = 0;

/**
 * The correct site must be set before any other function is called that filters on sites, or the queries will return no results.
 * @param id The ID of the site to set.
 */
export function setSiteID(id: number) { sites_id = id; }

export function getSites() {
    return <DS.DB.MSSQL.IMSSQLSelectQueryResult<ISite>>cds_db.query("SELECT * FROM sites");
}

export function getStaff(username: string) {
    return <DS.DB.MSSQL.IMSSQLSelectQueryResult<Staff>>cds_db.query("SELECT * FROM staff where sites_id = @sites_id and username=@username", {
        sites_id,
        username
    });
}

export function getDepartments() {
    return <DS.DB.MSSQL.IMSSQLSelectQueryResult<IDepartment>>cds_db.query(`select units_departments.id, units_departments.name, units_departments.display as department, programs.display as program
                FROM units_departments 
                LEFT OUTER JOIN programs ON programs.id = units_departments.programs_id
                where units_departments.sites_id=@sites_id and not units_departments.is_inactive=1
                order by department`,
        { sites_id });
}

export function getDirectorDepartments(staff_id: number) {
    return <DS.DB.MSSQL.IMSSQLSelectQueryResult<IDepartment>>cds_db.query(`select map_directors_units_departments.directors_id, map_directors_units_departments.units_departments_id as id, programs.display as program, units_departments.display as department
                FROM map_directors_units_departments LEFT OUTER JOIN units_departments ON units_departments.id = map_directors_units_departments.units_departments_id 
                LEFT OUTER JOIN staff ON staff.id = map_directors_units_departments.directors_id
                LEFT OUTER JOIN programs ON programs.id = units_departments.programs_id
                where staff.id = @staff_id`,
        { staff_id });
}

export function getSupervisorDepartments(staff_id: number) {
    return <DS.DB.MSSQL.IMSSQLSelectQueryResult<IDepartment>>cds_db.query(`select map_supervisors_units_departments.supervisors_id, map_supervisors_units_departments.units_departments_id as id, programs.display as program, units_departments.display as department
                FROM map_supervisors_units_departments LEFT OUTER JOIN units_departments ON units_departments.id = map_supervisors_units_departments.units_departments_id 
                LEFT OUTER JOIN staff ON staff.id = map_supervisors_units_departments.supervisors_id
                LEFT OUTER JOIN programs ON programs.id = units_departments.programs_id
                where staff.id = @staff_id`,
        { staff_id });
}

export function getDelegatedUnitsDepartments(staff_id: number) {
    return <DS.DB.MSSQL.IMSSQLSelectQueryResult<IDelegate>>sp_db.query(`select * from InvolvedUnitsDepartmentsDelegates where StaffID = @staff_id`,
        { staff_id, sites_id });
}

export function getSpecialAuthority(staff_id: number) {
    return <DS.DB.MSSQL.IMSSQLSelectQueryResult<ISpecialAuthority>>sp_db.query(`select * from SpecialAuthorityUsers where StaffID = @staff_id`,
        { staff_id });
}

export interface IIncidentResult {
    IncidentID: number;
    Status: string;
    IsInactive: boolean;
    SeverityDescription: string;
    Severity: string;
    SeverityDisplay: string;
}

export function getIncident(incidentNum: number) {
    return <DS.DB.MSSQL.IMSSQLSelectQueryResult<IIncidentResult>>sp_db.query(`select IncidentID, Status, IsInactive, IncidentSeverities.Description as SeverityDescription, IncidentSeverityGroups.Name as Severity, IncidentSeverityGroups.Display as SeverityDisplay FROM Incidents
                  left join IncidentSeverities on IncidentSeverities.IncidentSeverityID=Incidents.IncidentSeverityID
                  left join IncidentSeverityGroups on IncidentSeverityGroups.IncidentSeverityGroupID=IncidentSeverities.IncidentSeverityGroupID
                  where Incidents.IncidentID=@incidentid and SiteID=@sites_id`,
        { incidentid: incidentNum, sites_id });
}

export function getIncidentInvolvedUnitsDepartments(incidentNum: number) {
    return <DS.DB.MSSQL.IMSSQLSelectQueryResult<IInvolvedUnitDepartment & { Department: string; Program: string; }>>sp_db.query(
        `select InvolvedUnitsDepartments.*, dep.display as Department, prog.display as Program FROM InvolvedUnitsDepartments
                    left join srhccardiac6.cds.dbo.units_departments as dep on dep.id=UnitDepartmentID
                    left join srhccardiac6.cds.dbo.programs as prog on prog.id=programs_id
                    where IncidentID=@incidentid`,
        { incidentid: incidentNum });
}

export function getAssignedSpecialAuthorities(incidentNum: number, specialAuthorityID: number) {
    return <DS.DB.MSSQL.IMSSQLSelectQueryResult<ISpecialAuthorityAssignees>>sp_db.query(`select * from SpecialAuthorityAssignees
        where IncidentID=@incidentid and SpecialAuthorityID=@specialAuthorityID`,
        { incidentid: incidentNum, specialAuthorityID });
}