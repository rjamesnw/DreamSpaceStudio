import Concept, { concept, conceptHandler, intentHandler } from "../core/Concept";
import Brain from "../core/Brain";

@concept()
export default class QuestionsConcept extends Concept {
    // --------------------------------------------------------------------------------------------------------------------

    constructor(brian: Brain) {
        super(brian)
        this.Who = this.Memory.Dictionary.AddTextPart("who", this.POS.Pronoun_Subject);
        this.What = this.Memory.Dictionary.AddTextPart("what", this.POS.Pronoun_Subject);
        this.When = this.Memory.Dictionary.AddTextPart("when", this.POS.Adverb);
        this.Where = this.Memory.Dictionary.AddTextPart("where", this.POS.Adverb);
        this.Why = this.Memory.Dictionary.AddTextPart("why", this.POS.Adverb);
        this.How = this.Memory.Dictionary.AddTextPart("how", this.POS.Adverb);
        this.Are = this.Memory.Dictionary.AddTextPart("are", this.POS.Verb_Is);
        this.Is = this.Memory.Dictionary.AddTextPart("is", this.POS.Verb_Is);
        this.If = this.Memory.Dictionary.AddTextPart("if", this.POS.Conjunction);
        this.Can = this.Memory.Dictionary.AddTextPart("can", this.POS.Verb_AbleToOrPermitted);
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
    _Who(context: conceptHandlerContext): Promise<conceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, Who));
        return Task.FromResult(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler("name", "what^PN is^V ^PN name")
    _GetName(context: conceptHandlerContext): Promise<conceptHandlerContext> {
        return Task.FromResult(context);
    }

    @conceptHandler("What!?")
    _What_Exclamation(context: conceptHandlerContext): Promise<conceptHandlerContext> {
        context.AddIntentHandler(_What_Excl_Intent, 1d);
        return Task.FromResult(context);
    }
    async  _What_Excl_Intent(context: conceptHandlerContext): Promise<bool> {
        await Brain.DoResponse("Why so surprised?");
        return true;
    }

    @conceptHandler("What")
    _What_Unknown_Question(context: conceptHandlerContext): Promise<conceptHandlerContext> {
        if (context.WasPrevious(null)) {
            context.Context.Add(new QuestionContext(this, What));
            context.AddIntentHandler(_What_Intent, context.Operation.MinConfidence); // (this is like a fall-back plan if nothing else better is found)
        }
        return Task.FromResult(context);
    }

    async  _What_Intent(context: conceptHandlerContext): Promise<bool> {
        await Brain.DoResponse("What about what?");
        return true;
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler("When")
    _When(context: conceptHandlerContext): Promise<conceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, When));
        return Task.FromResult(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler("Where")
    _Where(context: conceptHandlerContext): Promise<conceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, Where));
        return Task.FromResult(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler("Why", "Why *")
    _Why(context: conceptHandlerContext): Promise<conceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, Why));
        return Task.FromResult(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler("How")
    _How(context: conceptHandlerContext): Promise<conceptHandlerContext> {
        if (context.WasPrevious(null)) {
            context.Context.Add(new QuestionContext(this, How));
            context.AddIntentHandler(_How_Intent, context.Operation.MinConfidence);
        }
        return Task.FromResult(context);
    }

    @intentHandler("How")
    async  _How_Intent(context: conceptHandlerContext): Promise<bool> {
        if (context.WasPrevious(null))
            await Brain.DoResponse("How what?");
        return true;
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler("Can", "Can *")
    _Can(context: conceptHandlerContext): Promise<conceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, Can));
        return Task.FromResult(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler("Is", "Is *")
    _Is(context: conceptHandlerContext): Promise<conceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, Is));
        return Task.FromResult(context);
    }

    @conceptHandler("Are", "Are *")
    _Are(context: conceptHandlerContext): Promise<conceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, Are));
        return Task.FromResult(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler("If", "If *")
    _If(context: conceptHandlerContext): Promise<conceptHandlerContext> {
        if (context.WasPrevious(null))
            context.Context.Add(new QuestionContext(this, If));
        return Task.FromResult(context);
    }

    // --------------------------------------------------------------------------------------------------------------------
}
}
