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
        /**
         *  The subject(s) HAS something.
        */
        ToHave,
        /**
         *  The subject(s) OWN something.
        */
        ToOwn
    }

    /**
     *  Holds connection and relationship information between concepts.
    */
    [Concept]
    export default class PossessionsConcept extends Concept
    {
        /**
         *  The subject that is the end point of this frequency modifier, which as such, is related to the source subject.
        */
        public readonly Concept Target;

        public PossessionTypes PossessionType;
        public TenseTypes TenseType;

        public PossessionsConcept(Dictionary dictionary, Concept source, Concept target) : base(dictionary)
        {
            Target = target;
        }

        // --------------------------------------------------------------------------------------------------------------------

        @conceptHandler("* has|have *")
        DictionaryItem[] _ToHave(Scene scene, Context leftCtx, Context rightCtx)
        {
            PossessionType = PossessionTypes.ToHave;
        }

        @conceptHandler("* had *")
        DictionaryItem[] _Had(Scene scene, Context leftCtx, Context rightCtx)
        {
            TenseType = TenseTypes.Past;
            return _ToHave(scene, leftCtx, rightCtx);
        }

        // --------------------------------------------------------------------------------------------------------------------

        @conceptHandler("* owns|own *")
        DictionaryItem[] _ToOwn(Scene scene, Context leftCtx, Context rightCtx)
        {
            PossessionType = PossessionTypes.ToOwn;
        }

        @conceptHandler("* had *")
        DictionaryItem[] _Owned(Scene scene, Context leftCtx, Context rightCtx)
        {
            TenseType = TenseTypes.Past;
            return _ToHave(scene, leftCtx, rightCtx);
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
