import { VDOM } from "../../2677A76EE8A34818873FB0587B8C3108/shared/VDOM";
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
