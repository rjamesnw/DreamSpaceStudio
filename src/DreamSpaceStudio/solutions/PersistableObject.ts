namespace DS {
    export interface ISavedPersistableObject {
    }

    /** Methods to deal with saving and loading plain non-system-tracked objects - typically by loading from and saved to JSON stores.
     * A version is also tracked with this type, which increments automatically on each save.
     * Note: This class is rarely inherited from directly.  Instead use 'TrackableObject', which enhances the persistence with a tracking ID.
     */
    export abstract class PersistableObject {
        readonly _lastConfig: ISavedPersistableObject & IndexedObject;
        readonly _currentConfig: ISavedPersistableObject & IndexedObject; // (note: if '_lastConfig' is null when SAVING for the first time, they both should be set to the same instance)

        /** The virtual file storage directory where this object will be persisted. */
        directory: VirtualFileSystem.Abstracts.Directory;

        /** A virtual file that represents the saved object data, if saved or loaded, otherwise this is undefined. 
         */
        file: VirtualFileSystem.Abstracts.File;

        /** Determines if a property has changed by comparing the last config object for this object instance with the new one supplied.
          * If no config object exists, then all properties are considered in a 'changed' (unsaved) state, because they are new.
          */
        propertyChanged<T extends IPersistableObject>(name: keyof T) {
            return !this._currentConfig || !this._lastConfig || this._lastConfig[<any>name] != this._currentConfig[<any>name];
        }

        /** Triggers the process to save the project to a data store. */
        async save(): Promise<this> {
            if (await this.onBeforeSave()) {

                var target = <ISavedPersistableObject>{};
                target = this.saveToObject(target);
                await this.onSave(target);
                await this.onAfterSave(target);
            }
            return this;
        }

        /** Triggers the process to load/sync the current project with a data store. */
        async load(replace = false): Promise<this> {
        }

        protected async onBeforeSave(target?: ISavedPersistableObject): Promise<boolean | void> { return Promise.resolve(); }
        protected async onAfterSave(target: ISavedPersistableObject): Promise<void> {
            var _this = <Writeable<this>>this;
            _this._lastConfig = this._currentConfig;
        }

        protected async onSave(target: ISavedPersistableObject): Promise<void> {
            return Promise.resolve();
        }

        protected async onBeforeLoad(source: ISavedPersistableObject): Promise<boolean | void> {
            var _this = <Writeable<this>>this;
            _this._currentConfig = source;
        }
        protected async onAfterLoad(source: ISavedPersistableObject): Promise<void> { return Promise.resolve(); }

        saveToObject<T extends ISavedPersistableObject>(target?: T) {
            return target || <any>{}; // (the base just returns a new object in case one wasn't supplied)
        }

        /** Loads data from a given object. 
         * Note: Every call to this method copies '_currentConfig' to '_lastConfig' and sets '_currentConfig' to the new incomming config file.
         */
        loadFromObject(source?: ISavedPersistableObject, replace = false): this {
            return this;
        }
    }

    export interface IPersistableObject extends PersistableObject { }
}