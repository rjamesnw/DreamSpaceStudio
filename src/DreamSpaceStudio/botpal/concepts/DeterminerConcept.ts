using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BotPal.Concepts
{
    // ========================================================================================================================

    public class DeterminerConcept : Concept
    {
        // --------------------------------------------------------------------------------------------------------------------

        public DeterminerConcept(Brain brian)
            : base(brian)
        {
        }

        // --------------------------------------------------------------------------------------------------------------------

        [ConceptHandler("A^DI", " * A^DI *")] // (indefinite determiner, any such thing)
        Task<ConceptHandlerContext> _A(ConceptHandlerContext context)
        {
            var currentContext = context.Context; // (get the current context)
            var timeContext = new FrequencyContext(this, currentContext) { RelationshipType = RelationshipTypes.One };
            currentContext.Add(timeContext);
            return Task.FromResult(context);
        }

        // --------------------------------------------------------------------------------------------------------------------

        [ConceptHandler("The", "* The^D *")] // (definite determiner, a specific/known thing)
        Task<ConceptHandlerContext> _The(ConceptHandlerContext context)
        {
            var currentContext = context.Context; // (get the current context)
            var timeContext = new FrequencyContext(this, currentContext) { RelationshipType = RelationshipTypes.One };
            currentContext.Add(timeContext);
            return Task.FromResult(context);
        }

        // --------------------------------------------------------------------------------------------------------------------

        [ConceptHandler("My^D", "* My^D *")]
        Task<ConceptHandlerContext> _My(ConceptHandlerContext context)
        {
            var currentContext = context.Context; // (get the current context)
            var timeContext = new FrequencyContext(this, currentContext) { RelationshipType = RelationshipTypes.One };
            currentContext.Add(timeContext);
            return Task.FromResult(context);
        }

        // --------------------------------------------------------------------------------------------------------------------

        [ConceptHandler("them^DI", " * them^DI *")] // (ex: "Them that do", anyone)
        Task<ConceptHandlerContext> _Them_Any(ConceptHandlerContext context)
        {
            return Task.FromResult(context);
        }

        [ConceptHandler("them^D,that^D", "* them^D|that^D *")] // (ex: "look at them eyes" / "Look at that man there")
        Task<ConceptHandlerContext> _Them_That_Specific_Subject(ConceptHandlerContext context)
        {
            return Task.FromResult(context);
        }

        // --------------------------------------------------------------------------------------------------------------------

        [ConceptHandler("those^D", " * those^D *")]
        Task<ConceptHandlerContext> _Those(ConceptHandlerContext context)
        {
            var currentContext = context.Context; // (get the current context)
            var timeContext = new FrequencyContext(this, currentContext) { RelationshipType = RelationshipTypes.Many };
            currentContext.Add(timeContext);
            return Task.FromResult(context);
        }

        // --------------------------------------------------------------------------------------------------------------------

        [ConceptHandler("these^D", " * these^D *")]
        Task<ConceptHandlerContext> _These(ConceptHandlerContext context)
        {
            var currentContext = context.Context; // (get the current context)
            var timeContext = new FrequencyContext(this, currentContext) { RelationshipType = RelationshipTypes.Many };
            currentContext.Add(timeContext);
            return Task.FromResult(context);
        }

        // --------------------------------------------------------------------------------------------------------------------

        [ConceptHandler("every^DI", " * every^DI *")]
        Task<ConceptHandlerContext> _Every(ConceptHandlerContext context)
        {
            var currentContext = context.Context; // (get the current context)
            var timeContext = new FrequencyContext(this, currentContext) { RelationshipType = RelationshipTypes.Many };
            currentContext.Add(timeContext);
            return Task.FromResult(context);
        }

        // --------------------------------------------------------------------------------------------------------------------

        [ConceptHandler("all^DI", " * all^DI *")]
        Task<ConceptHandlerContext> _All(ConceptHandlerContext context)
        {
            var currentContext = context.Context; // (get the current context)
            var timeContext = new FrequencyContext(this, currentContext) { RelationshipType = RelationshipTypes.Many };
            currentContext.Add(timeContext);
            return Task.FromResult(context);
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================
}
