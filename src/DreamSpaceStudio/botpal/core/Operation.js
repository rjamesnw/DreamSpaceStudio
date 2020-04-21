using;
System;
using;
System.Collections.Generic;
using;
System.Linq;
using;
System.Text;
using;
System.Threading.Tasks;
var BotPal;
(function (BotPal) {
    /// <summary>
    /// An operation is a threaded task that needs to be completed in the "brain".
    /// A subject instance contains details on a tangible object or intangible idea.
    /// For instance, a list of colors verses specific parts of a car.
    /// Most conversations require one or more subject matters as focus of communication, along a verb; otherwise the
    /// idea is fragmented (i.e. fragmented sentences).
    /// Most conversations have a subject, and thus, the subject is the start of understanding the text inputs.  The parts
    /// of a sentence will build upon the subject (which may be empty if unknown).
    /// Subjects form a "picture" in a virtual graph.  Humans usually think in pictures, and this process also helps to translate between languages.
    /// All these operations are asynchronously connected thoughts that required various operations to execute over time. 
    /// </summary>
    class Operation {
    }
    TimeReferencedObject, IMemoryObject;
    {
        Brain;
        Brain;
        Memory;
        Memory;
        {
            get;
            {
                return Brain.Memory;
            }
        }
        Operation;
        Parent;
        Operation;
        Next;
        Operation;
        Last;
        {
            get;
            {
                return Next != null ? Next.Last : this;
            }
            set;
            {
                Last.Next = value;
            }
        }
        Intents;
        Intent;
        Context;
        Context;
        Concept;
        Concept;
        bool;
        Completed;
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
        List < Intents > Commands;
        List < Intents > Arguments;
        Operation(Brain, brain, Intents, commandCode);
        {
            Brain = brain;
            Parent = null;
            Intent = commandCode;
        }
        async;
        Task < bool > Execute(BrainTask, btask = null);
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
        Task < bool > OnExecute(BrainTask, task = null);
    }
})(BotPal || (BotPal = {}));
//# sourceMappingURL=Operation.js.map