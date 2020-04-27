using;
System;
using;
System.Collections.Generic;
using;
System.Linq;
using;
System.Text;
var BotPal;
(function (BotPal) {
    /// <summary>
    /// A subject instance contains details on a tangible object or intangible idea.
    /// For instance, a list of colors verses specific parts of a car.
    /// Most conversations require one or more subject matters as focus of communication, along a verb; otherwise the
    /// idea is fragmented (i.e. fragmented sentences).
    /// Most conversations have a subject, and thus, the subject is the start of understanding the text inputs.  The parts
    /// of a sentence will build upon the subject (which may be empty if unknown).
    /// Subjects form a "picture" in a virtual graph.  Humans usually think in pictures, and this process also helps to translate between languages.
    /// </summary>
    class SubjectContext {
    }
    Context, IUnderlyingContext < SubjectContext >
        {
            // --------------------------------------------------------------------------------------------------------------------
            /// <summary>
            /// The name of this attribute, which is usually taken from determiners, adjectives, or adverbs.
            /// </summary>
            DictionaryItem, NameOrTitle,
            : .Contexts
        };
    {
        get;
        {
            yield;
            return this;
        }
    }
    bool;
    IUnderlyingContext(HasItems => true);
    SubjectContext;
    IUnderlyingContext(First => this);
    SubjectContext;
    IUnderlyingContext(Last => this);
    SubjectContext(Memory, memory, Concept, concept, DictionaryItem, nameOrTitle, Context, parent = null);
    base(memory, concept, parent);
    {
        NameOrTitle = nameOrTitle;
    }
    SubjectContext(Concept, concept, DictionaryItem, nameOrTitle, Context, parent = null);
    this(concept.Memory, concept, nameOrTitle, parent);
    {
    }
    // --------------------------------------------------------------------------------------------------------------------
})(BotPal || (BotPal = {}));
//# sourceMappingURL=SubjectContext.js.map