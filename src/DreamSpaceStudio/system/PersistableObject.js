var DS;
(function (DS) {
    /** Methods to deal with saving and loading plain non-system-tracked objects - typically by loading from and saved to JSON stores.
     * A version is also tracked with this type, which increments automatically on each save.
     * Note: This class is rarely inherited from directly.  Instead use 'TrackableObject', which enhances the persistence with a tracking ID.
     */
    class PersistableObject {
        /** Triggers the process to save the object to a data store. */
        async save() {
            if (await this.onBeforeSave()) { // (make sure we are in a state that allows saving)
                var contents = await this.onSave(); // (do the save operation and get the storage contents)
                this.onAfterSuccessfulSave(contents); // (run anything that needs to execute after )
            }
            return this;
        }
        /** Triggers the process to load/sync the current project with a data store.
         * Note: Every call to this method copies '_currentConfig' to '_lastConfig' and sets '_currentConfig' to the new incoming config file.
         */
        async load(replace = false) {
            if (await this.onBeforeLoad()) { // (make sure we are in a state that allows loading)
                var source = await this.onLoad(); // (do the load operation and get the contents)
                this.onAfterSuccessfulLoad(source);
            }
            return this;
        }
        async onBeforeSave() { return Promise.resolve(); }
        onAfterSuccessfulSave(result) { }
        async onSave() {
            return Promise.resolve();
        }
        async onBeforeLoad() { return Promise.resolve(); }
        onAfterSuccessfulLoad(result) { }
        /** Implementers can override this function to provide a different mechanism to retrieve the underlying content.
         * The default behavior simply returns 'undefined'.
         */
        async onLoad() {
            return Promise.resolve();
        }
        saveConfigToObject(target) {
            return target || {}; // (the base just returns a new object in case one wasn't supplied)
        }
        /** Loads data from a given object.
         */
        loadConfigFromObject(source, replace = false) {
            return this;
        }
    }
    DS.PersistableObject = PersistableObject;
})(DS || (DS = {}));
//# sourceMappingURL=PersistableObject.js.map