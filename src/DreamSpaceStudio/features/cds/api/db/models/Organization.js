"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Organization = void 0;
const DbSet_1 = require("./Common/DbSet");
const NamedApplicationEntity_1 = require("./Common/NamedApplicationEntity");
let Organization = class Organization extends NamedApplicationEntity_1.NamedApplicationEntity {
    //[NotMapped]
    //get Users(): Iterable<User> { get { return EntityMap.Get(ref _Users, this, User_Organization_Maps = User_Organization_Maps.EnsureEntityCollection()); } }
    //EntityMap<Organization, User_Organization_Map, User> _Users;
    //protected virtual ICollection<User_Organization_Map> User_Organization_Maps { get; set; }
    get ParentOrganization() { return null; }
};
__decorate([
    DbSet_1.column("domain")
], Organization.prototype, "domain", void 0);
__decorate([
    foreignKey(nameof(ParentOrganization)),
    DbSet_1.column("organizations_id")
], Organization.prototype, "organizationsID", void 0);
__decorate([
    DbSet_1.navigation()
], Organization.prototype, "ParentOrganization", null);
Organization = __decorate([
    DbSet_1.table("organizations")
], Organization);
exports.Organization = Organization;
//# sourceMappingURL=Organization.js.map