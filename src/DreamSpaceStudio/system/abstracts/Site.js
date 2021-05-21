var DS;
(function (DS) {
    let DeploymentEnvironments;
    (function (DeploymentEnvironments) {
        DeploymentEnvironments[DeploymentEnvironments["Sandbox"] = 0] = "Sandbox";
        DeploymentEnvironments[DeploymentEnvironments["Development"] = 1] = "Development";
        DeploymentEnvironments[DeploymentEnvironments["QA"] = 2] = "QA";
        DeploymentEnvironments[DeploymentEnvironments["Staging"] = 3] = "Staging";
        DeploymentEnvironments[DeploymentEnvironments["Production"] = 4] = "Production";
    })(DeploymentEnvironments = DS.DeploymentEnvironments || (DS.DeploymentEnvironments = {}));
    /** A page holds the UI design, which is basically just a single HTML page template. */
    class Site {
        constructor() {
            this.url = [];
            /** One or more page templates that belong to the site. This is empty for API-only sites. */
            this.pages = [];
        }
    }
    DS.Site = Site;
})(DS || (DS = {}));
//# sourceMappingURL=Site.js.map