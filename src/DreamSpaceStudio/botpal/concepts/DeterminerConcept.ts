// ========================================================================================================================

import Concept, { ConceptHandlerContext, conceptHandler } from "../core/Concept";
import Brain from "../core/Brain";
import FrequencyContext, { RelationshipTypes } from "../contexts/FrequencyContext";

export default class DeterminerConcept extends Concept {
    // --------------------------------------------------------------------------------------------------------------------

    constructor(brain: Brain) {
        super(brain);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler("A^DI", " * A^DI *") // (indefinite determiner, any such thing)
    _A(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        var currentContext = context.context; // (get the current context)
        var timeContext = new FrequencyContext(this, currentContext);
        timeContext.relationshipType = RelationshipTypes.One;
        currentContext.Add(timeContext);
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler("The", "* The^D *") // (definite determiner, a specific/known thing)
    _The(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        var currentContext = context.context; // (get the current context)
        var timeContext = new FrequencyContext(this, currentContext);
        timeContext.relationshipType = RelationshipTypes.One;
        currentContext.Add(timeContext);
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler("My^D", "* My^D *")
    _My(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        var currentContext = context.context; // (get the current context)
        var timeContext = new FrequencyContext(this, currentContext);
        timeContext.relationshipType = RelationshipTypes.One;
        currentContext.Add(timeContext);
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler("them^DI", " * them^DI *") // (ex: "Them that do", anyone)
    _Them_Any(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        return Promise.resolve(context);
    }

    @conceptHandler("them^D,that^D", "* them^D|that^D *") // (ex: "look at them eyes" / "Look at that man there")
    _Them_That_Specific_Subject(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler("those^D", " * those^D *")
    _Those(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        var currentContext = context.context; // (get the current context)
        var timeContext = new FrequencyContext(this, currentContext);
        timeContext.relationshipType = RelationshipTypes.Many;
        currentContext.Add(timeContext);
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler("these^D", " * these^D *")
    _These(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        var currentContext = context.context; // (get the current context)
        var timeContext = new FrequencyContext(this, currentContext);
        timeContext.relationshipType = RelationshipTypes.Many;
        currentContext.Add(timeContext);
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler("every^DI", " * every^DI *")
    _Every(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        var currentContext = context.context; // (get the current context)
        var timeContext = new FrequencyContext(this, currentContext);
        timeContext.relationshipType = RelationshipTypes.Many;
        currentContext.Add(timeContext);
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------

    @conceptHandler("all^DI", " * all^DI *")
    _All(context: ConceptHandlerContext): Promise<ConceptHandlerContext> {
        var currentContext = context.context; // (get the current context)
        var timeContext = new FrequencyContext(this, currentContext);
        timeContext.relationshipType = RelationshipTypes.Many;
        currentContext.Add(timeContext);
        return Promise.resolve(context);
    }

    // --------------------------------------------------------------------------------------------------------------------
}

    // ========================================================================================================================
