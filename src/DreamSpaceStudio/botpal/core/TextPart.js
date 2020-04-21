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
    /// Represents simple text entered by the user.  Text elements also contain a 'Key' property that is based on a lowercase
    /// representation of the text for quick and unique likeness comparison.
    /// <para>The text in this instance is the ONLY place the text should exist in memory.  All other object instances usually reference this object, or
    /// a dictionary word that references this object. The text is NOT stored per context, and in fact a single string of characters may span may referenced contexts.</para>
    /// </summary>
    class TextPart {
    }
    TimeReferencedObject, IMemoryObject;
    {
        IMemoryObject;
        Parent;
        Memory;
        Memory;
        {
            get;
            {
                return Parent.Memory;
            }
        }
        string;
        Text;
        {
            get;
            {
                return _Text;
            }
            internal;
            set;
            {
                if (_Text != value) {
                    _Text = value;
                    _TextParts = null;
                    _Key = null;
                }
            }
        }
        string;
        _Text;
        string[];
        TextParts;
        {
            get;
            {
                return _TextParts !== null && _TextParts !== void 0 ? _TextParts : (_TextParts = Parent.Memory.Brain.Parse(Text));
            }
        }
        string[];
        _TextParts;
        string;
        Key;
        {
            get;
            {
                return _Key !== null && _Key !== void 0 ? _Key : (_Key = Parent.Memory.Brain.GetKeyFromTextParts(TextParts));
            }
        }
        string;
        _Key;
        bool;
        HadPrecedingWhitespace;
        string;
        GroupKey;
        {
            get;
            {
                return Memory.Brain.KeyToGroupKey(Key);
            }
        }
        TextPart(IMemoryObject, parent, string, text, bool, hadPrecedingWhitespace = false);
        {
            Parent = parent !== null && parent !== void 0 ? parent : ;
            throw new ArgumentNullException("parent");
            if (string.IsNullOrWhiteSpace(text))
                throw new ArgumentNullException("'text' cannot be null or empty.");
            if (!hadPrecedingWhitespace)
                hadPrecedingWhitespace = text[0] == ' ';
            Text = text.Trim();
            HadPrecedingWhitespace = hadPrecedingWhitespace;
        }
        override;
        bool;
        Equals(object, obj);
        {
            if (obj)
                is;
            TextPart;
            tp;
            return this == tp;
            if (obj)
                is;
            string;
            str;
            return this == str;
            return (object);
            Text == obj; // (compare references - which basically just returns true if they are both null)
        }
        override;
        int;
        GetHashCode();
        {
            return GroupKey.GetHashCode();
        }
        override;
        string;
        ToString();
        {
            return Text + " [" + GroupKey + "]";
        }
        bool;
        operator == (TextPart);
        tp1, string;
        text;
        {
            if ((object))
                tp1 == null && text == null;
            return true;
            if ((object))
                tp1 == null || text == null;
            return false; // (if any is null, then the other isn't, so this fails also)
            var tp2 = new TextPart(tp1.Memory, text);
            return tp1.GroupKey == tp2.GroupKey;
        }
        bool;
        operator != (TextPart);
        tp, string;
        text;
        !(tp == text);
        // --------------------------------------------------------------------------------------------------------------------
    }
})(BotPal || (BotPal = {}));
//# sourceMappingURL=TextPart.js.map