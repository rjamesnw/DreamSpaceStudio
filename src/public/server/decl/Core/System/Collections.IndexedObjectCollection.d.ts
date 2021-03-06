import { Array, ArrayInstance } from "../PrimitiveTypes";
declare const IndexedObjectCollectionFactory_base: {
    new (): Array;
    super: typeof Array;
    'new'?(...args: any[]): any;
    init?(o: object, isnew: boolean, ...args: any[]): void;
} & {
    prototype: Array;
    isArray: (arg: any) => arg is any[];
    from: {
        <T>(arrayLike: ArrayLike<T>): T[];
        <T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];
        <T>(iterable: Iterable<T> | ArrayLike<T>): T[];
        <T, U>(iterable: Iterable<T> | ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];
    };
    of: <T>(...items: T[]) => T[];
    super: ArrayConstructor & import("./Events").IFactory<ArrayConstructor, import("./Events").NewDelegate<{}[]>, import("./Events").InitDelegate<{}[]>>;
};
/** Returns an ID based on the index position of the added object, or from a list of previously released object IDs (indexes).
* There are 2 main goals of this object: 1. to help prevent ID numbers from wrapping for server apps that may be running
* for days/weeks/months by caching an reusing IDs that are no longer needed, and 2. to maintain a global list of objects
* for fast lookup under a single app domain (especially for networking purposes).
* Note: A property '$__id' is added/updated on the objects automatically.  You can change this property name by setting
* a new value for 'IndexedObjectCollcetion.__IDPropertyName'.
*/
declare class IndexedObjectCollectionFactory extends IndexedObjectCollectionFactory_base {
    /** @param {TObject[]} objects Initial objects to add to the collection. */
    static 'new'<TObject extends object>(...objects: TObject[]): IndexedObjectCollection<TObject>;
    static init<TObject extends object>(o: IndexedObjectCollection<TObject>, isnew: boolean, ...objects: TObject[]): void;
    /**
     * Holds the name of the internal property created on the objects in order to track indexes.
     * This defaults to "$__index".
     */
    static __IDPropertyName: string;
    static __validIDIndexPropertyName: string;
}
declare class IndexedObjectCollection<TObject extends IndexedObject> extends ArrayInstance<TObject> {
    /**
     * Holds the name of the internal property created on the objects in order to track indexes.
     * This defaults to the global 'IndexedObjectCollection.__IDPropertyName' setting.
     */
    __IDPropertyName: string;
    private __objects;
    private __validIDs;
    private __validIDsReadIndex;
    private __releasedIDs;
    private __releasedIDsReadIndex;
    /** Adds an object and returns it's index number as the ID for the object. */
    addObject(obj: TObject): number;
    /** Releases an object based on it's ID (index value). */
    removeObject(id: number): TObject;
    /** Releases an object based on it's ID property (index value, which is '__id' by default). */
    removeObject(obj: TObject): TObject;
    /** Return the object associated with the specified ID (index) value cast to the specified type. */
    getObject<T extends TObject>(id: number): T;
    /** Return the object associated with the specified ID (index) value and forcibly cast it to the specified type. */
    getObjectForceCast<T extends object>(id: number): T;
    /** Returns the number of objects in this collection.
     * You can use this number with the 'getObjectAt()' function to iterate over all the objects.
     */
    count(): number;
    /** Returns an object at a specified index. This allows iterating over the objects in a linear fashion.
     * Internally, objects are stored in an array that may have a lot of 'null' items where objects have been removed. A
     * separate internal array holds a list of valid object IDs for quick reference, and it is this array that the 'index'
     * parameter applies to.
     * Warning: When objects are removed, their IDs in the internal "valid IDs" array are swapped with the end item, so never
     * remove objects while iterating over them using this function, otherwise many objects may be skipped in the process.
     * If objects must be deleted during iteration, get the complete array of objects first by calling the 'getItems()' function.
     */
    getObjectAt(index: number): TObject;
    /** Returns an array of all the objects in this collection. */
    getItems(): TObject[];
    /** Removes all objects from the collection. */
    clear(): this;
}
export { IndexedObjectCollectionFactory as IndexedObjectCollection, IndexedObjectCollection as IndexedObjectCollectionInstance };
export interface IIndexedObjectCollection<TObject extends object = object> extends IndexedObjectCollection<TObject> {
}
