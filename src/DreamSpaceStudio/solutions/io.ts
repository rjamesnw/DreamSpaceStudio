// Contains DreamSpace API functions and types that user code can use to work with the system.
// This API will be a layer of abstraction that keeps things similar between server and client sides.

type Methods = "GET" | "POST" | "PUT" | "DELETE";

interface IResponse<TData = any> {
    statusCode: number;
    message: string;
    data?: TData;
}

var isNode = typeof global == 'object' && global.process && global.process.versions && global.process.versions.node;

/** This is the root to all DreamSpaceJS utilities.
 * These utilities cover most common developer needs when buidling custom components. 
 */
namespace DS {
    /** Contains the results of a component's operation. */
    export function get<T = object>(url: string, type?: "json", method?: Methods, data?: any): Promise<T>;
    export function get<T = string>(url: string, type?: "xml", method?: Methods, data?: any): Promise<T>;
    export function get<T = string>(url: string, type?: "text", method?: Methods, data?: any): Promise<T>;
    export function get<T = boolean>(url: string, type?: "boolean", method?: Methods, data?: any): Promise<T>;
    export function get<T = number>(url: string, type?: "number", method?: Methods, data?: any): Promise<T>;
    export function get<T = any>(url: string, type?: string, method?: Methods, data?: any): Promise<T>;
    export function get<T>(url: string, type = "any", method: Methods = "GET", data?: any): Promise<T> {
        type = typeof type == 'string' ? type.toLocaleLowerCase() : 'any';
        return new Promise<any>((resolve, reject) => {
            if (isNode) {
                var request: typeof import("request") = require("request");
                request.get(url, { method: method, body: data }, (err, response, body) => {
                    if (err) { reject(err); return; }
                    resolve(response);
                });
                //var data = '';
                //function response(msg: import('http').IncomingMessage) {
                //    msg.on('data', (chunk) => { data += chunk; });
                //    msg.on('end', () => res(data));
                //}
                //if (url.substr(0, 6).toLowerCase() == "https:")
                //    var request = https.request({ url: url, method: method, json: type.toLowerCase && type.toLowerCase() == "json" }, response);
                //else
                //    var request = http.request(url, response);
                //request.on('error', (err) => { rej(err); })
            }
            else {
                var xhr = new XMLHttpRequest();
                xhr.addEventListener('load', () => { resolve(xhr.response); })
                xhr.addEventListener('error', (err) => { reject(err); })
                xhr.open(method, url);
                if (type == "json") {
                    if (typeof data == 'object')
                        data = JSON.stringify(data);
                    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                }
                xhr.send(data);
            }
        });
    }
}