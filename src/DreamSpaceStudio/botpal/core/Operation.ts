using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BotPal
{
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
    public abstract class Operation : TimeReferencedObject, IMemoryObject
    {
        /// <summary>
        /// The brain this operation belongs to.
        /// </summary>
        public readonly Brain Brain;

        public Memory Memory { get { return Brain.Memory; } }

        /// <summary>
        /// The parent operation that must precede this operation before it can execute.
        /// </summary>
        public Operation Parent;

        /// <summary>
        /// The next operation to execute once this one completes.
        /// </summary>
        public Operation Next;

        /// <summary>
        /// The gets/sets the last operation to execute in a nested sequence.
        /// </summary>
        public Operation Last { get { return Next != null ? Next.Last : this; } set { Last.Next = value; } }

        /// <summary>
        /// Fixed core functionality intents, such as splitting incoming text to be processed. 
        /// </summary>
        public readonly Intents Intent;

        /// <summary>
        /// A context that this operation applies to, if any.
        /// </summary>
        public Context Context;

        /// <summary>
        /// A concept that this operation applies to, if any.
        /// </summary>
        public Concept Concept;

        /// <summary>
        /// Should be set to true when the operation completes successfully.
        /// </summary>
        public bool Completed { get; protected set; }

        public List<Exception> Errors { get; protected set; }

        /// <summary>
        /// Will be true if the operation completed successfully, but there were errors in the process.
        /// </summary>
        public bool IsCompletedWithErrors { get { return Completed && Errors?.Count > 0; } }

        /// <summary>
        /// A list of commands to execute for this command, if any.
        /// </summary>
        public readonly List<Intents> Commands;

        /// <summary>
        /// A list of commands that need to complete in order for this command to execute.
        /// </summary>
        public readonly List<Intents> Arguments;

        public Operation(Brain brain, Intents commandCode)
        {
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
        public async Task<bool> Execute(BrainTask btask = null)
        {
            try
            {
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

        protected Exception _AddError(Exception error)
        {
            if (Errors == null)
                Errors = new List<Exception>();
            if (!Errors.Contains(error))
                Errors.Add(error);
            return error;
        }

        public abstract Task<bool> OnExecute(BrainTask task = null);
    }
}
