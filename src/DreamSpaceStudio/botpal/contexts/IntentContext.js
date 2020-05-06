using;
System;
using;
System.Collections.Generic;
using;
System.Linq;
using;
System.Text;
var BotPal;
(function (BotPal) {
    /**
     *  Holds accumulated contexts that hopefully grow towards an intent (and possible response).
    */
    class IntentContext {
    }
    Context;
    {
        IntentContext(Memory, memory, Concept, concept = null, Context, parent = null);
        base(memory, concept, parent);
        {
        }
        IEnumerable < SubjectContext > AllSubjects(bool, includeGroups = true);
        {
            return Flatten(includeGroups);
        }
        IEnumerable < SubjectContext > FlattenMostRecentSubjects();
        {
            return new SortedSet(AllSubjects(), DefaultReverseComparer);
        }
        // --------------------------------------------------------------------------------------------------------------------
    }
})(BotPal || (BotPal = {}));
//# sourceMappingURL=IntentContext.js.map