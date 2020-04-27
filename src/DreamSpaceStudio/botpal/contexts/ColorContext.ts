using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BotPal
{
    /// <summary>
    /// Represents a color state of a subject. Attributes are usually applied to subject contexts, but can also be applied to other attributes.
    /// For example, a noun "John" could be next to another noun "Peter", with a verb "talking" as an attribute on one or both of them.  The verb talking, however, could also
    /// be modified with another attribute, such as the adverb "loudly", which would be applied to the verb "talking".
    /// </summary>
    public class ColorContext : AttributeContext
    {
        // --------------------------------------------------------------------------------------------------------------------

        public ColorContext(Memory memory, Concept concept, DictionaryItem color, Context parent = null) : base(memory, concept, color, parent)
        {
        }

        public ColorContext(Concept concept, DictionaryItem color, Context parent = null) : this(concept.Memory, concept, color, parent)
        {
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
