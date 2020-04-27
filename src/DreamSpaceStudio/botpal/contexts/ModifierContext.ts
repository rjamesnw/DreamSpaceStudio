using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BotPal
{
    /// <summary>
    /// </summary>
    public class ModifierContext : Context
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// The name of this modifier, which is usually taken from adverbs.
        /// </summary>
        public DictionaryItem Name;

        // --------------------------------------------------------------------------------------------------------------------

        public ModifierContext(Memory memory, Concept concept, DictionaryItem attributeName, Context parent = null) : base(memory, concept, parent)
        {
            Name = attributeName;
        }

        public ModifierContext(Concept concept, DictionaryItem attributeName, Context parent = null) : this(concept.Memory, concept, attributeName, parent)
        {
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
