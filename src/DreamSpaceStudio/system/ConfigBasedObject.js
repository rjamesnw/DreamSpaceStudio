var DS;
(function (DS) {
    /** A config-based object is one that does not contain any file contents.
     *  The whole object is represented by a JSON config file (*.json).
     *  Normally the implementer tracks where the JSON should be loaded from or saved to, and this base object then tracks
     *  the state of that object, including caching it to detect property changes.
     */
    class ConfigBaseObject extends DS.TrackableObject {
        /** Determines if a property has changed by comparing the last config object for this object instance with the new one supplied.
          * If no config object exists, then all properties are considered in a 'changed' (unsaved) state, because they are new.
          */
        propertyChanged(name) {
            return !this._currentConfig || !this._lastConfig || this._lastConfig[name] != this._currentConfig[name];
        }
        async onLoad() {
            if (!this.directory && !this._file)
                throw new DS.Exception("Cannot load configuration: A directory or file is required.", this);
            if (!this._file && !this.configFilename)
                throw new DS.Exception("Cannot load configuration: A filename is required.", this);
            if (!this._file)
                this._file = this.directory.createFile(this.configFilename);
            var content = (await this._file.read()).text;
            try {
                var configObject = JSON.parse(content);
            }
            catch (err) {
                throw new DS.Exception("Failed to parse configuration file as JSON.", content, err);
            }
            this.loadConfigFromObject(configObject);
            var _this = this;
            _this._lastConfig = this._currentConfig;
            _this._currentConfig = configObject;
            return content;
        }
        async onSave() {
            if (!this.directory && !this._file)
                throw new DS.Exception("Cannot save configuration: A directory or file is required.", this);
            if (!this._file && !this.configFilename)
                throw new DS.Exception("Cannot save configuration: A filename is required.", this);
            if (!this._file)
                this._file = this.directory.createFile(this.configFilename);
            var configObject = this.saveConfigToObject();
            this._file.text = JSON.stringify(configObject);
            await this._file.save();
            var _this = this;
            _this._lastConfig = this._currentConfig;
            _this._currentConfig = configObject;
            return this._file.text;
        }
        /** Save the configuration information to an object - typically prior to serialization. */
        saveConfigToObject(target) {
            return super.saveConfigToObject(target);
        }
        /** Loads data from a given object.
         */
        loadConfigFromObject(source, replace = false) {
            return super.loadConfigFromObject(source, replace);
        }
        onAfterSuccessfulSave(result) { }
        onAfterSuccessfulLoad(result) { }
    }
    DS.ConfigBaseObject = ConfigBaseObject;
})(DS || (DS = {}));
//# sourceMappingURL=ConfigBasedObject.js.map