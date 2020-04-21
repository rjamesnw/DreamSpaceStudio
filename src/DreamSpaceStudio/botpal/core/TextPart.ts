import { IMemoryObject } from "./Memory";

/**
 Represents simple text entered by the user.  Text elements also contain a 'Key' property that is based on a lowercase
 representation of the text for quick and unique likeness comparison.
 
 The text in this instance is the ONLY place the text should exist in memory.  All other object instances usually reference this object, or
 a dictionary word that references this object. The text is NOT stored per context, and in fact a single string of characters may span may referenced contexts.
*/
export default class TextPart extends TimeReferencedObject implements IMemoryObject {
    // --------------------------------------------------------------------------------------------------------------------

    readonly Parent: IMemoryObject;

    get Memory(): Memory { return Parent?.Memory; }

    /**
    /// The raw text for this text part.
    */
    public string Text { get { return _Text; } internal set { if (_Text != value) { _Text = value; _TextParts = null; _Key = null; } } }
string _Text;

        public string[] TextParts { get { return _TextParts ?? (_TextParts = Parent.Memory.Brain.Parse(Text)); } }
string[] _TextParts;

        /**
        /// A case sensitive key used to identify the precise text entered by the user, without the whitespace.
        */
        public string Key { get { return _Key ?? (_Key = Parent.Memory.Brain.GetKeyFromTextParts(TextParts)); } }
string _Key;

        /**
        /// If true, the text part had preceding whitespace (for example, certain sentence punctuation symbols like '.', '?', and '!').
        /// This is handy when dealing with an array of separated text parts that may need to be rejoined later on when analyzing text.
        */
        public readonly bool HadPrecedingWhitespace;

        // --------------------------------------------------------------------------------------------------------------------

        /**
        /// A grouping key to identify all similar texts without considering case sensitivity.
        /// This can be used to group text that is different only based on case sensitivity, or that of characters which "look" similar.
        */
        public string GroupKey { get { return Memory.Brain.KeyToGroupKey(Key); } }

        // --------------------------------------------------------------------------------------------------------------------

        /**
        /// Creates a new text part class that wraps part of text parsed from user input.
        */
        /// <param name="parent">The memory object to associate with.</param>
        /// <param name="text">The text to wrap.  Note that this text will be trimmed if any whitespace exists on either end.</param>
        /// <param name="hadPrecedingWhitespace">True if the text had preceding whitespace when parsed.  If false, and the given text
        /// has preceding whitespace, then the text will be trimmed and true will be assumed.</param>
        public TextPart(IMemoryObject parent, string text, bool hadPrecedingWhitespace = false)
{
    Parent = parent ?? throw new ArgumentNullException("parent");

    if (string.IsNullOrWhiteSpace(text))
        throw new ArgumentNullException("'text' cannot be null or empty.");

    if (!hadPrecedingWhitespace) hadPrecedingWhitespace = text[0] == ' ';

    Text = text.Trim();

    HadPrecedingWhitespace = hadPrecedingWhitespace;
}

        // --------------------------------------------------------------------------------------------------------------------

        public override bool Equals(object obj)
{
    if (obj is TextPart tp) return this == tp;
    if (obj is string str) return this == str;
    return (object)Text == obj; // (compare references - which basically just returns true if they are both null)
}

        public override int GetHashCode()
{
    return GroupKey.GetHashCode();
}

        public override string ToString()
{
    return Text + " [" + GroupKey + "]";
}

        public static bool operator == (TextPart tp1, string text)
{
    if ((object)tp1 == null && text == null) return true;
    if ((object)tp1 == null || text == null) return false; // (if any is null, then the other isn't, so this fails also)
    var tp2 = new TextPart(tp1.Memory, text);
    return tp1.GroupKey == tp2.GroupKey;
}

        public static bool operator != (TextPart tp, string text) => !(tp == text);

        // --------------------------------------------------------------------------------------------------------------------
    }