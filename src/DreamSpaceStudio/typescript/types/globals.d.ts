declare namespace NodeJS {
    export interface Global {
        XMLHttpRequest: XMLHttpRequest;
    }
}

declare var XMLHttpRequestBase: any;
declare class XMLHttpRequest extends XMLHttpRequestBase { [index: string]: any; }