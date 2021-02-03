import { SupportWizard } from "./SupportWizard";

DS.appVersion = "1.0.0";

DS.init().then(() => { // (always initialize first, then go from there)

    DS.Browser.onReady.attach(() => { // (wait for the page to load)
        var wizard = new SupportWizard("$userID", "$incidentID", "$analyze", "$results");
    });

});

