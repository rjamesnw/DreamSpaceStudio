import { AnalysisMessageState, IAnalysis, IAnalysisMessage } from './cds';

interface IAnalysisMap {
    element?: any; // (the element on the browser where this analysis is rendered [HTMLElement])
}

interface IMessageMap {
    element?: any; // (the element on the browser where this analysis message is rendered [HTMLElement])
    formElement?: any; // (if a form was required it gets appended on request and referenced here)
}

var analytics: { [index: string]: IAnalysis } = {};
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

function buildForm(title: string, inputs: { name: string, caption?: string, placeHolder?: string, type?: DS.HTML.InputElementTypes }[], buttonCaption: string,
    id: string, msgIndex: number, serverFuncName: string) {
    let formDiv = document.createElement('div');
    formDiv.className = "panel panel-default";
    formDiv.innerHTML = `<div class="panel-heading"><h4>${title}</h4></div><div class="panel-body">${inputs.map(i =>
        `<div class="form-group">`
        + (i.caption ? `<label for="${i.name}">${i.caption}</label>` : "")
        + `<input class="form-control" type="${i.type}" id="${i.name}" name="${i.name}" placeholder="${i.placeHolder ?? ""}">`
        + `</div>`)}</div>`
        + `<button type="button" class="btn btn-success" onclick="DS.Globals.getValue('SupportWizard', '${serverFuncName}')('${id}', ${msgIndex}, '${serverFuncName}'); return false;">${buttonCaption}</button>`;
    return formDiv;
}

DS.Globals.setValue("SupportWizard", "fixMissingSpecialAuth", async (id: string, msgIndex: number, serverFuncName: string) => {
    await fixit(id, msgIndex, serverFuncName, `support/analyze?cmd=${serverFuncName}`, "Add the user as a special authority for the incident?");
});

DS.Globals.setValue("SupportWizard", "fixSupDirAsDel", async (id: string, msgIndex: number, serverFuncName: string) => {
    await fixit(id, msgIndex, serverFuncName, `support/analyze?cmd=${serverFuncName}`, "This fix will clear all delegate entries for the user, since they should not exist. Continue?");
});



DS.Globals.setValue("SupportWizard", "fixMissingCDSUser", async (id: string, msgIndex: number, serverFuncName: string) => {
    await fixit(id, msgIndex, serverFuncName, `support/analyze?cmd=${serverFuncName}`, "Add the user to CDS so they can login?", () => {
        let data = {
            firstName: (<HTMLInputElement>document.getElementById('firstName')).value.trim(),
            lastName: (<HTMLInputElement>document.getElementById('lastName')).value.trim(),
            email: (<HTMLInputElement>document.getElementById('email')).value.trim(),
        };
        if (!data.firstName) return new DS.Exception('Please enter a first name.');
        if (!data.lastName) return new DS.Exception('Please enter a last name.');
        if (!DS.Data.Validations.isValidEmailAddress(data.email)) return new DS.Exception('Please enter a valid email.');
        return data;
    }, (analysis, msg) => {
        return buildForm("Add User", [
            { name: "firstName", placeHolder: "First Name" },
            { name: "lastName", placeHolder: "Last Name" },
            { name: "email", placeHolder: "Email" }
        ], "Add", id, msgIndex, serverFuncName);
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
                analytics[result.id] = result; // (keep track in order to refer back)

                var adiv = document.createElement("div");
                if (result.staff)
                    adiv.innerHTML = `<h4>${result.staff.display} (${result.staff.email})</h4>`;

                uiMapping.set(result, <IAnalysisMap>{ element: adiv });

                adiv.className = "alert alert-" + (result.state == AnalysisMessageState.Error ? "danger" : result.state == AnalysisMessageState.Warning ? "warning" : "success");

                result.messages.forEach(v => {
                    let msgDiv = document.createElement("div");
                    msgDiv.innerHTML = v.message.replace(/\n/g, "<br/>\r\n");
                    adiv.appendChild(msgDiv);
                    uiMapping.set(v, <IMessageMap>{ element: msgDiv });
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

