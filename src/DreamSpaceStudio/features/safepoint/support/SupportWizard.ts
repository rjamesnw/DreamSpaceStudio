import { Analysis, AnalysisMessageState, IAnalysis, IAnalysisMessage, validateNewUserDetails } from './cds.shared';

interface IAnalysisMap {
    element?: any; // (the element on the browser where this analysis is rendered [HTMLElement])
}

interface IMessageMap {
    element?: any; // (the element on the browser where this analysis message is rendered [HTMLElement])
    formElement?: any; // (if a form was required it gets appended on request and referenced here)
}

var analytics: { [index: string]: Analysis } = {};
var uiMapping = new WeakMap();

async function fixit(id: string, msgIndex: number, serverFuncName: string, apiPath: string, prompt: string, data?: (a: IAnalysis) => IndexedObject | Error, getForm?: (a: IAnalysis, msg: IAnalysisMessage) => HTMLElement) {
    var analysis = analytics[id];
    if (!analysis)
        return alert(`Internal error: analytics with ID '${id}' not found.`);

    var msg = analysis.messages[msgIndex];
    if (!msg)
        return alert(`Internal error: analytics with ID '${id}' does not have a message at index ${msgIndex}.`);

    if (msg.state == AnalysisMessageState.Fixed)
        alert(`You already corrected this. Click the [Analyze] button to refresh.`);
    else {
        var msgMap = <IMessageMap>uiMapping.get(msg);

        // ... if a form is required then make it now and exit; upon return here the form will be processed ...
        if (!msgMap.formElement) {
            let form = getForm && getForm(analysis, msg);
            if (form) {
                let el = <HTMLElement>msgMap.element;
                el.innerHTML += "<br/><br/>";
                el.appendChild(msgMap.formElement = form);
                return;
            }
        }

        var _data = data && data(analysis);
        if (_data instanceof Error) { alert(_data.message); return; } // (data not valid, so abort)

        if (confirm(prompt))
            try {
                var result = await DS.IO.get<DS.IO.IResponse>(DS.Path.combine(`/api/safepoint/`, apiPath), void 0, DS.IO.Methods.POST, Object.assign(analysis, _data));
                if (result.error)
                    alert("Error: " + result.error.message);
                else if (result.status != 200)
                    alert("Success response not received. Could be a server error, please try again later or contact support.");
                else {
                    if (result.message)
                        alert(result.message)
                    else
                        alert("Fixed.");
                    msg.state = AnalysisMessageState.Fixed;
                    (<HTMLElement>msgMap.element).style.backgroundColor = '#f0fcf0';
                }
            }
            catch (ex) {
                throw ex;
            }
    }
};

interface ISelection {
    name: string;
    id?: string;
    caption: string;
    value: string;
    tag?: any;
    selected?: boolean;
    header?: boolean; // (true for tabular options that should be rendered as table headers)
}

interface IFormControl {
    name: string;
    id?: string;
    caption?: string;
    placeHolder?: string;
    columns?: string[];
    type?: DS.HTML.InputElementTypes;
    selections?: (ISelection | ISelection[])[];
}

function makeFormControl(ctrl: IFormControl): string {
    var body = "", groupType = "form-group", label = true;

    if (ctrl?.type == DS.HTML.InputElementTypes.list) {
        if (ctrl.selections)
            ctrl.selections.forEach(s =>
                body += `<button type="button" class="list-group-item list-group-item-action ${s.selected ? 'active' : ''}" id="${s.id ?? s.name}" name="${s.name ?? s.id}">${s.caption ?? ""}</button>\r\n`
            );
        groupType = "list-group";
    } else if (ctrl?.type == DS.HTML.InputElementTypes.tabularOptions) {
        body += `<table class="table table-striped"><thead><tr>\r\n`;
        if (ctrl.columns)
            ctrl.columns.forEach(s => body += `<th scope="col">${s}</th>\r\n`);
        body += `</tr></thead><tbody>`;
        if (ctrl.selections)
            ctrl.selections.forEach(s => {
                body += `<tr>\r\n`;
                let colSelections = Array.isArray(s) ? s : [s];
                colSelections.forEach((v, i) =>
                    body += v.header ? `<th scope="row">${v.caption}</th>\r\n`
                        : `<td><input type="checkbox" class="form-check-input" id = "${v.id ?? v.name}" name="${v.name ?? ctrl.name ?? ctrl.id}" value="${DS.StringUtils.toString(v.value)}" ${v.selected ? 'checked' : ''} title="${ctrl.columns[i]}"></td>\r\n`
                );
                body += `</tr/>\r\n`;
            });
        body += `</tbody></table>\r\n`;
        groupType = "";
        label = false;
    } else if (ctrl?.type == DS.HTML.InputElementTypes.multilist) {
        if (ctrl.selections)
            ctrl.selections.forEach(s =>
                body += `<div class="form-check"><input type="checkbox" class="form-check-input" id="${s.id ?? s.name}" name="${s.name ?? ctrl.name ?? ctrl.id}" value="${DS.StringUtils.toString(s.value)}" ${s.selected ? 'checked' : ''}><label class="form-check-label" for="${s.id ?? s.name}">${s.caption ?? ""}</label></div>\r\n`
            );
        groupType = "list-group";
    } else {
        body = `<input class="form-control" type="${ctrl.type}" id="${ctrl.id ?? ctrl.name}" name="${ctrl.name ?? ctrl.id}" placeholder="${ctrl.placeHolder ?? ""}">\r\n`;
    }

    var html = `<div class="${groupType}">\r\n`;

    if (label)
        html += ctrl.caption ? `<label for="${ctrl.name}" style="font-weight: bold">${ctrl.caption}</label>\r\n` : "";

    return html + body + `</div>\r\n`;
}

function buildForm(title: string, inputs: IFormControl[], buttonCaption: string,
    id: string, msgIndex: number, serverFuncName: string) {
    let formDiv = document.createElement('div');
    formDiv.className = "panel panel-default";
    formDiv.innerHTML = `<div class="panel-heading"><h4>${title}</h4></div><div class="panel-body">${inputs.map(i => makeFormControl(i)).join('<br/>\r\n')}</div>`
        + `<br/><button type="button" class="btn btn-success" onclick="DS.Globals.getValue('SupportWizard', '${serverFuncName}')('${id}', ${msgIndex}, '${serverFuncName}'); return false;">${buttonCaption}</button>`;
    return formDiv;
}

DS.Globals.setValue("SupportWizard", "fixMissingSpecialAuth", async (id: string, msgIndex: number, serverFuncName: string) => {
    await fixit(id, msgIndex, serverFuncName, `support/analyze?cmd=${serverFuncName}`, "Add the user as a special authority for the incident?");
});

DS.Globals.setValue("SupportWizard", "fixSupDirAsDel", async (id: string, msgIndex: number, serverFuncName: string) => {
    await fixit(id, msgIndex, serverFuncName, `support/analyze?cmd=${serverFuncName}`, "This fix will clear all delegate entries for the user, since they should not exist. Continue?");
});

DS.Globals.setValue("SupportWizard", "removeSpecialAuth", async (id: string, msgIndex: number, serverFuncName: string) => {
    await fixit(id, msgIndex, serverFuncName, `support/analyze?cmd=${serverFuncName}`, "Remove user's special authority role?");
});


DS.Globals.setValue("SupportWizard", "fixMissingCDSUser", async (id: string, msgIndex: number, serverFuncName: string) => {
    await fixit(id, msgIndex, serverFuncName, `support/analyze?cmd=${serverFuncName}`, "Add the user to CDS so they can login?", (analysis) => {
        let data = validateNewUserDetails(
            (<HTMLInputElement>document.getElementById('$userID')).value,
            (<HTMLInputElement>document.getElementById('firstName')).value,
            (<HTMLInputElement>document.getElementById('lastName')).value,
            (<HTMLInputElement>document.getElementById('email')).value
        )
        return data;
    }, (analysis, msg) => {
        return buildForm("Add User", [
            { name: "firstName", placeHolder: "First Name" },
            { name: "lastName", placeHolder: "Last Name" },
            { name: "email", placeHolder: "Email" }
        ], "Add", id, msgIndex, serverFuncName);
    });
});

DS.Globals.setValue("SupportWizard", "addWBUser", async (id: string, msgIndex: number, serverFuncName: string) => {
    await fixit(id, msgIndex, serverFuncName, `support/analyze?cmd=${serverFuncName}`, "Add the user to the Whiteboard so they can login?");
});

DS.Globals.setValue("SupportWizard", "updateAsSupervisorDirector", async (id: string, msgIndex: number, serverFuncName: string) => {
    await fixit(id, msgIndex, serverFuncName, `support/analyze?cmd=${serverFuncName}`, "Change departments for this user?", () => {
        var directorDpts: number[] = [], supervisorDpts: number[] = [];
        document.querySelectorAll<HTMLInputElement>("input[name='directorFor']:checked").forEach(e => +e.value ? directorDpts.push(+e.value) : void 0);
        document.querySelectorAll<HTMLInputElement>("input[name='supervisorFor']:checked").forEach(e => +e.value ? supervisorDpts.push(+e.value) : void 0);
        let data = {
            directorDepartments: directorDpts,
            supervisorDepartments: supervisorDpts
        };
        return data;
    }, (analysis, msg) => {
        return buildForm(`Change Units/Departments for ${analysis.staff?.display}`, [
            {
                name: "directorSupervisorFor",
                caption: "Select departments user is a director or supervisor of:",
                type: DS.HTML.InputElementTypes.tabularOptions,
                columns: ["", "Director", "Supervisor"],
                selections: analysis.departments.map(d => <ISelection[]>[{
                    caption: d.department + ` (${d.program})`,
                    header: true
                }, {
                    name: 'directorFor',
                    id: 'director_' + (d.name ?? '') + '_' + d.id,
                    caption: d.department + ` (${d.program})`,
                    value: '' + d.id,
                    selected: !!analysis.directorOf?.some(d2 => d2.id == d.id)
                }, {
                    name: 'supervisorFor',
                    id: 'supervisor_' + (d.name ?? '') + '_' + d.id,
                    caption: d.department + ` (${d.program})`,
                        value: '' + d.id,
                        selected: !!analysis.supervisorOf?.some(d2 => d2.id == d.id)
                }])
            }
        ], "Update", id, msgIndex, serverFuncName);
    });
});

export class SupportWizard {
    username: HTMLInputElement;
    incidentNum: HTMLInputElement;
    startButton: HTMLElement;
    resultsContainer: HTMLElement;

    private static _getElement<T extends HTMLElement = HTMLElement>(paramname: string, id: string): T {
        var el = document.getElementById(id);
        if (!el)
            throw DS.Exception.invalidArgument("SupportWizard", paramname, this, `Element with ID '${id}' not found.`);
        return <T>el;
    }

    constructor(usernameID: string, incidentNumID: string, startButtonID: string, resultsContainerID: string) {
        this.username = SupportWizard._getElement<HTMLInputElement>("usernameID", usernameID);
        this.incidentNum = SupportWizard._getElement<HTMLInputElement>("incidentNumID", incidentNumID);
        this.startButton = SupportWizard._getElement("startButtonID", startButtonID);
        this.resultsContainer = SupportWizard._getElement("resultsContainerID", resultsContainerID);


        this.startButton.onclick = () => {
            this.analyze();
        };
    }

    async analyze() {
        var username = DS.nud(this.username.value, '').trim();
        var incidentNum = DS.nud(this.incidentNum.value, '').trim();

        if (!username) return alert("Please enter a username.");

        // ... all the backend to do the analysis ...
        // ... connect to the database ...
        var results = await DS.IO.get<IAnalysis[]>("/api/safepoint/support/analyze", void 0, void 0, {
            username: username,
            incidentNum: incidentNum
        });

        if (results.length) {
            this.resultsContainer.innerHTML = ""; // (clear)

            for (let result of results) {
                var analysis = Analysis.from(result);
                analytics[analysis.id] = analysis; // (keep track in order to refer back)

                var adiv = document.createElement("div");
                if (analysis.staff)
                    adiv.innerHTML = `<h4>${analysis.staff.display} (ID: ${analysis.staff.id}, ${analysis.staff.email})</h4>`;

                uiMapping.set(analysis, <IAnalysisMap>{ element: adiv });

                adiv.className = "alert alert-" + (analysis.state == AnalysisMessageState.Error ? "danger" : analysis.state == AnalysisMessageState.Warning ? "warning" : "success");

                let msg = "";

                if (analysis.directorOf) {
                    msg = "<br/><bold>Departments user is a director for:</bold><ul>";
                    analysis.directorOf.forEach(v => {
                        msg += `${v.id} - ${v.department} (${v.program})\r\n`;
                    });
                    analysis.messages.push({ message: msg + "</ul>", state: AnalysisMessageState.NoIssue })
                }

                if (analysis.supervisorOf) {
                    msg = "<br/><bold>Departments user is a supervisor for:</bold><ul>";
                    analysis.supervisorOf.forEach(v => {
                        msg += `${v.id} - ${v.department} (${v.program})\r\n`;
                    });
                    analysis.messages.push({ message: msg + "</ul>", state: AnalysisMessageState.NoIssue })
                }

                if (analysis.staff_id) {
                    msg = `<bold><a href="#" onclick="${analysis.actionLink('updateAsSupervisorDirector')}">Change Units/Departments</a></bold>`;
                    analysis.messages.push({ message: msg, state: AnalysisMessageState.NoIssue })
                }

                analysis.messages.forEach(v => {
                    let msgDiv = document.createElement("div");
                    msgDiv.innerHTML = v.message.replace(/\n/g, "<br/>\r\n");
                    adiv.appendChild(msgDiv);
                    uiMapping.set(v, <IMessageMap>{ element: msgDiv });
                });

                this.resultsContainer.appendChild(adiv);
            }
        }
    }
}

