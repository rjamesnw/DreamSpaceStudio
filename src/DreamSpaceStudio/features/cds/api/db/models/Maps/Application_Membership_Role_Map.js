"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Application_Membership_Role_Map_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application_Membership_Role_Map = void 0;
const Application_1 = require("../Application");
const DbSet_1 = require("../Common/DbSet");
const MapEntity_1 = require("../Common/MapEntity");
const Membership_1 = require("../Membership");
const Role_1 = require("../Role");
let Application_Membership_Role_Map = Application_Membership_Role_Map_1 = class Application_Membership_Role_Map extends MapEntity_1.MapEntity {
};
__decorate([
    DbSet_1.column("applications_id")
], Application_Membership_Role_Map.prototype, "applicationsID", void 0);
__decorate([
    DbSet_1.column("memberships_id")
], Application_Membership_Role_Map.prototype, "membershipsID", void 0);
__decorate([
    DbSet_1.column("roles_id")
], Application_Membership_Role_Map.prototype, "rolesID", void 0);
__decorate([
    DbSet_1.navigation(Application_Membership_Role_Map_1, _ => _.applicationsID, Application_1.Application, _ => _.Application_Membership_Role_Mapping, _ => _.id)
], Application_Membership_Role_Map.prototype, "Application", void 0);
__decorate([
    DbSet_1.navigation(Application_Membership_Role_Map_1, _ => _.membershipsID, Membership_1.Membership, _ => _.Application_Membership_Role_Mapping, _ => _.id)
], Application_Membership_Role_Map.prototype, "Membership", void 0);
__decorate([
    DbSet_1.navigation(Application_Membership_Role_Map_1, _ => _.rolesID, Role_1.Role, _ => _.Application_Membership_Role_Mapping, _ => _.id)
], Application_Membership_Role_Map.prototype, "Role", void 0);
Application_Membership_Role_Map = Application_Membership_Role_Map_1 = __decorate([
    DbSet_1.table("map_applications_memberships_roles"),
    DbSet_1.navigation_(_ => _.applicationsID, Application_1.Application, _ => _.Application_Membership_Role_Mapping, _ => _.id)
], Application_Membership_Role_Map);
exports.Application_Membership_Role_Map = Application_Membership_Role_Map;
//# sourceMappingURL=Application_Membership_Role_Map.js.map