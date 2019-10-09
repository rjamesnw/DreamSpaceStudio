namespace DS {
    export interface ISavedPersistableObject {
    }

    /** Methods to deal with saving and loading plain non-system-tracked objects - typically by loading from and saved to JSON stores.
     * A version is also tracked with this type, which increments automatically on each save.
     * Note: This class is rarely inherited from directly.  Instead use 'TrackableObject', which enhances the persistence with a tracking ID.
     */
    export abstract class PersistableObject {
        /** Triggers the process to save the project to a data store. */
        async save(): Promise<this> {
            if (await this.onBeforeSave()) { // (make sure we are in a state that allows saving)
                var contents = await this.onSave(); // (do the save operation and get the storage contents)
                this.onAfterSuccessfulSave(contents); // (run anything that needs to execute after )
            }
            return this;
        }

        /** Triggers the process to load/sync the current project with a data store. 
         * Note: Every call to this method copies '_currentConfig' to '_lastConfig' and sets '_currentConfig' to the new incoming config file.
         */
        async load(replace = false): Promise<this> {
            if (await this.onBeforeLoad()) { // (make sure we are in a state that allows loading)
                var source = await this.onLoad(); // (do the load operation and get the contents)
                this.onAfterSuccessfulLoad(source);
            }
            return this;
        }

        protected async onBeforeSave(): Promise<boolean | void> { return Promise.resolve(); }
        protected onAfterSuccessfulSave(result: any): void { }
        protected async onSave(): Promise<any> {
            return Promise.resolve();
        }

        protected async onBeforeLoad(): Promise<boolean | void> { return Promise.resolve(); }
        protected onAfterSuccessfulLoad(result: any): void { }

        /** Implementers can override this function to provide a different mechanism to retrieve the underlying content.
         * The default behavior simply returns 'undefined'.
         */
        protected async onLoad(): Promise<any> {
            return Promise.resolve();
        }

        saveConfigToObject<T extends ISavedPersistableObject>(target?: T) {
            return target || <any>{}; // (the base just returns a new object in case one wasn't supplied)
        }

        /** Loads data from a given object. 
         */
        loadConfigFromObject(source?: ISavedPersistableObject, replace = false): this {
            return this;
        }
    }

    export interface IPersistableObject extends PersistableObject { }
}