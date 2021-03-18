/** All tables  */
export class Entity<T extends IndexedObject = IndexedObject> {

    constructor(public entity: T) {
    }

    /** Saves this entity. If not yet attached, the entity is attached to the DbSet first before saving. */
    save() {
    }
}