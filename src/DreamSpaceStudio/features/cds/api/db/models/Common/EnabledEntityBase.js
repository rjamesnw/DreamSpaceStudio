"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnabledEntityBase = void 0;
const DbSet_1 = require("./DbSet");
const EntityCreatedBase_1 = require("./EntityCreatedBase");
class EnabledEntityBase extends EntityCreatedBase_1.EntityCreatedBase {
}
__decorate([
    DbSet_1.column()
], EnabledEntityBase.prototype, "disabled", void 0);
exports.EnabledEntityBase = EnabledEntityBase;
//# sourceMappingURL=EnabledEntityBase.js.map