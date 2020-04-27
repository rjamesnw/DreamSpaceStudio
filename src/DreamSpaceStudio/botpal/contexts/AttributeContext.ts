using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BotPal
{
    /// <summary>
    /// Represents the state of a subject. Attributes are usually applied to various contexts, but can also be applied to other attributes.
    /// For example, a noun "John" could be next to another noun "Peter", with a verb "talking" as an attribute on one or both of them.  The verb talking, however, could also
    /// be modified with another attribute, such as the adverb "loudly", which would be applied to the verb "talking".
    /// </summary>
    public class AttributeContext : Context
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// The name of this attribute, which is usually taken from adjectives.
        /// </summary>
        public DictionaryItem Name;

        // --------------------------------------------------------------------------------------------------------------------

        public AttributeContext(Memory memory, Concept concept, DictionaryItem attributeName, Context parent = null) : base(memory, concept, parent)
        {
            Name = attributeName;
        }
        public AttributeContext(Concept concept, DictionaryItem attributeName, Context parent = null) : this(concept.Memory, concept, attributeName, parent)
        {
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
