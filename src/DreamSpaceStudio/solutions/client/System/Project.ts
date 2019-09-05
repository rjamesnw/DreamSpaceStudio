namespace DS {
    // ========================================================================================================================

    export class Project extends Abstracts.Project {
        // --------------------------------------------------------------------------------------------------------------------

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

                _this.name = target.name;
                _this.description = target.description;

                // TODO: associated files and scripts.
            }
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================
}