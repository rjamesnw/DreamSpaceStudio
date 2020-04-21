using;
System;
using;
System.Collections.Generic;
using;
System.Linq;
using;
System.Text;
using;
System.Threading.Tasks;
var BotPal;
(function (BotPal) {
    /// <summary>
    ///     A thought graph breaks down multiple sentences into multiple graphs, each containing an isolated thought from the
    ///     user (though they may be related).
    ///     <para>Each thought graph acts like a logical container to isolate the main subjects, and related details, from other
    ///     thoughts. The parent of a thought graph is usually the sentence of a thought in brackets. Nesting occurs when nested
    ///     brackets (parenthesis, square, curly, angled, or similar) are discovered. Doing this keeps sub-thoughts away from
    ///     the main thought.</para>
    /// </summary>
    /// <seealso cref="T:BotPal.MultiNode{BotPal.ThoughtGraph}"/>
    class ThoughtGraph {
    }
    MultiNode < ThoughtGraph >
        {
            /// <summary>
            ///     The current node in the build process. A blank subject group node is added by default for every thought graph, since
            ///     any meaningful thought usually has a subject which the attributes, descriptions, and actions relate to. A subject
            ///     group can contain nouns and pronouns, including descriptions applied to the group, and association branches.
            /// </summary>
            /// <value> The current. </value>
            ThoughtGraphNode, Current
        };
    {
        get;
        internal;
        set;
    }
    ThoughtGraphNode.CreateSubjectGroup();
    ThoughtGraph;
    Add(params, DictionaryItem[], words);
    {
        for (int; i = 0, n = words.Length; i < n)
            ;
        ++i;
        {
            var word = words[i];
            Current = Current.Add(word);
            // (current always updates to the best context - typically the subject [noun], or the next best thing)
            // TODO: (when "and" is encountered, then either 1. the adjective or noun is grouped, or 2. in the presence of existing actions, a new thought graph is created and linked)
        }
        return this;
    }
})(BotPal || (BotPal = {}));
//# sourceMappingURL=ThoughtGraph.js.map