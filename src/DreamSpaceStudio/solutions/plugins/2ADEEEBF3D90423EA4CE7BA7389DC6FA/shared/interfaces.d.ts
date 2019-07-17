import { VDOM } from "./modules";
/** Data template information as extracted from HTML template text. */
export interface IDataTemplate {
    id: string;
    originalHTML: string;
    templateHTML: string;
    templateItem: VDOM.Node;
    childTemplates: IDataTemplate[];
}
export interface IHTMLParseResult {
    rootElements: VDOM.Node[];
    templates: {
        [id: string]: IDataTemplate;
    };
}
