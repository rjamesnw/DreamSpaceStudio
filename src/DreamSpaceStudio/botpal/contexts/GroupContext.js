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
    IContext;
    where;
    T: class {
    }
    IContext;
    {
        IEnumerable < T > Contexts;
        {
            get;
        }
        /// <summary>
        /// True if this context has any items.
        /// </summary>
        bool;
        HasItems;
        {
            get;
        }
        /// <summary> Returns the first context in the list. </summary>
        /// <value> The first context. </value>
        T;
        First;
        {
            get;
        }
        /// <summary> Returns the last context in the list. The last context is the most recent context. </summary>
        /// <value> The last (most recent) context. </value>
        T;
        Last;
        {
            get;
        }
    }
    /// <summary>
    /// Manages a specific collection of the same contexts.
    /// </summary>
    class GroupContext {
    }
    Context, IUnderlyingContext < T > where;
    T: class {
    }
    IContext;
    {
        ContextCollection < T > Contexts;
        {
            get;
            set;
        }
        IEnumerable < T > IUnderlyingContext(Contexts => Contexts);
        T;
        First => Contexts.FirstOrDefault();
        T;
        Last => Contexts.LastOrDefault();
        bool;
        HasItems => Contexts.HasItems;
        GroupContext(Memory, memory, Concept, concept, Context, parent = null);
        base(memory, concept, parent);
        {
            Contexts = new ContextCollection(this);
        }
        GroupContext(Concept, concept, Context, parent = null);
        this(concept.Memory, concept, parent);
        {
        }
        bool;
        Remove(T, context);
        {
            return Contexts.Remove(context);
        }
        // --------------------------------------------------------------------------------------------------------------------
    }
})(BotPal || (BotPal = {}));
//# sourceMappingURL=GroupContext.js.map