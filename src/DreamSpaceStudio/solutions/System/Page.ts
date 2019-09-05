namespace DS {
    export namespace Abstracts {

        /** A page holds the UI design, which is basically just a single HTML page template. */
        export abstract class Page extends TrackableObject implements IResourceSource {
            abstract getResourceValue(): Promise<any>;
            abstract getResourceType(): ResourceTypes;
        }

    }
}