import { IHTMLParseResult } from "./interfaces";
/** Parses HTML to create a graph object tree, and also returns any templates found.
* This concept is similar to using XAML to load objects in WPF. As such, you have the option to use an HTML template, or dynamically build your
* graph items directly in code.
*
* Warning about inline scripts: Script tags may be executed client side (naturally by the DOM), but you cannot rely on them server side.  Try to use
* HTML for UI DESIGN ONLY.  Expect that any code you place in the HTML will not execute server side (or client side for that matter) unless you
* handle/execute the script code yourself.
* @param {string} html The HTML to parse.
* @param {boolean} strictMode If true, then the parser will produce errors on ill-formed HTML (eg. 'attribute=' with no value).
* This can greatly help keep your html clean, AND identify possible areas of page errors.  If strict formatting is not important, pass in false.
*/
export declare function parse(html?: string, strictMode?: boolean): Promise<IResponse<IHTMLParseResult>>;
