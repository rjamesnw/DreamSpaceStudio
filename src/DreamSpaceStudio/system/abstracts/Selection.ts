namespace DS {
    /** Represents a single selected item. */
    export class SelectedItem {
        /** The item that was selected. */
        item: any;
        /** The type of item selected. */
        type: string;
    }

    /** Represents one or more selected items. */
    export class Selection {
        /** One or more selected items. */
        readonly selections: SelectedItem[] = [];
    }
}