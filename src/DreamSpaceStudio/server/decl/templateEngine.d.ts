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
    /** An accumulation of named contexts while parsing a previous view. */
    sectionManager: SectionManager;
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
export interface Renderer {
    (): string | Promise<string>;
}
export declare class Section {
    readonly manager: SectionManager;
    readonly name: string;
    renderers: (Renderer | string)[];
    constructor(manager: SectionManager, name: string);
    /** Adds a new renderer or static string to the list of items to render for this section. */
    add(value: Renderer | string): void;
    render(): Promise<string>;
}
export declare class SectionManager {
    static readonly defaultSectionName = "content";
    readonly sections: {
        [name: string]: Section;
    };
    activeSection: string;
    /** Adds a new renderer or static string to the list of items to render for the specified section.
     * If a section does not exist then it is created first.
     */
    add(value: Renderer | string, name?: string): void;
    /** Returns true if the named section exist. */
    hasSection(name: string): boolean;
}
export declare function apply(app: ReturnType<typeof import("express")>, viewsRootPath?: string): void;
