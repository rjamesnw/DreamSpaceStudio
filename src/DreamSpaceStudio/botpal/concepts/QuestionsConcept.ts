import Concept, { concept, conceptHandler, intentHandler, ConceptHandlerContext, contexts } from "../core/Concept";
import Brain from "../core/Brain";
import QuestionContext from "../contexts/QuestionContext";
import DictionaryItem from "../core/DictionaryItem";
import POS from "../core/POS";
import SubjectContext from "../contexts/SubjectContext";

@concept()
export default class QuestionsConcept extends Concept {
    // --------------------------------------------------------------------------------------------------------------------

    static readonly who_PN = new DictionaryItem("Who", POS.Pronoun_Subject);
    readonly who_PN: DictionaryItem;

    static readonly what = new DictionaryItem("What");
    readonly what: DictionaryItem;

    static readonly what_PN = new DictionaryItem("What", POS.Pronoun_Subject);
    readonly what_PN: DictionaryItem;

    static readonly what_D = new DictionaryItem("What", POS.Determiner);
    readonly what_D: DictionaryItem;

    static readonly what_AV = new DictionaryItem("What", POS.Adverb);
    readonly what_AV: DictionaryItem;

    /** When: Adverb */
    static readonly when_AV = new DictionaryItem("When", POS.Adverb);
    readonly when_AV: DictionaryItem;

    static readonly where_AV = new DictionaryItem("Where", POS.Adverb);
    readonly where_AV: DictionaryItem;
    static readonly why_AV = new DictionaryItem("Why", POS.Adverb);
    readonly why_AV: DictionaryItem;
    static readonly how_AV = new DictionaryItem("How", POS.Adverb);
    readonly how_AV: DictionaryItem;
    static readonly are_V = new DictionaryItem("Are", POS.Verb_Is);
    readonly are_V: DictionaryItem;
    static readonly is_V = new DictionaryItem("Is", POS.Verb_Is);
    readonly is_V: DictionaryItem;
    static readonly if_C = new DictionaryItem("If", POS.Conjunction);
    readonly if_C: DictionaryItem;
    static readonly can_V = new DictionaryItem("Can", POS.Verb_AbleToOrPermitted);
    readonly can_V: DictionaryItem;

    static readonly Name_N = new DictionaryItem("name", POS.Noun); // (the name)
    readonly Name_N: DictionaryItem;

    static readonly Name_V = new DictionaryItem("name", POS.Verb); // (naming)
    readonly Name_V: DictionaryItem;

    static readonly Name_A = new DictionaryItem("name", POS.Adjective); // (named)
    readonly Name_A: DictionaryItem;

    constructor(brain: Brain) {
        super(brain)
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler(QuestionsConcept.who_PN)
    _Who(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, this.who_PN));
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler(QuestionsConcept.Name_N, QuestionsConcept.Name_V, QuestionsConcept.Name_A) //"what^PN is^V ^PN name"
    @contexts(QuestionContext, SubjectContext, 'tobe|is') //"what^PN is^V ^PN name"
    _GetName(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        return Promise.resolve(context);
    }

    @conceptHandler(QuestionsConcept.what_PN, QuestionsConcept.what_D, QuestionsConcept.what_AV, "!")
    _What_Exclamation(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        context.addIntentHandler(new DS.Delegate(this, this._What_Excl_Intent), 1);
        return Promise.resolve(context);
    }
    async  _What_Excl_Intent(context: ConceptHandlerContext): Promise<boolean> {
        await this.brain.doResponse("Why so surprised?");
        return true;
    }

    @conceptHandler(QuestionsConcept.what)
    _What_Unknown_Question(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null)) {
            context.Context.Add(new QuestionContext(this, this.what_PN));
            context.addIntentHandler(new DS.Delegate(this, this._What_Intent), context.Operation.MinConfidence); // (this is like a fall-back plan if nothing else better is found)
        }
        return Promise.resolve(context);
    }

    async  _What_Intent(context: ConceptHandlerContext): Promise<boolean> {
        await this.brain.doResponse("What about what?");
        return true;
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler(QuestionsConcept.when_AV)
    _When(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, this.when_AV));
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler(QuestionsConcept.where_AV)
    _Where(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, this.where_AV));
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler(QuestionsConcept.why_AV)
    _Why(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, this.why_AV));
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler(QuestionsConcept.how_AV)
    _How(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null)) {
            context.Context.Add(new QuestionContext(this, this.how_AV));
            context.addIntentHandler(new DS.Delegate(this, this._How_Intent), context.Operation.MinConfidence);
        }
        return Promise.resolve(context);
    }

    @intentHandler(QuestionsConcept.how_AV)
    async  _How_Intent(context: ConceptHandlerContext): Promise<boolean> {
        if (context.WasPrevious(null))
            await this.brain.doResponse("How what?");
        return true;
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler(QuestionsConcept.can_V)
    _Can(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, this.can_V));
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler(QuestionsConcept.is_V)
    _Is(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, this.is_V));
        return Promise.resolve(context);
    }

    @conceptHandler(QuestionsConcept.are_V)
    _Are(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, this.are_V));
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler(QuestionsConcept.if_C)
    _If(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, this.if_C));
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------
}
