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
    function buildForm(title, inputs, buttonCaption, id, msgIndex, serverFuncName) {
        let formDiv = document.createElement('div');
        formDiv.className = "panel panel-default";
        formDiv.innerHTML = `<div class="panel-heading"><h4>${title}</h4></div><div class="panel-body">${inputs.map(i => {
            var _a;
            return `<div class="form-group">`
                + (i.caption ? `<label for="${i.name}">${i.caption}</label>` : "")
                + `<input class="form-control" type="${i.type}" id="${i.name}" name="${i.name}" placeholder="${(_a = i.placeHolder) !== null && _a !== void 0 ? _a : ""}">`
                + `</div>`;
        })}</div>`
            + `<button type="button" class="btn btn-success" onclick="DS.Globals.getValue('SupportWizard', '${serverFuncName}')('${id}', ${msgIndex}, '${serverFuncName}'); return false;">${buttonCaption}</button>`;
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
                    analytics[result.id] = result; // (keep track in order to refer back)
                    var adiv = document.createElement("div");
                    if (result.staff)
                        adiv.innerHTML = `<h4>${result.staff.display} (${result.staff.email})</h4>`;
                    uiMapping.set(result, { element: adiv });
                    adiv.className = "alert alert-" + (result.state == cds_1.AnalysisMessageState.Error ? "danger" : result.state == cds_1.AnalysisMessageState.Warning ? "warning" : "success");
                    result.messages.forEach(v => {
                        let msgDiv = document.createElement("div");
                        msgDiv.innerHTML = v.message.replace(/\n/g, "<br/>\r\n");
                        adiv.appendChild(msgDiv);
                        uiMapping.set(v, { element: msgDiv });
                    });
                    if (result.directorOf) {
                        let div = document.createElement("div");
                        div.innerHTML = "<br/><bold>Departments user is a director for:</bold>";
                        let ul = document.createElement("ul");
                        div.appendChild(ul);
                        result.directorOf.forEach(v => {
                            let li = document.createElement("li");
                            li.innerHTML = `${v.units_departments_id} - ${v.department} (${v.program})<br/>\r\n`;
                            ul.appendChild(li);
                        });
                        adiv.appendChild(div);
                    }
                    if (result.supervisorOf) {
                        let div = document.createElement("div");
                        div.innerHTML = "<br/><bold>Departments user is a supervisor for:</bold>";
                        let ul = document.createElement("ul");
                        div.appendChild(ul);
                        result.supervisorOf.forEach(v => {
                            let li = document.createElement("li");
                            li.innerHTML = `${v.units_departments_id} - ${v.department} (${v.program})<br/>\r\n`;
                            ul.appendChild(li);
                        });
                        adiv.appendChild(div);
                    }
                    this.resultsContainer.appendChild(adiv);
                }
            }
        }
    }
    exports.SupportWizard = SupportWizard;
});
//# sourceMappingURL=SupportWizard.js.map