import MultiNode from "./Node";
import ThoughtGraphNode from "./ThoughtGraphNode";
import DictionaryItem from "../core/DictionaryItem";

/**
 * A thought graph breaks down multiple sentences into multiple graphs, each containing an isolated thought from the
 *  user (though they may be related).
 *
 *  Each thought graph acts like a logical container to isolate the main subjects, and related details, from other
 *  thoughts. The parent of a thought graph is usually the sentence outside a thought placed in brackets. Nesting occurs when nested
 *  brackets (parenthesis, square, curly, angled, or similar) are discovered. Doing this keeps sub-thoughts away from
 *  the main thought.
 *
 *  @see MultiNode<ThoughtGraph>
*/
export default class ThoughtGraph extends MultiNode<ThoughtGraph>
{
    /**
     * The current node in the build process. A blank subject group node is added by default for every thought graph, since
     * any meaningful thought usually has a subject which the attributes, descriptions, and actions relate to. A subject
     * group can contain nouns and pronouns, including descriptions applied to the group, and association branches.
     */
    get current(): ThoughtGraphNode { return this.#_current; }
    //x private set _current(value: ThoughtGraphNode): { this.#_current = value; }
    #_current: ThoughtGraphNode = ThoughtGraphNode.CreateSubjectGroup();

    /**
     * Adds words (or symbols) to the thought graph. These are added like a human would read text - one by one, like a
     * stream of text parts.
     * @param words A variable-length parameters list containing words.
    */
    add(...words: DictionaryItem[]): ThoughtGraph {
        for (var i = 0, n = words.length; i < n; ++i) {
            var word = words[i];

            this.#_current = this.current.Add(word);
            // (current always updates to the best context - typically the subject [noun], or the next best thing)
            // TODO: (when "and" is encountered, then either 1. the adjective or noun is grouped, or 2. in the presence of existing actions, a new thought graph is created and linked)
        }

        return this;
    }

    clone(): ThoughtGraph {
        var copy = new ThoughtGraph();

        return copy;
    }
}

