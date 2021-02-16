"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssignedSpecialAuthorities = exports.getIncidentInvolvedUnitsDepartments = exports.getIncident = exports.getSpecialAuthority = exports.getDelegatedUnitsDepartments = exports.getSupervisorDepartments = exports.getDirectorDepartments = exports.getDepartments = exports.getStaff = exports.getSites = exports.setSiteID = exports.sites_id = void 0;
const db_1 = require("./db");
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
function getStaff(username) {
    return db_1.cds_db.query("SELECT * FROM staff where sites_id = @sites_id and username=@username", {
        sites_id: exports.sites_id,
        username
    });
}
exports.getStaff = getStaff;
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
    return db_1.sp_db.query(`select * from InvolvedUnitsDepartmentsDelegates where StaffID = @staff_id`, { staff_id, sites_id: exports.sites_id });
}
exports.getDelegatedUnitsDepartments = getDelegatedUnitsDepartments;
function getSpecialAuthority(staff_id) {
    return db_1.sp_db.query(`select * from SpecialAuthorityUsers where StaffID = @staff_id`, { staff_id });
}
exports.getSpecialAuthority = getSpecialAuthority;
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
//# sourceMappingURL=cds.js.map