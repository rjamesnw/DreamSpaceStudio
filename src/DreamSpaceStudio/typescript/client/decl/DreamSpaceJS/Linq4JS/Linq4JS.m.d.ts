import { Module } from "../Scripts";
/**
* Enables Linq based queries, similar to C#. (https://github.com/morrisjdev/Linq4JS).
* This is included to allow .Net developers who are familiar with Linq to use Linq based
* nested method calls to work on DreamSpace arrays/collections.
*/
export default class extends Module {
    scriptInfo: {
        files: string;
    };
}
