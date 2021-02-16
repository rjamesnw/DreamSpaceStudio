import { SupportWizard } from "./SupportWizard";
import { bootsrap } from "./globals";

bootsrap.then(() => { // (always initialize first, then go from there)
    var wizard = new SupportWizard("$userID", "$incidentID", "$analyze", "$results");
});

