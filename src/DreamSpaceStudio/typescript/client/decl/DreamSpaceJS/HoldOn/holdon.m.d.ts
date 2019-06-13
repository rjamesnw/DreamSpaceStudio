import { Module } from "../Scripts";
export interface IHoldOn {
    open: (options: {
        message: string;
        theme?: string;
        content?: string;
        backgroundColor?: string;
        textColor?: string;
    }) => void;
    close: () => void;
}
/**
 * HoldOn.js is a useful plugin that allows you to block user interactions using an overlay over the page.
 * Source: https://sdkcarlos.github.io/sites/holdon.html
 */
export default class extends Module {
    scriptInfo: {
        files: string;
        cssFiles: string;
    };
    onReady(): void;
}
