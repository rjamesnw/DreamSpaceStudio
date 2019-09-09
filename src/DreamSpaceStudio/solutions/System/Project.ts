namespace DS {
    // ========================================================================================================================

    export interface ISavedProject extends ISavedTrackableObject {
        name: string;
        description?: string;
        directory?: string;
        /** File paths related to this project. */
        files?: string[];
        //comments: string[];
        workflows?: (ISavedWorkflow | string)[]; // (references either 1. a saved workflow object, or 2. a UID that references the workflow object)
    }

    export namespace Abstracts {

        export abstract class Project extends VirtualFileSystem.Abstract.File {
            // --------------------------------------------------------------------------------------------------------------------

            static CONFIG_FILENAME = "project.json";
            configFilename = Solution.CONFIG_FILENAME;

            //x /** The script instance for this project. */
            //x get script() { return this._script; }
            //x protected _script: IFlowScript;

            /** The file storage directory for this project. */
            readonly directory: VirtualFileSystem.Abstract.Directory;

            /** A list of all files associated with this project, indexed by the absolute lowercase file path. */
            readonly files: { [index: string]: VirtualFileSystem.Abstract.File } = {};

            /** A list of user IDs and assigned roles for this project. */
            readonly userSecurity = new UserAccess();

            /** The site for this project.  Every project contains a site object, even for API-only projects. For API-only projects there are no pages. */
            readonly site: Site = new Site();

            /** True if this project holds the main entry point when no other project is active. */
            isStartup: boolean;

            // --------------------------------------------------------------------------------------------------------------------
            // Create a type of trash-bin to hold expressions so the user can restore them, or delete permanently.

            /** Holds a list of expressions the developer has removed from scripts. This renders to a global space, which allows
              * developers to move expressions easily between scripts.
              * Use 'addExpressionToBin()' and 'removeExpressionFromBin()' to modify this list, which also triggers the UI to update.
              */
            get expressionBin() { return this._expressionBin; }
            private _expressionBin: SelectedItem[] = [];
            onExpressionBinItemAdded = new EventDispatcher<Project, { (item: SelectedItem, project: Project): void }>(this, "onExpressionBinItemAdded");
            onExpressionBinItemRemoved = new EventDispatcher<Project, { (item: SelectedItem, project: Project): void }>(this, "onExpressionBinItemRemoved");

            /** Returns the expression that was picked by the user for some operation. In the future this may also be used during drag-n-drop operations. */
            get pickedItem() { return this._pickedItem; }
            private _pickedItem: SelectedItem;

            // --------------------------------------------------------------------------------------------------------------------

            constructor(
            /** The solution this project belongs to. */ public readonly solution: Solution,
            /** The title of the project. */ public name: string,
            /** The project's description. */ public description?: string
            ) {
                super(solution._fileManager, solution);
                if (!Path.isValidFileName(name))
                    throw "The project title '" + name + "' must also be a valid file name. Don't include special directory characters, such as: \\ / ? % * ";
                this.directory = this.solution.directory.createDirectory(VirtualFileSystem.combine("projects", this._id)); // (the path is "User ID"/"project's unique ID"/ )
            }

            // --------------------------------------------------------------------------------------------------------------------

            /** Saves the project and related items to a specified object. 
             * If no object is specified, then a new empty object is created and returned.
             */
            save(target?: ISavedProject): ISavedProject {
                target = target || <ISavedProject>{};

                super.save(target);

                target.name = this.name;
                target.description = this.description;

                for (var p in this.files)
                    (target.files || (target.files = [])).push(this.files[p].absolutePath);

                target.workflows = [this.script.save()];

                return target;
            }

            /** Saves the project to a persisted storage, such as the local browser storage, or a remote store, if possible. 
             * Usually the local storage is attempted first, then the system will try to sync with a remote store.  If there
             * is no free space in the local store, the system will try to sync with a remote store.  If that fails, the
             * data will only be in memory and a UI warning will display.
             */
            saveToStorage(source = this.save()) {
                if (!source) return; // (nothing to do)

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

                var projectJSON = this.serialize(source);

                file = this.directory.createFile(this._id + ".dsp.json", projectJSON); // (dsp: DreamSpace Project file)
                this.files[file.absolutePath.toLocaleLowerCase()] = file;
            }

            load(target?: ISavedProject): this {
                if (target) {
                    var _this = <Writeable<this>>this;

                    super.load(target);

                    if (!_this.propertyChanged<ISavedProject>('name')) _this.name = target.name;
                    if (!_this.propertyChanged<ISavedProject>('description')) _this.description = target.description;

                    // TODO: associated files and scripts.

                    this._lastConfig = target;
                }
                return this;
            }

            // --------------------------------------------------------------------------------------------------------------------

            /** Saves the project to data objects (calls this.save() when 'source' is undefined) and uses the JSON object to serialize the result into a string. */
            serialize(source = this.save()): string {
                var json = JSON.stringify(source);
                return json;
            }

            // --------------------------------------------------------------------------------------------------------------------

            addToBin(expr: SelectedItem, triggerEvent = true) {
                if (this._expressionBin.indexOf(expr) < 0) {
                    this._expressionBin.push(expr);
                    if (triggerEvent)
                        this.onExpressionBinItemAdded.trigger(expr, this);
                }
            }

            removeFromBin(expr: SelectedItem, triggerEvent = true) {
                var i = this._expressionBin.indexOf(expr);
                if (i >= 0) {
                    var expr = this._expressionBin.splice(i, 1)[0];
                    if (triggerEvent)
                        this.onExpressionBinItemRemoved.trigger(expr, this);
                }
            }

            isInBin(expr: SelectedItem) { return this._expressionBin.indexOf(expr) >= 0; }

            // --------------------------------------------------------------------------------------------------------------------

            pick(expr: SelectedItem) {
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
            async getResource(path: string) {
                return new Promise<Resource[]>((ok, err) => {
                    var unloadedProjects = this._unloadedProjects;

                });
            }

            // --------------------------------------------------------------------------------------------------------------------

            /** Loads/merges any changes from the server-side JSON configuration file. */
            async refresh(): Promise<void> {
                var configFile = this.directory.getFile(this.configFilename);
                if (!configFile) return;
                var configJSON = await configFile.readText();
                var config: ISavedProject = JSON.parse(configJSON);
                this.load(config);
            }

            // --------------------------------------------------------------------------------------------------------------------
        }

    }

    // ========================================================================================================================
}