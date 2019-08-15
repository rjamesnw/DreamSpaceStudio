namespace DS {

    // ========================================================================================================================

    function _defaultCreateProjectHandler(solution: Solution, project: ISavedProject) {
        var proj = new Project(solution, project.name, project.description);
        if (project.$id)
            (<Writeable<typeof proj>>proj)._id = project.$id;
        return proj;
    };

    export interface ISavedSolution extends ISavedTrackableObject {
        name: string;
        description?: string;
        directory?: string;
        /** If this is a string, then it represents a GUID that references a project instead. */
        projects?: (ISavedProject | string)[];
        //comments: string[];
    }

    /**
    * Holds a collection of projects.
    * When a project instance is created, the default 'Solution.onCreateProject' handler is used, which can be overridden for derived project types.
    */
    export class Solution extends VirtualFileSystem.File {
        /** The function used to create project instances when a project is created from saved project data.
         * Host programs can overwrite this event property with a handler to create and return derived types instead (such as ProjectUI.ts).
         */
        static get onCreateProject() { return this._onCreateProject || _defaultCreateProjectHandler; }
        static set onCreateProject(value) { if (typeof value != 'function') throw "Solution.onCreateProject: Set failed - value is not a function."; this._onCreateProject = value; }
        private static _onCreateProject = _defaultCreateProjectHandler;

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
        readonly directory: VirtualFileSystem.Directory;

        /** A list of user IDs and assigned roles for this project. */
        readonly userSecurity = new UserAccess();

        /** Returns the startup project, or null if none found. */
        get startupProject() {
            for (var i = 0, n = this._projects && this._projects.length || 0, p: Project; i < n; ++i)
                if ((p = this._projects[i]).isStartup) return p;
            return null;
        }

        constructor(fileManager: VirtualFileSystem.FileManager, parent?: VirtualFileSystem.DirectoryItem) {
            super(fileManager, parent);
            this.directory = fileManager.createDirectory(VirtualFileSystem.combine("solutions", this._id));
        }

        /**
         * Creates a new project with the given title and description.
         * @param name The project title.
         * @param description The project description.
         */
        createProject(name: string, description?: string): Project {
            var info: ISavedProject = { $id: void 0, name, description };
            var project = Solution.onCreateProject(this, info);
            this._projects.push(project);
            return project;
        }

        /** Compiles a list of all projects, both locally and remotely. */
        async refreshProjects() {
            return new Promise<Project>((ok, err) => {
                var unloadedProjects = this._unloadedProjects;

            });
        }

        /** Returns a list of projects that match the given URL path. */
        async getProjects(path: string) {
            return new Promise<Project[]>((ok, err) => {
                var unloadedProjects = this._unloadedProjects;

            });
        }
    }

    // ========================================================================================================================

    export abstract class Solutions {
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

        /** Triggers the process to load all the solutions in the '/solutions' folder. */
        static async load(fm = VirtualFileSystem.fileManager) {
            return new Promise<typeof Solutions>((ok, err) => {
                var unloadedSolutions: Solution[] = [];

            });
        }
    }

    // ========================================================================================================================
}
