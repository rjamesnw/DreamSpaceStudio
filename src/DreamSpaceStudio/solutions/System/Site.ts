namespace DS {

    export enum DeploymentEnvironments {
        Sandbox,
        Development,
        QA,
        Staging,
        Production
    }

    export type DeploymentEnvironmentsType = {
        [P in DeploymentEnvironments]: string;
    }

    /** A page holds the UI design, which is basically just a single HTML page template. */
    export class Site {
        /** A title for the website. */
        title: string;

        url: DeploymentEnvironmentsType = <any>[];

        /** One or more page templates that belong to the site. This is empty for API-only sites. */
        readonly pages: Abstracts.Page[] = [];
    }

}