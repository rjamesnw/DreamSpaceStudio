using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BotPal
{
    /// <summary>
    /// Holds details about a question.
    /// </summary>
    public class QuestionContext : Context
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> If the user's context is a question, this is the question type (who, what, when, where, why, etc.). </summary>
        public DictionaryItem Question;

        /** Returns true if 'Question' was set. */
        public bool IsQuestion => Question != (object)null;

        public bool IsWhoQuestion => Question == "who";
        public bool IsWhatQuestion => Question == "what";
        public bool IsWhenQuestion => Question == "when";
        public bool IsWhereQuestion => Question == "where";
        public bool IsWhyQuestion => Question == "why";
        public bool IsHowQuestion => Question == "how";
        public bool IsAreQuestion => Question == "are";
        public bool IsCanQuestion => Question == "can";
        public bool IsIfQuestion => Question == "if";

        // --------------------------------------------------------------------------------------------------------------------

        public QuestionContext(Memory memory, Concept concept, DictionaryItem question, Context parent = null) : base(memory, concept, parent)
        {
            Question = question;
        }

        public QuestionContext(Concept concept, DictionaryItem question, Context parent = null) : this(concept.Memory, concept, question, parent)
        {
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
