
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
        // ... all the backend to do the analysis ...
        // ... connect to the database ...
        var result = await DS.IO.get<any>("/api/safepoint/support/analyze", void 0, void 0, {
            username: this.username.value,
            incidentNum: this.incidentNum.value
        });

        alert("Result: " + JSON.stringify(result));
    }
}
