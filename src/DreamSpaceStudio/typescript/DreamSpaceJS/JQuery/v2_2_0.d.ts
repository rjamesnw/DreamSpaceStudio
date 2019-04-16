/// <reference path="../manifest.d.ts" />
import { Module } from "../Scripts";
/** jQuery (see http://jquery.com/). */
export default class extends Module {
    scriptInfo: {
        filename: string;
        path: string;
    };
    onReady(): void;
}
