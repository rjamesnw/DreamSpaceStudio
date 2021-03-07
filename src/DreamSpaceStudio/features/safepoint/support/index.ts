import { SupportWizard } from "./SupportWizard";
import { startup } from "../../startup";

startup.then(() => { // (always initialize first, then go from there)
    var wizard = new SupportWizard("$userID", "$incidentID", "$analyze", "$results");
});
