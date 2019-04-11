import { IDreamSpace as IDS } from "./System.Platform";
declare namespace Windows {
    const Window_base: any;
    class Window extends Window_base {
        /** Creates a new window object.  If null is passed as the root element, then a new pop-up window is created when the window is shown. */
        static 'new'(rootElement?: HTMLElement, url?: string): IWindow;
        static init(o: IWindow, isnew: boolean, rootElement?: HTMLElement, url?: string): void;
    }
    namespace Window {
        const $__type_base: any;
        class $__type extends $__type_base {
            private _guid;
            private _target;
            private _header;
            private _body;
            private _url;
            show(): void;
            moveTo(x: number, y: number): void;
            moveby(deltaX: number, deltaY: number): void;
        }
    }
    interface IWindow extends Window.$__type {
    }
}
export interface IDreamSpace extends IDS {
    Windows: typeof Windows;
}
declare var DreamSpace: IDreamSpace;
export default DreamSpace;
