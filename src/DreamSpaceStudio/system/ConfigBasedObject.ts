namespace DS {

    export interface IConfigBaseObject extends ISavedTrackableObject {
    }

    /** A config-based object is one that does not contain any file contents.
     *  The whole object is represented by a JSON config file (*.json).
     *  Normally the implementer tracks where the JSON should be loaded from or saved to, and this base object then tracks
     *  the state of that object, including caching it to detect property changes.
     */
    export class ConfigBaseObject extends TrackableObject {

        /** Determines if a property has changed by comparing the last config object for this object instance with the new one supplied.
          * If no config object exists, then all properties are considered in a 'changed' (unsaved) state, because they are new.
          */
        propertyChanged<T extends ISavedPersistableObject>(name: keyof T) {
            return !this._currentConfig || !this._lastConfig || this._lastConfig[<any>name] != this._currentConfig[<any>name];
        }

        readonly _lastConfig: ISavedPersistableObject & IndexedObject;
        readonly _currentConfig: ISavedPersistableObject & IndexedObject; // (note: if '_lastConfig' is null when SAVING for the first time, they both should be set to the same instance)

        /** The virtual file storage directory where this config object will be persisted. */
        directory: VirtualFileSystem.Abstracts.Directory;

        /** A virtual file that represents the saved object data, if saved or loaded, otherwise this is undefined.
          */
        _file: VirtualFileSystem.Abstracts.File;

        configFilename: string;

        protected async onLoad(): Promise<string> {
            if (!this.directory && !this._file)
                throw new Exception("Cannot load configuration: A directory or file is required.", this);

            if (!this._file && !this.configFilename)
                throw new Exception("Cannot load configuration: A filename is required.", this);

            if (!this._file)
                this._file = this.directory.createFile(this.configFilename);

            var content = (await this._file.read()).text;

            try {
                var configObject = <IConfigBaseObject>JSON.parse(content);
            }
            catch (err) {
                throw new Exception("Failed to parse configuration file as JSON.", content, err);
            }

            this.loadConfigFromObject(configObject);

            var _this = <Writeable<this>>this;
            _this._lastConfig = this._currentConfig;
            _this._currentConfig = configObject;

            return content;
        }

        protected async onSave(): Promise<string> {

            if (!this.directory && !this._file)
                throw new Exception("Cannot save configuration: A directory or file is required.", this);

            if (!this._file && !this.configFilename)
                throw new Exception("Cannot save configuration: A filename is required.", this);

            if (!this._file)
                this._file = this.directory.createFile(this.configFilename);

            var configObject = this.saveConfigToObject();

            this._file.text = JSON.stringify(configObject);

            await this._file.save();

            var _this = <Writeable<this>>this;
            _this._lastConfig = this._currentConfig;
            _this._currentConfig = configObject;

            return this._file.text;
        }

        /** Save the configuration information to an object - typically prior to serialization. */
        saveConfigToObject<T extends ISavedPersistableObject>(target?: T & IConfigBaseObject) {
            return super.saveConfigToObject(target);
        }

        /** Loads data from a given object. 
         */
        loadConfigFromObject(source?: IConfigBaseObject, replace = false): this {
            return super.loadConfigFromObject(source, replace);
        }

        protected onAfterSuccessfulSave(result: string): void { }
        protected onAfterSuccessfulLoad(result: string): void { }
    }
}