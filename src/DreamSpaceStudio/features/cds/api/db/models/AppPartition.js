"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppPartition = void 0;
const ApplicationEntity_1 = require("./Common/ApplicationEntity");
const DbSet_1 = require("./Common/DbSet");
/** Defines partitioning details for an application.
 * The 'applications' table holds all the applications that are available to be used (like a global registry), and also defines
 * the default system partition, which is usually 1 by default. Each application is partitioned by organizations, and each
 * partition contains the connection details, in case of dedicated servers (such as on-premise ones).
 */
let AppPartition = class AppPartition extends ApplicationEntity_1.ApplicationEntity {
};
__decorate([
    DbSet_1.column()
], AppPartition.prototype, "name", void 0);
__decorate([
    DbSet_1.column()
], AppPartition.prototype, "organizations_id", void 0);
__decorate([
    DbSet_1.column()
], AppPartition.prototype, "applications_id", void 0);
__decorate([
    DbSet_1.column()
], AppPartition.prototype, "db_server_name", void 0);
__decorate([
    DbSet_1.column()
], AppPartition.prototype, "db_server_ip", void 0);
__decorate([
    DbSet_1.column()
], AppPartition.prototype, "db_server_port", void 0);
__decorate([
    DbSet_1.column()
], AppPartition.prototype, "notes", void 0);
AppPartition = __decorate([
    DbSet_1.table("app_partitions")
], AppPartition);
exports.AppPartition = AppPartition;
//# sourceMappingURL=AppPartition.js.map