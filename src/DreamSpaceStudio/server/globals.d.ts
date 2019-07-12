// ... many of these are to appease the TypeScript compiler as there is run-time checking for server vs client, and related types ...

//declare namespace NodeJS {
//    export interface Global {
//        XMLHttpRequest: XMLHttpRequest;
//    }
//}

//declare var XMLHttpRequestBase: any;
//declare class XMLHttpRequest extends XMLHttpRequestBase { [index: string]: any; }

//declare class Event { [name: string]: any; }
//interface OnErrorEventHandlerNonNull {
//    (event: Event | string, source?: string, lineno?: number, colno?: number, error?: Error): any;
//}

//type GlobalEventHandlers = any;

//declare class Navigator { [name: string]: any; }
//declare var navigator: Navigator;
//declare var window: {
//    addEventListener: any;
//    onerror: OnErrorEventHandlerNonNull;
//    onload: (this: GlobalEventHandlers, ev: Event) => any;
//    document: Document;
//    location: Location;
//    navigator: Navigator;
//    innerWidth: number;
//    innerHeight: number;
//    event: any;
//};
//declare class Window { [name: string]: any; }
//declare class Node { nodeName: string; className: string; removeChild: any; }
//declare class Element extends Node { [name: string]: any; clientWidth: number; clientHeight: number; }
//declare class HTMLElement extends Element { }
//declare class HTMLIFrameElement extends HTMLElement { }
//declare class Text { [name: string]: any; }
//declare class ErrorEvent extends Event { [name: string]: any; }
//declare class ProgressEvent extends Event { [name: string]: any; }
//declare class FormData { [name: string]: any; }
//declare class Location { [name: string]: any; }
//declare var location: any;
//declare class Document extends HTMLElement { [name: string]: any; }
//declare var document: any;
//declare class Storage { [name: string]: any; }
//declare var localStorage: any;
//declare var sessionStorage: any;
//declare var alert: any;
//declare class Worker { [name: string]: any; }
