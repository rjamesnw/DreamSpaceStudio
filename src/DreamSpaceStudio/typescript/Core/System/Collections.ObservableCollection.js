"use strict";
// ############################################################################################################################################
// Collections: ObservableCollection
// ############################################################################################################################################
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Factories_1 = require("../Factories");
const PrimitiveTypes_1 = require("../PrimitiveTypes");
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
// ############################################################################################################################################
//# sourceMappingURL=Collections.ObservableCollection.js.map