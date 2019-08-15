namespace DS {
    /** A page holds the UI design, which is basically just a single HTML page template. */
    export class Page extends Resource {
        /** On the client-side, this is the iframe or pop-up window that contains the page elements. */
        window: any;
    }
}