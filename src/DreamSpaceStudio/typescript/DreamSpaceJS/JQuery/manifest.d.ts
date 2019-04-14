/// <reference path="../manifest.d.ts" />
import { Manifest } from "../Scripts";
/** jQuery (see http://jquery.com/). */
export default class extends Manifest {
    scripts: {
        [index: string]: import("../Scripts").IScriptInfo;
        V2_2_0: {
            scriptInfo: {
                filename: string;
                path: string;
            };
            onReady(): void;
        };
        Latest: {
            scriptInfo: {
                filename: string;
                path: string;
            };
            onReady(): void;
        };
    };
}
