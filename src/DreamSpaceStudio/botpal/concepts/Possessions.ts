using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BotPal
{
    public enum PossessionTypes
    {
        Unspecified,
        /// <summary>
        /// The subject(s) HAS something.
        /// </summary>
        ToHave,
        /// <summary>
        /// The subject(s) OWN something.
        /// </summary>
        ToOwn
    }

    /// <summary>
    /// Holds connection and relationship information between concepts.
    /// </summary>
    [Concept]
    public class PossessionsConcept : Concept
    {
        /// <summary>
        /// The subject that is the end point of this frequency modifier, which as such, is related to the source subject.
        /// </summary>
        public readonly Concept Target;

        public PossessionTypes PossessionType;
        public TenseTypes TenseType;

        public PossessionsConcept(Dictionary dictionary, Concept source, Concept target) : base(dictionary)
        {
            Target = target;
        }

        // --------------------------------------------------------------------------------------------------------------------

        [ConceptHandler("* has|have *")]
        DictionaryItem[] _ToHave(Scene scene, Context leftCtx, Context rightCtx)
        {
            PossessionType = PossessionTypes.ToHave;
        }

        [ConceptHandler("* had *")]
        DictionaryItem[] _Had(Scene scene, Context leftCtx, Context rightCtx)
        {
            TenseType = TenseTypes.Past;
            return _ToHave(scene, leftCtx, rightCtx);
        }

        // --------------------------------------------------------------------------------------------------------------------

        [ConceptHandler("* owns|own *")]
        DictionaryItem[] _ToOwn(Scene scene, Context leftCtx, Context rightCtx)
        {
            PossessionType = PossessionTypes.ToOwn;
        }

        [ConceptHandler("* had *")]
        DictionaryItem[] _Owned(Scene scene, Context leftCtx, Context rightCtx)
        {
            TenseType = TenseTypes.Past;
            return _ToHave(scene, leftCtx, rightCtx);
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
