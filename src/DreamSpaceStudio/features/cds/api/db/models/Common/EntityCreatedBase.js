"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityCreatedBase = void 0;
const EntityBase_1 = require("./EntityBase");
/// <summary>
/// The base type for all entities that track which user created them.
/// </summary>
class EntityCreatedBase extends EntityBase_1.EntityBase {
    validate(apiAction) {
        return super.validate(apiAction);
    }
}
__decorate([
    readOnly(true)
], EntityCreatedBase.prototype, "created", void 0);
__decorate([
    readOnly(true)
], EntityCreatedBase.prototype, "updated", void 0);
exports.EntityCreatedBase = EntityCreatedBase;
//# sourceMappingURL=EntityCreatedBase.js.map