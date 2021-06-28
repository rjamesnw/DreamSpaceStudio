// ###########################################################################################################################
// Text manipulation utility functions.
// ###########################################################################################################################

namespace DS {
    // ========================================================================================================================

    /** Contains a few utility functions for working with strings. */
    export namespace StringUtils {
        /**
         * Returns the given numeric value appended with the plural form of a word given a numeric value. 
         * @param n The value to test.
         * @param singular The singular form of the word.
         * @param plural The plural for of the word, or text to append when plural. The default is "s".
         * @param append If true (the default) then 'plural' is the text to append when plural (such as "s"). If false, then it replaces the singular word.
         * @param decimals See Utilities.precision()
         * @param round See Utilities.precision()
         */
        export function _s(n: number, singular: string, plural = "s", append = true, decimals?: number, round?: boolean) {
            return Utilities.precision(n, decimals, round) + ' ' + (n == 1 ? singular : append ? singular + plural : plural);
        }

        /**
         * Removes either single or double quotes from both ends of the given string.  The string is trimmed of whitespace first, if any, before removing.
         * @param str The string to trim quotes from.
         * @param trim If true (the default), then whitespace is trimmed first.
         */
        export function unquote(str: string, trim = true) {
            if (!str || typeof str != 'string') return str;
            if (trim) str = str.trim();
            if (str[0] == '"' && str[str.length - 1] == '"' || str[0] == "'" && str[str.length - 1] == "'")
                return str.substr(1, str.length - 2);
            return str;
        }

        /** Replaces one string with another in a given string.
            * This function is optimized to select the faster method in the current browser. For instance, 'split()+join()' is
            * faster in Chrome, and RegEx based 'replace()' in others.
            */
        export function replace(source: string, replaceWhat: string, replaceWith: string, ignoreCase?: boolean): string {
            // (split+join is faster in some browsers, or very close in speed) http://jsperf.com/split-join-vs-regex-replace-the-raven
            if (typeof source !== 'string') source = "" + source;
            if (typeof replaceWhat !== 'string') replaceWhat = "" + replaceWhat;
            if (typeof replaceWith !== 'string') replaceWith = "" + replaceWith;
            var regex = new RegExp(Utilities.escapeRegex(replaceWhat), ignoreCase ? 'gi' : 'g');
            return source.replace(regex, replaceWith);
        }

        /** Pads a string with given characters to make it a given fixed length. If the string is greater or equal to the
          * specified fixed length, then the request is ignored, and the given string is returned.
          * @param {any} str The string to pad.
          * @param {number} fixedLength The fixed length for the given string (note: a length less than the string length will not truncate it).
          * @param {string} leftPadChar Padding to add to the left side of the string, or null/undefined to ignore. If 'rightPadChar' is also specified, the string becomes centered.
          * @param {string} rightPadChar Padding to add to the right side of the string, or null/undefined to ignore. If 'leftPadChar' is also specified, the string becomes centered.
          */
        export function pad(str: any, fixedLength: number, leftPadChar: string, rightPadChar?: string): string {
            if (str === void 0) str = "";

            var s = "" + str, targetLength = fixedLength > 0 ? fixedLength : 0;
            var remainder = targetLength - s.length;
            var lchar = DS.StringUtils.toString(leftPadChar), rchar = DS.StringUtils.toString(rightPadChar);
            var llen = 0, rlen = 0, lpad: string = "", rpad: string = "";

            if (remainder <= 0 || (!lchar && !rchar)) return str;

            if (lchar && rchar) {
                llen = Math.floor(remainder / 2);
                rlen = remainder - llen;
            }
            else if (lchar) llen = remainder;
            else rlen = remainder;

            lpad = DS.global.Array(llen + 1).join(lchar); // (https://stackoverflow.com/a/24398129/1236397)
            rpad = DS.global.Array(rlen + 1).join(rchar);

            return lpad + s + rpad;
        }

        /** Appends the suffix string to the end of the source string, optionally using a delimiter if the source is not empty.
          * Note: If any argument is not a string, the value is converted into a string.
          * @param source The first string to combine.
          * @param suffix The second string to combine.
          * @param delimiter A string that joins the two strings, which is only added if both string parameters are not undefined, null, or empty.  If missing, the two strings are simply joined together.
          */
        export function append(source: string, suffix?: string, delimiter?: string): string {
            if (typeof source != 'string') source = toString(source);
            if (typeof suffix != 'string') suffix = toString(suffix);
            if (!source) return suffix;
            if (!suffix) return source;
            if (typeof delimiter != 'string') delimiter = toString(delimiter);
            return source + delimiter + suffix;
        }

        /** Appends the prefix string to the beginning of the source string, optionally using a delimiter if the source is not empty.
          * Note: If any argument is not a string, the value is converted into a string.
          */
        export function prepend(source: string, prefix?: string, delimiter?: string): string {
            if (source === void 0) source = "";
            else if (typeof source != 'string') source = toString(source);
            if (typeof prefix != 'string') prefix = toString(prefix);
            if (typeof delimiter != 'string') delimiter = toString(delimiter);
            if (!source) return prefix;
            return prefix + delimiter + source;
        }

        /**
         * Returns an array of all matches of 'regex' in 'text', grouped into sub-arrays (string[matches][groups], where
         * 'groups' index 0 is the full matched text, and 1 onwards are any matched groups).
         */
        export function matches(regex: RegExp, text: string): string[][] {
            text = toString(text);
            var matchesFound: string[][] = [], result: RegExpExecArray;
            if (!regex.global) throw new Exception("The 'global' flag is required in order to find all matches.");
            regex.lastIndex = 0;
            while ((result = regex.exec(text)) !== null)
                matchesFound.push(result.slice());
            return matchesFound;
        }

        /** 
         * Converts the given value to a string and returns it.  'undefined' (void 0) and null become empty, string types are
         * returned as is, and everything else will be converted to a string by calling 'toString()', or simply '""+value' if
         * 'value.toString' is not a function. If for some reason a call to 'toString()' does not return a string the cycle
         * starts over with the new value until a string is returned.
         * Note: If no arguments are passed in (i.e. 'StringUtils.toString()'), then undefined is returned.
         */
        export function toString(value?: any): string {
            if (arguments.length == 0) return void 0;
            if (value === void 0 || value === null) return "";
            if (typeof value == 'string') return value;
            return typeof value.toString == 'function' ? toString(value.toString()) : "" + value; // ('value.toString()' should be a string, but in case it is not, this will cycle until a string type value is found, or no 'toString()' function exists)
        }

        /** Splits the lines of the text (delimited by '\r\n', '\r', or '\n') into an array of strings. */
        export function getLines(text: string): string[] {
            var txt = typeof text == 'string' ? text : toString(text);
            return txt.split(/\r\n|\n|\r/gm);
        }

        export interface IAddLineNumbersFilter {
            (lineNumber: number, marginSize: number, paddedLineNumber: string, line: string): string;
        }

        /** Adds a line number margin to the given text and returns the result. This is useful when display script errors.
        * @param {string} text The text to add line numbers to.
        * @param {Function} lineFilter An optional function to run on every line that should return new line text, or undefined to skip a line.
        */
        export function addLineNumbersToText(text: string, lineFilter?: IAddLineNumbersFilter) {
            var lines = this.getLines(text);
            var marginSize = lines.length.toString().length + 1; // (used to find the max padding length; +1 for the period [i.e. '  1.'])
            if (lineFilter && typeof lineFilter != 'function') lineFilter = null;
            for (var i = 0, n = lines.length, line: string, _line: string; i < n; ++i) {
                line = lines[i];
                var lineNumStr = (1 + i) + '.';
                var paddedLineNumStr = this.pad(lineNumStr, marginSize, ' ');
                lines[i] = lineFilter && (_line = lineFilter(1 + i, marginSize, paddedLineNumStr, line)) !== void 0 && _line !== null && _line || paddedLineNumStr + " " + line;
            }
            return lines.join("\r\n");
        }

        /** Converts a byte array to a UTF8 string. */
        export function byteArrayToString(array: Uint8Array): string {
            if (typeof TextDecoder == 'undefined')
                if (isNode)
                    global.TextDecoder = require("util").TextDecoder;
                else
                    throw "TextDecoder is required, but not supported on this system. Please run on a system that supports it, or add a polyfill.";
            return new TextDecoder('utf-8').decode(array);
        }

        /** Converts a UTF8 string to a byte array. */
        export function stringToByteArray(text: string): Uint8Array {
            return new TextEncoder().encode(toString(text));
        }

        /**
         * Escapes control, escape, or double quote characters in a string and returns it.
         * Note: Single quotes are not escaped by default.
         * @param str The string to escape.
         * @param includeSingleQuotes Escapes single quotes by doubling them.  This, along with escaping, is typically used to help sanitize strings before storing them in a database.
         */
        export function escapeString(str: string, includeSingleQuotes = false): string {
            var str = JSON.stringify(typeof str == 'string' ? str : "" + str).slice(1, -1); // (JSON.stringify() will escape double quotes and other whitespace chars)
            if (includeSingleQuotes)
                str = str.replace(/'/g, "''");
            return str;
        }

        /** Reduces multiple consecutive whitespace characters into a single space character. 
         * This helps with either presentation, or when comparing text entered by users.
         */
        export function reduceWhitespace(s: string) {
            return (typeof s != 'string' ? toString(s) : s).replace(/\s+/g, ' ');
        }

        /**
         * Returns true if string content is undefined, null, empty, or only whitespace.
         * @param {string} value
         */
        export function isEmptyOrWhitespace(value: string) {
            if (!(value ?? false)) return true;
            return reduceWhitespace(value) == ' ';
        }

        /**
         * Compares two strings, ignoring case by default.
         * If 'a' is equal to 'b' then 0 is returned.  If 'a' should come before 'b', then -1 is returned, otherwise 1 is returned.
         * @param {string} a
         * @param {string} b
         * @returns
         */
        export function compare(a: string, b: string, ignorecase = true): number {
            if ((a === null || a === void 0) && (b === null || b == void 0)) return 1;
            if (a != null && a !== void 0 && typeof a !== 'string') a = toString(a);
            if (b != null && b !== void 0 && typeof b !== 'string') b = toString(b);
            return a.localeCompare(b, undefined, { sensitivity: 'accent' });
        }
    }

    // ========================================================================================================================

    export namespace Encoding {

        export enum Base64Modes {
            /** Use standard Base64 encoding characters. */
            Standard,
            /** Use Base64 encoding that is compatible with URIs (to help encode query values). */
            URI,
            /** Use custom user-supplied Base64 encoding characters (the last character is used for padding, so there should be 65 characters total).
            * Set 'Security.__64BASE_ENCODING_CHARS_CUSTOM' to your custom characters for this option (defaults to standard characters).
            */
            Custom
        };

        export var __64BASE_ENCODING_CHARS_STANDARD = DS.global.String("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=");
        export var __64BASE_ENCODING_CHARS_URI = DS.global.String("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_%3D"); // (note: %3D is treaded as one char [an % encoded '='])
        export var __64BASE_ENCODING_CHARS_CUSTOM = __64BASE_ENCODING_CHARS_STANDARD;
        // (Note: There must be exactly 65 characters [64 + 1 for padding])
        // (Note: 'String' objects MUST be used in order for the encoding functions to populate the reverse lookup indexes)

        function __CreateCharIndex(str: string & IndexedObject) {
            if (str.length < 65)
                throw new Exception("65 characters expected for base64 encoding characters (last character is for padding), but only " + str.length + " were specified.", <any>str);
            if (typeof str !== "object" && !(<any>str instanceof String))
                throw new Exception("The encoding characters must be set in a valid 'String' OBJECT (not as a string VALUE).");
            if (!str['charIndex']) {
                var index: { [index: string]: number } = {};
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
        export function base64Encode(value: string, mode: Base64Modes = Base64Modes.Standard, usePadding?: boolean): string {
            if (value === void 0 || value === null) value = ""; else value = "" + value;
            if (value.length == 0) return "";

            if (usePadding === void 0)
                usePadding = (mode != Base64Modes.URI);

            var encodingChars: string & IndexedObject = <any>(mode == Base64Modes.Standard ? __64BASE_ENCODING_CHARS_STANDARD : (mode == Base64Modes.URI ? __64BASE_ENCODING_CHARS_URI : __64BASE_ENCODING_CHARS_CUSTOM));

            // ... make sure the reverse lookup exists, and populate if missing  (which also serves to validate the encoding chars) ...

            if (!encodingChars['charIndex'])
                __CreateCharIndex(encodingChars);

            // ... determine the character bit depth ...

            var srcCharBitDepth = 8; // (regular 8-bit ASCII chars is the default, unless Unicode values are detected)
            for (var i = value.length - 1; i >= 0; --i)
                if (value.charCodeAt(i) > 255) {
                    srcCharBitDepth = 16; // (Unicode mode [16-bit])
                    value = DS.global.String.fromCharCode(0) + value; // (note: 0 is usually understood to be a null character, and is used here to flag Unicode encoding [two 0 bytes at the beginning])
                    break;
                }
            var shiftCount = srcCharBitDepth - 1;
            var bitClearMask = (1 << shiftCount) - 1;

            // ... encode the values as a virtual stream of bits, from one buffer to another ...

            var readIndex = 0, readBitIndex = srcCharBitDepth;
            var writeBitIndex = 0;
            var code: number, bit: number, baseCode: number = 0;
            var result = "";
            var paddingLength = usePadding ? (3 - Math.floor(value.length * (srcCharBitDepth / 8) % 3)) : 0;
            if (paddingLength == 3) paddingLength = 0;

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

        /** Decodes a base-64 encoded string value.  The characters used for decoding are selected based on the specified encoding 'mode'.
        * The given string is scanned for character values greater than 255 in order to auto detect the character bit depth to use.
        * @param (string) value The string value to encode.  If the value is not a string, it will be converted to one.
        * @param (Base64Modes) mode Selects the type of encoding characters to use (default is Standard).
        */
        export function base64Decode(value: string, mode: Base64Modes = Base64Modes.Standard): string {
            if (value === void 0 || value === null) value = ""; else value = "" + value;
            if (value.length == 0) return "";

            var encodingChars: string & IndexedObject = <any>(mode == Base64Modes.Standard ? __64BASE_ENCODING_CHARS_STANDARD : (mode == Base64Modes.URI ? __64BASE_ENCODING_CHARS_URI : __64BASE_ENCODING_CHARS_CUSTOM));

            // ... make sure the reverse lookup exists, and populate if missing  (which also serves to validate the encoding chars) ...

            if (!encodingChars['charIndex'])
                __CreateCharIndex(encodingChars);

            // ... determine the character bit depth ...

            var srcCharBitDepth = 8; // (regular 8-bit ASCII chars is the default, unless Unicode values are detected)
            if (value.charAt(0) == 'A')// (normal ASCII encoded characters will never start with "A" (a 'null' character), so this serves as the Unicode flag)
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
            var code: number, bit: number, baseCode: number = 0;
            var result = "";
            var charCount = 0;

            while (true) {
                if (readBitIndex == 6) {
                    readBitIndex = 0;
                    code = readIndex < value.length ? encodingChars['charIndex'][value.charAt(readIndex++)] : 0;
                    if (code === void 0)
                        throw new Exception("The value '" + value + "' has one or more invalid characters.  Valid characters for the specified encoding mode '" + Base64Modes[mode] + "' are: '" + encodingChars + "'");
                }

                bit = code >> 5; // (read left most bit; base64 values are always 6 bit)
                code = (code & 31) << 1; // (clear left most bit and shift left)
                ++readBitIndex;
                baseCode = (baseCode << 1) | bit;
                ++writeBitIndex;

                if (writeBitIndex == srcCharBitDepth) {
                    writeBitIndex = 0;
                    if (baseCode) // (should never be 0 [null char])
                        result += DS.global.String.fromCharCode(baseCode);
                    if (++charCount >= resultLength) break; // (all expected characters written)
                    baseCode = 0;
                }
            }

            return result;
        }
    }

    // ========================================================================================================================

    export abstract class HTML { }
    export namespace HTML {
        // --------------------------------------------------------------------------------------------------------------------

        export enum InputElementTypes {
            button = "button",
            checkbox = "checkbox",
            color = "color",
            date = "date",
            datetimeLocal = "local",
            email = "email",
            file = "file",
            hidden = "hidden",
            image = "image",
            month = "month",
            number = "number",
            password = "password",
            radio = "radio",
            range = "range",
            reset = "reset",
            search = "search",
            submit = "submit",
            tel = "tel",
            text = "text",
            time = "time",
            url = "url",
            week = "week",
            list = "list", // (special type - will create a select list)
            multilist = "multilist", // (special type - will create a multiple selection list)
            tabularOptions = "tabularOptions" // (special type - will create a table of values with selects on the left and check boxes on the right)
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Removes the '<!-- -->' comment sequence from the ends of the specified HTML. */
        export function uncommentHTML(html: string): string { // TODO: Consider using regex
            var content = ("" + html).trim();
            var i1 = 0, i2 = content.length;
            if (content.substring(0, 4) == "<!--") i1 = 4;
            if (content.substr(content.length - 3) == "-->") i2 -= 3;
            if (i1 > 0 || i2 < content.length)
                content = content.substring(i1, i2);
            return content;
        }

        // --------------------------------------------------------------------------------------------------------------------

        //** Gets the text between '<!-- -->' (assumed to be at each end of the given HTML). */
        export function getCommentText(html: string): string { // TODO: Consider using regex
            var content = ("" + html).trim();
            var i1 = content.indexOf("<!--"), i2 = content.lastIndexOf("-->");
            if (i1 < 0) i1 = 0;
            if (i2 < 0) i2 = content.length;
            return content.substring(i1, i2);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Gets the text between '<!-- -->' (assumed to be at each end of the given HTML). */
        export function getScriptCommentText(html: string): string { // TODO: Consider using regex.
            var content = ("" + html).trim();
            var i1 = content.indexOf("/*"), i2 = content.lastIndexOf("*/");
            if (i1 < 0) i1 = 0;
            if (i2 < 0) i2 = content.length;
            return content.substring(i1, i2);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Replaces all tags in the given 'HTML' string with 'tagReplacement' (an empty string by default) and returns the result. */
        export function replaceTags(html: string, tagReplacement?: string): string {
            return html.replace(/<[^<>]*|>[^<>]*?>|>/g, tagReplacement ?? "");
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Simply converts '<br/>' into EOL characters and strips all the HTML tags from the given HTML. */
        export function htmlToPlainText(html: string) {
            return replaceTags(StringUtils.toString(html).replace(/<br\s*\/?>/g, '\r\n'));
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Encodes any characters other than numbers and letters as html entities. 
         * @param html The HTML text to encode (typically to display in a browser).
         * @param ingoreChars You can optionally pass in a list of characters to ignore (such as "\r\n" to maintain source formatting when outputting HTML).
         * @param encodeSpaceAsNBSP If true, the spaces are replaced with "&nbsp;" elements to maintain the spacing.  If false (the default), the spaces will be collapsed when displayed in browsers.
         */
        export function encodeHTML(html: string, ingoreChars?: string, encodeSpaceAsNBSP = false) {
            return !isNullOrUndefined(html) && StringUtils.toString(html).replace(/[^0-9A-Za-z!@#$%^*()\-_=+{}\[\]:";',.?\/~`|\\]/g, function (c: string) {
                return ingoreChars && ingoreChars.indexOf(c) >= 0 ? c : encodeSpaceAsNBSP && c == ' ' ? "&nbsp;" : c == ' ' ? c : "&#" + c.charCodeAt(0) + ";";
            }) || "";
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}

// ############################################################################################################################
