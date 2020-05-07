import Concept, { concept, conceptHandler, intentHandler, ConceptHandlerContext } from "../core/Concept";
import Brain from "../core/Brain";
import QuestionContext from "../contexts/QuestionContext";
import DictionaryItem from "../core/DictionaryItem";
import POS from "../core/POS";
import SubjectContext from "../contexts/SubjectContext";

@concept()
export default class QuestionsConcept extends Concept {
    // --------------------------------------------------------------------------------------------------------------------

    constructor(brian: Brain) {
        super(brian)
        this.Who = this.memory.dictionary.addTextPart("who", POS.Pronoun_Subject);
        this.What = this.memory.dictionary.addTextPart("what", POS.Pronoun_Subject);
        this.When = this.memory.dictionary.addTextPart("when", POS.Adverb);
        this.Where = this.memory.dictionary.addTextPart("where", POS.Adverb);
        this.Why = this.memory.dictionary.addTextPart("why", POS.Adverb);
        this.How = this.memory.dictionary.addTextPart("how", POS.Adverb);
        this.Are = this.memory.dictionary.addTextPart("are", POS.Verb_Is);
        this.Is = this.memory.dictionary.addTextPart("is", POS.Verb_Is);
        this.If = this.memory.dictionary.addTextPart("if", POS.Conjunction);
        this.Can = this.memory.dictionary.addTextPart("can", POS.Verb_AbleToOrPermitted);
    }

    // --------------------------------------------------------------------------------------------------------------------

    readonly Who: DictionaryItem;
    readonly What: DictionaryItem;
    readonly When: DictionaryItem;
    readonly Where: DictionaryItem;
    readonly Why: DictionaryItem;
    readonly How: DictionaryItem;
    readonly Are: DictionaryItem;
    readonly Is: DictionaryItem;
    readonly If: DictionaryItem;
    readonly Can: DictionaryItem;

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler("Who^PN")
    _Who(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, this.Who));
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler("name^N^V^A", QuestionContext, SubjectContext, 'tobe|is') //"what^PN is^V ^PN name"
    _GetName(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        return Promise.resolve(context);
    }

    @conceptHandler("What!?")
    _What_Exclamation(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        context.AddIntentHandler(new DS.Delegate(this, this._What_Excl_Intent), 1);
        return Promise.resolve(context);
    }
    async  _What_Excl_Intent(context: ConceptHandlerContext): Promise<boolean> {
        await this.brain.doResponse("Why so surprised?");
        return true;
    }

    @conceptHandler("What")
    _What_Unknown_Question(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null)) {
            context.Context.Add(new QuestionContext(this, this.What));
            context.AddIntentHandler(new DS.Delegate(this, this._What_Intent), context.Operation.MinConfidence); // (this is like a fall-back plan if nothing else better is found)
        }
        return Promise.resolve(context);
    }

    async  _What_Intent(context: ConceptHandlerContext): Promise<boolean> {
        await this.brain.doResponse("What about what?");
        return true;
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler("When")
    _When(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, this.When));
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler("Where")
    _Where(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, this.Where));
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler("Why", "Why *")
    _Why(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, this.Why));
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler("How")
    _How(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null)) {
            context.Context.Add(new QuestionContext(this, this.How));
            context.AddIntentHandler(new DS.Delegate(this, this._How_Intent), context.Operation.MinConfidence);
        }
        return Promise.resolve(context);
    }

    @intentHandler("How")
    async  _How_Intent(context: ConceptHandlerContext): Promise<boolean> {
        if (context.WasPrevious(null))
            await this.brain.doResponse("How what?");
        return true;
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler("Can", "Can *")
    _Can(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, this.Can));
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler("Is", "Is *")
    _Is(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, this.Is));
        return Promise.resolve(context);
    }

    @conceptHandler("Are", "Are *")
    _Are(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, this.Are));
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler("If", "If *")
    _If(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, this.If));
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------
}
