import { DSObject } from "./PrimitiveTypes";
declare const Window_base: {
    new (): DSObject;
    super: typeof DSObject;
    'new'?(...args: any[]): any;
    init?(o: object, isnew: boolean, ...args: any[]): void;
} & {
    prototype: DSObject;
    getTypeName: typeof DSObject.getTypeName;
    isEmpty: typeof DSObject.isEmpty;
    super: typeof import("../Types").Disposable & import("../Globals").IFactory<typeof import("../Types").Disposable, import("../Globals").NewDelegate<import("../Types").Disposable>, import("../Globals").InitDelegate<import("../Types").Disposable>>;
};
export declare class Window extends Window_base {
    /** Creates a new window object.  If null is passed as the root element, then a new pop-up window is created when the window is shown. */
    static 'new'(rootElement?: HTMLElement, url?: string): IWindow;
    static init(o: IWindow, isnew: boolean, rootElement?: HTMLElement, url?: string): void;
    private _guid;
    private _target;
    private _header;
    private _body;
    private _url;
    show(): void;
    moveTo(x: number, y: number): void;
    moveby(deltaX: number, deltaY: number): void;
}
export interface IWindow extends Window {
}
export {};
