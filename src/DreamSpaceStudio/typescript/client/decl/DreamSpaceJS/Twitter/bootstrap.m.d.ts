import { Module } from "../Scripts";
/** The Twitter Bootstrap JS module (the Bootstrap script file only, nothing more).
*/
export default class extends Module {
    scriptInfo: {
        files: string;
        basePath: string;
        cssFiles: string;
    };
}
