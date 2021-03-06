﻿namespace DS {
    // ########################################################################################################################

    export interface ISavedSolution extends ISavedTrackableObject {
        name: string;
        description?: string;
        directory?: string;
        /** If this is a string, then it represents a GUID that references a project instead. */
        projects?: (ISavedProject | string)[];
        //comments: string[];
    }
    
    /** The system.json file contains the entire list of solutions in the system, including system-related settings.
     */
    export interface ISystem {
        solutions?: ISavedSolution[];
    }

    export namespace Abstracts {

        export declare function _defaultCreateSolutionHandler(solution: ISavedSolution): Solution; // (this will be defined on the client/server sides)
        export declare function _defaultCreateProjectHandler(solution: Solution, project: ISavedProject): Project; // (this will be defined on the client/server sides)

        // ====================================================================================================================

        /**
        * Holds a collection of projects.
        * When a project instance is created, the default 'Solution.onCreateProject' handler is used, which can be overridden for derived project types.
        */
        export abstract class Solution extends ConfigBaseObject {
            static CONFIG_FILENAME = "solution.json";

            /** The function used to create project instances when a project is created from saved project data.
             * Host programs can overwrite this event property with a handler to create and return derived types instead (such as ProjectUI.ts).
             */
            static get onCreateProject() { return this._onCreateProject || Abstracts._defaultCreateProjectHandler; }
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
                this.configFilename = Solution.CONFIG_FILENAME;
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
            saveConfigToObject<T extends ISavedPersistableObject>(target?: T & ISavedSolution) {
                target = super.saveConfigToObject(target);

                target.name = this.name;
                target.description = this.description;
                target.directory = this.directory.absolutePath;

                if (!target.projects)
                    target.projects = [];

                for (var i = 0, n = this.projects.length; i < n; ++i)
                    target.projects.push(this.projects[i].saveConfigToObject());

                return target;
            }

            /** Loads the tracking details from a given object. */
            loadConfigFromObject(source?: ISavedSolution, replace = false): this {
                if (source) {
                    super.loadConfigFromObject(source); // (this should be first so 'propertyChanged()' will work properly)

                    var _this = <Writeable<this>>this;

                    if (!this.propertyChanged<ISavedSolution>('name')) _this.name = source.name;
                    if (!this.propertyChanged<ISavedSolution>('description')) _this.description = source.description;

                    if (source.directory && source.directory != this.directory.absolutePath)
                        for (var i = 0, n = this.projects.length; i < n; ++i)
                            this.projects[i].loadConfigFromObject(source);
                }
                return this;
            }

            /** Saves the solution and related items.
            */
            async onSave(): Promise<string> {
                try {
                    return await super.onSave();
                }
                catch (err) {
                    throw new Exception(`Failed to save solution '${this.name}'.`, this, err);
                }

                //x var file = this.directory.createFile((workflow.name || workflow.$id) + ".wf.json", wfJSON); // (wf: Workflow file)
            }

            /** Loads and merges/replaces the solution from the virtual file system.
             * @param replace If true, the whole project and any changed properties are replaced.  If false (the default), then only unmodified properties get updated.
             */
            async onLoad(replace = false): Promise<string> {
                try {
                    return await super.onLoad();
                }
                catch (err) {
                    throw new Exception(`Failed to load solution '${this.name}'.`, this, err);
                }
            }

            ///** Loads and merges/replaces the solution values from the virtual file system.
            // * @param replace If true, the whole solution and any changed properties are replaced.  If false (the default), then only unmodified properties get updated.
            // */
            //x async load(replace = false): Promise<this> {

            //    var configFile = this.directory.getFile(this.configFilename);
            //    if (!configFile) return;

            //    try {
            //        var configJSON = await configFile.readText();
            //        var config: ISavedSolution = JSON.parse(configJSON);
            //    }
            //    catch (err) {
            //        throw new Exception(`Failed to load and parse configuration for project '${this.name}'.`, this, err);
            //    }

            //    return this.loadConfigFromObject(config, replace);
            //}

            ///** Loads/merges any changes from the server-side JSON configuration file. */
            //x async refresh(): Promise<void> {
            //    var configFile = this.directory.getFile(this.configFilename);
            //    if (!configFile) return;
            //    var configJSON = await configFile.readText();
            //    var config: ISavedSolution = JSON.parse(configJSON);
            //    this.load(config);
            //}
        }

        // ========================================================================================================================

        export abstract class Solutions {
            /** The function used to create solution instances when a solution is created from saved solution data.
             * Host programs can overwrite this event property with a handler to create and return derived types instead.
             */
            static get onCreateSolution() { return this._onCreateSolution || Abstracts._defaultCreateSolutionHandler; }
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
            static async getSolutions(): Promise<ISavedSolution[]> {

                // ... load the 'solutions.json' file from the root to see which solutions are available ...

                var solutionJson = await DS.IO.read("system.json");

                if (solutionJson) {
                    var jsonStr = StringUtils.byteArrayToString(solutionJson);
                    var s: ISystem = JSON.parse(jsonStr);
                }

                if (s && s.solutions && s.solutions.length)
                    return s.solutions;
                else
                    return [];
            }

            /** Triggers the process to load all the solution details in the '/solutions' folder by first calling 'Solutions.getSolutions()'
             * to get the IDs from 'solutions.json'. While all solution configurations are loaded, the contained projects are not.
             */
            static async refresh(fm = VirtualFileSystem.FileManager.current): Promise<typeof Solutions> {
                var solutions = await Solutions.getSolutions();
                var unloadedSolutions: Solution[] = [];

                if (solutions && solutions.forEach)
                    solutions.forEach((sol, i, arr) => {
                        if (!this.get(sol.$id)) {
                            var newSol = this.createSolution(sol.$id, void 0, sol.$id);
                            if (newSol) {
                                if (!StringUtils.toString(newSol._id).trim()) // (if not null, undefined, empty, or whitespace, then update the tracking GUID)
                                    newSol._id = sol.$id;
                                unloadedSolutions.push(newSol);
                            }
                        }
                    });

                // ... wait for the solutions to load their data before we complete the process ...

                for (var i = 0, n = unloadedSolutions.length; i < n; ++i)
                    await unloadedSolutions[i].refreshProjects();

                return Solutions;
            }

            /**
             * Creates a new solution with the given title and description.
             * @param name The solution title.
             * @param description The solution description.
             */
            static createSolution(name: string, description?: string, guid?: string): Solution {
                var info: ISavedSolution = { $id: guid, $objectType: "Solution", name, description }; // (an undefined ID will just used the default one created on the instance)
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
