using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BotPal
{
    /// <summary>
    /// A subject instance contains details on a tangible object or intangible idea.
    /// For instance, a list of colors verses specific parts of a car.
    /// Most conversations require one or more subject matters as focus of communication, along a verb; otherwise the
    /// idea is fragmented (i.e. fragmented sentences).
    /// Most conversations have a subject, and thus, the subject is the start of understanding the text inputs.  The parts
    /// of a sentence will build upon the subject (which may be empty if unknown).
    /// Subjects form a "picture" in a virtual graph.  Humans usually think in pictures, and this process also helps to translate between languages.
    /// </summary>
    public class SubjectContext : Context, IUnderlyingContext<SubjectContext>
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// The name of this attribute, which is usually taken from determiners, adjectives, or adverbs.
        /// </summary>
        public DictionaryItem NameOrTitle;

        IEnumerable<SubjectContext> IUnderlyingContext<SubjectContext>.Contexts { get { yield return this; } }
        bool IUnderlyingContext<SubjectContext>.HasItems => true;
        SubjectContext IUnderlyingContext<SubjectContext>.First => this;
        SubjectContext IUnderlyingContext<SubjectContext>.Last => this;

        ///// <summary>
        ///// Returns this context or the nearest parent context that has subjects (the root context of one or more subjects).
        ///// If no root contexts are found with subjects, the top most context in the hierarchy is returned.
        ///// <para>Note this does NOT return nodes of 'SubjectContext' type, but only contexts that have subjects as child nodes.
        ///// This allows focusing on a single or group of subjects in a context.</para>
        ///// </summary>
        //x public Context SubjectRootContext { get { return HasSubjects ? this : Parent == null ? this : Parent.SubjectRootContext; } }

        // --------------------------------------------------------------------------------------------------------------------

        public SubjectContext(Memory memory, Concept concept, DictionaryItem nameOrTitle, Context parent = null) : base(memory, concept, parent)
        {
            NameOrTitle = nameOrTitle;
        }

        public SubjectContext(Concept concept, DictionaryItem nameOrTitle, Context parent = null) : this(concept.Memory, concept, nameOrTitle, parent)
        {
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
