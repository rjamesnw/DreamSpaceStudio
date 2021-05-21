var DS;
(function (DS) {
    /** Represents a single selected item. */
    class SelectedItem {
    }
    DS.SelectedItem = SelectedItem;
    /** Represents one or more selected items. */
    class Selection {
        constructor() {
            /** One or more selected items. */
            this.selections = [];
        }
    }
    DS.Selection = Selection;
})(DS || (DS = {}));
//# sourceMappingURL=Selection.js.map