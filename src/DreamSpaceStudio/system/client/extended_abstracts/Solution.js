var DS;
(function (DS) {
    // ########################################################################################################################
    DS.Abstracts._defaultCreateSolutionHandler = function (solution) {
        var s = new DS.Solution();
        if (solution.$id)
            s._id = solution.$id;
        return s;
    };
    DS.Abstracts._defaultCreateProjectHandler = function (solution, project) {
        var proj = new DS.Project(solution, project.name, project.description);
        if (project.$id)
            proj._id = project.$id;
        return proj;
    };
    // ========================================================================================================================
    /**
    * Holds a collection of projects.
    * When a project instance is created, the default 'Solution.onCreateProject' handler is used, which can be overridden for derived project types.
    */
    class Solution extends DS.Abstracts.Solution {
    }
    DS.Solution = Solution;
    // ========================================================================================================================
    class Solutions extends DS.Abstracts.Solutions {
        /** Returns a list of available solution GUIDs that can be loaded. */
        static getSolutionIDs() {
            return new Promise((ok, err) => {
                var ids = [];
                // ... if server side, just scan the folder, otherwise call the API ...
                ok(ids);
            });
        }
        /** Triggers the process to load all the solutions in the '/solutions' folder. */
        static async load(fm = DS.VirtualFileSystem.FileManager.current) {
            return new Promise((ok, err) => {
                var unloadedSolutions = [];
            });
        }
    }
    DS.Solutions = Solutions;
    // ########################################################################################################################
})(DS || (DS = {}));
//# sourceMappingURL=Solution.js.map