namespace DS {
    /** A page holds the UI design, which is basically just a single HTML page template. */
    export class Page extends Abstracts.Page implements IResourceSource {
        /** On the client-side, this is the iframe or pop-up window that contains the page elements. */
        window: any;

        getResourceValue(): Promise<any> { return Promise.resolve(""); }
        getResourceType(): ResourceTypes { return ResourceTypes.Text_HTML; }
    }
}