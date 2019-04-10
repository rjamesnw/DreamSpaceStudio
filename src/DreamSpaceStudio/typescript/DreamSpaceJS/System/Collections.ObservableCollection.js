"use strict";
// ############################################################################################################################################
// Collections: ObservableCollection
// ############################################################################################################################################
Object.defineProperty(exports, "__esModule", { value: true });
const Types_1 = require("../Types");
/** Holds an array of items, and implements notification functionality for when the collection changes. */
class ObservableCollection extends Types_1.Factory(Array) {
    static 'new'(...items) { return null; }
    static init(o, isnew, ...items) {
        this.super.init(o, isnew, ...items);
    }
}
exports.ObservableCollection = ObservableCollection;
(function (ObservableCollection) {
    class $__type extends FactoryType(Array) {
        // --------------------------------------------------------------------------------------------------------------------------
        static [constructor](factory) {
            //factory.init = (o, isnew) => {
            //};
        }
    }
    ObservableCollection.$__type = $__type;
    ObservableCollection.$__register(Collections);
})(ObservableCollection = exports.ObservableCollection || (exports.ObservableCollection = {}));
// ############################################################################################################################################
//# sourceMappingURL=Collections.ObservableCollection.js.map