// ############################################################################################################################################
// Collections: ObservableCollection
// ############################################################################################################################################
define(["require", "exports", "../Types", "../PrimitiveTypes"], function (require, exports, Types_1, PrimitiveTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /** Holds an array of items, and implements notification functionality for when the collection changes. */
    class ObservableCollectionFactory extends Types_1.Factory(PrimitiveTypes_1.Array) {
        static 'new'(...items) { return null; }
        static init(o, isnew, ...items) {
            this.super.init(o, isnew, ...items);
        }
    }
    exports.ObservableCollection = ObservableCollectionFactory;
    let ObservableCollection = class ObservableCollection extends PrimitiveTypes_1.ArrayInstance {
    };
    ObservableCollection = __decorate([
        Types_1.usingFactory(ObservableCollectionFactory, this)
    ], ObservableCollection);
    exports.ObservableCollectionInstance = ObservableCollection;
});
// ############################################################################################################################################
//# sourceMappingURL=Collections.ObservableCollection.js.map