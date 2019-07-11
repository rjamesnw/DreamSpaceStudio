declare type Methods = "GET" | "POST" | "PUT" | "DELETE";
interface IResponse<TData = any> {
    statusCode: number;
    message: string;
    data?: TData;
}
declare var isNode: string;
/** This is the root to all DreamSpaceJS utilities.
 * These utilities cover most common developer needs when buidling custom components.
 */
declare namespace DS {
    /** Contains the results of a component's operation. */
    function get<T = object>(url: string, type?: "json", method?: Methods, data?: any): Promise<T>;
    function get<T = string>(url: string, type?: "xml", method?: Methods, data?: any): Promise<T>;
    function get<T = string>(url: string, type?: "text", method?: Methods, data?: any): Promise<T>;
    function get<T = boolean>(url: string, type?: "boolean", method?: Methods, data?: any): Promise<T>;
    function get<T = number>(url: string, type?: "number", method?: Methods, data?: any): Promise<T>;
    function get<T = any>(url: string, type?: string, method?: Methods, data?: any): Promise<T>;
}
