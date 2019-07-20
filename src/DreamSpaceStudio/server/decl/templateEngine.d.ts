import { Request, Response } from 'express-serve-static-core';
export declare var viewsRootFolder: string;
export declare var viewsRoot: string;
export declare class HttpContext {
    /** The request object for the current request. */
    request: Request;
    /** The response object for the current request. */
    response: Response;
    /** The path to the view being rendered. */
    viewPath: string;
    /** Optional data for the view being rendered. */
    viewData?: any;
    /** Constructs a new HTTP context using another existing context.
     * @param viewData The data to use for this view.  If not specified, then the view data on the context will be used instead.
     * @param viewPath The relative path and view name to the view being rendered.
     */
    constructor(httpContext: IHttpContext, viewData?: any, viewPath?: string);
    /** Constructs a new HTTP context.
     * @param request The request object for the current request.
     * @param response The response object for the current request.
     * @param viewData The data to use for this view.  If not specified, then the view data on the context will be used instead.
     * @param viewPath The relative path and view name to the view being rendered.
     */
    constructor(request: Request, response: Response, viewData?: any, viewPath?: string);
}
export interface IHttpContext extends HttpContext {
}
export declare function apply(app: ReturnType<typeof import("express")>, viewsRootPath?: string): void;
