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
    /// <summary>
    /// Holds details about a question.
    /// </summary>
    class QuestionContext {
    }
    Context;
    {
        DictionaryItem;
        Question;
        bool;
        IsQuestion => Question != (object);
        null;
        bool;
        IsWhoQuestion => Question == "who";
        bool;
        IsWhatQuestion => Question == "what";
        bool;
        IsWhenQuestion => Question == "when";
        bool;
        IsWhereQuestion => Question == "where";
        bool;
        IsWhyQuestion => Question == "why";
        bool;
        IsHowQuestion => Question == "how";
        bool;
        IsAreQuestion => Question == "are";
        bool;
        IsCanQuestion => Question == "can";
        bool;
        IsIfQuestion => Question == "if";
        QuestionContext(Memory, memory, Concept, concept, DictionaryItem, question, Context, parent = null);
        base(memory, concept, parent);
        {
            Question = question;
        }
        QuestionContext(Concept, concept, DictionaryItem, question, Context, parent = null);
        this(concept.Memory, concept, question, parent);
        {
        }
        // --------------------------------------------------------------------------------------------------------------------
    }
})(BotPal || (BotPal = {}));
//# sourceMappingURL=QuestionContext.js.map