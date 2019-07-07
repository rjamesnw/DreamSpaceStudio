// ###########################################################################################################################
// Text manipulation utility functions.
// ###########################################################################################################################
define(["require", "exports", "./DreamSpace", "./Exception", "./Utilities", "./Browser"], function (require, exports, DreamSpace_1, Exception_1, Utilities_1, Browser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // ===========================================================================================================================
    class StringUtils {
    }
    exports.StringUtils = StringUtils;
    (function (StringUtils) {
        /** Replaces one string with another in a given string.
            * This function is optimized to select the faster method in the current browser. For instance, 'split()+join()' is
            * faster in Chrome, and RegEx based 'replace()' in others.
            */
        function replace(source, replaceWhat, replaceWith, ignoreCase) {
            // (split+join is faster in some browsers, or very close in speed) http://jsperf.com/split-join-vs-regex-replace-the-raven
            if (typeof source !== 'string')
                source = "" + source;
            if (typeof replaceWhat !== 'string')
                replaceWhat = "" + replaceWhat;
            if (typeof replaceWith !== 'string')
                replaceWith = "" + replaceWith;
            if (ignoreCase)
                return source.replace(new RegExp(Utilities_1.Utilities.escapeRegex(replaceWhat), 'gi'), replaceWith);
            else if (Browser_1.Browser.type == Browser_1.Browser.BrowserTypes.Chrome)
                return source.split(replaceWhat).join(replaceWith); // (MUCH faster in Chrome [including Chrome mobile])
            else
                return source.replace(new RegExp(Utilities_1.Utilities.escapeRegex(replaceWhat), 'g'), replaceWith);
        }
        StringUtils.replace = replace;
        /** Replaces all tags in the given 'HTML' string with 'tagReplacement' (an empty string by default) and returns the result. */
        function replaceTags(html, tagReplacement) {
            return html.replace(/<[^<>]*|>[^<>]*?>|>/g, tagReplacement);
        }
        StringUtils.replaceTags = replaceTags;
        /** Pads a string with given characters to make it a given fixed length. If the string is greater or equal to the
          * specified fixed length, then the request is ignored, and the given string is returned.
          * @param {any} str The string to pad.
          * @param {number} fixedLength The fixed length for the given string (note: a length less than the string length will not truncate it).
          * @param {string} leftPadChar Padding to add to the left side of the string, or null/undefined to ignore. If 'rightPadChar' is also specified, the string becomes centered.
          * @param {string} rightPadChar Padding to add to the right side of the string, or null/undefined to ignore. If 'leftPadChar' is also specified, the string becomes centered.
          */
        function pad(str, fixedLength, leftPadChar, rightPadChar) {
            if (str === void 0)
                str = "";
            if (leftPadChar === void 0 || leftPadChar === null)
                leftPadChar = "";
            if (rightPadChar === void 0 || rightPadChar === null)
                rightPadChar = "";
            var s = "" + str, targetLength = fixedLength > 0 ? fixedLength : 0, remainder = targetLength - s.length, lchar = "" + leftPadChar, rchar = "" + rightPadChar, llen, rlen, lpad = "", rpad = "";
            if (remainder <= 0 || (!lchar && !rchar))
                return str;
            if (lchar && rchar) {
                llen = Math.floor(remainder / 2);
                rlen = targetLength - llen;
            }
            else if (lchar)
                llen = remainder;
            else if (rchar)
                rlen = remainder;
            lpad = DreamSpace_1.DreamSpace.global.Array(llen).join(lchar); // (https://stackoverflow.com/a/24398129/1236397)
            rpad = DreamSpace_1.DreamSpace.global.Array(rlen).join(rchar);
            return lpad + s + rpad;
        }
        StringUtils.pad = pad;
        /** Appends the suffix string to the end of the source string, optionally using a delimiter if the source is not empty.
          * Note: If any argument is not a string, the value is converted into a string.
          */
        function append(source, suffix, delimiter) {
            if (source === void 0)
                source = "";
            else if (typeof source != 'string')
                source = '' + source;
            if (typeof suffix != 'string')
                suffix = '' + suffix;
            if (typeof delimiter != 'string')
                delimiter = '' + delimiter;
            if (!source)
                return suffix;
            return source + delimiter + suffix;
        }
        StringUtils.append = append;
        /** Appends the prefix string to the beginning of the source string, optionally using a delimiter if the source is not empty.
          * Note: If any argument is not a string, the value is converted into a string.
          */
        function prepend(source, prefix, delimiter) {
            if (source === void 0)
                source = "";
            else if (typeof source != 'string')
                source = '' + source;
            if (typeof prefix != 'string')
                prefix = '' + prefix;
            if (typeof delimiter != 'string')
                delimiter = '' + delimiter;
            if (!source)
                return prefix;
            return prefix + delimiter + source;
        }
        StringUtils.prepend = prepend;
        /** Returns an array of all matches of 'regex' in 'text', grouped into sub-arrays (string[matches][groups]). */
        function matches(regex, text) {
            return Utilities_1.Utilities.matches(regex, this.toString());
        }
        StringUtils.matches = matches;
        /** Splits the lines of the text (delimited by '\r\n', '\r', or '\n') into an array of strings. */
        function getLines(text) {
            var txt = typeof text == 'string' ? text : '' + text;
            return txt.split(/\r\n|\n|\r/gm);
        }
        StringUtils.getLines = getLines;
        /** Adds a line number margin to the given text and returns the result. This is useful when display script errors.
        * @param {string} text The text to add line numbers to.
        * @param {Function} lineFilter An optional function to run on every line that should return new line text, or undefined to skip a line.
        */
        function addLineNumbersToText(text, lineFilter) {
            var lines = this.getLines(text);
            var marginSize = lines.length.toString().length + 1; // (used to find the max padding length; +1 for the period [i.e. '  1.'])
            if (lineFilter && typeof lineFilter != 'function')
                lineFilter = null;
            for (var i = 0, n = lines.length, line, _line; i < n; ++i) {
                line = lines[i];
                var lineNumStr = (1 + i) + '.';
                var paddedLineNumStr = this.pad(lineNumStr, marginSize, ' ');
                lines[i] = lineFilter && (_line = lineFilter(1 + i, marginSize, paddedLineNumStr, line)) !== void 0 && _line !== null && _line || paddedLineNumStr + " " + line;
            }
            return lines.join("\r\n");
        }
        StringUtils.addLineNumbersToText = addLineNumbersToText;
    })(StringUtils = exports.StringUtils || (exports.StringUtils = {}));
    // ===========================================================================================================================
    class Encoding {
    }
    exports.Encoding = Encoding;
    (function (Encoding) {
        //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
        let Base64Modes;
        (function (Base64Modes) {
            /** Use standard Base64 encoding characters. */
            Base64Modes[Base64Modes["Standard"] = 0] = "Standard";
            /** Use Base64 encoding that is compatible with URIs (to help encode query values). */
            Base64Modes[Base64Modes["URI"] = 1] = "URI";
            /** Use custom user-supplied Base64 encoding characters (the last character is used for padding, so there should be 65 characters total).
            * Set 'Security.__64BASE_ENCODING_CHARS_CUSTOM' to your custom characters for this option (defaults to standard characters).
            */
            Base64Modes[Base64Modes["Custom"] = 2] = "Custom";
        })(Base64Modes = Encoding.Base64Modes || (Encoding.Base64Modes = {}));
        ;
        Encoding.__64BASE_ENCODING_CHARS_STANDARD = DreamSpace_1.DreamSpace.global.String("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=");
        Encoding.__64BASE_ENCODING_CHARS_URI = DreamSpace_1.DreamSpace.global.String("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_%3D"); // (note: %3D is treaded as one char [an % encoded '='])
        Encoding.__64BASE_ENCODING_CHARS_CUSTOM = Encoding.__64BASE_ENCODING_CHARS_STANDARD;
        // (Note: There must be exactly 65 characters [64 + 1 for padding])
        // (Note: 'String' objects MUST be used in order for the encoding functions to populate the reverse lookup indexes)
        function __CreateCharIndex(str) {
            if (str.length < 65)
                throw Exception_1.Exception.from("65 characters expected for base64 encoding characters (last character is for padding), but only " + str.length + " were specified.", str);
            if (typeof str !== "object" && !(str instanceof String))
                throw Exception_1.Exception.from("The encoding characters must be set in a valid 'String' OBJECT (not as a string VALUE).");
            if (!str['charIndex']) {
                var index = {};
                for (var i = 0, n = str.length; i < n; ++i)
                    index[str[i]] = i;
                str['charIndex'] = index;
            }
        }
        /** Applies a base-64 encoding to the a value.  The characters used are selected based on the specified encoding 'mode'.
        * The given string is scanned for character values greater than 255 in order to auto detect the character bit depth to use.
        * @param (string) value The string value to encode.  If the value is not a string, it will be converted to one.
        * @param (Base64Modes) mode Selects the type of encoding characters to use (default is Standard).
        * @param (boolean) usePadding If true (default), Base64 padding characters are added to the end of strings that are no divisible by 3.
        *                             Exception: If the mode is URI encoding, then padding is false by default.
        */
        function base64Encode(value, mode = Base64Modes.Standard, usePadding) {
            if (value === void 0 || value === null)
                value = "";
            else
                value = "" + value;
            if (value.length == 0)
                return "";
            if (usePadding === void 0)
                usePadding = (mode != Base64Modes.URI);
            var encodingChars = (mode == Base64Modes.Standard ? Encoding.__64BASE_ENCODING_CHARS_STANDARD : (mode == Base64Modes.URI ? Encoding.__64BASE_ENCODING_CHARS_URI : Encoding.__64BASE_ENCODING_CHARS_CUSTOM));
            // ... make sure the reverse lookup exists, and populate if missing  (which also serves to validate the encoding chars) ...
            if (!encodingChars['charIndex'])
                __CreateCharIndex(encodingChars);
            // ... determine the character bit depth ...
            var srcCharBitDepth = 8; // (regular 8-bit ASCII chars is the default, unless Unicode values are detected)
            for (var i = value.length - 1; i >= 0; --i)
                if (value.charCodeAt(i) > 255) {
                    srcCharBitDepth = 16; // (Unicode mode [16-bit])
                    value = DreamSpace_1.DreamSpace.global.String.fromCharCode(0) + value; // (note: 0 is usually understood to be a null character, and is used here to flag Unicode encoding [two 0 bytes at the beginning])
                    break;
                }
            var shiftCount = srcCharBitDepth - 1;
            var bitClearMask = (1 << shiftCount) - 1;
            // ... encode the values as a virtual stream of bits, from one buffer to another ...
            var readIndex = 0, readBitIndex = srcCharBitDepth;
            var writeBitIndex = 0;
            var code, bit, baseCode = 0;
            var result = "";
            var paddingLength = usePadding ? (3 - Math.floor(value.length * (srcCharBitDepth / 8) % 3)) : 0;
            if (paddingLength == 3)
                paddingLength = 0;
            while (true) {
                if (readBitIndex == srcCharBitDepth) {
                    if (readIndex >= value.length) {
                        // ... finished ...
                        if (writeBitIndex > 0) // (this will be 0 for strings evenly divisible by 3)
                            result += encodingChars.charAt(baseCode << (6 - writeBitIndex)); // (set remaining code [shift left to fill zeros as per spec])
                        if (usePadding && paddingLength) {
                            var paddingChar = encodingChars.substring(64);
                            while (paddingLength--)
                                result += paddingChar;
                        }
                        break;
                    }
                    readBitIndex = 0;
                    code = value.charCodeAt(readIndex++);
                }
                bit = code >> shiftCount;
                code = (code & bitClearMask) << 1;
                ++readBitIndex;
                baseCode = (baseCode << 1) | bit;
                ++writeBitIndex;
                if (writeBitIndex == 6) {
                    writeBitIndex = 0;
                    result += encodingChars.charAt(baseCode);
                    baseCode = 0;
                }
            }
            return result;
        }
        Encoding.base64Encode = base64Encode;
        /** Decodes a base-64 encoded string value.  The characters used for decoding are selected based on the specified encoding 'mode'.
        * The given string is scanned for character values greater than 255 in order to auto detect the character bit depth to use.
        * @param (string) value The string value to encode.  If the value is not a string, it will be converted to one.
        * @param (Base64Modes) mode Selects the type of encoding characters to use (default is Standard).
        */
        function base64Decode(value, mode = Base64Modes.Standard) {
            if (value === void 0 || value === null)
                value = "";
            else
                value = "" + value;
            if (value.length == 0)
                return "";
            var encodingChars = (mode == Base64Modes.Standard ? Encoding.__64BASE_ENCODING_CHARS_STANDARD : (mode == Base64Modes.URI ? Encoding.__64BASE_ENCODING_CHARS_URI : Encoding.__64BASE_ENCODING_CHARS_CUSTOM));
            // ... make sure the reverse lookup exists, and populate if missing  (which also serves to validate the encoding chars) ...
            if (!encodingChars['charIndex'])
                __CreateCharIndex(encodingChars);
            // ... determine the character bit depth ...
            var srcCharBitDepth = 8; // (regular 8-bit ASCII chars is the default, unless Unicode values are detected)
            if (value.charAt(0) == 'A') // (normal ASCII encoded characters will never start with "A" (a 'null' character), so this serves as the Unicode flag)
                srcCharBitDepth = 16;
            var shiftCount = srcCharBitDepth - 1;
            var bitClearMask = (1 << shiftCount) - 1;
            // ... remove the padding characters (not required) ...
            var paddingChar = encodingChars.substring(64);
            while (value.substring(value.length - paddingChar.length) == paddingChar)
                value = value.substring(0, value.length - paddingChar.length);
            var resultLength = Math.floor((value.length * 6) / 8) / (srcCharBitDepth / 8); // (Base64 produces 4 characters for every 3 input bytes)
            // (note: resultLength includes the null char)
            // ... decode the values as a virtual stream of bits, from one buffer to another ...
            var readIndex = 0, readBitIndex = 6;
            var writeBitIndex = 0;
            var code, bit, baseCode = 0;
            var result = "";
            var charCount = 0;
            while (true) {
                if (readBitIndex == 6) {
                    readBitIndex = 0;
                    code = readIndex < value.length ? encodingChars['charIndex'][value.charAt(readIndex++)] : 0;
                    if (code === void 0)
                        throw Exception_1.Exception.from("The value '" + value + "' has one or more invalid characters.  Valid characters for the specified encoding mode '" + Base64Modes[mode] + "' are: '" + encodingChars + "'");
                }
                bit = code >> 5; // (read left most bit; base64 values are always 6 bit)
                code = (code & 31) << 1; // (clear left most bit and shift left)
                ++readBitIndex;
                baseCode = (baseCode << 1) | bit;
                ++writeBitIndex;
                if (writeBitIndex == srcCharBitDepth) {
                    writeBitIndex = 0;
                    if (baseCode) // (should never be 0 [null char])
                        result += DreamSpace_1.DreamSpace.global.String.fromCharCode(baseCode);
                    if (++charCount >= resultLength)
                        break; // (all expected characters written)
                    baseCode = 0;
                }
            }
            return result;
        }
        Encoding.base64Decode = base64Decode;
    })(Encoding = exports.Encoding || (exports.Encoding = {}));
    // ============================================================================================================================
    class HTML {
    }
    exports.HTML = HTML;
    (function (HTML) {
        // ------------------------------------------------------------------------------------------------------------------------
        // Removes the '<!-- -->' comment sequence from the ends of the specified HTML.
        function uncommentHTML(html) {
            var content = ("" + html).trim();
            var i1 = 0, i2 = content.length;
            if (content.substring(0, 4) == "<!--")
                i1 = 4;
            if (content.substr(content.length - 3) == "-->")
                i2 -= 3;
            if (i1 > 0 || i2 < content.length)
                content = content.substring(i1, i2);
            return content;
        }
        HTML.uncommentHTML = uncommentHTML;
        // ------------------------------------------------------------------------------------------------------------------------
        // Gets the text between '<!-- -->' (assumed to be at each end of the given HTML).
        function getCommentText(html) {
            var content = ("" + html).trim();
            var i1 = content.indexOf("<!--"), i2 = content.lastIndexOf("-->");
            if (i1 < 0)
                i1 = 0;
            if (i2 < 0)
                i2 = content.length;
            return content.substring(i1, i2);
        }
        HTML.getCommentText = getCommentText;
        // ------------------------------------------------------------------------------------------------------------------------
        // Gets the text between '<!-- -->' (assumed to be at each end of the given HTML).
        function getScriptCommentText(html) {
            var content = ("" + html).trim();
            var i1 = content.indexOf("/*"), i2 = content.lastIndexOf("*/");
            if (i1 < 0)
                i1 = 0;
            if (i2 < 0)
                i2 = content.length;
            return content.substring(i1, i2);
        }
        HTML.getScriptCommentText = getScriptCommentText;
        // ------------------------------------------------------------------------------------------------------------------------
    })(HTML = exports.HTML || (exports.HTML = {}));
});
// ############################################################################################################################
//# sourceMappingURL=Text.js.map