"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.post = exports.get = void 0;
const util_1 = require("util");
const cds_1 = require("../cds");
var cds_db = new DS.DB.MSSQL.MSSQLAdapter({
    user: process.env.CDS_MSSQL_USER,
    password: process.env.CDS_MSSQL_PASS,
    server: process.env.CDS_MSSQL_HOST + (process.env.CDS_MSSQL_INSTANCE ? '\\' + process.env.CDS_MSSQL_INSTANCE : ''),
    database: process.env.CDS_MSSQL_DB_NAME,
    options: {
        encrypt: false // Set this to true if you're on Windows Azure (default is false)
    }
});
var cds_conn;
var sp_db = new DS.DB.MSSQL.MSSQLAdapter({
    user: process.env.SP_MSSQL_USER,
    password: process.env.SP_MSSQL_PASS,
    server: process.env.SP_MSSQL_HOST + (process.env.SP_MSSQL_INSTANCE ? '\\' + process.env.SP_MSSQL_INSTANCE : ''),
    database: process.env.SP_MSSQL_DB_NAME,
    options: {
        encrypt: false // Set this to true if you're on Windows Azure (default is false)
    }
});
var sp_conn;
async function _getCDSConnection() {
    //if (this._BotPalConn && (this._BotPalConn.connection.state == 'connected' || this._BotPalConn.connection.state == 'authenticated'))
    //    return this._BotPalConn;
    return cds_conn || (cds_conn = await cds_db.createConnection()); // (uses the environment default values)
}
async function _getSPConnection() {
    //if (this._BotPalConn && (this._BotPalConn.connection.state == 'connected' || this._BotPalConn.connection.state == 'authenticated'))
    //    return this._BotPalConn;
    return sp_conn || (sp_conn = await sp_db.createConnection()); // (uses the environment default values)
}
//let newFile = new TTSFile();
//newFile.filename = DS.Path.getName(targetFilename);
//newFile.voice_code = DS.StringUtils.isEmptyOrWhitespace(voiceCode) ? null : voiceCode;
//newFile.location = DS.Path.getPath(targetFilename);
//newFile.text = text;
//var conn = await this._getConnection();
//await conn.updateOrInsert(newFile, "tts_files");
async function get(req, res, next) {
    var _a, _b;
    var json, results = [], state;
    try {
        var username = req.query.username;
        var incidentNum = req.query.incidentNum && +req.query.incidentNum || void 0;
        var sites_id = 1;
        var staffResuts = await cds_db.query("SELECT * FROM staff where sites_id = @sites_id and username=@username", {
            sites_id,
            username
        });
        if (!staffResuts.response.length) {
            let analysis = results[results.length] = new cds_1.Analysis(null);
            analysis.username = username;
            analysis.incidentNum = incidentNum;
            var msg = `User is not added to CDS and does not have access to login ${analysis.correctThisLink('fixMissingCDSUser')}.`;
            analysis.error(msg);
        }
        else
            for (var staff of staffResuts.response) {
                let analysis = results[results.length] = new cds_1.Analysis(staff);
                analysis.username = staff.username;
                analysis.staff_id = staff.id;
                analysis.incidentNum = incidentNum;
                console.log("Checking staff:" + staff.display + "...");
                var allDepartments = await cds_db.query(`select units_departments.id, units_departments.name, units_departments.display as department, programs.display as program
                FROM units_departments 
                LEFT OUTER JOIN programs ON programs.id = units_departments.programs_id
                where units_departments.sites_id=@sites_id and not units_departments.is_inactive=1
                order by department`, { sites_id });
                analysis.departments = allDepartments.response;
                var directors = await cds_db.query(`select map_directors_units_departments.directors_id, map_directors_units_departments.units_departments_id as id, programs.display as program, units_departments.display as department
                FROM map_directors_units_departments LEFT OUTER JOIN units_departments ON units_departments.id = map_directors_units_departments.units_departments_id 
                LEFT OUTER JOIN staff ON staff.id = map_directors_units_departments.directors_id
                LEFT OUTER JOIN programs ON programs.id = units_departments.programs_id
                where staff.id = @staff_id`, { staff_id: staff.id });
                var supervisors = await cds_db.query(`select map_supervisors_units_departments.supervisors_id, map_supervisors_units_departments.units_departments_id as id, programs.display as program, units_departments.display as department
                FROM map_supervisors_units_departments LEFT OUTER JOIN units_departments ON units_departments.id = map_supervisors_units_departments.units_departments_id 
                LEFT OUTER JOIN staff ON staff.id = map_supervisors_units_departments.supervisors_id
                LEFT OUTER JOIN programs ON programs.id = units_departments.programs_id
                where staff.id = @staff_id`, { staff_id: staff.id });
                if (directors.response.length) {
                    analysis.add("User is a director.");
                    analysis.directorOf = directors.response;
                }
                if (supervisors.response.length) {
                    analysis.add("User is a supervisor.");
                    analysis.supervisorOf = supervisors.response;
                }
                if (!analysis.directorOf && !analysis.supervisorOf)
                    analysis.add("User is not a supervisor or director.");
                var delegates = await sp_db.query(`select * from InvolvedUnitsDepartmentsDelegates where StaffID = @staff_id`, { staff_id: staff.id, sites_id });
                if (!delegates.response.length)
                    analysis.add("User is not a delegate.");
                else {
                    analysis.add("User is a delegate.");
                    if (analysis.directorOf || analysis.supervisorOf)
                        analysis.error("This user should not be a delegate AND also a supervisor or director."
                            + ` Making a supervisor or director a delegate of another unit/department may cause problems accessing incidents ${analysis.correctThisLink('fixSupDirAsDel')}.`);
                }
                var specAuthUsers = await sp_db.query(`select * from SpecialAuthorityUsers where StaffID = @staff_id`, { staff_id: staff.id });
                let sa = specAuthUsers.response[0];
                var incidents = incidentNum && await sp_db.query(`select IncidentID, Status, IsInactive, IncidentSeverities.Description as SeverityDescription, IncidentSeverityGroups.Name as Severity, IncidentSeverityGroups.Display as SeverityDisplay FROM Incidents
                  left join IncidentSeverities on IncidentSeverities.IncidentSeverityID=Incidents.IncidentSeverityID
                  left join IncidentSeverityGroups on IncidentSeverityGroups.IncidentSeverityGroupID=IncidentSeverities.IncidentSeverityGroupID
                  where Incidents.IncidentID=@incidentid and SiteID=@sites_id`, { incidentid: incidentNum, sites_id });
                var incident = ((_a = incidents === null || incidents === void 0 ? void 0 : incidents.response) === null || _a === void 0 ? void 0 : _a.length) ? incidents.response[0] : null;
                if (incident) {
                    var involvedUnitDepartments = await sp_db.query(`select InvolvedUnitsDepartments.*, dep.display as Department, prog.display as Program FROM InvolvedUnitsDepartments
                    left join srhccardiac6.cds.dbo.units_departments as dep on dep.id=UnitDepartmentID
                    left join srhccardiac6.cds.dbo.programs as prog on prog.id=programs_id
                    where IncidentID=@incidentid`, { incidentid: incidentNum });
                    if (!((_b = involvedUnitDepartments === null || involvedUnitDepartments === void 0 ? void 0 : involvedUnitDepartments.response) === null || _b === void 0 ? void 0 : _b.length))
                        analysis.warning("There are no units or departments associated with that incident. No one will be able to open it.");
                    else {
                        var msg = "These are the only departments allowed to access this incident:";
                        involvedUnitDepartments.response.forEach(i => msg += "\r\n * " + i.Department + ` (${i.Program})`);
                        analysis.add(msg);
                        var authorized = !analysis.directorOf ? false : analysis.directorOf.some(d => involvedUnitDepartments.response.some(i => i.UnitDepartmentID == d.id));
                        var authorized = authorized || !analysis.supervisorOf ? authorized : analysis.supervisorOf.some(d => involvedUnitDepartments.response.some(i => i.UnitDepartmentID == d.id));
                        if (authorized) {
                            state = cds_1.AnalysisMessageState.NoIssue;
                            var msg = "User is a part of at least one unit or department associated with the incident";
                            var specialAuthorityAssignees = await sp_db.query(`select * from SpecialAuthorityAssignees
                            where IncidentID=@incidentid and SpecialAuthorityID=@specialAuthorityID`, { incidentid: incidentNum, specialAuthorityID: sa.SpecialAuthorityID });
                            if (specialAuthorityAssignees.response.length) {
                                msg += " and should be able to open it.";
                                if (specialAuthorityAssignees.response[0].DoneReviewing)
                                    msg += " User is also done reviewing the incident.";
                                else {
                                    state = cds_1.AnalysisMessageState.Warning;
                                    msg += " User has not yet completed reviewing the incident.";
                                }
                            }
                            else {
                                state = cds_1.AnalysisMessageState.Error;
                                msg += ` but will not be able to open it, as they were not part of any related department when the incident was created (<a href="#" onclick="${analysis.actionLink('fixMissingSpecialAuth')}">correct this</a>).`;
                            }
                            analysis.add(msg, state);
                        }
                        else
                            analysis.warning("User is not part of any unit or department associated with the incident and will not be able to open it.");
                    }
                }
                if (!sa)
                    analysis.add("User is not a special authority.");
                else {
                    analysis.add("User is a special authority.");
                    analysis.specialAuthorityID = sa.SpecialAuthorityID;
                    if (authorized) {
                        analysis.add(`User will not get notifications unless the severity is '${sa.MinimumAlertSeverityRequired}' or greater.`);
                        if (incident) {
                            state = cds_1.AnalysisMessageState.NoIssue;
                            var msg = `The incident has a severity of '${incident.SeverityDisplay}'.`;
                            var incidentSL = cds_1.Severities[incident.Severity];
                            var saSL = cds_1.Severities[sa.MinimumAlertSeverityRequired];
                            if (incidentSL < saSL) {
                                msg += ` Since the severity is less than what the special authority notification level, they will not get a notification.`;
                                state = cds_1.AnalysisMessageState.Warning;
                            }
                            else
                                msg += ` Since the severity is equal or greater than the special authority notification level, they should have gotten a notification.`;
                            analysis.add(msg, state);
                        }
                    }
                }
                if (!incident) {
                    if (incidentNum)
                        analysis.error(`Unable to analyze incident: No incident with ID '${incidentNum}' could be found.`);
                    else
                        analysis.add(`Unable to analyze incident: No incident specified.`);
                }
                else {
                    if (incident.IsInactive == true)
                        analysis.warning(" The incident is inactive and can no longer be opened.");
                }
            }
        res.status(200).json(results);
        //? res.end();
        return Promise.resolve();
    }
    catch (ex) {
        return Promise.reject(ex);
    }
}
exports.get = get;
;
async function post(req, res, next) {
    var _a, _b, _c, _d;
    var cmd = req.query.cmd, analysis = req.body;
    try {
        switch (cmd) {
            case "fixMissingSpecialAuth": {
                if (!analysis.id)
                    return next(DS.Exception.error("analysis.post()", "'id' missing."));
                if (!analysis.incidentNum)
                    return next(DS.Exception.error("analysis.post()", "'incidentNum' missing."));
                if (!analysis.staff_id)
                    return next(DS.Exception.error("analysis.post()", "'staff_id' missing."));
                if (!analysis.specialAuthorityID)
                    return next(DS.Exception.error("analysis.post()", "'specialAuthorityID' missing."));
                let conn = await _getSPConnection();
                let newAssignedSpecialAuth = {
                    IncidentID: analysis.incidentNum,
                    DoneReviewing: false,
                    SpecialAuthorityID: analysis.specialAuthorityID
                };
                var updateResult = await conn.updateOrInsert(newAssignedSpecialAuth, "SpecialAuthorityAssignees");
                res.status(200).json(new DS.IO.Response(null));
                break;
            }
            case "fixMissingCDSUser": {
                if (!analysis.username)
                    return next(DS.Exception.error("analysis.post()", "'username' missing."));
                if (!analysis.firstName)
                    return next(DS.Exception.error("analysis.post()", "'firstName' missing."));
                if (!analysis.lastName)
                    return next(DS.Exception.error("analysis.post()", "'lastName' missing."));
                if (!analysis.email)
                    return next(DS.Exception.error("analysis.post()", "'email' missing."));
                let conn = await _getCDSConnection();
                let newStaff = {
                    username: analysis.username,
                    email: analysis.email,
                    first_name: analysis.firstName,
                    last_name: analysis.lastName,
                    display: analysis.firstName + " " + analysis.lastName,
                    name: analysis.firstName + analysis.lastName,
                    is_inactive: false,
                    sites_id: 1
                };
                var updateResult = await conn.updateOrInsert(newStaff, "staff");
                res.status(200).json(new DS.IO.Response(null));
                break;
            }
            case "fixSupDirAsDel": {
                if (!analysis.staff_id)
                    return next(DS.Exception.error("analysis.post()", "'staff_id' missing."));
                await sp_db.query(`delete from InvolvedUnitsDepartmentsDelegates where StaffID=@staff_id`, { staff_id: analysis.staff_id });
                res.status(200).json(new DS.IO.Response(null));
                break;
            }
            case "updateAsSupervisorDirector": {
                if (!analysis.staff_id)
                    return next(DS.Exception.error("analysis.post()", "'staff_id' missing."));
                if (!util_1.isArray(analysis.directorDepartments))
                    return next(DS.Exception.error("analysis.post()", "'directorDepartments' array missing."));
                if (!util_1.isArray(analysis.supervisorDepartments))
                    return next(DS.Exception.error("analysis.post()", "'supervisorDepartments' array missing."));
                // ... first get the updated list of what departments they are of ...
                var directorOf = await cds_db.query(`select map_directors_units_departments.directors_id, map_directors_units_departments.units_departments_id as id, programs.display as program, units_departments.display as department
                FROM map_directors_units_departments LEFT OUTER JOIN units_departments ON units_departments.id = map_directors_units_departments.units_departments_id 
                LEFT OUTER JOIN staff ON staff.id = map_directors_units_departments.directors_id
                LEFT OUTER JOIN programs ON programs.id = units_departments.programs_id
                where staff.id = @staff_id`, { staff_id: analysis.staff_id });
                var supervisorOf = await cds_db.query(`select map_supervisors_units_departments.supervisors_id, map_supervisors_units_departments.units_departments_id as id, programs.display as program, units_departments.display as department
                FROM map_supervisors_units_departments LEFT OUTER JOIN units_departments ON units_departments.id = map_supervisors_units_departments.units_departments_id 
                LEFT OUTER JOIN staff ON staff.id = map_supervisors_units_departments.supervisors_id
                LEFT OUTER JOIN programs ON programs.id = units_departments.programs_id
                where staff.id = @staff_id`, { staff_id: analysis.staff_id });
                // ... remove the missing ones ....
                if ((_a = directorOf.response) === null || _a === void 0 ? void 0 : _a.length) {
                    let removeCount = 0;
                    await Promise.all(directorOf.response.map(async (d) => {
                        if (analysis.directorDepartments.indexOf(d.id) < 0) {
                            // ... missing from the list, so remove it ...
                            await cds_db.query(`delete from map_directors_units_departments where directors_id=@staff_id and units_departments_id=@units_departments_id`, { staff_id: analysis.staff_id, units_departments_id: d.id });
                            ++removeCount;
                        }
                    }));
                    if (removeCount == directorOf.response.length) {
                        // ... no longer a director of anything, so remove that also ...
                        await cds_db.query(`delete from directors where staff_id=@staff_id`, { staff_id: analysis.staff_id });
                    }
                }
                if ((_b = supervisorOf.response) === null || _b === void 0 ? void 0 : _b.length) {
                    let removeCount = 0;
                    await Promise.all(supervisorOf.response.map(async (d) => {
                        if (analysis.supervisorDepartments.indexOf(d.id) < 0) {
                            // ... missing from the list, so remove it ...
                            await cds_db.query(`delete from map_supervisors_units_departments where supervisors_id=@staff_id and units_departments_id=@units_departments_id`, { staff_id: analysis.staff_id, units_departments_id: d.id });
                            ++removeCount;
                        }
                    }));
                    if (removeCount == supervisorOf.response.length) {
                        // ... no longer a supervisor of anything, so remove that also ...
                        await cds_db.query(`delete from supervisors where staff_id=@staff_id`, { staff_id: analysis.staff_id });
                    }
                }
                // ... add the missing ones ...
                if (analysis.directorDepartments.length) {
                    var exists = !!((_c = (await cds_db.query(`select staff_id from directors where staff_id=@staff_id`, { staff_id: analysis.staff_id })).response) === null || _c === void 0 ? void 0 : _c.length);
                    if (!exists)
                        await cds_db.query(`insert into directors ({fields}) values ({parameters})`, { staff_id: analysis.staff_id, is_inactive: 0 });
                    else
                        await cds_db.query(`update directors set is_inactive=0 where staff_id=@staff_id`, { staff_id: analysis.staff_id });
                    await Promise.all(analysis.directorDepartments.map(async (id) => {
                        var _a;
                        if (!((_a = directorOf.response) === null || _a === void 0 ? void 0 : _a.some(d => d.id == id))) {
                            // ... missing from the list, so remove it ...
                            await cds_db.query(`insert into map_directors_units_departments ({fields}) values ({parameters})`, { directors_id: analysis.staff_id, units_departments_id: id });
                        }
                    }));
                }
                if (analysis.supervisorDepartments.length) {
                    var exists = !!((_d = (await cds_db.query(`select staff_id from supervisors where staff_id=@staff_id`, { staff_id: analysis.staff_id })).response) === null || _d === void 0 ? void 0 : _d.length);
                    if (!exists)
                        await cds_db.query(`insert into supervisors ({fields}) values ({parameters})`, { staff_id: analysis.staff_id, is_inactive: 0 });
                    else
                        await cds_db.query(`update supervisors set is_inactive=0 where staff_id=@staff_id`, { staff_id: analysis.staff_id });
                    await Promise.all(analysis.supervisorDepartments.map(async (id) => {
                        var _a;
                        if (!((_a = supervisorOf.response) === null || _a === void 0 ? void 0 : _a.some(d => d.id == id))) {
                            // ... missing from the list, so remove it ...
                            await cds_db.query(`insert into map_supervisors_units_departments ({fields}) values ({parameters})`, { supervisors_id: analysis.staff_id, units_departments_id: id });
                        }
                    }));
                }
                res.status(200).json(new DS.IO.Response(null));
                break;
            }
            default:
                res.status(400).json(DS.IO.Response.fromError("Action is not yet implemented.", null));
        }
    }
    catch (ex) {
        res.status(200).json(DS.IO.Response.fromError(null, ex));
    }
}
exports.post = post;
//# sourceMappingURL=analyze.js.map