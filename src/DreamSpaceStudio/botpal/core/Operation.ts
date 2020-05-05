
import TimeReferencedObject from "./TimeReferencedObject";
import Memory, { IMemoryObject } from "./Memory";
import { Intents } from "./Enums";
import Brain from "./Brain";
import Concept from "./Concept";
import Context from "./Context";

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
export default abstract class Operation extends TimeReferencedObject implements IMemoryObject {
    /// <summary>
    /// The brain this operation belongs to.
    /// </summary>
    readonly Brain: Brain;

    get memory(): Memory { return this.Brain.Memory; }

    /// <summary>
    /// The parent operation that must precede this operation before it can execute.
    /// </summary>
    Parent: Operation;

    /// <summary>
    /// The next operation to execute once this one completes.
    /// </summary>
    Next: Operation;

    /// <summary>
    /// The gets/sets the last operation to execute in a nested sequence.
    /// </summary>
    get Last(): Operation { return this.Next?.Last ?? this; }
    set Last(value) { this.Last.Next = value; }

    /// <summary>
    /// Fixed core functionality intents, such as splitting incoming text to be processed. 
    /// </summary>
    readonly Intent: Intents;

    /// <summary>
    /// A context that this operation applies to, if any.
    /// </summary>
    Context: Context;

    /// <summary>
    /// A concept that this operation applies to, if any.
    /// </summary>
    Concept: Concept;

    /// <summary>
    /// Should be set to true when the operation completes successfully.
    /// </summary>
    get Completed() { return this.#_Completed; }
    #_Completed: boolean;

    get Errors() { return this.#_errors; }
    #_errors: DS.Exception[];

    /// <summary>
    /// Will be true if the operation completed successfully, but there were errors in the process.
    /// </summary>
    get IsCompletedWithErrors() { return this.Completed && this?.Errors?.length > 0; }

    /// <summary>
    /// A list of commands to execute for this command, if any.
    /// </summary>
    readonly Commands: Intents[];

    /// <summary>
    /// A list of commands that need to complete in order for this command to execute.
    /// </summary>
    public readonly List<Intents> Arguments;

    public Operation(Brain brain, Intents commandCode) {
        Brain = brain;
        Parent = null;
        Intent = commandCode;
    }

    /// <summary>
    /// Execute the operation. If true is returned, the instruction can be removed, otherwise it must be left, and the next instruction executed.
    /// This occurs in a cycle, keeping all operations "alive" until they are all completed.
    /// </summary>
    /// <param name="btask">The brain task that is executing this operation, if any. If null, this is being called on the main thread. 
    /// This is provided so that the task's 'IsCancellationRequested' property can be monitored, allowing to gracefully abort current operations.</param>
    public async  OnExecute(BrainTask task = null): Promise<bool> Execute(BrainTask btask = null) {
        try {
            Completed = await OnExecute(btask);
        }
        catch (Exception ex)
        {
            Completed = true; // (this should only be false if the task needs to be called again later - usually because details are missing that may be given at a later time)
            _AddError(ex);
            // ('Completed' is not forced to false here to allow implementers to fire off exceptions to abort operations and complete at the same time; though the error will be set).
        }
        return Completed;
    }

    protected Exception _AddError(Exception error) {
        if (Errors == null)
            Errors = new List<Exception>();
        if (!Errors.Contains(error))
            Errors.Add(error);
        return error;
    }

    public abstract Task<bool>;
}
}
