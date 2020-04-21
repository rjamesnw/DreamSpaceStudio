using;
System;
using;
System.Collections.Generic;
using;
System.Linq;
using;
System.Text;
using;
System.Threading.Tasks;
var BotPal;
(function (BotPal) {
    let PossessionTypes;
    (function (PossessionTypes) {
        PossessionTypes[PossessionTypes["Unspecified"] = 0] = "Unspecified";
        /// <summary>
        /// The subject(s) HAS something.
        /// </summary>
        PossessionTypes[PossessionTypes["ToHave"] = 1] = "ToHave";
        /// <summary>
        /// The subject(s) OWN something.
        /// </summary>
        PossessionTypes[PossessionTypes["ToOwn"] = 2] = "ToOwn";
    })(PossessionTypes || (PossessionTypes = {}));
    /// <summary>
    /// Holds connection and relationship information between concepts.
    /// </summary>
    [Concept];
    class PossessionsConcept {
    }
    Concept;
    {
        Concept;
        Target;
        PossessionTypes;
        PossessionType;
        TenseTypes;
        TenseType;
        PossessionsConcept(Dictionary, dictionary, Concept, source, Concept, target);
        base(dictionary);
        {
            Target = target;
        }
        // --------------------------------------------------------------------------------------------------------------------
        [ConceptHandler("* has|have *")];
        DictionaryItem[];
        _ToHave(Scene, scene, Context, leftCtx, Context, rightCtx);
        {
            PossessionType = PossessionTypes.ToHave;
        }
        [ConceptHandler("* had *")];
        DictionaryItem[];
        _Had(Scene, scene, Context, leftCtx, Context, rightCtx);
        {
            TenseType = TenseTypes.Past;
            return _ToHave(scene, leftCtx, rightCtx);
        }
        // --------------------------------------------------------------------------------------------------------------------
        [ConceptHandler("* owns|own *")];
        DictionaryItem[];
        _ToOwn(Scene, scene, Context, leftCtx, Context, rightCtx);
        {
            PossessionType = PossessionTypes.ToOwn;
        }
        [ConceptHandler("* had *")];
        DictionaryItem[];
        _Owned(Scene, scene, Context, leftCtx, Context, rightCtx);
        {
            TenseType = TenseTypes.Past;
            return _ToHave(scene, leftCtx, rightCtx);
        }
        // --------------------------------------------------------------------------------------------------------------------
    }
})(BotPal || (BotPal = {}));
//# sourceMappingURL=Possessions.js.map