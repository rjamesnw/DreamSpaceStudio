// ############################################################################################################################################
// Collections: ObservableCollection
// ############################################################################################################################################
var DreamSpace;
(function (DreamSpace) {
    var System;
    (function (System) {
        var Collections;
        (function (Collections) {
            namespace(() => DreamSpace.System.Collections);
            /** Holds an array of items, and implements notification functionality for when the collection changes. */
            class ObservableCollection extends FactoryBase(Array) {
                static 'new'(...items) { return null; }
                static init(o, isnew, ...items) {
                    this.super.init(o, isnew, ...items);
                }
            }
            Collections.ObservableCollection = ObservableCollection;
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
            })(ObservableCollection = Collections.ObservableCollection || (Collections.ObservableCollection = {}));
            // ========================================================================================================================================
        })(Collections = System.Collections || (System.Collections = {}));
    })(System = DreamSpace.System || (DreamSpace.System = {}));
})(DreamSpace || (DreamSpace = {})); // (end Collections)
//# sourceMappingURL=System.Collections.ObservableCollection.js.map