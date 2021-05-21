var DS;
(function (DS) {
    /** A page holds the UI design, which is basically just a single HTML page template. */
    class Page extends DS.Abstracts.Page {
        getResourceValue() { return Promise.resolve(""); }
        getResourceType() { return DS.ResourceTypes.Text_HTML; }
    }
    DS.Page = Page;
})(DS || (DS = {}));
//# sourceMappingURL=Page.js.map