"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplitTextOperation = void 0;
const Concept_1 = require("../core/Concept");
const ThoughtGraph_1 = require("../nlp/ThoughtGraph");
const Operation_1 = require("../core/Operation");
const Enums_1 = require("../core/Enums");
class SplitTextOperation extends Operation_1.default {
    /**
     * Constructs a new split text operation.
     * @param {TextRecognitionConcept} concept The concept that triggered the operation.
     * @param {ISplitTextState} state A state instance to copy from, if any.
     * @param {ThoughtGraph} thoughtGraph A thought graph to clone from as a starting point.
     */
    constructor(concept, state, thoughtGraph) {
        var _a;
        super(concept.brain, Enums_1.Intents.SplitText);
        this.concept = concept;
        if (typeof state == 'object')
            for (var p in state)
                if (state.hasOwnProperty(p))
                    this[p] = state[p];
        this.thoughtGraph = (_a = thoughtGraph === null || thoughtGraph === void 0 ? void 0 : thoughtGraph.clone()) !== null && _a !== void 0 ? _a : new ThoughtGraph_1.default();
    }
    clone() {
        return new SplitTextOperation(this.concept, this.state, this.thoughtGraph);
    }
    async onExecute(btask) {
        var state = this.state;
        if (!state.started) {
            state.partsLen = state.textParts.length;
            state.spanEndIndex = state.partsLen;
            state.started = true;
        }
        var dictionaryItems; // Match<ConceptContext>[];
        for (; state.partsIndex1 < state.partsLen; ++state.partsIndex1) // (select the first text part to search for)
         {
            if (btask.cancelled) {
                this._completed = false;
                return false;
            }
            // ... don't bother starting on empty parts, since it will cause double checking on the same text ...
            while (state.partsIndex1 < state.partsLen && DS.StringUtils.isEmptyOrWhitespace(state.textParts[state.partsIndex1]))
                ++state.partsIndex1;
            if (state.partsIndex1 == state.partsLen)
                break; // (everything else is just blank text parts, so exit)
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
            if ((dictionaryItems === null || dictionaryItems === void 0 ? void 0 : dictionaryItems.length) > 0) // (also, if state.SpanEndIndex == state.PartsIndex2, no concepts were found)
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
exports.SplitTextOperation = SplitTextOperation;
/**
 *  Adds a concept that recognizes user input text against the current dictionary.
 *  When a user inputs text, it needs to be broken down into phrases and words.  This concept starts with all words and symbols
 *  as a single phrase. A special "group key" is made from the text for rapid lookups. This allows fast recognition of any
 *  existing phrases. A loop breaks own words and symbols by removing the right most entry until either a phrase, or single
 *  word or symbol remains. Each phrase, word, or symbol is added to the NLP via a ThoughtGrap root instance.
*/
let TextRecognitionConcept = class TextRecognitionConcept extends Concept_1.default {
    // --------------------------------------------------------------------------------------------------------------------
    constructor(brain) {
        super(brain);
        brain.textInputHandlers.push(new DS.Delegate(this, this.onTextInput));
    }
    /** Executes once the after all core system concepts have been registered. */
    onAfterAllRegistered() { }
    onTextInput(text) {
        this.brain.addOperation(new SplitTextOperation(this, { text: text }));
    }
};
TextRecognitionConcept = __decorate([
    Concept_1.concept()
], TextRecognitionConcept);
exports.default = TextRecognitionConcept;
//# sourceMappingURL=TextRecognitionConcept.js.map