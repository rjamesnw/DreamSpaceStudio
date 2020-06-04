
import TimeReferencedObject from "./TimeReferencedObject";
import Memory, { IMemoryObject } from "./Memory";
import { Intents } from "./Enums";
import Brain from "./Brain";
import Concept from "./Concept";
import Context from "./Context";
import BrainTask from "./BrainTask";

/**
 * An operation is a n asynchronous task that needs to be completed in the "brain".
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
    /**
     *  The brain this operation belongs to.
    */
    readonly Brain: Brain;

    get memory(): Memory { return this.Brain.memory; }

    /**
     *  The parent operation that must precede this operation before it can execute.
    */
    Parent: Operation;

    /**
     *  The next operation to execute once this one completes.
    */
    Next: Operation;

    /**
     *  The gets/sets the last operation to execute in a nested sequence.
    */
    get Last(): Operation { return this.Next?.Last ?? this; }
    set Last(value) { this.Last.Next = value; }

    /**
     *  Fixed core functionality intents, such as splitting incoming text to be processed. 
    */
    readonly Intent: Intents;

    /**
     *  A context that this operation applies to, if any.
    */
    Context: Context;

    /**
     *  A concept that this operation applies to, if any.
    */
    Concept: Concept;

    /**
     *  Should be set to true when the operation completes successfully.
    */
    get completed() { return this._completed; }
    protected _completed: boolean;

    get Errors() { return this._errors; }
    protected _errors: DS.Exception[];

    /**
     *  Will be true if the operation completed successfully, but there were errors in the process.
    */
    get IsCompletedWithErrors() { return this.completed && this?.Errors?.length > 0; }

    /**
     *  A list of commands to execute for this command, if any.
    */
    readonly Commands: Intents[];

    /**
     *  A list of commands that need to complete in order for this command to execute.
    */
    readonly Arguments: Intents[];

    constructor(brain: Brain, commandCode: Intents) {
        super();
        this.Brain = brain;
        this.Parent = null;
        this.Intent = commandCode;
    }

    /**
     *  Execute the operation. If true is returned, the instruction can be removed, otherwise it must be left, and the next instruction executed.
     *  This occurs in a cycle, keeping all operations "alive" until they are all completed.
    */
    /// <param name="btask">The brain task that is executing this operation, if any. If null, this is being called on the main thread. 
    /// This is provided so that the task's 'IsCancellationRequested' property can be monitored, allowing to gracefully abort current operations.</param>
    async execute(btask: BrainTask = null): Promise<boolean> {
        try {
            this._completed = await this.onExecute(btask);
        }
        catch (ex) {
            this._completed = true; // (this should only be false if the task needs to be called again later - usually because details are missing that may be given at a later time)
            this._addError(ex);
            // ('Completed' is not forced to false here to allow implementers to fire off exceptions to abort operations and complete at the same time; though the error will be set).
        }
        return this.completed;
    }

    protected _addError(error: DS.Exception): DS.Exception {
        if (!this._errors)
            this._errors = [];
        if (this._errors.indexOf(error) < 0)
            this._errors.push(error);
        return error;
    }

    protected abstract onExecute(task?: BrainTask): Promise<boolean>;
}
