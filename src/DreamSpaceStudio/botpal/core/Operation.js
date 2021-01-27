"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TimeReferencedObject_1 = require("./TimeReferencedObject");
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
class Operation extends TimeReferencedObject_1.default {
    constructor(brain, commandCode) {
        super();
        this.Brain = brain;
        this.Parent = null;
        this.Intent = commandCode;
    }
    get memory() { return this.Brain.memory; }
    /**
     *  The gets/sets the last operation to execute in a nested sequence.
    */
    get Last() { var _a, _b; return (_b = (_a = this.Next) === null || _a === void 0 ? void 0 : _a.Last) !== null && _b !== void 0 ? _b : this; }
    set Last(value) { this.Last.Next = value; }
    /**
     *  Should be set to true when the operation completes successfully.
    */
    get completed() { return this._completed; }
    get errors() { return this._errors; }
    /**
     *  Will be true if the operation completed successfully, but there were errors in the process.
    */
    get IsCompletedWithErrors() { var _a; return this.completed && ((_a = this === null || this === void 0 ? void 0 : this.errors) === null || _a === void 0 ? void 0 : _a.length) > 0; }
    /**
     *  Execute the operation. If true is returned, the instruction can be removed, otherwise it must be left, and the next instruction executed.
     *  This occurs in a cycle, keeping all operations "alive" until they are all completed.
    */
    /// <param name="btask">The brain task that is executing this operation, if any. If null, this is being called on the main thread. 
    /// This is provided so that the task's 'IsCancellationRequested' property can be monitored, allowing to gracefully abort current operations.</param>
    async execute(btask = null) {
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
    _addError(error) {
        if (!this._errors)
            this._errors = [];
        if (this._errors.indexOf(error) < 0)
            this._errors.push(error);
        return error;
    }
}
exports.default = Operation;
//# sourceMappingURL=Operation.js.map