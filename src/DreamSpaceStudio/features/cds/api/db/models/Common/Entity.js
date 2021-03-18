"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = void 0;
/** All tables  */
class Entity {
    constructor(entity) {
        this.entity = entity;
    }
    /** Saves this entity. If not yet attached, the entity is attached to the DbSet first before saving. */
    save() {
    }
}
exports.Entity = Entity;
//# sourceMappingURL=Entity.js.map