"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
const DbSet_1 = require("./Common/DbSet");
const NamedApplicationEntity_1 = require("./Common/NamedApplicationEntity");
let Role = class Role extends NamedApplicationEntity_1.NamedApplicationEntity {
};
__decorate([
    DbSet_1.column()
], Role.prototype, "description", void 0);
Role = __decorate([
    DbSet_1.table("roles")
], Role);
exports.Role = Role;
//# sourceMappingURL=Role.js.map