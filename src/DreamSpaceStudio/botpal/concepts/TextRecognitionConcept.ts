import Concept from "../core/Concept";
import DictionaryItem from "../core/DictionaryItem";
import Brain from "../core/Brain";
import ThoughtGraph from "../nlp/ThoughtGraph";
import BrainTask from "../core/BrainTask";
import Match from "../core/Match";

class SplitTextState {
    concept: TextRecognitionConcept;

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

    constructor(state?: NonFunctionProperties<SplitTextState>) {
        if (typeof state == 'object')
            for (var p in state)
                if ((<Object>state).hasOwnProperty(p))
                    (<IndexedObject>this)[p] = (<IndexedObject>state)[p];
    }

    clone(): SplitTextState {
        return new SplitTextState(this);
    }

    async execute(): Promise<void> {
        if (!this.started) {
            this.partsLen = this.textParts.length;
            this.spanEndIndex = this.partsLen;
            this.started = true;
        }

        var possibleConceptContextMatches: Match<ConceptContext>[];

        for (; this.partsIndex1 < this.partsLen; ++this.partsIndex1) // (select the first text part to search for)
        {
            if (btask.IsCancellationRequested) {
                Completed = true;
                throw new OperationCanceledException(btask.Token);
            }

            // ... don't bother starting on empty parts, since it will cause double checking on the same text ...

            while (this.partsIndex1 < this.partsLen && DS.StringUtils.isEmptyOrWhitespace(this.textParts[this.partsIndex1])) ++this.partsIndex1;
            if (this.partsIndex1 == this.partsLen) break; // (everything else is just blank text parts, so exit)

            possibleConceptContextMatches = null;

            do {
                // ... combine a span of text on each pass, combining one less part each time until a match is found ...

                this.textToMatch = "";

                for (this.partsIndex2 = this.partsIndex1; this.partsIndex2 < this.spanEndIndex; ++this.partsIndex2) {
                    this.part = this.textParts[this.partsIndex2];
                    if (this.partsIndex2 != this.partsIndex1 && this.partsIndex2 != this.spanEndIndex - 1 || !DS.StringUtils.isEmptyOrWhitespace(this.part))
                        this.textToMatch += this.textParts[this.partsIndex2];
                }

                this.textToMatch = this.textToMatch.trim();

                if (!DS.StringUtils.isEmptyOrWhitespace(this.textToMatch)) {

                    possibleConceptContextMatches = this.concept.brain.findConceptContexts(this.textToMatch); // (returns a list of concepts matching the text)

                    if (possibleConceptContextMatches.length > 0) {
                        // (found some concepts for this text part, or combined parts [phrases])
                        // ... for phrases (more than one matched text part), spawn a new task to handle them, then continue
                        //    down to a single text part, then break out to process the possible matches ...

                        var len = this.spanEndIndex - this.partsIndex2;

                        // TODO: DON'T SPAWN YET TO GET SHORTER MATCHES - keep the most text parts matched as the best likely match, until we can later "test" the "nature of things".
                        //if (len > 1)
                        //{
                        //    // (if we find a match for multiple text parts, typically a phrase or combo word (like  "hot dog"), we still need to try other combinations without the phrase, so we need to spawn a new task 
                        //    //  that continues to shorten down to a single text part, and locally continue to handle the phrase we just found)
                        //    var spawnedOp = Clone();
                        //    --spawnedOp.this.SpanEndIndex; // (adjust so the spawned job tries the next shorter text span; the SPAWNED job will try looking for a SHORTER phrase, while THIS current one will CONTINUE to use the one found)
                        //    Brain.AddOperation(spawnedOp);
                        //}

                        this.partsIndex1 += len;

                        break;
                    } // (else there is no dictionary entry for this text part yet)
                }

                --this.spanEndIndex;

                // ... skip over any white space on end ...
                while (this.spanEndIndex > this.partsIndex1 && DS.StringUtils.isEmptyOrWhitespace(this.textParts[this.spanEndIndex - 1]))
                    --this.spanEndIndex;
            } while (this.spanEndIndex > this.partsIndex1);

            if (possibleConceptContextMatches?.length > 0) // (also, if this.SpanEndIndex == this.PartsIndex2, no concepts were found)
            {
                // ... some concepts were found for this text part; add them ...
                this.CurrentProcessConceptsOperation.AddConceptContextMatches(this.textPartIndex++, possibleConceptContextMatches, this.textToMatch);
            }
            else {
                // ... no concept exists to handle this text part, so skip and move on (it may be inferred later on after other concepts execute based on surrounding grammar) ...
                this.CurrentProcessConceptsOperation.AddConceptContextMatches(this.textPartIndex++, null, this.textToMatch);
            }

            this.spanEndIndex = this.partsLen;
        }

        // (after splitting and searching for concepts, '_CurrentProcessConceptsOperation' should be set to run next upon return from this task)
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
    }

    private async _splitTextOperation(task: BrainTask<SplitTextState>): Promise<void> {

        await task.state.execute();

        return; // (completed, end task and remove it)
    }

    // --------------------------------------------------------------------------------------------------------------------
}
