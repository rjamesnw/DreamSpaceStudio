using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BotPal
{
    /// <summary>
    /// </summary>
    public class ActionContext : Context
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// The name of this action, which is usually taken from verbs.
        /// </summary>
        public DictionaryItem Name;

        // --------------------------------------------------------------------------------------------------------------------

        public ActionContext(Memory memory, Concept concept, DictionaryItem actionName, Context parent = null) : base(memory, concept, parent)
        {
            Name = actionName;
        }

        public ActionContext(Concept concept, DictionaryItem actionName, Context parent = null) : this(concept.Memory, concept, actionName, parent)
        {
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
