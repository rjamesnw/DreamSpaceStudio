import { Array, ArrayInstance } from "../PrimitiveTypes";
import { IEventDispatcher } from "./Events";
export interface NotifyCollectionChangingEventHandler<TItem> {
    (sender: {}, oldItems: TItem[], oldIndex: number, newItems: TItem[], newIndex: number): any;
}
export interface NotifyCollectionChangedEventHandler<TItem> {
    (sender: {}, oldItems: TItem[], oldIndex: number, newItems: TItem[], newIndex: number): any;
}
export interface INotifyCollectionChanging<TOwner extends object, TItems> {
    collectionChanging: IEventDispatcher<TOwner, NotifyCollectionChangingEventHandler<TItems>>;
}
export interface INotifyCollectionChanged<TOwner extends object, TItems> {
    collectionChanged: IEventDispatcher<TOwner, NotifyCollectionChangedEventHandler<TItems>>;
}
declare const ObservableCollectionFactory_base: {
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
/** Holds an array of items, and implements notification functionality for when the collection changes. */
declare class ObservableCollectionFactory extends ObservableCollectionFactory_base {
    static 'new'<TOwner extends IndexedObject, T>(...items: T[]): ObservableCollection<TOwner, T>;
    static init<TOwner extends IndexedObject, T>(o: ObservableCollection<TOwner, T>, isnew: boolean, ...items: T[]): void;
}
declare class ObservableCollection<TOwner extends IndexedObject, T> extends ArrayInstance<T> implements INotifyCollectionChanging<TOwner, T>, INotifyCollectionChanged<TOwner, T> {
    [name: string]: any;
    collectionChanging: IEventDispatcher<TOwner, NotifyCollectionChangingEventHandler<T>>;
    collectionChanged: IEventDispatcher<TOwner, NotifyCollectionChangedEventHandler<T>>;
}
export { ObservableCollectionFactory as ObservableCollection, ObservableCollection as ObservableCollectionInstance };
export interface IObservableCollection<TOwner extends object, T> extends ObservableCollection<TOwner, T> {
}
