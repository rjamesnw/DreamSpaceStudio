namespace DS {
    // ########################################################################################################################

    export interface ISavedSolution extends ISavedTrackableObject {
        name: string;
        description?: string;
        directory?: string;
        /** If this is a string, then it represents a GUID that references a project instead. */
        projects?: (ISavedProject | string)[];
        //comments: string[];
    }

    export interface ISavedSolutions {
        solutions: string[];
    }

    export namespace Abstracts {

        export declare function _defaultCreateSolutionHandler(solution: ISavedSolution): Solution; // (this will be defined on the client/server sides)
        export declare function _defaultCreateProjectHandler(solution: Solution, project: ISavedProject): Project; // (this will be defined on the client/server sides)

        // ====================================================================================================================

        /**
        * Holds a collection of projects.
        * When a project instance is created, the default 'Solution.onCreateProject' handler is used, which can be overridden for derived project types.
        */
        export abstract class Solution extends TrackableObject {
            static CONFIG_FILENAME = "solution.json";
            configFilename = Solution.CONFIG_FILENAME;

            /** The function used to create project instances when a project is created from saved project data.
             * Host programs can overwrite this event property with a handler to create and return derived types instead (such as ProjectUI.ts).
             */
            static get onCreateProject() { return this._onCreateProject || _defaultCreateProjectHandler; }
            static set onCreateProject(value) { if (typeof value != 'function') throw "Solution.onCreateProject: Set failed - value is not a function."; this._onCreateProject = value; }
            private static _onCreateProject: typeof _defaultCreateProjectHandler;

            get count() { return this._projects.length; }

            /* All projects for the current user. */
            get projects() { return this._projects; }
            private _projects: Project[] = []; // (the loaded projects that are currently active)

            /* A list of users, by ID, that are allowed . */
            get userIDs() { return this._userIDs; }
            private _userIDs: string[] = []; // (the loaded projects that are currently active)

            //x get unloadedProjects() { return this._unloadedProjects; }
            //x private _unloadedProjects: ISavedProject[] = []; // (the unloaded projects)

            /** The file storage directory for all projects. */
            readonly directory: VirtualFileSystem.Abstracts.Directory;

            /** A list of user IDs and assigned roles for this project. */
            readonly userSecurity = new UserAccess();

            /** A description for the project. */
            description: string;

            /** Returns the startup project, or null if none found. */
            get startupProject() {
                for (var i = 0, n = this._projects && this._projects.length || 0, p: Project; i < n; ++i)
                    if ((p = this._projects[i]).isStartup) return p;
                return null;
            }

            constructor(fileManager = VirtualFileSystem.FileManager.current) {
                super();
                this.directory = fileManager.createDirectory(VirtualFileSystem.combine("solutions", this._id));
            }

            /**
             * Creates a new project with the given title and description.
             * @param name The project title.
             * @param description The project description.
             */
            createProject(name: string, description?: string): Project {
                var info: ISavedProject = { $id: void 0, $objectType: "Project", name, description };
                var project = Solution.onCreateProject(this, info);
                this._projects.push(project);
                return project;
            }

            /** Returns a list of projects that match the given URL path. */
            async getProjects(path: string): Promise<Project[]> {
                throw Exception.notImplemented("Project.getProjects()");
            }

            /** Updates all projects from the data store and returns the project marked as the "start-up". */
            async refreshProjects(): Promise<Project> { // (project returned is the start-up project)
                var startupProject: Project = null;
                for (var i = 0, n = this._projects.length, proj: Project; i < n; ++i) {
                    proj = this._projects[i];
                    if (proj.isStartup)
                        startupProject = proj;
                    proj.refresh();
                }
                return startupProject;
            }

            /** Saves the tracking details and related items to a specified object. 
            * If no object is specified, then a new empty object is created and returned.
            */
            save(target?: ISavedSolution): ISavedSolution {
                target = target || <ISavedSolution>{};

                super.save(target);

                target.name = this.name;
                target.description = this.description;
                target.directory = this.directory.absolutePath;

                if (!target.projects)
                    target.projects = [];

                for (var i = 0, n = this.projects.length; i < n; ++i)
                    this.projects[i].save(target);

                return target;
            }

            /** Loads the tracking details from a given object. */
            load(source?: ISavedSolution): this {
                if (source) {
                    super.load(source); // (this should be first so 'propertyChanged()' will work properly)

                    var _this = <Writeable<this>>this;

                    if (!_this.propertyChanged<ISavedSolution>('name')) _this.name = source.name;
                    if (!_this.propertyChanged<ISavedSolution>('description')) _this.description = source.description;

                    if (source.directory && source.directory != this.directory.absolutePath)

                        for (var i = 0, n = this.projects.length; i < n; ++i)
                            this.projects[i].load(source);
                }
                return this;
            }

            /** Loads/merges any changes from the server-side JSON configuration file. */
            async refresh(): Promise<void> {
                var configFile = this.directory.getFile(this.configFilename);
                if (!configFile) return;
                var configJSON = await configFile.readText();
                var config: ISavedSolution = JSON.parse(configJSON);
                this.load(config);
            }
        }

        // ========================================================================================================================

        export abstract class Solutions {
            /** The function used to create solution instances when a solution is created from saved solution data.
             * Host programs can overwrite this event property with a handler to create and return derived types instead.
             */
            static get onCreateSolution() { return this._onCreateSolution || _defaultCreateSolutionHandler; }
            static set onCreateSolution(value) { if (typeof value != 'function') throw "Solution.onCreateSolution: Set failed - value is not a function."; this._onCreateSolution = value; }
            private static _onCreateSolution: typeof _defaultCreateSolutionHandler;

            /* All projects for the current user. */
            static get solutions() { return this._solutions; }
            private static _solutions: Solution[] = []; // (the loaded projects that are currently active)

            static get startupSolution() {
                for (var i = 0, n = this._solutions && this._solutions.length || 0, s: Solution; i < n; ++i)
                    if ((s = this._solutions[i]).startupProject) return s;
                return null;
            }

            /** Returns the solution with the specified ID, or null if not found. */
            static get(id: string) {
                for (var i = 0, n = this._solutions && this._solutions.length || 0, s: Solution; i < n; ++i)
                    if ((s = this._solutions[i])._id == id) return s;
                return null;
            }

            /** Returns a list of available solution GUIDs that can be loaded. */
            static async getSolutionIDs(): Promise<string[]> {

                // ... load the 'solutions.json' file from the root to see which solutions are available ...

                var solutionJson = await DS.IO.read("solutions.json");

                if (solutionJson) {
                    var jsonStr = StringUtils.byteArrayToString(solutionJson);
                    var s: ISavedSolutions = JSON.parse(jsonStr);
                }

                if (s && s.solutions && s.solutions.length)
                    return s.solutions;
                else
                    return [];
            }

            /** Triggers the process to load all the solutions in the '/solutions' folder by first calling 'Solutions.getSProjectolutionIDs()'
             * to get the IDs from 'solutions.json'. While all solution configurations are loaded, the contained projects are not.
             */
            static async refresh(fm = VirtualFileSystem.FileManager.current): Promise<typeof Solutions> {
                var ids = await Solutions.getSolutionIDs();
                var unloadedSolutions: Solution[] = [];

                if (ids && ids.forEach)
                    ids.forEach((v, i, arr) => {
                        if (!this.get(v)) {
                            var s = this.createSolution(v, void 0, v);
                            if (s) {
                                s._id = v;
                                unloadedSolutions.push(s);
                                this.solutions.push(s);
                            }
                        }
                    });

                // ... wait for the solutions to load their data before we complete the process ...

                for (var i = 0, n = unloadedSolutions.length; i < n; ++i)
                    await unloadedSolutions[i].refresh();

                return Solutions;
            }

            /**
             * Creates a new solution with the given title and description.
             * @param name The solution title.
             * @param description The solution description.
             */
            static createSolution(name: string, description?: string, guid?: string): Solution {
                var info: ISavedSolution = { $id: void 0, $objectType: "Solution", name, description }; // (an undefined ID will just used the default one created on the instance)
                var solution = Solutions.onCreateSolution(info);
                if (solution)
                    this.solutions.push(solution);
                return solution;
            }
        }

        // ========================================================================================================================
    }

    // ########################################################################################################################
}
