"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.post = exports.get = void 0;
const util_1 = require("util");
const cds_shared_1 = require("../cds.shared");
const cds_1 = require("./cds");
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
    var session = req.session;
    try {
        var username = req.query.username;
        var incidentNum = req.query.incidentNum && +req.query.incidentNum || void 0;
        var sites_id = +session.sites_id;
        if (!sites_id)
            throw "No valid site ID exists in the session. Please login first.";
        cds_1.setSiteID(sites_id);
        var staffResuts = await cds_1.getStaff(username);
        if (!staffResuts.response.length) {
            let analysis = results[results.length] = new cds_shared_1.Analysis(null);
            analysis.username = username;
            analysis.incidentNum = incidentNum;
            var msg = `User is not added to CDS and does not have access to login ${analysis.correctThisLink('fixMissingCDSUser')}.`;
            analysis.error(msg);
        }
        else
            for (var staff of staffResuts.response) {
                let analysis = results[results.length] = new cds_shared_1.Analysis(staff);
                analysis.username = staff.username;
                analysis.staff_id = staff.id;
                analysis.incidentNum = incidentNum;
                console.log("Checking staff:" + staff.display + "...");
                if (sites_id == 3) {
                    var wbUser = await cds_1.getWhiteboardUser(analysis.username);
                    if (wbUser.response.length)
                        analysis.add("User has access to the ER Whiteboard.");
                    else
                        analysis.add(`User does not have access to the ER Whiteboard (<a href="#" onclick="${analysis.actionLink('addWBUser')}">add them</a>).`);
                }
                var allDepartments = await cds_1.getDepartments();
                analysis.departments = allDepartments.response;
                var directors = await cds_1.getDirectorDepartments(staff.id);
                var supervisors = await cds_1.getSupervisorDepartments(staff.id);
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
                var delegates = await cds_1.getDelegatedUnitsDepartments(staff.id);
                if (!delegates.response.length)
                    analysis.add("User is not a delegate.");
                else {
                    analysis.add("User is a delegate.");
                    if (analysis.directorOf || analysis.supervisorOf)
                        analysis.error("This user should not be a delegate AND also a supervisor or director."
                            + ` Making a supervisor or director a delegate of another unit/department may cause problems accessing incidents ${analysis.correctThisLink('fixSupDirAsDel')}.`);
                }
                var specAuthUsers = await cds_1.getSpecialAuthority(staff.id);
                let sa = specAuthUsers.response[0];
                var incidents = incidentNum && await cds_1.getIncident(incidentNum);
                var incident = ((_a = incidents === null || incidents === void 0 ? void 0 : incidents.response) === null || _a === void 0 ? void 0 : _a.length) ? incidents.response[0] : null;
                if (incident) {
                    var involvedUnitDepartments = await cds_1.getIncidentInvolvedUnitsDepartments(incidentNum);
                    if (!((_b = involvedUnitDepartments === null || involvedUnitDepartments === void 0 ? void 0 : involvedUnitDepartments.response) === null || _b === void 0 ? void 0 : _b.length))
                        analysis.warning("There are no units or departments associated with that incident. No one will be able to open it.");
                    else {
                        var msg = "These are the only departments allowed to access this incident:";
                        involvedUnitDepartments.response.forEach(i => msg += "\r\n * " + i.Department + ` (${i.Program})`);
                        analysis.add(msg);
                        var authorized = !analysis.directorOf ? false : analysis.directorOf.some(d => involvedUnitDepartments.response.some(i => i.UnitDepartmentID == d.id));
                        var authorized = authorized || !analysis.supervisorOf ? authorized : analysis.supervisorOf.some(d => involvedUnitDepartments.response.some(i => i.UnitDepartmentID == d.id));
                        if (authorized) {
                            state = cds_shared_1.AnalysisMessageState.NoIssue;
                            var msg = "User is a part of at least one unit or department associated with the incident";
                            var specialAuthorityAssignees = sa && await cds_1.getAssignedSpecialAuthorities(incidentNum, sa.SpecialAuthorityID) || null;
                            if (specialAuthorityAssignees === null || specialAuthorityAssignees === void 0 ? void 0 : specialAuthorityAssignees.response.length) {
                                msg += " and should be able to open it.";
                                if (specialAuthorityAssignees.response[0].DoneReviewing)
                                    msg += " User is also done reviewing the incident.";
                                else {
                                    state = cds_shared_1.AnalysisMessageState.Warning;
                                    msg += " User has not yet completed reviewing the incident.";
                                }
                            }
                            else {
                                state = cds_shared_1.AnalysisMessageState.Error;
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
                    analysis.add(`User is a special authority (<a href="#" onclick="${analysis.actionLink('removeSpecialAuth')}">correct this</a>).`);
                    analysis.specialAuthorityID = sa.SpecialAuthorityID;
                    if (authorized) {
                        analysis.add(`User will not get notifications unless the severity is '${sa.MinimumAlertSeverityRequired}' or greater.`);
                        if (incident) {
                            state = cds_shared_1.AnalysisMessageState.NoIssue;
                            var msg = `The incident has a severity of '${incident.SeverityDisplay}'.`;
                            var incidentSL = cds_shared_1.Severities[incident.Severity];
                            var saSL = cds_shared_1.Severities[sa.MinimumAlertSeverityRequired];
                            if (incidentSL < saSL) {
                                msg += ` Since the severity is less than what the special authority notification level, they will not get a notification.`;
                                state = cds_shared_1.AnalysisMessageState.Warning;
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
                break;
            }
        res.status(200).json(results);
        //? res.end();
    }
    catch (ex) {
        return Promise.reject(ex);
    }
}
exports.get = get;
;
async function post(req, res, next) {
    var _a;
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
                let updateResult = cds_1.addSpecialAuthorityAssignee({
                    IncidentID: analysis.incidentNum,
                    DoneReviewing: false,
                    SpecialAuthorityID: analysis.specialAuthorityID
                });
                res.status(200).json(new DS.IO.Response(null));
                break;
            }
            case "fixMissingCDSUser": {
                try {
                    var staff = cds_shared_1.validateNewUserDetails(analysis.username, analysis.first_name, analysis.last_name, analysis.email);
                    if (staff instanceof Error)
                        return next(staff); // (DS.Exception inherits from Error)
                }
                catch (err) {
                    return next(err);
                }
                let updateResult = await cds_1.addStaff(staff);
                res.status(200).json(new DS.IO.Response(null));
                break;
            }
            case "fixSupDirAsDel": {
                if (!analysis.staff_id)
                    return next(DS.Exception.error("analysis.post()", "'staff_id' missing."));
                await cds_1.deleteAllDepartmentsForDelegate(analysis.staff_id);
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
                // ... sync the new department selections ....
                await cds_1.updateDepartmentsFromDirector(analysis.staff_id, analysis.directorDepartments);
                await cds_1.updateDepartmentsFromSupervisor(analysis.staff_id, analysis.supervisorDepartments);
                res.status(200).json(new DS.IO.Response(null));
                break;
            }
            case "removeSpecialAuth": {
                if (!analysis.staff_id)
                    return next(DS.Exception.error("analysis.post()", "'staff_id' missing."));
                await cds_1.removeSpecialAuthority(analysis.staff_id);
                res.status(200).json(new DS.IO.Response(null));
                break;
            }
            case "addWBUser": {
                if (cds_1.sites_id != 3)
                    return next(DS.Exception.error("analysis.post()", "Unauthorized site: " + cds_1.sites_id));
                let staffResponse = await cds_1.getStaff(analysis.username);
                if (!((_a = staffResponse.response) === null || _a === void 0 ? void 0 : _a.length))
                    return next(DS.Exception.error("analysis.post()", "User not found in CDS."));
                let staff = staffResponse.response[0];
                let result = await cds_1.addWhiteboardUser(staff);
                res.status(200).json(new DS.IO.Response(`User added. \r\nUsername is '${result.user.UserLoginID}' and password is '${result.user.UserPassword}'.`));
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