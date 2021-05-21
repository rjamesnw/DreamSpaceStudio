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

// ============================================================================================================================
// Decorators that will help define the model for the DbSet.

export class ColumnInfo {
    isForeignKey: boolean;
    constructor(public tableInfo: TableInfo, public name: string) { }
}

export class TableInfo {
    /** Associates table column details with model property names as the keys. */
    columns: IndexedObject<ColumnInfo> = {};
    /** References column from another model type info that represents the foreign key for the model associated via the navigational property. */
    navigations: IndexedObject<{ type: IType, foreignKeyName: string, parentType: IType, parentKeyName: string, parentNavPropertyName: string }> = {};

    /** Returns the name of the model type. */
    get typeName() { return DS.Utilities.getTypeName(this.type, false); }

    constructor(
        /** The underlying model type this info represents. */
        public type: IType,
        /** The table name this model represents. */
        public name: string,
        /** The parent model info that helps define the current model. */
        public parentInfo: TableInfo
    ) { }
}

export interface ITableType extends IType {
    __tableInfo__: TableInfo;
}

export function table(name: string) {
    return (target: IType) => {
        (<ITableType>target).__tableInfo__ = new TableInfo(target, name, (<ITableType>target).__tableInfo__);
        // (the static table info is inherited by the sub-types, so we need to explicitly set the table info and reference any
        //  prior references to create an inheritance chain)
    };
}

/**
 * Returns the table information associated with a model type or model instance (assuming the constructor has not been replaced with a custom value).
 * @param typeOrPrototype The type to get TableInfo for.
 * @param required If true (default) then an error is throw if the type is missing.  If false, the return is undefined if missing.
 */
export function getTableInfo(typeOrPrototype: object, required = true): TableInfo {
    var info = 'constructor' in typeOrPrototype ? (<ITableType>typeOrPrototype.constructor)?.__tableInfo__ : (<ITableType>typeOrPrototype).__tableInfo__;
    if (!info) throw DS.Exception.error('@column()', `A '@table(name)' decorator is required first on the model class '${DS.Utilities.getTypeName(typeOrPrototype, false)}'.`)
    return info;
}

export function column(name?: string) {
    return (prototype: object, propertyKey: string, descriptor?: PropertyDescriptor) => {
        var info = getTableInfo(prototype);
        // (by default the constructor for a prototype is the same as the type that owns it)
        info.columns[propertyKey] = new ColumnInfo(info, name ?? propertyKey);
    };
}

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
export function navigation<TChild extends object, TParent extends object>(thisType: IType<TChild>, foreignKeyNameSelector: (_: TChild) => TChild[keyof TChild], parentModelType?: IType<TParent>, parentNavPropertyNameSelector?: (_: TParent) => TParent[keyof TParent], parentKeyNameSelector?: (_: TParent) => TParent[keyof TParent]) {
    return (prototype: object, propertyKey: string, descriptor?: PropertyDescriptor) => {
        var info = getTableInfo(prototype); // (get table info for the associated model)
        //var navModelInfo = modelInfoMap.get(modelType.prototype);
        //if (!navModelInfo) throw DS.Exception.error('@navigation()', "A '@table(name)' decorator is required first on the target model type for the navigational property.")
        //var fkCol = navModelInfo.columns[<any>foreignKeyName];
        //if (!fkCol) throw DS.Exception.error('@navigation()', `A '@column(name)' decorator is required first on the '${foreignKeyName}' foreign key of model type '${navModelInfo.typeName}' befre.`)
        //fkCol.isForeignKey = true;
        if (thisType != info.type) throw DS.Exception.error("@navigation()", "The child model type (first parameter) does not match the type of the model it is in.");
        info.navigations[propertyKey] = {
            type: info.type,
            foreignKeyName: DS.Utilities.nameof(foreignKeyNameSelector),
            parentType: parentModelType ?? info.type,
            parentKeyName: DS.Utilities.nameof(parentKeyNameSelector) ?? "id",
            parentNavPropertyName: DS.Utilities.nameof(parentNavPropertyNameSelector)
        };
        // (note: we cannot check if the other column was defined yet, as the class type may not yet be define in cases of cyclical referencing)
    };
}
export function navigation_<TChild extends IType<any>, TParent extends object>(foreignKeyNameSelector: (_: TChild) => TChild[keyof TChild], parentModelType?: IType<TParent>, parentNavPropertyNameSelector?: (_: TParent) => TParent[keyof TParent], parentKeyNameSelector?: (_: TParent) => TParent[keyof TParent])
    : (thisType: TChild) => TChild {
    return (thisType: TChild) => {
        var info = getTableInfo(thisType); // (get table info for the associated model)
        //var navModelInfo = modelInfoMap.get(modelType.prototype);
        //if (!navModelInfo) throw DS.Exception.error('@navigation()', "A '@table(name)' decorator is required first on the target model type for the navigational property.")
        //var fkCol = navModelInfo.columns[<any>foreignKeyName];
        //if (!fkCol) throw DS.Exception.error('@navigation()', `A '@column(name)' decorator is required first on the '${foreignKeyName}' foreign key of model type '${navModelInfo.typeName}' befre.`)
        //fkCol.isForeignKey = true;
        if (thisType != info.type) throw DS.Exception.error("@navigation()", "The child model type (first parameter) does not match the type of the model it is in.");
        info.navigations[propertyKey] = {
            type: info.type,
            foreignKeyName: DS.Utilities.nameof(foreignKeyNameSelector),
            parentType: parentModelType ?? info.type,
            parentKeyName: DS.Utilities.nameof(parentKeyNameSelector) ?? "id",
            parentNavPropertyName: DS.Utilities.nameof(parentNavPropertyNameSelector)
        };
        // (note: we cannot check if the other column was defined yet, as the class type may not yet be define in cases of cyclical referencing)
    };
}
