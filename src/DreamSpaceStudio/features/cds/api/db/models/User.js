"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const ApplicationEntity_1 = require("./Common/ApplicationEntity");
const DbSet_1 = require("./Common/DbSet");
let User = class User extends ApplicationEntity_1.ApplicationEntity {
    constructor() {
        super(...arguments);
        this.email = void 0;
    }
};
Column("email"), Column("phone");
__decorate([
    DbSet_1.column("first_name")
], User.prototype, "firstName", void 0);
__decorate([
    DbSet_1.column("last_name")
], User.prototype, "lastName", void 0);
User = __decorate([
    DbSet_1.table("users")
], User);
exports.User = User;
{
    get;
    set;
}
[Column("password")];
string;
Password;
{
    get;
    set;
}
[Column("password_reset_key")];
string;
PasswordResetKey;
{
    get;
    set;
}
[Column("last_login")];
DateTime ? LastLogin : ;
{
    get;
    set;
}
[Column("reg_mode")];
int ? reg_mode : ;
{
    get;
    set;
}
[Column("reg_key")];
string;
reg_key;
{
    get;
    set;
}
virtual;
ICollection < User_Organization_Map > User_Organization_Mapping;
{
    get;
    set;
}
virtual;
ICollection < Payment > Payments;
{
    get;
    set;
}
[NotMapped];
virtual;
ICollection < Subscription > Subscriptions;
{
    get;
    {
        return EntityMap.Get(ref, _Subscriptions, this, Subscription_User_Maps = Subscription_User_Maps.EnsureEntityCollection());
    }
}
EntityMap < User, Subscription_User_Map, Subscription > _Subscriptions;
virtual;
ICollection < Subscription_User_Map > Subscription_User_Maps;
{
    get;
    set;
}
virtual;
ICollection < Organization_User_Application_Membership_Map > Organization_User_Application_Membership_Mapping;
{
    get;
    set;
}
virtual;
ICollection < Subscription_User_Map > Subscription_SubUser_Mapping;
{
    get;
    set;
}
virtual;
ICollection < SavedBillingAddress > SavedBillingAddresses;
{
    get;
    set;
}
virtual;
ICollection < SavedCreditCardInfo > SavedCreditCardInfos;
{
    get;
    set;
}
virtual;
ICollection < SessionStore > SessionData;
{
    get;
    set;
}
//# sourceMappingURL=User.js.map