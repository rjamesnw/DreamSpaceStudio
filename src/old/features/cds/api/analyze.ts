/*
 * Connects to the SafePoint database to analyze for issues.
 */
import express = require('express');
import { isArray } from 'util';
import {
    Analysis, Director, IDepartment, IDelegate, ISpecialAuthority, IIncident, Staff, Supervisor, Severities,
    IncidentStatus, IInvolvedUnitDepartment, ISpecialAuthorityAssignees, AnalysisMessageState, IAnalysis, validateNewUserDetails
} from '../cds.shared';
import { getDepartments, getStaff, getDirectorDepartments, setSiteID, getSupervisorDepartments, getDelegatedUnitsDepartments, getSpecialAuthority, getIncident, getIncidentInvolvedUnitsDepartments, getAssignedSpecialAuthorities, deleteAllDepartmentsForDelegate, addSpecialAuthorityAssignee, addStaff, updateDepartmentsFromDirector, updateDepartmentsFromSupervisor, removeSpecialAuthority, getWhiteboardUser, sites_id, addWhiteboardUser } from './cds';


//let newFile = new TTSFile();
//newFile.filename = DS.Path.getName(targetFilename);
//newFile.voice_code = DS.StringUtils.isEmptyOrWhitespace(voiceCode) ? null : voiceCode;
//newFile.location = DS.Path.getPath(targetFilename);
//newFile.text = text;
//var conn = await this._getConnection();
//await conn.updateOrInsert(newFile, "tts_files");

export async function get(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    var json: string, results: Analysis[] = [], state: AnalysisMessageState;
    var session: typeof req.session & IndexedObject = req.session;

    try {
        var username = <string>req.query.username;
        var incidentNum = req.query.incidentNum && +req.query.incidentNum || void 0;
        var sites_id = +session.sites_id;

        if (!sites_id)
            throw "No valid site ID exists in the session. Please login first.";

        setSiteID(sites_id);

        var staffResuts = await getStaff(username);

        if (!staffResuts.response.length) {
            let analysis = results[results.length] = new Analysis(null);
            analysis.username = username;
            analysis.incidentNum = incidentNum;
            var msg = `User is not added to CDS and does not have access to login ${analysis.correctThisLink('fixMissingCDSUser')}.`;
            analysis.error(msg);
        }
        else
            for (var staff of staffResuts.response) {
                let analysis = results[results.length] = new Analysis(staff);

                analysis.username = staff.username;
                analysis.staff_id = staff.id;
                analysis.incidentNum = incidentNum;

                console.log("Checking staff:" + staff.display + "...");

                if (sites_id == 3) {
                    var wbUser = await getWhiteboardUser(analysis.username);
                    if (wbUser.response.length)
                        analysis.add("User has access to the ER Whiteboard.");
                    else
                        analysis.add(`User does not have access to the ER Whiteboard (<a href="#" onclick="${analysis.actionLink('addWBUser')}">add them</a>).`);
                }

                var allDepartments = await getDepartments();

                analysis.departments = allDepartments.response;

                var directors = await getDirectorDepartments(staff.id);

                var supervisors = await getSupervisorDepartments(staff.id);

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

                var delegates = await getDelegatedUnitsDepartments(staff.id);

                if (!delegates.response.length)
                    analysis.add("User is not a delegate.");
                else {
                    analysis.add("User is a delegate.");
                    if (analysis.directorOf || analysis.supervisorOf)
                        analysis.error("This user should not be a delegate AND also a supervisor or director."
                            + ` Making a supervisor or director a delegate of another unit/department may cause problems accessing incidents ${analysis.correctThisLink('fixSupDirAsDel')}.`);
                }

                var specAuthUsers = await getSpecialAuthority(staff.id);
                let sa = specAuthUsers.response[0];

                var incidents = incidentNum && await getIncident(incidentNum);
                var incident = incidents?.response?.length ? incidents.response[0] : null;

                if (incident) {
                    var involvedUnitDepartments = await getIncidentInvolvedUnitsDepartments(incidentNum);

                    if (!involvedUnitDepartments?.response?.length)
                        analysis.warning("There are no units or departments associated with that incident. No one will be able to open it.");
                    else {
                        var msg = "These are the only departments allowed to access this incident:";
                        involvedUnitDepartments.response.forEach(i => msg += "\r\n * " + i.Department + ` (${i.Program})`);
                        analysis.add(msg);

                        var authorized = !analysis.directorOf ? false : analysis.directorOf.some(d => involvedUnitDepartments.response.some(i => i.UnitDepartmentID == d.id));
                        var authorized = authorized || !analysis.supervisorOf ? authorized : analysis.supervisorOf.some(d => involvedUnitDepartments.response.some(i => i.UnitDepartmentID == d.id));
                        if (authorized) {
                            state = AnalysisMessageState.NoIssue;

                            var msg = "User is a part of at least one unit or department associated with the incident";

                            var specialAuthorityAssignees = await getAssignedSpecialAuthorities(incidentNum, sa.SpecialAuthorityID);

                            if (specialAuthorityAssignees.response.length) {
                                msg += " and should be able to open it.";
                                if (specialAuthorityAssignees.response[0].DoneReviewing)
                                    msg += " User is also done reviewing the incident.";
                                else {
                                    state = AnalysisMessageState.Warning;
                                    msg += " User has not yet completed reviewing the incident.";
                                }
                            }
                            else {
                                state = AnalysisMessageState.Error;
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
                            state = AnalysisMessageState.NoIssue;

                            var msg = `The incident has a severity of '${incident.SeverityDisplay}'.`
                            var incidentSL = Severities[<any>incident.Severity];
                            var saSL = Severities[<any>sa.MinimumAlertSeverityRequired];
                            if (incidentSL < saSL) {
                                msg += ` Since the severity is less than what the special authority notification level, they will not get a notification.`;
                                state = AnalysisMessageState.Warning;
                            } else
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
                } else {
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
};

export async function post(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    var cmd = req.query.cmd, analysis = <IAnalysis>req.body;
    try {
        switch (cmd) {
            case "fixMissingSpecialAuth": {
                if (!analysis.id) return next(DS.Exception.error("analysis.post()", "'id' missing."));
                if (!analysis.incidentNum) return next(DS.Exception.error("analysis.post()", "'incidentNum' missing."));
                if (!analysis.staff_id) return next(DS.Exception.error("analysis.post()", "'staff_id' missing."));
                if (!analysis.specialAuthorityID) return next(DS.Exception.error("analysis.post()", "'specialAuthorityID' missing."));


                let updateResult = addSpecialAuthorityAssignee({
                    IncidentID: analysis.incidentNum,
                    DoneReviewing: false,
                    SpecialAuthorityID: analysis.specialAuthorityID
                });

                res.status(200).json(new DS.IO.Response(null));
                break;
            }

            case "fixMissingCDSUser": {

                try {
                    var staff = validateNewUserDetails(analysis.username, analysis.first_name, analysis.last_name, analysis.email);
                    if (staff instanceof Error) return next(staff); // (DS.Exception inherits from Error)
                } catch (err) {
                    return next(err);
                }

                let updateResult = await addStaff(staff);

                res.status(200).json(new DS.IO.Response(null));

                break;
            }

            case "fixSupDirAsDel": {
                if (!analysis.staff_id) return next(DS.Exception.error("analysis.post()", "'staff_id' missing."));
                await deleteAllDepartmentsForDelegate(analysis.staff_id);
                res.status(200).json(new DS.IO.Response(null));
                break;
            }

            case "updateAsSupervisorDirector": {
                if (!analysis.staff_id) return next(DS.Exception.error("analysis.post()", "'staff_id' missing."));
                if (!isArray(analysis.directorDepartments)) return next(DS.Exception.error("analysis.post()", "'directorDepartments' array missing."));
                if (!isArray(analysis.supervisorDepartments)) return next(DS.Exception.error("analysis.post()", "'supervisorDepartments' array missing."));

                // ... sync the new department selections ....

                await updateDepartmentsFromDirector(analysis.staff_id, analysis.directorDepartments);
                await updateDepartmentsFromSupervisor(analysis.staff_id, analysis.supervisorDepartments);

                res.status(200).json(new DS.IO.Response(null));

                break;
            }

            case "removeSpecialAuth": {
                if (!analysis.staff_id) return next(DS.Exception.error("analysis.post()", "'staff_id' missing."));
                await removeSpecialAuthority(analysis.staff_id);
                res.status(200).json(new DS.IO.Response(null));
                break;
            }

            case "addWBUser": {
                if (sites_id != 3) return next(DS.Exception.error("analysis.post()", "Unauthorized site: " + sites_id));

                let staffResponse = await getStaff(analysis.username);
                if (!staffResponse.response?.length) return next(DS.Exception.error("analysis.post()", "User not found in CDS."));
                let staff = staffResponse.response[0];
                let result = await addWhiteboardUser(staff);

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