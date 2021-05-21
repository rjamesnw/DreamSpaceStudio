var DS;
(function (DS) {
    // ========================================================================================================================
    let Abstracts;
    (function (Abstracts) {
        class Project extends DS.ConfigBaseObject {
            // --------------------------------------------------------------------------------------------------------------------
            constructor(
            /** The solution this project belongs to. */ solution, 
            /** The title of the project. */ name, 
            /** The project's description. */ description) {
                super();
                this.solution = solution;
                this.name = name;
                this.description = description;
                //x /** The script instance for this project. */
                //x get script() { return this._script; }
                //x protected _script: IFlowScript;
                /** A list of all files associated with this project, indexed by the absolute lowercase file path. */
                this.files = {};
                /** A list of user IDs and assigned roles for this project. */
                this.userSecurity = new DS.UserAccess();
                /** The site for this project.  Every project contains a site object, even for API-only projects. For API-only projects there are no pages. */
                this.site = new DS.Site();
                this._expressionBin = [];
                this.onExpressionBinItemAdded = new DS.EventDispatcher(this, "onExpressionBinItemAdded");
                this.onExpressionBinItemRemoved = new DS.EventDispatcher(this, "onExpressionBinItemRemoved");
                if (!DS.Path.isValidFileName(name))
                    throw "The project title '" + name + "' must also be a valid file name. Don't include special directory characters, such as: \\ / ? % * ";
                this.configFilename = Project.CONFIG_FILENAME;
                this.directory = this.solution.directory.createDirectory(DS.VirtualFileSystem.combine("projects", this._id)); // (the path is "User ID"/"project's unique ID"/ )
            }
            // --------------------------------------------------------------------------------------------------------------------
            // Create a type of trash-bin to hold expressions so the user can restore them, or delete permanently.
            /** Holds a list of expressions the developer has removed from scripts. This renders to a global space, which allows
              * developers to move expressions easily between scripts.
              * Use 'addExpressionToBin()' and 'removeExpressionFromBin()' to modify this list, which also triggers the UI to update.
              */
            get expressionBin() { return this._expressionBin; }
            /** Returns the expression that was picked by the user for some operation. In the future this may also be used during drag-n-drop operations. */
            get pickedItem() { return this._pickedItem; }
            // --------------------------------------------------------------------------------------------------------------------
            /** Saves the project values to an object - typically prior to serialization. */
            saveConfigToObject(target) {
                target = super.saveConfigToObject(target);
                target.name = this.name;
                target.description = this.description;
                for (var p in this.files)
                    (target.files || (target.files = [])).push(this.files[p].absolutePath);
                target.workflows = [];
                return target;
            }
            /** Saves the project to a persisted storage, such as the local browser storage, or a remote store, if possible.
             * Usually the local storage is attempted first, then the system will try to sync with a remote store.  If there
             * is no free space in the local store, the system will try to sync with a remote store.  If that fails, the
             * data will only be in memory and a UI warning will display.
             */
            saveToStorage(source = this.saveConfigToObject()) {
                if (!source)
                    return; // (nothing to do)
                if (Array.isArray(source.workflows))
                    for (var i = 0, n = source.workflows.length; i < n; ++i) {
                        var workflow = source.workflows[i];
                        if (typeof workflow == 'object' && workflow.$id) {
                            source.workflows[i] = workflow.$id; // (replaced the object entry with the ID before saving the project graph later; these will be files instead)
                            var wfJSON = workflow && JSON.stringify(workflow) || null;
                            var file = this.directory.createFile((workflow.name || workflow.$id) + ".wf.json", wfJSON); // (wf: Workflow file)
                            this.files[file.absolutePath.toLocaleLowerCase()] = file;
                        }
                    }
                var projectJSON = JSON.stringify(source);
                file = this.directory.createFile(this._id + ".dsp.json", projectJSON); // (dsp: DreamSpace Project file)
                this.files[file.absolutePath.toLocaleLowerCase()] = file;
            }
            /** Loads and merges/replaces the project values from an object - typically prior to serialization.
             * @param replace If true, the whole project and any changed properties are replaced.  If false (the default), then only unmodified properties get updated.
             */
            loadConfigFromObject(source, replace = false) {
                if (source) {
                    var _this = this;
                    super.loadConfigFromObject(source, replace);
                    if (replace || !_this.propertyChanged('name'))
                        _this.name = source.name;
                    if (replace || !_this.propertyChanged('description'))
                        _this.description = source.description;
                    // TODO: associated files and scripts.
                }
                return this;
            }
            /** Returns the resource value for this trackable object, which is just the config file contents. */
            async getResourceValue() {
                try {
                    if (!this._file)
                        return await this.onLoad();
                    else
                        return this._file.text;
                }
                catch (err) {
                    throw new DS.Exception(`Failed to load contents for project '${this.name}'.`, this, err);
                }
            }
            getResourceType() {
                return DS.ResourceTypes.Application_JSON;
            }
            /** Saves the project and related items.
             */
            async onSave() {
                try {
                    return await super.onSave();
                }
                catch (err) {
                    throw new DS.Exception(`Failed to save project '${this.name}'.`, this, err);
                }
                //x var file = this.directory.createFile((workflow.name || workflow.$id) + ".wf.json", wfJSON); // (wf: Workflow file)
            }
            /** Loads and merges/replaces the project from the virtual file system.
             * @param replace If true, the whole project and any changed properties are replaced.  If false (the default), then only unmodified properties get updated.
             */
            async onLoad(replace = false) {
                try {
                    return await super.onLoad();
                }
                catch (err) {
                    throw new DS.Exception(`Failed to load project '${this.name}'.`, this, err);
                }
            }
            // --------------------------------------------------------------------------------------------------------------------
            /** Saves the project to data objects (calls this.save() when 'source' is undefined) and uses the JSON object to
             * serialize the result into a string.
             */
            serialize() {
                var source = this.saveConfigToObject();
                var json = JSON.stringify(source);
                return json;
            }
            // --------------------------------------------------------------------------------------------------------------------
            addToBin(expr, triggerEvent = true) {
                if (this._expressionBin.indexOf(expr) < 0) {
                    this._expressionBin.push(expr);
                    if (triggerEvent)
                        this.onExpressionBinItemAdded.trigger(expr, this);
                }
            }
            removeFromBin(expr, triggerEvent = true) {
                var i = this._expressionBin.indexOf(expr);
                if (i >= 0) {
                    var expr = this._expressionBin.splice(i, 1)[0];
                    if (triggerEvent)
                        this.onExpressionBinItemRemoved.trigger(expr, this);
                }
            }
            isInBin(expr) { return this._expressionBin.indexOf(expr) >= 0; }
            // --------------------------------------------------------------------------------------------------------------------
            pick(expr) {
                this._pickedItem = expr;
            }
            // --------------------------------------------------------------------------------------------------------------------
            //private _findChildNode(node: HTMLElement, fstype: Type): HTMLElement { //?
            //    if (node) {
            //        for (var i = 0, len = node.childNodes.length; i < len; ++i)
            //            if ((<any>node.childNodes[i])["$__fs_type"] == fstype)
            //                return <HTMLElement>node.childNodes[i];
            //    }
            //    else return null;
            //}
            // --------------------------------------------------------------------------------------------------------------------
            /** Returns a list of resources that match the given URL path. */
            async getResource(path) {
                return new Promise((ok, err) => {
                    var unloadedProjects = this._unloadedProjects;
                });
            }
        }
        // --------------------------------------------------------------------------------------------------------------------
        Project.CONFIG_FILENAME = "project.json";
        Abstracts.Project = Project;
    })(Abstracts = DS.Abstracts || (DS.Abstracts = {}));
    // ========================================================================================================================
})(DS || (DS = {}));
//# sourceMappingURL=Project.js.map