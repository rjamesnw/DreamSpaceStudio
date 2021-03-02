"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDepartmentsFromSupervisor = exports.updateDepartmentsFromDirector = exports.addWhiteboardUser = exports.addStaff = exports.addSpecialAuthorityAssignee = exports.deleteAllDepartmentsForDelegate = exports.getAssignedSpecialAuthorities = exports.getIncidentInvolvedUnitsDepartments = exports.getIncident = exports.removeSpecialAuthority = exports.getSpecialAuthority = exports.getDelegatedUnitsDepartments = exports.getSupervisorDepartments = exports.getDirectorDepartments = exports.getDepartments = exports.getWhiteboardUser = exports.getStaff = exports.getSite = exports.getSites = exports.setSiteID = exports.sites_id = void 0;
const db_1 = require("./db");
const cds_shared_1 = require("../cds.shared");
exports.sites_id = 0;
/**
 * The correct site must be set before any other function is called that filters on sites, or the queries will return no results.
 * @param id The ID of the site to set.
 */
function setSiteID(id) { exports.sites_id = id; }
exports.setSiteID = setSiteID;
function getSites() {
    return db_1.cds_db.query("SELECT * FROM sites");
}
exports.getSites = getSites;
function getSite(id = exports.sites_id) {
    return db_1.cds_db.query("SELECT * FROM sites where id = @sites_id", {
        sites_id: id
    });
}
exports.getSite = getSite;
function getStaff(username) {
    return db_1.cds_db.query("SELECT * FROM staff where sites_id = @sites_id and (username=@username or display like '%'+@username+'%')", {
        sites_id: exports.sites_id,
        username
    });
}
exports.getStaff = getStaff;
function getWhiteboardUser(username) {
    return db_1.wb_db.query("SELECT * FROM USR_Users where UserLoginID=@username or UserFullName like '%'+@username+'%'", {
        username
    });
}
exports.getWhiteboardUser = getWhiteboardUser;
function getDepartments() {
    return db_1.cds_db.query(`select units_departments.id, units_departments.name, units_departments.display as department, programs.display as program
                FROM units_departments 
                LEFT OUTER JOIN programs ON programs.id = units_departments.programs_id
                where units_departments.sites_id=@sites_id and not units_departments.is_inactive=1
                order by department`, { sites_id: exports.sites_id });
}
exports.getDepartments = getDepartments;
function getDirectorDepartments(staff_id) {
    return db_1.cds_db.query(`select map_directors_units_departments.directors_id, map_directors_units_departments.units_departments_id as id, programs.display as program, units_departments.display as department
                FROM map_directors_units_departments LEFT OUTER JOIN units_departments ON units_departments.id = map_directors_units_departments.units_departments_id 
                LEFT OUTER JOIN staff ON staff.id = map_directors_units_departments.directors_id
                LEFT OUTER JOIN programs ON programs.id = units_departments.programs_id
                where staff.id = @staff_id`, { staff_id });
}
exports.getDirectorDepartments = getDirectorDepartments;
function getSupervisorDepartments(staff_id) {
    return db_1.cds_db.query(`select map_supervisors_units_departments.supervisors_id, map_supervisors_units_departments.units_departments_id as id, programs.display as program, units_departments.display as department
                FROM map_supervisors_units_departments LEFT OUTER JOIN units_departments ON units_departments.id = map_supervisors_units_departments.units_departments_id 
                LEFT OUTER JOIN staff ON staff.id = map_supervisors_units_departments.supervisors_id
                LEFT OUTER JOIN programs ON programs.id = units_departments.programs_id
                where staff.id = @staff_id`, { staff_id });
}
exports.getSupervisorDepartments = getSupervisorDepartments;
function getDelegatedUnitsDepartments(staff_id) {
    return db_1.sp_db.query(`select * from InvolvedUnitsDepartmentsDelegates where StaffID = @staff_id`, { staff_id });
}
exports.getDelegatedUnitsDepartments = getDelegatedUnitsDepartments;
function getSpecialAuthority(staff_id) {
    return db_1.sp_db.query(`select * from SpecialAuthorityUsers where StaffID = @staff_id`, { staff_id });
}
exports.getSpecialAuthority = getSpecialAuthority;
function removeSpecialAuthority(staff_id) {
    return db_1.sp_db.query(`delete from SpecialAuthorityUsers where StaffID = @staff_id`, { staff_id });
}
exports.removeSpecialAuthority = removeSpecialAuthority;
function getIncident(incidentNum) {
    return db_1.sp_db.query(`select IncidentID, Status, IsInactive, IncidentSeverities.Description as SeverityDescription, IncidentSeverityGroups.Name as Severity, IncidentSeverityGroups.Display as SeverityDisplay FROM Incidents
                  left join IncidentSeverities on IncidentSeverities.IncidentSeverityID=Incidents.IncidentSeverityID
                  left join IncidentSeverityGroups on IncidentSeverityGroups.IncidentSeverityGroupID=IncidentSeverities.IncidentSeverityGroupID
                  where Incidents.IncidentID=@incidentid and SiteID=@sites_id`, { incidentid: incidentNum, sites_id: exports.sites_id });
}
exports.getIncident = getIncident;
function getIncidentInvolvedUnitsDepartments(incidentNum) {
    return db_1.sp_db.query(`select InvolvedUnitsDepartments.*, dep.display as Department, prog.display as Program FROM InvolvedUnitsDepartments
                    left join srhccardiac6.cds.dbo.units_departments as dep on dep.id=UnitDepartmentID
                    left join srhccardiac6.cds.dbo.programs as prog on prog.id=programs_id
                    where IncidentID=@incidentid`, { incidentid: incidentNum });
}
exports.getIncidentInvolvedUnitsDepartments = getIncidentInvolvedUnitsDepartments;
function getAssignedSpecialAuthorities(incidentNum, specialAuthorityID) {
    return db_1.sp_db.query(`select * from SpecialAuthorityAssignees
        where IncidentID=@incidentid and SpecialAuthorityID=@specialAuthorityID`, { incidentid: incidentNum, specialAuthorityID });
}
exports.getAssignedSpecialAuthorities = getAssignedSpecialAuthorities;
function deleteAllDepartmentsForDelegate(staff_id) {
    return db_1.sp_db.query(`delete from InvolvedUnitsDepartmentsDelegates where StaffID=@staff_id`, { staff_id });
}
exports.deleteAllDepartmentsForDelegate = deleteAllDepartmentsForDelegate;
async function addSpecialAuthorityAssignee(assignee) {
    let conn = await db_1.getSPConnection();
    return await conn.updateOrInsert(assignee, "SpecialAuthorityAssignees");
}
exports.addSpecialAuthorityAssignee = addSpecialAuthorityAssignee;
async function addStaff(staff) {
    let conn = await db_1.getCDSConnection();
    staff.sites_id = exports.sites_id;
    return await conn.updateOrInsert(staff, "staff");
}
exports.addStaff = addStaff;
/**
 * Adds a Whiteboard user based on a CDS user.
 */
async function addWhiteboardUser(staff) {
    let conn = await db_1.getWBConnection();
    staff.sites_id = exports.sites_id;
    var user = new cds_shared_1.WhiteboardUser(staff.first_name, staff.last_name);
    return {
        user,
        result: await conn.updateOrInsert(user, "USR_Users")
    };
}
exports.addWhiteboardUser = addWhiteboardUser;
async function updateDepartmentsFromDirector(staff_id, newDepartmentIDs) {
    var _a, _b;
    var directorOf = await getDirectorDepartments(staff_id); // (first, find all existing departments)
    if ((_a = directorOf.response) === null || _a === void 0 ? void 0 : _a.length) {
        let removeCount = 0;
        await Promise.all(directorOf.response.map(async (d) => {
            if (newDepartmentIDs.indexOf(d.id) < 0) {
                // ... missing from the list, so remove it ...
                await db_1.cds_db.query(`delete from map_directors_units_departments where directors_id=@staff_id and units_departments_id=@units_departments_id`, { staff_id, units_departments_id: d.id });
                ++removeCount;
            }
        }));
        if (removeCount == directorOf.response.length) {
            // ... no longer a director of anything, so remove that also ...
            await db_1.cds_db.query(`delete from directors where staff_id=@staff_id`, { staff_id: staff_id });
        }
    }
    if (newDepartmentIDs === null || newDepartmentIDs === void 0 ? void 0 : newDepartmentIDs.length) {
        var exists = !!((_b = (await db_1.cds_db.query(`select staff_id from directors where staff_id=@staff_id`, { staff_id })).response) === null || _b === void 0 ? void 0 : _b.length);
        if (!exists)
            await db_1.cds_db.query(`insert into directors ({fields}) values ({parameters})`, { staff_id, is_inactive: 0 });
        else
            await db_1.cds_db.query(`update directors set is_inactive=0 where staff_id=@staff_id`, { staff_id });
        await Promise.all(newDepartmentIDs.map(async (id) => {
            var _a;
            if (!((_a = directorOf.response) === null || _a === void 0 ? void 0 : _a.some(d => d.id == id))) {
                // ... missing from the list, so remove it ...
                await db_1.cds_db.query(`insert into map_directors_units_departments ({fields}) values ({parameters})`, { directors_id: staff_id, units_departments_id: id });
            }
        }));
    }
}
exports.updateDepartmentsFromDirector = updateDepartmentsFromDirector;
async function updateDepartmentsFromSupervisor(staff_id, newDepartmentIDs) {
    var _a, _b;
    var supervisorOf = await getSupervisorDepartments(staff_id);
    if ((_a = supervisorOf.response) === null || _a === void 0 ? void 0 : _a.length) {
        let removeCount = 0;
        await Promise.all(supervisorOf.response.map(async (d) => {
            if (newDepartmentIDs.indexOf(d.id) < 0) {
                // ... missing from the list, so remove it ...
                await db_1.cds_db.query(`delete from map_supervisors_units_departments where supervisors_id=@staff_id and units_departments_id=@units_departments_id`, { staff_id: staff_id, units_departments_id: d.id });
                ++removeCount;
            }
        }));
        if (removeCount == supervisorOf.response.length) {
            // ... no longer a supervisor of anything, so remove that also ...
            await db_1.cds_db.query(`delete from supervisors where staff_id=@staff_id`, { staff_id: staff_id });
        }
    }
    if (newDepartmentIDs === null || newDepartmentIDs === void 0 ? void 0 : newDepartmentIDs.length) {
        var exists = !!((_b = (await db_1.cds_db.query(`select staff_id from supervisors where staff_id=@staff_id`, { staff_id })).response) === null || _b === void 0 ? void 0 : _b.length);
        if (!exists)
            await db_1.cds_db.query(`insert into supervisors ({fields}) values ({parameters})`, { staff_id, is_inactive: 0 });
        else
            await db_1.cds_db.query(`update supervisors set is_inactive=0 where staff_id=@staff_id`, { staff_id });
        await Promise.all(newDepartmentIDs.map(async (id) => {
            var _a;
            if (!((_a = supervisorOf.response) === null || _a === void 0 ? void 0 : _a.some(d => d.id == id))) {
                // ... missing from the list, so remove it ...
                await db_1.cds_db.query(`insert into map_supervisors_units_departments ({fields}) values ({parameters})`, { supervisors_id: staff_id, units_departments_id: id });
            }
        }));
    }
}
exports.updateDepartmentsFromSupervisor = updateDepartmentsFromSupervisor;
//# sourceMappingURL=cds.js.map