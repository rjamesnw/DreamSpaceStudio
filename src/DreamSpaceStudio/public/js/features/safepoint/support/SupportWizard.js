define(["require", "exports", "./cds"], function (require, exports, cds_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SupportWizard = void 0;
    var analytics = {};
    var uiMapping = new WeakMap();
    async function fixit(id, msgIndex, serverFuncName, apiPath, prompt, data, getForm) {
        var analysis = analytics[id];
        if (!analysis)
            return alert(`Internal error: analytics with ID '${id}' not found.`);
        var msg = analysis.messages[msgIndex];
        if (!msg)
            return alert(`Internal error: analytics with ID '${id}' does not have a message at index ${msgIndex}.`);
        if (msg.state == cds_1.AnalysisMessageState.Fixed)
            alert(`You already corrected this. Click the [Analyze] button to refresh.`);
        else {
            var msgMap = uiMapping.get(msg);
            // ... if a form is required then make it now and exit; upon return here the form will be processed ...
            if (!msgMap.formElement) {
                let form = getForm && getForm(analysis, msg);
                if (form) {
                    let el = msgMap.element;
                    el.innerHTML += "<br/><br/>";
                    el.appendChild(msgMap.formElement = form);
                    return;
                }
            }
            var _data = data && data(analysis);
            if (_data instanceof Error) {
                alert(_data.message);
                return;
            } // (data not valid, so abort)
            if (confirm(prompt))
                try {
                    var result = await DS.IO.get(DS.Path.combine(`/api/safepoint/`, apiPath), void 0, DS.IO.Methods.POST, Object.assign(analysis, _data));
                    if (result.error)
                        alert("Error: " + result.error.message);
                    else if (result.status != 200)
                        alert("Success response not received. Could be a server error, please try again later or contact support.");
                    else {
                        if (result.message)
                            alert(result.message);
                        else
                            alert("Fixed.");
                        msg.state = cds_1.AnalysisMessageState.Fixed;
                        msgMap.element.style.backgroundColor = '#f0fcf0';
                    }
                }
                catch (ex) {
                    throw ex;
                }
        }
    }
    ;
    function makeFormControl(ctrl) {
        var _a, _b, _c;
        var body = "", groupType = "form-group", label = true;
        if ((ctrl === null || ctrl === void 0 ? void 0 : ctrl.type) == DS.HTML.InputElementTypes.list) {
            if (ctrl.selections)
                ctrl.selections.forEach(s => { var _a, _b, _c; return body += `<button type="button" class="list-group-item list-group-item-action ${s.selected ? 'active' : ''}" id="${(_a = s.id) !== null && _a !== void 0 ? _a : s.name}" name="${(_b = s.name) !== null && _b !== void 0 ? _b : s.id}">${(_c = s.caption) !== null && _c !== void 0 ? _c : ""}</button>\r\n`; });
            groupType = "list-group";
        }
        else if ((ctrl === null || ctrl === void 0 ? void 0 : ctrl.type) == DS.HTML.InputElementTypes.multilist) {
            if (ctrl.selections)
                ctrl.selections.forEach(s => { var _a, _b, _c, _d, _e; return body += `<div class="form-check"><input type="checkbox" class="form-check-input" id="${(_a = s.id) !== null && _a !== void 0 ? _a : s.name}" name="${(_c = (_b = s.name) !== null && _b !== void 0 ? _b : ctrl.name) !== null && _c !== void 0 ? _c : ctrl.id}" value="${DS.StringUtils.toString(s.value)}" ${s.selected ? 'checked' : ''}><label class="form-check-label" for="${(_d = s.id) !== null && _d !== void 0 ? _d : s.name}">${(_e = s.caption) !== null && _e !== void 0 ? _e : ""}</label></div>\r\n`; });
            groupType = "list-group";
        }
        else {
            body = `<input class="form-control" type="${ctrl.type}" id="${(_a = ctrl.id) !== null && _a !== void 0 ? _a : ctrl.name}" name="${(_b = ctrl.name) !== null && _b !== void 0 ? _b : ctrl.id}" placeholder="${(_c = ctrl.placeHolder) !== null && _c !== void 0 ? _c : ""}">\r\nd`;
        }
        var html = `<div class="${groupType}">\r\n`;
        if (label)
            html += ctrl.caption ? `<label for="${ctrl.name}" style="font-weight: bold">${ctrl.caption}</label>\r\n` : "";
        return html + body + `</div>\r\n`;
    }
    function buildForm(title, inputs, buttonCaption, id, msgIndex, serverFuncName) {
        let formDiv = document.createElement('div');
        formDiv.className = "panel panel-default";
        formDiv.innerHTML = `<div class="panel-heading"><h4>${title}</h4></div><div class="panel-body">${inputs.map(i => makeFormControl(i)).join('<br/>\r\n')}</div>`
            + `<br/><button type="button" class="btn btn-success" onclick="DS.Globals.getValue('SupportWizard', '${serverFuncName}')('${id}', ${msgIndex}, '${serverFuncName}'); return false;">${buttonCaption}</button>`;
        return formDiv;
    }
    DS.Globals.setValue("SupportWizard", "fixMissingSpecialAuth", async (id, msgIndex, serverFuncName) => {
        await fixit(id, msgIndex, serverFuncName, `support/analyze?cmd=${serverFuncName}`, "Add the user as a special authority for the incident?");
    });
    DS.Globals.setValue("SupportWizard", "fixSupDirAsDel", async (id, msgIndex, serverFuncName) => {
        await fixit(id, msgIndex, serverFuncName, `support/analyze?cmd=${serverFuncName}`, "This fix will clear all delegate entries for the user, since they should not exist. Continue?");
    });
    DS.Globals.setValue("SupportWizard", "fixMissingCDSUser", async (id, msgIndex, serverFuncName) => {
        await fixit(id, msgIndex, serverFuncName, `support/analyze?cmd=${serverFuncName}`, "Add the user to CDS so they can login?", () => {
            let data = {
                firstName: document.getElementById('firstName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                email: document.getElementById('email').value.trim(),
            };
            if (!data.firstName)
                return new DS.Exception('Please enter a first name.');
            if (!data.lastName)
                return new DS.Exception('Please enter a last name.');
            if (!DS.Data.Validations.isValidEmailAddress(data.email))
                return new DS.Exception('Please enter a valid email.');
            return data;
        }, (analysis, msg) => {
            return buildForm("Add User", [
                { name: "firstName", placeHolder: "First Name" },
                { name: "lastName", placeHolder: "Last Name" },
                { name: "email", placeHolder: "Email" }
            ], "Add", id, msgIndex, serverFuncName);
        });
    });
    DS.Globals.setValue("SupportWizard", "updateAsSupervisorDirector", async (id, msgIndex, serverFuncName) => {
        await fixit(id, msgIndex, serverFuncName, `support/analyze?cmd=${serverFuncName}`, "Change departments for this user?", () => {
            var directorDpts = [], supervisorDpts = [];
            document.querySelectorAll("input[name='directorFor']:checked").forEach(e => +e.value ? directorDpts.push(+e.value) : void 0);
            document.querySelectorAll("input[name='supervisorFor']:checked").forEach(e => +e.value ? supervisorDpts.push(+e.value) : void 0);
            let data = {
                directorDepartments: directorDpts,
                supervisorDepartments: supervisorDpts
            };
            return data;
        }, (analysis, msg) => {
            var _a;
            return buildForm(`Change Units/Departments for ${(_a = analysis.staff) === null || _a === void 0 ? void 0 : _a.display}`, [
                {
                    name: "directorFor", caption: "Director For", type: DS.HTML.InputElementTypes.multilist,
                    selections: analysis.departments.map(d => { var _a, _b; return ({ id: '' + ((_a = d.name) !== null && _a !== void 0 ? _a : '') + '_' + d.id, caption: d.department + ` (${d.program})`, value: '' + d.id, selected: !!((_b = analysis.directorOf) === null || _b === void 0 ? void 0 : _b.some(d2 => d2.id == d.id)) }); })
                },
                {
                    name: "supervisorFor", caption: "Supervisor For", type: DS.HTML.InputElementTypes.multilist,
                    selections: analysis.departments.map(d => { var _a, _b; return ({ id: '' + ((_a = d.name) !== null && _a !== void 0 ? _a : '') + '_' + d.id, caption: d.department + ` (${d.program})`, value: '' + d.id, selected: !!((_b = analysis.supervisorOf) === null || _b === void 0 ? void 0 : _b.some(d2 => d2.id == d.id)) }); })
                }
            ], "Update", id, msgIndex, serverFuncName);
        });
    });
    class SupportWizard {
        constructor(usernameID, incidentNumID, startButtonID, resultsContainerID) {
            this.username = SupportWizard._getElement("usernameID", usernameID);
            this.incidentNum = SupportWizard._getElement("incidentNumID", incidentNumID);
            this.startButton = SupportWizard._getElement("startButtonID", startButtonID);
            this.resultsContainer = SupportWizard._getElement("resultsContainerID", resultsContainerID);
            this.startButton.onclick = () => {
                this.analyze();
            };
        }
        static _getElement(paramname, id) {
            var el = document.getElementById(id);
            if (!el)
                throw DS.Exception.invalidArgument("SupportWizard", paramname, this, `Element with ID '${id}' not found.`);
            return el;
        }
        async analyze() {
            var username = DS.nud(this.username.value, '').trim();
            var incidentNum = DS.nud(this.incidentNum.value, '').trim();
            if (!username)
                return alert("Please enter a username.");
            // ... all the backend to do the analysis ...
            // ... connect to the database ...
            var results = await DS.IO.get("/api/safepoint/support/analyze", void 0, void 0, {
                username: username,
                incidentNum: incidentNum
            });
            if (results.length) {
                this.resultsContainer.innerHTML = ""; // (clear)
                for (let result of results) {
                    var analysis = cds_1.Analysis.from(result);
                    analytics[analysis.id] = analysis; // (keep track in order to refer back)
                    var adiv = document.createElement("div");
                    if (analysis.staff)
                        adiv.innerHTML = `<h4>${analysis.staff.display} (ID: ${analysis.staff.id}, ${analysis.staff.email})</h4>`;
                    uiMapping.set(analysis, { element: adiv });
                    adiv.className = "alert alert-" + (analysis.state == cds_1.AnalysisMessageState.Error ? "danger" : analysis.state == cds_1.AnalysisMessageState.Warning ? "warning" : "success");
                    let msg;
                    if (analysis.directorOf) {
                        msg = "<br/><bold>Departments user is a director for:</bold><ul>";
                        analysis.directorOf.forEach(v => {
                            msg += `${v.id} - ${v.department} (${v.program})\r\n`;
                        });
                        analysis.messages.push({ message: msg + "</ul>", state: cds_1.AnalysisMessageState.NoIssue });
                    }
                    if (analysis.supervisorOf) {
                        msg = "<br/><bold>Departments user is a supervisor for:</bold><ul>";
                        analysis.supervisorOf.forEach(v => {
                            msg += `${v.id} - ${v.department} (${v.program})\r\n`;
                        });
                        analysis.messages.push({ message: msg + "</ul>", state: cds_1.AnalysisMessageState.NoIssue });
                    }
                    msg = `<bold><a href="#" onclick="${analysis.actionLink('updateAsSupervisorDirector')}">Change Units/Departments</a></bold>`;
                    analysis.messages.push({ message: msg, state: cds_1.AnalysisMessageState.NoIssue });
                    analysis.messages.forEach(v => {
                        let msgDiv = document.createElement("div");
                        msgDiv.innerHTML = v.message.replace(/\n/g, "<br/>\r\n");
                        adiv.appendChild(msgDiv);
                        uiMapping.set(v, { element: msgDiv });
                    });
                    this.resultsContainer.appendChild(adiv);
                }
            }
        }
    }
    exports.SupportWizard = SupportWizard;
});
//# sourceMappingURL=SupportWizard.js.map