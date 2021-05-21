"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityCreatedByBase = void 0;
const EnabledEntityBase_1 = require("./EnabledEntityBase");
const EntityBase_1 = require("./EntityBase");
/// <summary>
/// The base type for all entities that track which user created them.
/// </summary>
class EntityCreatedByBase extends EnabledEntityBase_1.EnabledEntityBase {
    /// <summary>
    /// The user that created this record entry.
    /// </summary>
    get createdBy() { return null; }
    validate(apiAction) {
        var modeState = super.validate(apiAction);
        switch (apiAction) {
            case EntityBase_1.APIActions.Create:
                if (!(this.users_id > 0))
                    modeState.AddModelError(TableJsonConverter.CLRNameToJSName(nameof(UsersID)), "A first name is required.");
                break;
            case EntityBase_1.APIActions.Read:
            case EntityBase_1.APIActions.Update:
            case EntityBase_1.APIActions.Delete:
                break;
        }
        return modeState;
    }
}
__decorate([
    required(),
    foreignKey(nameof(CreatedBy)),
    readOnly(true),
    column("users_id")
], EntityCreatedByBase.prototype, "users_id", void 0);
exports.EntityCreatedByBase = EntityCreatedByBase;
//# sourceMappingURL=EntityCreatedByBase.js.map