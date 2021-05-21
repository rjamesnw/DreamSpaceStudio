"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.navigation_ = exports.navigation = exports.column = exports.getTableInfo = exports.table = exports.TableInfo = exports.ColumnInfo = exports.DbSet = exports.detachDbSet = exports.attachDbSet = exports.getEntityState = exports.EntityState = exports.EntityStates = void 0;
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
// ============================================================================================================================
// Decorators that will help define the model for the DbSet.
class ColumnInfo {
    constructor(tableInfo, name) {
        this.tableInfo = tableInfo;
        this.name = name;
    }
}
exports.ColumnInfo = ColumnInfo;
class TableInfo {
    constructor(
    /** The underlying model type this info represents. */
    type, 
    /** The table name this model represents. */
    name, 
    /** The parent model info that helps define the current model. */
    parentInfo) {
        this.type = type;
        this.name = name;
        this.parentInfo = parentInfo;
        /** Associates table column details with model property names as the keys. */
        this.columns = {};
        /** References column from another model type info that represents the foreign key for the model associated via the navigational property. */
        this.navigations = {};
    }
    /** Returns the name of the model type. */
    get typeName() { return DS.Utilities.getTypeName(this.type, false); }
}
exports.TableInfo = TableInfo;
function table(name) {
    return (target) => {
        target.__tableInfo__ = new TableInfo(target, name, target.__tableInfo__);
        // (the static table info is inherited by the sub-types, so we need to explicitly set the table info and reference any
        //  prior references to create an inheritance chain)
    };
}
exports.table = table;
/**
 * Returns the table information associated with a model type or model instance (assuming the constructor has not been replaced with a custom value).
 * @param typeOrPrototype The type to get TableInfo for.
 * @param required If true (default) then an error is throw if the type is missing.  If false, the return is undefined if missing.
 */
function getTableInfo(typeOrPrototype, required = true) {
    var _a;
    var info = 'constructor' in typeOrPrototype ? (_a = typeOrPrototype.constructor) === null || _a === void 0 ? void 0 : _a.__tableInfo__ : typeOrPrototype.__tableInfo__;
    if (!info)
        throw DS.Exception.error('@column()', `A '@table(name)' decorator is required first on the model class '${DS.Utilities.getTypeName(typeOrPrototype, false)}'.`);
    return info;
}
exports.getTableInfo = getTableInfo;
function column(name) {
    return (prototype, propertyKey, descriptor) => {
        var info = getTableInfo(prototype);
        // (by default the constructor for a prototype is the same as the type that owns it)
        info.columns[propertyKey] = new ColumnInfo(info, name !== null && name !== void 0 ? name : propertyKey);
    };
}
exports.column = column;
//export function foreignKey(name?: string) {
//    return (prototype: object, propertyKey: string, descriptor?: PropertyDescriptor) => {
//        var info = getTableInfo(prototype);
//        // (by default the constructor for a prototype is the same as the type that owns it)
//        info.columns[propertyKey] = new ColumnInfo(info, name ?? propertyKey);
//    };
//}
/**
 * When defining a navigational property you must specify the target model type and foreign key name first, followed by the
 * parent model it is a child of and the parent key (which defaults to just 'id', as is most common).
 * @param modelType
 * @param foreignKeyName
 * @param parentModelType
 * @param parentKeyName
 */
function navigation(thisType, foreignKeyNameSelector, parentModelType, parentNavPropertyNameSelector, parentKeyNameSelector) {
    return (prototype, propertyKey, descriptor) => {
        var _a;
        var info = getTableInfo(prototype); // (get table info for the associated model)
        //var navModelInfo = modelInfoMap.get(modelType.prototype);
        //if (!navModelInfo) throw DS.Exception.error('@navigation()', "A '@table(name)' decorator is required first on the target model type for the navigational property.")
        //var fkCol = navModelInfo.columns[<any>foreignKeyName];
        //if (!fkCol) throw DS.Exception.error('@navigation()', `A '@column(name)' decorator is required first on the '${foreignKeyName}' foreign key of model type '${navModelInfo.typeName}' befre.`)
        //fkCol.isForeignKey = true;
        if (thisType != info.type)
            throw DS.Exception.error("@navigation()", "The child model type (first parameter) does not match the type of the model it is in.");
        info.navigations[propertyKey] = {
            type: info.type,
            foreignKeyName: DS.Utilities.nameof(foreignKeyNameSelector),
            parentType: parentModelType !== null && parentModelType !== void 0 ? parentModelType : info.type,
            parentKeyName: (_a = DS.Utilities.nameof(parentKeyNameSelector)) !== null && _a !== void 0 ? _a : "id",
            parentNavPropertyName: DS.Utilities.nameof(parentNavPropertyNameSelector)
        };
        // (note: we cannot check if the other column was defined yet, as the class type may not yet be define in cases of cyclical referencing)
    };
}
exports.navigation = navigation;
function navigation_(foreignKeyNameSelector, parentModelType, parentNavPropertyNameSelector, parentKeyNameSelector) {
    return (thisType) => {
        var _a;
        var info = getTableInfo(thisType); // (get table info for the associated model)
        //var navModelInfo = modelInfoMap.get(modelType.prototype);
        //if (!navModelInfo) throw DS.Exception.error('@navigation()', "A '@table(name)' decorator is required first on the target model type for the navigational property.")
        //var fkCol = navModelInfo.columns[<any>foreignKeyName];
        //if (!fkCol) throw DS.Exception.error('@navigation()', `A '@column(name)' decorator is required first on the '${foreignKeyName}' foreign key of model type '${navModelInfo.typeName}' befre.`)
        //fkCol.isForeignKey = true;
        if (thisType != info.type)
            throw DS.Exception.error("@navigation()", "The child model type (first parameter) does not match the type of the model it is in.");
        info.navigations[propertyKey] = {
            type: info.type,
            foreignKeyName: DS.Utilities.nameof(foreignKeyNameSelector),
            parentType: parentModelType !== null && parentModelType !== void 0 ? parentModelType : info.type,
            parentKeyName: (_a = DS.Utilities.nameof(parentKeyNameSelector)) !== null && _a !== void 0 ? _a : "id",
            parentNavPropertyName: DS.Utilities.nameof(parentNavPropertyNameSelector)
        };
        // (note: we cannot check if the other column was defined yet, as the class type may not yet be define in cases of cyclical referencing)
    };
}
exports.navigation_ = navigation_;
//# sourceMappingURL=DbSet.js.map