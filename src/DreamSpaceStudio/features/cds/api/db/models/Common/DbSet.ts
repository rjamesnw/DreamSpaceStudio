export enum EntityStates {
    New,
    Unchanged,
    Changed
}

export class EntityState<T extends IndexedObject = IndexedObject> {
    /** Holds the original values to allow resetting, and to help detect if there are any changes. */
    originalValues: T;
    constructor(
        /** The DbSet instance tracking the */
        public readonly dbSet: DbSet<T>,
        /** The underlying entity associated with this state instance. */
        public readonly entity: T,
        public state = EntityStates.New) {
    }

    get changed(): boolean { return true; } // TODO
}

/** This is the magic allows the system to track the databases associated with entity instances and navigational properties. */
var dbSets = new WeakMap<object, EntityState>();

/**
 * Get the DbSet instance associated with the given entity instance, if any, otherwise undefined is returned.
 * @param entity
 */
export function getEntityState<T extends IndexedObject = IndexedObject>(entity: T): EntityState<T> {
    return <EntityState<T>>dbSets.get(entity);
}

/**
 * Associates the given DbSet instance with the given entity instance.
 * @param entity
 */
export function attachDbSet<TEntity extends IndexedObject = IndexedObject, TSet extends DbSet<TEntity> = DbSet<TEntity>>(entity: TEntity, dbSet: TSet): EntityState<TEntity> {
    if (typeof entity != 'object') throw DS.Exception.invalidArgument("attachDbSet()", "entity", void 0, "The entity must be a valid object.");
    if (!(dbSet instanceof DbSet)) throw DS.Exception.invalidArgument("attachDbSet()", "'dbSet' must be a valid DbSet instance.");
    var currentState = getEntityState(entity); // (as a precaution we should check this, since rarely do people move entities between contexts; force them to use detachDbSet is that was desired)
    if (currentState && currentState.dbSet && currentState.dbSet != dbSet) throw DS.Exception.error("attachDbSet()", "The given entity already belongs to another DbSet. Please use 'detachDbSet()' first.")
    if (!currentState) {
        currentState = new EntityState(dbSet, entity);
        dbSets.set(entity, currentState);
    } else (<Writeable<EntityState>>currentState).dbSet = dbSet; // (no need to set again, just update the existing state object)
    return currentState;
}

/**
 * Unassociates any DbSet instance from the given entity instance.
 * This would be require prior to attaching an entity to another DbSet instance.
 * @param entity
 */
export function detachDbSet<TEntity extends IndexedObject = IndexedObject>(entity: TEntity): TEntity {
    dbSets.delete(entity);
    return entity;
}

/** Represents a navigation property that pulls data either as a top level table, or related to parent data using foreign keys. */
export class DbSet<T extends IndexedObject = IndexedObject> {

    /** A collection of entities associated with this DbSet instance. */
    items = new Map<T, EntityState>();

    /** Provides a fast way to find existing objects without needing to hit the database. */
    private _keyMap: IndexedObject<EntityState> = {};

    constructor(public readonly type: IType<T>) {
        if (!type) throw DS.Exception.argumentUndefinedOrNull('DbSet()', 'type', this);
        if (typeof type != 'function') throw DS.Exception.invalidArgument('DbSet()', 'type', this);
    }

    /**
     * Adds the given entity to the context underlying the set in the Added state such that it will be inserted into the
     * database when saveChanges() is called.
     * @param entity
     */
    add(entity: T) {
        var state = attachDbSet(entity, this);
        this.items.set(entity, state);
    }

    /**
     * Attaches the given entity to the context underlying the set. That is, the entity is placed into the context in the
     * Unchanged state, just as if it had been read from the database.
     * @param entity
     */
    attach(entity: T) {
        var state = attachDbSet(entity, this);
        this.items.set(entity, state);
    }

    /**
     * Creates a new instance of an entity for the type of this set. Note that this instance is NOT added or attached to
     * the set. However, the instance returned will be associated with this DbSet indirectly.
     * @param entity
     */
    create() { // (note: uses )
        var entity: T = new this.type();
        var state = attachDbSet(entity, this);
        return entity;
    }
}