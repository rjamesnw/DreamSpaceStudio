"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogItem = void 0;
const Action_1 = require("./Action");
const ApplicationEntity_1 = require("./Common/ApplicationEntity");
const DbSet_1 = require("./Common/DbSet");
let AuditLogItem = class AuditLogItem extends ApplicationEntity_1.ApplicationEntity {
    get User() { return null; }
    get Action() { return null; }
};
__decorate([
    foreignKey(DS.Utilities.nameof(() => Action_1.Action)),
    DbSet_1.column("actions_id")
], AuditLogItem.prototype, "actionsID", void 0);
__decorate([
    DbSet_1.column("details")
], AuditLogItem.prototype, "details", void 0);
__decorate([
    DbSet_1.column("ip")
], AuditLogItem.prototype, "ip", void 0);
__decorate([
    DbSet_1.column("host")
], AuditLogItem.prototype, "host", void 0);
AuditLogItem = __decorate([
    DbSet_1.table("audit_log")
], AuditLogItem);
exports.AuditLogItem = AuditLogItem;
//# sourceMappingURL=AuditLogItem.js.map