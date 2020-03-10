namespace DS {
    /** A page holds the UI design, which is basically just a single HTML page template. */
    export class Page extends Abstracts.Page implements IResourceSource {
        getResourceValue(): Promise<any> { return Promise.resolve(""); }
        getResourceType(): ResourceTypes { return ResourceTypes.Text_HTML; }
    }
}