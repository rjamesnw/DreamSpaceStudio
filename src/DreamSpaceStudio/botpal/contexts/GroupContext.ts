using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BotPal
{
    /// <summary>
    ///     Creates a type that defines the underlying context type. This is used as a common key between groups of types and a
    ///     single type.
    /// </summary>
    /// <typeparam name="T"> Generic type parameter. </typeparam>
    public interface IUnderlyingContext<out T> : IContext where T : class, IContext
    {
        IEnumerable<T> Contexts { get; }

        /// <summary>
        /// True if this context has any items.
        /// </summary>
        bool HasItems { get; }

        /// <summary> Returns the first context in the list. </summary>
        /// <value> The first context. </value>
        T First { get; }

        /// <summary> Returns the last context in the list. The last context is the most recent context. </summary>
        /// <value> The last (most recent) context. </value>
        T Last { get; }
    }

    /// <summary>
    /// Manages a specific collection of the same contexts.
    /// </summary>
    public class GroupContext<T> : Context, IUnderlyingContext<T> where T : class, IContext
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        ///     As the conversation progresses, this set will increase with the subjects talked about. This set will hold all the
        ///     entities which will be acting in the scenes of this context.
        /// </summary>
        /// <value> The contexts. </value>
        public ContextCollection<T> Contexts { get; private set; }
        IEnumerable<T> IUnderlyingContext<T>.Contexts => Contexts;

        /// <summary> Returns the first context in the list. </summary>
        /// <value> The first context. </value>
        /// <seealso cref="P:BotPal.IUnderlyingContext{T}.First"/>
        public T First => Contexts.FirstOrDefault();

        /// <summary> Returns the last context in the list. The last context is the most recent context. </summary>
        /// <value> The last (most recent) context. </value>
        /// <seealso cref="P:BotPal.IUnderlyingContext{T}.Last"/>
        public T Last => Contexts.LastOrDefault();

        /// <summary>
        /// True if this context has subjects.
        /// </summary>
        public bool HasItems => Contexts.HasItems;

        ///// <summary>
        ///// Returns this context or the nearest parent context that has subjects (the root context of one or more subjects).
        ///// If no root contexts are found with subjects, the top most context in the hierarchy is returned.
        ///// <para>Note this does NOT return nodes of 'GroupContext' type, but only contexts that have subjects as child nodes.
        ///// This allows focusing on a single or group of subjects in a context.</para>
        ///// </summary>
        //x public Context SubjectRootContext { get { return HasItems ? this : Parent == null ? this : Parent.SubjectRootContext; } }

        // --------------------------------------------------------------------------------------------------------------------

        public GroupContext(Memory memory, Concept concept, Context parent = null) : base(memory, concept, parent)
        {
            Contexts = new ContextCollection<T>(this);
        }

        public GroupContext(Concept concept, Context parent = null) : this(concept.Memory, concept, parent)
        {
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Attempts to detect and remove the given context object from any of the context collections it should belong to.
        /// </summary>
        public bool Remove(T context)
        {
            return Contexts.Remove(context);

        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
