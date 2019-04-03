/// <reference path="../manifest.ts" />

// #######################################################################################

namespace DreamSpace.Scripts.Modules {
    // ===================================================================================

    /**
    * Enables Linq based queries, similar to C#. (https://github.com/morrisjdev/Linq4JS).
    * This is included to allow .Net developers who are familiar with Linq to use Linq based
    * nested method calls to work on DreamSpace arrays/collections.
    */
    export var Linq4JS = module([], 'linq4js', '~Linq4JS/');

   // ===================================================================================
}

// #######################################################################################
