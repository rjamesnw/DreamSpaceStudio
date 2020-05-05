"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TimeReferencedObject_1 = require("./TimeReferencedObject");
const Enums_1 = require("./Enums");
const Brain_1 = require("./Brain");
/**
 * An operation is a threaded task that needs to be completed in the "brain".
 * A subject instance contains details on a tangible object or intangible idea.
 * For instance, a list of colors verses specific parts of a car.
 * Most conversations require one or more subject matters as focus of communication, along a verb; otherwise the
 * idea is fragmented (i.e. fragmented sentences).
 * Most conversations have a subject, and thus, the subject is the start of understanding the text inputs.  The parts
 * of a sentence will build upon the subject (which may be empty if unknown).
 * Subjects form a "picture" in a virtual graph.  Humans usually think in pictures, and this process also helps to translate between languages.
 * All these operations are asynchronously connected thoughts that required various operations to execute over time.
 */
class Operation extends TimeReferencedObject_1.default {
    get memory() { return this.Brain.Memory; }
    /// <summary>
    /// The gets/sets the last operation to execute in a nested sequence.
    /// </summary>
    get Last() { var _a, _b; return (_b = (_a = this.Next) === null || _a === void 0 ? void 0 : _a.Last) !== null && _b !== void 0 ? _b : this; }
    set Last(value) { this.Last.Next = value; }
}
exports.default = Operation;
{
    get;
    set;
}
List < Exception > Errors;
{
    get;
    set;
}
bool;
IsCompletedWithErrors;
{
    get;
    {
        return Completed && (Errors === null || Errors === void 0 ? void 0 : Errors.Count) > 0;
    }
}
List < Enums_1.Intents > Commands;
List < Enums_1.Intents > Arguments;
Operation(Brain_1.default, brain, Enums_1.Intents, commandCode);
{
    Brain_1.default = brain;
    Parent = null;
    Intent = commandCode;
}
async;
OnExecute(BrainTask, task = null);
Promise < bool > Execute(BrainTask, btask = null);
{
    try {
        Completed = await OnExecute(btask);
    }
    catch (Exception) { }
    ex;
    {
        Completed = true; // (this should only be false if the task needs to be called again later - usually because details are missing that may be given at a later time)
        _AddError(ex);
        // ('Completed' is not forced to false here to allow implementers to fire off exceptions to abort operations and complete at the same time; though the error will be set).
    }
    return Completed;
}
Exception;
_AddError(Exception, error);
{
    if (Errors == null)
        Errors = new List();
    if (!Errors.Contains(error))
        Errors.Add(error);
    return error;
}
abstract;
Task();
//# sourceMappingURL=Operation.js.map