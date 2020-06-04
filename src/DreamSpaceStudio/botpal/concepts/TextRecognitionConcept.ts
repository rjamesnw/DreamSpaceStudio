import Concept from "../core/Concept";
import DictionaryItem from "../core/DictionaryItem";
import Brain from "../core/Brain";
import ThoughtGraph from "../nlp/ThoughtGraph";
import BrainTask from "../core/BrainTask";
import Match from "../core/Match";
import Operation from "../core/Operation";
import { Intents } from "../core/Enums";
import TextPart from "../core/TextPart";

interface ISplitTextState {
    text: string;

    started?: boolean; // (when false, this triggers initialization on first time execution)

    textPartIndex?: number;
    partsIndex1?: number;
    partsIndex2?: number;
    spanEndIndex?: number;

    textParts?: string[]; // (ok to copy reference, as this should be static)
    partsLen?: number;

    part?: string;
    textToMatch?: string;
    groupKey?: string;
}

class SplitTextOperation extends Operation {

    state: ISplitTextState;

    thoughtGraph: ThoughtGraph;

    /**
     * Constructs a new split text operation.
     * @param {TextRecognitionConcept} concept The concept that triggered the operation.
     * @param {ISplitTextState} state A state instance to copy from, if any.
     * @param {ThoughtGraph} thoughtGraph A thought graph to clone from as a starting point.
     */
    constructor(public readonly concept: TextRecognitionConcept, state?: ISplitTextState, thoughtGraph?: ThoughtGraph) {
        super(concept.brain, Intents.SplitText);
        if (typeof state == 'object')
            for (var p in state)
                if ((<Object>state).hasOwnProperty(p))
                    (<IndexedObject>this)[p] = (<IndexedObject>state)[p];

        this.thoughtGraph = thoughtGraph?.clone() ?? new ThoughtGraph();
    }

    clone(): SplitTextOperation {
        return new SplitTextOperation(this.concept, this.state, this.thoughtGraph);
    }

    async onExecute(btask: BrainTask): Promise<boolean> {
        var state = this.state;

        if (!state.started) {
            state.partsLen = state.textParts.length;
            state.spanEndIndex = state.partsLen;
            state.started = true;
        }

        var dictionaryItems: DictionaryItem[]; // Match<ConceptContext>[];

        for (; state.partsIndex1 < state.partsLen; ++state.partsIndex1) // (select the first text part to search for)
        {
            if (btask.cancelled) {
                this._completed = false;
                return false;
            }

            // ... don't bother starting on empty parts, since it will cause double checking on the same text ...

            while (state.partsIndex1 < state.partsLen && DS.StringUtils.isEmptyOrWhitespace(state.textParts[state.partsIndex1]))
                ++state.partsIndex1;
            if (state.partsIndex1 == state.partsLen) break; // (everything else is just blank text parts, so exit)

            dictionaryItems = null;

            do {
                // ... combine a span of text on each pass, combining one less part each time until a match is found ...

                state.textToMatch = "";

                for (state.partsIndex2 = state.partsIndex1; state.partsIndex2 < state.spanEndIndex; ++state.partsIndex2) {
                    state.part = state.textParts[state.partsIndex2];
                    if (state.partsIndex2 != state.partsIndex1 && state.partsIndex2 != state.spanEndIndex - 1 || !DS.StringUtils.isEmptyOrWhitespace(state.part))
                        state.textToMatch += state.textParts[state.partsIndex2];
                }

                state.textToMatch = state.textToMatch.trim();

                if (!DS.StringUtils.isEmptyOrWhitespace(state.textToMatch)) {

                    //possibleConceptContextMatches = this.concept.brain.findConceptContexts(state.textToMatch); // (returns a list of concepts matching the text)
                    dictionaryItems = this.concept.brain.memory.dictionary.findSimilarEntries(state.textToMatch);

                    if (dictionaryItems.length > 0) {
                        // (found some dictionary matches for this text part, or combined parts [phrases])
                        // ... for phrases (more than one matched text part), spawn a new task to handle them, then continue
                        //    down to a single text part, then break out to process the possible matches ...

                        var len = state.spanEndIndex - state.partsIndex2;

                        // TODO: DON'T SPAWN YET TO GET SHORTER MATCHES - keep the most text parts matched as the best likely match, until we can later "test" the "nature of things".
                        if (len > 1) {
                            // (if we find a match for multiple text parts, typically a phrase or combo word (like  "hot dog"), we still need to try other combinations without the phrase, so we need to spawn a new task 
                            //  that continues to shorten down to a single text part, and locally continue to handle the phrase we just found)
                            var spawnedOp = this.clone();
                            --spawnedOp.state.spanEndIndex; // (adjust so the spawned job tries the next shorter text span; the SPAWNED job will try looking for a SHORTER phrase, while THIS current one will CONTINUE to use the one found)
                            this.concept.brain.addOperation(spawnedOp);
                        }

                        state.partsIndex1 += len;

                        break;
                    } // (else there is no dictionary entry for this text part yet)
                }

                --state.spanEndIndex;

                // ... skip over any white space on end ...
                while (state.spanEndIndex > state.partsIndex1 && DS.StringUtils.isEmptyOrWhitespace(state.textParts[state.spanEndIndex - 1]))
                    --state.spanEndIndex;
            } while (state.spanEndIndex > state.partsIndex1);

            if (dictionaryItems?.length > 0) // (also, if state.SpanEndIndex == state.PartsIndex2, no concepts were found)
            {
                // ... some items were found for this text part; add them ...
                this.thoughtGraph.add(dictionaryItems[0]); // (always include the first one for this operation, and spawn more operations for the rest)
                // state.CurrentProcessConceptsOperation.AddConceptContextMatches(state.textPartIndex++, dictionaryItems, state.textToMatch);
                for (let i = 1, n = dictionaryItems.length; i < n; ++i) {
                    var spawnedOp = this.clone();
                    --spawnedOp.state.spanEndIndex; // (adjust so the spawned job tries the next shorter text span; the SPAWNED job will try looking for a SHORTER phrase, while THIS current one will CONTINUE to use the one found)
                    spawnedOp.thoughtGraph.add(dictionaryItems[i]);
                    this.concept.brain.addOperation(spawnedOp);
                }
            }
            else {
                // ... no items exist matching this text part, so skip and move on (it may be inferred later on after other concepts execute based on surrounding grammar) ...
                this.thoughtGraph.add(this.Brain.memory.dictionary.addTextPart(state.textToMatch));
            }

            state.spanEndIndex = state.partsLen;
        }

        // (after splitting and searching for concepts, '_CurrentProcessConceptsOperation' should be set to run next upon return from this task)
        return true;
    }
}

/**
 *  Ads a concept that recognizes user input text against the current dictionary.
 *  When a user inputs text, it needs to be broken down into phrases and words.  This concept starts with all words and symbols
 *  as a single phrase. A special "group key" is made from the text for rapid lookups. This allows fast recognition of any
 *  existing phrases. A loop breaks own words and symbols by removing the right most entry until either a phrase, or single
 *  word or symbol remains. Each phrase, word, or symbol is added to the NLP via a ThoughtGrap root instance.
*/
export default class TextRecognitionConcept extends Concept {
    // --------------------------------------------------------------------------------------------------------------------

    thoughtGraphRoot: ThoughtGraph;

    // --------------------------------------------------------------------------------------------------------------------

    constructor(brain: Brain) {
        super(brain);
        brain.textInputHandlers.push(new DS.Delegate(this, this.onTextInput));
    }

    /** Executes once the after all core system concepts have been registered. */
    protected onAfterAllRegistered() { }

    onTextInput(text: string) {
        this.brain.createTask(this._splitTextOperation.bind(this), new SplitTextState({ concept: this, text: text }));
        this.brain.addOperation();
    }

    private async _splitTextOperation(task: BrainTask<SplitTextState>): Promise<void> {

        await task.state.execute();

        return; // (completed, end task and remove it)
    }

    // --------------------------------------------------------------------------------------------------------------------
}
