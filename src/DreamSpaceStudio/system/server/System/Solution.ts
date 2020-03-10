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

    }

    // ========================================================================================================================

    export abstract class Solutions extends Abstracts.Solutions {

    }

    // ########################################################################################################################
}
