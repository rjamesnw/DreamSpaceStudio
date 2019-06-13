// ############################################################################################################################################
// Collections: ObservableCollection
// ############################################################################################################################################

import { Factory, usingFactory } from "../Types";
import { Array, ArrayInstance } from "../PrimitiveTypes";
import { IEventDispatcher } from "./Events";

// ========================================================================================================================================

export interface NotifyCollectionChangingEventHandler<TItem> { (sender: {}, oldItems: TItem[], oldIndex: number, newItems: TItem[], newIndex: number): any }
export interface NotifyCollectionChangedEventHandler<TItem> { (sender: {}, oldItems: TItem[], oldIndex: number, newItems: TItem[], newIndex: number): any }

export interface INotifyCollectionChanging<TOwner extends object, TItems> {
    collectionChanging: IEventDispatcher<TOwner, NotifyCollectionChangingEventHandler<TItems>>;
}

export interface INotifyCollectionChanged<TOwner extends object, TItems> {
    collectionChanged: IEventDispatcher<TOwner, NotifyCollectionChangedEventHandler<TItems>>;
}

/** Holds an array of items, and implements notification functionality for when the collection changes. */
class ObservableCollectionFactory extends Factory(Array) {
    static 'new'<TOwner extends IndexedObject, T>(...items: T[]): ObservableCollection<TOwner, T> { return null; }

    static init<TOwner extends IndexedObject, T>(o: ObservableCollection<TOwner, T>, isnew: boolean, ...items: T[]): void {
        this.super.init<T>(o, isnew, ...items);
    }
}

@usingFactory(ObservableCollectionFactory, this)
class ObservableCollection<TOwner extends IndexedObject, T> extends ArrayInstance<T> implements INotifyCollectionChanging<TOwner, T>, INotifyCollectionChanged<TOwner, T> {
    // --------------------------------------------------------------------------------------------------------------------------

    [name: string]: any;

    collectionChanging: IEventDispatcher<TOwner, NotifyCollectionChangingEventHandler<T>>; // TODO: Implement
    collectionChanged: IEventDispatcher<TOwner, NotifyCollectionChangedEventHandler<T>>; // TODO: Implement

    // --------------------------------------------------------------------------------------------------------------------------
}

export { ObservableCollectionFactory as ObservableCollection, ObservableCollection as ObservableCollectionInstance }

export interface IObservableCollection<TOwner extends object, T> extends ObservableCollection<TOwner, T> { }

// ############################################################################################################################################
