namespace DS {
    // ########################################################################################################################

    Abstracts._defaultCreateSolutionHandler = function (solution: ISavedSolution): Solution {
        var s = new DS.Solution();
        if (solution.$id)
            (<Writeable<typeof s>>s)._id = solution.$id;
        return s;
    };

    Abstracts._defaultCreateProjectHandler = function (solution: Solution, project: ISavedProject): Project {
        var proj = new DS.Project(solution, project.name, project.description);
        if (project.$id)
            (<Writeable<typeof proj>>proj)._id = project.$id;
        return proj;
    };

    // ========================================================================================================================

    /**
    * Holds a collection of projects.
    * When a project instance is created, the default 'Solution.onCreateProject' handler is used, which can be overridden for derived project types.
    */
    export class Solution extends Abstracts.Solution {

        /** Compiles a list of all projects, both locally and remotely. */
        async refreshProjects(): Promise<Project> {
            var unloadedProjects = this._unloadedProjects;
            return null;
        }

        /** Returns a list of projects that match the given URL path. */
        async getProjects(path: string): Promise<Project[]> {
            var unloadedProjects = this._unloadedProjects;
            return null;
        }

        /** Loads/merges any changes from the server-side JSON configuration file. */
        async refresh(): Promise<void> {
            var unloadedProjects = this._unloadedProjects;
            return null;
        }
    }

    // ========================================================================================================================

    export abstract class Solutions extends Abstracts.Solutions {
        /** Returns a list of available solution GUIDs that can be loaded. */
        static async getSolutionIDs(): Promise<string[]> {

            // ... load the 'solutions.json' file from the root to see which solutions are available ...

            var solutionJson = await DS.load("solutions.json");

            var s: ISavedSolutions = JSON.parse(solutionJson);

            if (s && s.solutions && s.solutions.length)
                return s.solutions;
            else
                return [];
        }
    }

    // ########################################################################################################################
}
