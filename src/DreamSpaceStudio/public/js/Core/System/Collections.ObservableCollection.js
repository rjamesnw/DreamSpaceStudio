// ############################################################################################################################################
// Collections: ObservableCollection
// ############################################################################################################################################
define(["require", "exports", "../Factories", "../PrimitiveTypes"], function (require, exports, Factories_1, PrimitiveTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /** Holds an array of items, and implements notification functionality for when the collection changes. */
    class ObservableCollectionFactory extends Factories_1.Factory(PrimitiveTypes_1.Array) {
        static 'new'(...items) { return null; }
        static init(o, isnew, ...items) {
            this.super.init(o, isnew, ...items);
        }
    }
    exports.ObservableCollection = ObservableCollectionFactory;
    let ObservableCollection = class ObservableCollection extends PrimitiveTypes_1.ArrayInstance {
    };
    ObservableCollection = __decorate([
        Factories_1.usingFactory(ObservableCollectionFactory, this)
    ], ObservableCollection);
    exports.ObservableCollectionInstance = ObservableCollection;
});
// ############################################################################################################################################
//# sourceMappingURL=Collections.ObservableCollection.js.map