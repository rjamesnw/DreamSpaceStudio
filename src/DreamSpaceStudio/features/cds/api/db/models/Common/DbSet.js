"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbSet = exports.detachDbSet = exports.attachDbSet = exports.getEntityState = exports.EntityState = exports.EntityStates = void 0;
var EntityStates;
(function (EntityStates) {
    EntityStates[EntityStates["New"] = 0] = "New";
    EntityStates[EntityStates["Unchanged"] = 1] = "Unchanged";
    EntityStates[EntityStates["Changed"] = 2] = "Changed";
})(EntityStates = exports.EntityStates || (exports.EntityStates = {}));
class EntityState {
    constructor(
    /** The DbSet instance tracking the */
    dbSet, 
    /** The underlying entity associated with this state instance. */
    entity, state = EntityStates.New) {
        this.dbSet = dbSet;
        this.entity = entity;
        this.state = state;
    }
    get changed() { return true; } // TODO
}
exports.EntityState = EntityState;
/** This is the magic allows the system to track the databases associated with entity instances and navigational properties. */
var dbSets = new WeakMap();
/**
 * Get the DbSet instance associated with the given entity instance, if any, otherwise undefined is returned.
 * @param entity
 */
function getEntityState(entity) {
    return dbSets.get(entity);
}
exports.getEntityState = getEntityState;
/**
 * Associates the given DbSet instance with the given entity instance.
 * @param entity
 */
function attachDbSet(entity, dbSet) {
    if (typeof entity != 'object')
        throw DS.Exception.invalidArgument("attachDbSet()", "entity", void 0, "The entity must be a valid object.");
    if (!(dbSet instanceof DbSet))
        throw DS.Exception.invalidArgument("attachDbSet()", "'dbSet' must be a valid DbSet instance.");
    var currentState = getEntityState(entity); // (as a precaution we should check this, since rarely do people move entities between contexts; force them to use detachDbSet is that was desired)
    if (currentState && currentState.dbSet && currentState.dbSet != dbSet)
        throw DS.Exception.error("attachDbSet()", "The given entity already belongs to another DbSet. Please use 'detachDbSet()' first.");
    if (!currentState) {
        currentState = new EntityState(dbSet, entity);
        dbSets.set(entity, currentState);
    }
    else
        currentState.dbSet = dbSet; // (no need to set again, just update the existing state object)
    return currentState;
}
exports.attachDbSet = attachDbSet;
/**
 * Unassociates any DbSet instance from the given entity instance.
 * This would be require prior to attaching an entity to another DbSet instance.
 * @param entity
 */
function detachDbSet(entity) {
    dbSets.delete(entity);
    return entity;
}
exports.detachDbSet = detachDbSet;
/** Represents a navigation property that pulls data either as a top level table, or related to parent data using foreign keys. */
class DbSet {
    constructor(type) {
        this.type = type;
        /** A collection of entities associated with this DbSet instance. */
        this.items = new Map();
        /** Provides a fast way to find existing objects without needing to hit the database. */
        this._keyMap = {};
        if (!type)
            throw DS.Exception.argumentUndefinedOrNull('DbSet()', 'type', this);
        if (typeof type != 'function')
            throw DS.Exception.invalidArgument('DbSet()', 'type', this);
    }
    /**
     * Adds the given entity to the context underlying the set in the Added state such that it will be inserted into the
     * database when saveChanges() is called.
     * @param entity
     */
    add(entity) {
        var state = attachDbSet(entity, this);
        this.items.set(entity, state);
    }
    /**
     * Attaches the given entity to the context underlying the set. That is, the entity is placed into the context in the
     * Unchanged state, just as if it had been read from the database.
     * @param entity
     */
    attach(entity) {
        var state = attachDbSet(entity, this);
        this.items.set(entity, state);
    }
    /**
     * Creates a new instance of an entity for the type of this set. Note that this instance is NOT added or attached to
     * the set. However, the instance returned will be associated with this DbSet indirectly.
     * @param entity
     */
    create() {
        var entity = new this.type();
        var state = attachDbSet(entity, this);
        return entity;
    }
}
exports.DbSet = DbSet;
//# sourceMappingURL=DbSet.js.map