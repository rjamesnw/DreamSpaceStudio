/// <reference path="../manifest.d.ts" />
import { Module } from "../Scripts";
/** jQuery (see http://jquery.com/). */
export default class extends Module {
    scriptInfo: {
        filename: "jquery_2_2_0{min:.min}";
        path: "~JQuery/";
    };
    onReady(): void;
}
