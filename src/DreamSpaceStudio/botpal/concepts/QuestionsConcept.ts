import Concept, { concept, conceptHandler, intentHandler, ConceptHandlerContext } from "../core/Concept";
import Brain from "../core/Brain";
import QuestionContext from "../contexts/QuestionContext";
import DictionaryItem from "../core/DictionaryItem";
import POS from "../core/POS";
import SubjectContext from "../contexts/SubjectContext";

@concept()
export default class QuestionsConcept extends Concept {
    // --------------------------------------------------------------------------------------------------------------------

    static readonly Who = new DictionaryItem("Who", POS.Pronoun_Subject);
    readonly Who: DictionaryItem;

    static readonly What = new DictionaryItem("What");
    readonly What: DictionaryItem;

    static readonly What_PN = new DictionaryItem("What", POS.Pronoun_Subject);
    readonly What_PN: DictionaryItem;

    static readonly What_D = new DictionaryItem("What", POS.Determiner);
    readonly What_D: DictionaryItem;

    static readonly What_AV = new DictionaryItem("What", POS.Adverb);
    readonly What_AV: DictionaryItem;

    static readonly When = new DictionaryItem("When", POS.Adverb);
    readonly When: DictionaryItem;
    static readonly Where = new DictionaryItem("Where", POS.Adverb);
    readonly Where: DictionaryItem;
    static readonly Why = new DictionaryItem("Why", POS.Adverb);
    readonly Why: DictionaryItem;
    static readonly How = new DictionaryItem("How", POS.Adverb);
    readonly How: DictionaryItem;
    static readonly Are = new DictionaryItem("Are", POS.Verb_Is);
    readonly Are: DictionaryItem;
    static readonly Is = new DictionaryItem("Is", POS.Verb_Is);
    readonly Is: DictionaryItem;
    static readonly If = new DictionaryItem("If", POS.Conjunction);
    readonly If: DictionaryItem;
    static readonly Can = new DictionaryItem("Can", POS.Verb_AbleToOrPermitted);
    readonly Can: DictionaryItem;

    static readonly Name_Noun = new DictionaryItem("name", POS.Noun);
    readonly Name_Noun: DictionaryItem;

    static readonly Name_Verb = new DictionaryItem("name", POS.Verb);
    readonly Name_Verb: DictionaryItem;

    static readonly Name_Adjective = new DictionaryItem("name", POS.Adjective);
    readonly Name_Adjective: DictionaryItem;

    constructor(brian: Brain) {
        super(brian)
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler(QuestionsConcept.Who)
    _Who(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, this.Who));
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler(QuestionsConcept.Name_Noun, QuestionsConcept.Name_Verb, QuestionsConcept.Name_Adjective, QuestionContext, SubjectContext, 'tobe|is') //"what^PN is^V ^PN name"
    _GetName(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        return Promise.resolve(context);
    }

    @conceptHandler(QuestionsConcept.What_PN, QuestionsConcept.What_D, QuestionsConcept.What_AV, "!")
    _What_Exclamation(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        context.AddIntentHandler(new DS.Delegate(this, this._What_Excl_Intent), 1);
        return Promise.resolve(context);
    }
    async  _What_Excl_Intent(context: ConceptHandlerContext): Promise<boolean> {
        await this.brain.doResponse("Why so surprised?");
        return true;
    }

    @conceptHandler(QuestionsConcept.What)
    _What_Unknown_Question(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null)) {
            context.Context.Add(new QuestionContext(this, this.What_PN));
            context.AddIntentHandler(new DS.Delegate(this, this._What_Intent), context.Operation.MinConfidence); // (this is like a fall-back plan if nothing else better is found)
        }
        return Promise.resolve(context);
    }

    async  _What_Intent(context: ConceptHandlerContext): Promise<boolean> {
        await this.brain.doResponse("What about what?");
        return true;
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler(QuestionsConcept.When)
    _When(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, this.When));
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler(QuestionsConcept.Where)
    _Where(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, this.Where));
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler(QuestionsConcept.Why)
    _Why(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, this.Why));
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler(QuestionsConcept.How)
    _How(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null)) {
            context.Context.Add(new QuestionContext(this, this.How));
            context.AddIntentHandler(new DS.Delegate(this, this._How_Intent), context.Operation.MinConfidence);
        }
        return Promise.resolve(context);
    }

    @intentHandler(QuestionsConcept.How)
    async  _How_Intent(context: ConceptHandlerContext): Promise<boolean> {
        if (context.WasPrevious(null))
            await this.brain.doResponse("How what?");
        return true;
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler(QuestionsConcept.Can)
    _Can(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, this.Can));
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler(QuestionsConcept.Is)
    _Is(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, this.Is));
        return Promise.resolve(context);
    }

    @conceptHandler(QuestionsConcept.Are)
    _Are(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, this.Are));
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler(QuestionsConcept.If)
    _If(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, this.If));
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------
}
