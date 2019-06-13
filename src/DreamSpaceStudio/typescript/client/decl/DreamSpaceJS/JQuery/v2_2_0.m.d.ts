import { Module } from "../Scripts";
/** jQuery (see http://jquery.com/). */
export default class extends Module {
    scriptInfo: {
        files: string;
        basePath: string;
    };
    onReady(): void;
}
