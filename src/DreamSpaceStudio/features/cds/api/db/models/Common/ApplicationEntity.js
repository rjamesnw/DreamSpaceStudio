"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationEntity = void 0;
const DbSet_1 = require("./DbSet");
const EntityBase_1 = require("./EntityBase");
const EntityCreatedByBase_1 = require("./EntityCreatedByBase");
/// <summary>
/// The base type for all entities that store partitioned application instance data.
/// These are all tables that are NOT related to map tables or static lookup tables.
/// </summary>
class ApplicationEntity extends EntityCreatedByBase_1.EntityCreatedByBase {
    /// <summary>
    ///     Returns true if this instance has no key or a new key assigned.  This helps the reconciliation process if an insert
    ///     fails and new keys are needed.
    /// </summary>
    /// <param name="db"> A database context to use to check this instance against. </param>
    /// <returns> True if new, false if not. </returns>
    isNew(db) { return id == 0 || db.Entry(this).Property("ID").IsModified; }
    Validate(apiAction) {
        var modeState = super.validate(apiAction);
        switch (apiAction) {
            case EntityBase_1.APIActions.Create:
                if (this.id != 0)
                    modeState.AddModelError(DS.Utilities.nameof(() => this.id), "The ID must be 0 when creating a new entry.");
                break;
            case EntityBase_1.APIActions.Read:
                if (this.id <= 0)
                    modeState.AddModelError(DS.Utilities.nameof(() => this.id), "The ID must be > 0 when looking up existing entries.");
                break;
            case EntityBase_1.APIActions.Update:
                if (this.id <= 0)
                    modeState.AddModelError(DS.Utilities.nameof(() => this.id), "An ID is required when updating existing entries.");
                break;
            case EntityBase_1.APIActions.Delete:
                if (this.id <= 0)
                    modeState.AddModelError(DS.Utilities.nameof(() => this.id), "An ID is required to delete existing entries.");
                break;
        }
        return modeState;
    }
}
__decorate([
    required(),
    key(),
    readOnly(true),
    DbSet_1.column("id")
], ApplicationEntity.prototype, "id", void 0);
exports.ApplicationEntity = ApplicationEntity;
//# sourceMappingURL=ApplicationEntity.js.map