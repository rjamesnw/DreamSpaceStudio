import { cds_db, sp_db, getCDSConnection, getSPConnection, getWBConnection, wb_db } from './db';
import {
    Analysis, Director, IDepartment, IDelegate, ISpecialAuthority, IIncident, Staff, Supervisor, Severities,
    IncidentStatus, IInvolvedUnitDepartment, ISpecialAuthorityAssignees, AnalysisMessageState, IAnalysis, ISite, WhiteboardUser
} from '../../cds.shared';

export var sites_id = 0;

/**
 * The correct site must be set before any other function is called that filters on sites, or the queries will return no results.
 * @param id The ID of the site to set.
 */
export function setSiteID(id: number) { sites_id = id; }

export function getSites() {
    return <DS.DB.MSSQL.IMSSQLSelectQueryResult<ISite>>cds_db.query("SELECT * FROM sites");
}

export function getSite(id = sites_id) {
    return <DS.DB.MSSQL.IMSSQLSelectQueryResult<ISite>>cds_db.query("SELECT * FROM sites where id = @sites_id", {
        sites_id: id
    });
}

export function getStaff(username: string) {
    return <DS.DB.MSSQL.IMSSQLSelectQueryResult<Staff>>cds_db.query("SELECT * FROM staff where sites_id = @sites_id and (username=@username or display like '%'+@username+'%')", {
        sites_id,
        username
    });
}

export function getWhiteboardUser(username: string) {
    return <DS.DB.MSSQL.IMSSQLSelectQueryResult<WhiteboardUser>>wb_db.query("SELECT * FROM USR_Users where UserLoginID=@username or UserFullName like '%'+@username+'%'", {
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
        { staff_id });
}

export function getSpecialAuthority(staff_id: number) {
    return <DS.DB.MSSQL.IMSSQLSelectQueryResult<ISpecialAuthority>>sp_db.query(`select * from SpecialAuthorityUsers where StaffID = @staff_id`,
        { staff_id });
}

export function removeSpecialAuthority(staff_id: number) {
    return <DS.DB.MSSQL.IMSSQLSelectQueryResult<ISpecialAuthority>>sp_db.query(`delete from SpecialAuthorityUsers where StaffID = @staff_id`,
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

export function deleteAllDepartmentsForDelegate(staff_id: number) {
    return sp_db.query(`delete from InvolvedUnitsDepartmentsDelegates where StaffID=@staff_id`,
        { staff_id });
}

export async function addSpecialAuthorityAssignee(assignee: ISpecialAuthorityAssignees) {
    let conn = await getSPConnection();
    return await conn.updateOrInsert(assignee, "SpecialAuthorityAssignees");
}

export async function addStaff(staff: Staff) {
    let conn = await getCDSConnection();

    staff.sites_id = sites_id;

    return await conn.updateOrInsert(staff, "staff");

}

/**
 * Adds a Whiteboard user based on a CDS user.
 */
export async function addWhiteboardUser(staff: Staff) {
    let conn = await getWBConnection();

    staff.sites_id = sites_id;

    var user = new WhiteboardUser(staff.first_name, staff.last_name);

    return {
        user,
        result: await conn.updateOrInsert(user, "USR_Users")
    };
}

export async function updateDepartmentsFromDirector(staff_id: number, newDepartmentIDs: number[]) {
    var directorOf = await getDirectorDepartments(staff_id); // (first, find all existing departments)

    if (directorOf.response?.length) {
        let removeCount = 0;
        await Promise.all(
            directorOf.response.map(async d => {
                if (newDepartmentIDs.indexOf(d.id) < 0) {
                    // ... missing from the list, so remove it ...
                    await cds_db.query(`delete from map_directors_units_departments where directors_id=@staff_id and units_departments_id=@units_departments_id`,
                        { staff_id, units_departments_id: d.id });
                    ++removeCount;
                }
            })
        );

        if (removeCount == directorOf.response.length) {
            // ... no longer a director of anything, so remove that also ...
            await cds_db.query(`delete from directors where staff_id=@staff_id`,
                { staff_id: staff_id });
        }
    }

    if (newDepartmentIDs?.length) {
        var exists = !!(await cds_db.query<DS.DB.IRecordSet<{ staff_id: number }>>(`select staff_id from directors where staff_id=@staff_id`, { staff_id })).response?.length;
        if (!exists)
            await cds_db.query(`insert into directors ({fields}) values ({parameters})`, { staff_id, is_inactive: 0 });
        else
            await cds_db.query(`update directors set is_inactive=0 where staff_id=@staff_id`, { staff_id });

        await Promise.all(
            newDepartmentIDs.map(async id => {
                if (!directorOf.response?.some(d => d.id == id)) {
                    // ... missing from the list, so remove it ...
                    await cds_db.query(`insert into map_directors_units_departments ({fields}) values ({parameters})`,
                        { directors_id: staff_id, units_departments_id: id });
                }
            })
        );
    }
}

export async function updateDepartmentsFromSupervisor(staff_id: number, newDepartmentIDs: number[]) {
    var supervisorOf = await getSupervisorDepartments(staff_id);

    if (supervisorOf.response?.length) {
        let removeCount = 0;
        await Promise.all(
            supervisorOf.response.map(async d => {
                if (newDepartmentIDs.indexOf(d.id) < 0) {
                    // ... missing from the list, so remove it ...
                    await cds_db.query(`delete from map_supervisors_units_departments where supervisors_id=@staff_id and units_departments_id=@units_departments_id`,
                        { staff_id: staff_id, units_departments_id: d.id });
                    ++removeCount;
                }
            })
        );
        if (removeCount == supervisorOf.response.length) {
            // ... no longer a supervisor of anything, so remove that also ...
            await cds_db.query(`delete from supervisors where staff_id=@staff_id`,
                { staff_id: staff_id });
        }
    }

    if (newDepartmentIDs?.length) {
        var exists = !!(await cds_db.query<DS.DB.IRecordSet<{ staff_id: number }>>(`select staff_id from supervisors where staff_id=@staff_id`, { staff_id })).response?.length;
        if (!exists)
            await cds_db.query(`insert into supervisors ({fields}) values ({parameters})`, { staff_id, is_inactive: 0 });
        else
            await cds_db.query(`update supervisors set is_inactive=0 where staff_id=@staff_id`, { staff_id });

        await Promise.all(
            newDepartmentIDs.map(async id => {
                if (!supervisorOf.response?.some(d => d.id == id)) {
                    // ... missing from the list, so remove it ...
                    await cds_db.query(`insert into map_supervisors_units_departments ({fields}) values ({parameters})`,
                        { supervisors_id: staff_id, units_departments_id: id });
                }
            })
        );
    }
}
