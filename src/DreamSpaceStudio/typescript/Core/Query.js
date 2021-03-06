"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Query_1;
const Factories_1 = require("./Factories");
const Text_1 = require("./System/Text");
const Utilities_1 = require("./Utilities");
const DreamSpace_1 = require("./DreamSpace");
// ==========================================================================================================================
exports.QUERY_STRING_REGEX = /[?|&][a-zA-Z0-9-._]+(?:=[^&#$]*)?/gi;
/**
  * Helps wrap common functionality for query/search string manipulation.  An internal 'values' object stores the 'name:value'
  * pairs from a URI or 'location.search' string, and converting the object to a string results in a proper query/search string
  * with all values escaped and ready to be appended to a URI.
  * Note: Call 'Query.new()' to create new instances.
  */
let Query = Query_1 = class Query extends Factories_1.Factory() {
    /**
      * Helps wrap common functionality for query/search string manipulation.  An internal 'values' object stores the 'name:value'
      * pairs from a URI or 'location.search' string, and converting the object to a string results in a proper query/search string
      * with all values escaped and ready to be appended to a URI.
      * Note: Call 'Query.new()' to create new instances.
      */
    constructor() {
        super(...arguments);
        // ----------------------------------------------------------------------------------------------------------------
        this.values = {};
        // ---------------------------------------------------------------------------------------------------------------
    }
    /** Helps to build an object of 'name:value' pairs from a URI or 'location.search' string.
    * @param {string|object} query A full URI string, a query string (such as 'location.search'), or an object to create query values from.
    * @param {boolean} makeNamesLowercase If true, then all query names are made lower case when parsing (the default is false).
    */
    static init(o, isnew, query, makeNamesLowercase) {
        if (query)
            if (typeof query == 'object')
                o.addOrUpdate(query, makeNamesLowercase);
            else {
                if (typeof query != 'string')
                    query = Utilities_1.Utilities.toString(query);
                var nameValuePairs = query.match(exports.QUERY_STRING_REGEX);
                var i, n, eqIndex, nameValue;
                if (nameValuePairs)
                    for (var i = 0, n = nameValuePairs.length; i < n; ++i) {
                        nameValue = nameValuePairs[i];
                        eqIndex = nameValue.indexOf('='); // (need to get first instance of the '=' char)
                        if (eqIndex == -1)
                            eqIndex = nameValue.length; // (whole string is the name)
                        if (makeNamesLowercase)
                            o.values[decodeURIComponent(nameValue).substring(1, eqIndex).toLowerCase()] = decodeURIComponent(nameValue.substring(eqIndex + 1)); // (note: the RegEx match always includes a delimiter)
                        else
                            o.values[decodeURIComponent(nameValue).substring(1, eqIndex)] = decodeURIComponent(nameValue.substring(eqIndex + 1)); // (note: the RegEx match always includes a delimiter)
                    }
            }
    }
    // ----------------------------------------------------------------------------------------------------------------
    /**
        * Use to add additional query string values. The function returns the current object to allow chaining calls.
        * Example: add({'name1':'value1', 'name2':'value2', ...});
        * Note: Use this to also change existing values.
        * @param {boolean} newValues An object whose properties will be added to the current query.
        * @param {boolean} makeNamesLowercase If true, then all query names are made lower case when parsing (the default is false).
        */
    addOrUpdate(newValues, makeNamesLowercase = false) {
        if (newValues)
            for (var pname in newValues)
                this.values[makeNamesLowercase ? pname.toLocaleLowerCase() : pname] = newValues[pname];
        return this;
    }
    // ---------------------------------------------------------------------------------------------------------------
    /** Use to rename a series of query parameter names.  The function returns the current object to allow chaining calls.
        * Example: rename({'oldName':'newName', 'oldname2':'newName2', ...});
        * Warning: If the new name already exists, it will be replaced.
        */
    rename(newNames) {
        for (var pname in this.values)
            for (var pexistingname in newNames)
                if (pexistingname == pname && newNames[pexistingname] && newNames[pexistingname] != pname) { // (&& make sure the new name is actually different)
                    this.values[newNames[pexistingname]] = this.values[pexistingname];
                    delete this.values[pexistingname];
                }
        return this;
    }
    // ---------------------------------------------------------------------------------------------------------------
    /** Use to remove a series of query parameter names.  The function returns the current object to allow chaining calls.
        * Example: remove(['name1', 'name2', 'name3']);
        */
    remove(namesToDelete) {
        if (namesToDelete && namesToDelete.length)
            for (var i = 0, n = namesToDelete.length; i < n; ++i)
                if (this.values[namesToDelete[i]])
                    delete this.values[namesToDelete[i]];
        return this;
    }
    // ---------------------------------------------------------------------------------------------------------------
    /** Creates and returns a duplicate of this object. */
    clone() {
        var q = Query_1.new();
        for (var pname in this.values)
            q.values[pname] = this.values[pname];
        return q;
    }
    // ---------------------------------------------------------------------------------------------------------------
    appendTo(uri) {
        return uri.match(/^[^\?]*/g)[0] + this.toString();
    }
    // ---------------------------------------------------------------------------------------------------------------
    /** Returns the specified value, or a default value if nothing was found. */
    getValue(name, defaultValueIfUndefined) {
        var value = this.values[name];
        if (value === void 0)
            value = defaultValueIfUndefined;
        return value;
    }
    /** Returns the specified value as a lowercase string, or a default value (also made lowercase) if nothing was found. */
    getLCValue(name, defaultValueIfUndefined) {
        var value = this.values[name];
        if (value === void 0)
            value = defaultValueIfUndefined;
        return ("" + value).toLowerCase();
    }
    /** Returns the specified value as an uppercase string, or a default value (also made uppercase) if nothing was found. */
    getUCValue(name, defaultValueIfUndefined) {
        var value = this.values[name];
        if (value === void 0)
            value = defaultValueIfUndefined;
        return ("" + value).toUpperCase();
    }
    /** Returns the specified value as an uppercase string, or a default value (also made uppercase) if nothing was found. */
    getNumber(name, defaultValueIfUndefined) {
        var value = parseFloat(this.values[name]);
        if (value === void 0)
            value = defaultValueIfUndefined;
        return value;
    }
    // ---------------------------------------------------------------------------------------------------------------
    /** Obfuscates the specified query value (to make it harder for end users to read naturally).  This is done using Base64 encoding.
        * The existing value is replaced by the encoded value, and the encoded value is returned.
        * Note: This is NOT encryption.  It is meant solely as a means to transmit values that may contain characters not supported for URI query values.
        */
    encodeValue(name) {
        var value = this.values[name], result;
        if (value !== void 0 && value !== null) {
            this.values[name] = result = Text_1.Encoding.base64Encode(value, Text_1.Encoding.Base64Modes.URI);
        }
        return result;
    }
    /** De-obfuscates the specified query value (to make it harder for end users to read naturally).  This expects Base64 encoding.
        * The existing value is replaced by the decoded value, and the decoded value is returned.
        */
    decodeValue(name) {
        var value = this.values[name], result;
        if (value !== void 0 && value !== null) {
            this.values[name] = result = Text_1.Encoding.base64Decode(value, Text_1.Encoding.Base64Modes.URI);
        }
        return result;
    }
    /** Encode ALL query values (see 'encodeValue()').
        * Note: This is NOT encryption.  It is meant solely as a means to transmit values that may contain characters not supported for URI query values.
        */
    encodeAll() {
        for (var p in this.values)
            this.encodeValue(p);
    }
    /** Decode ALL query values (see 'encodeValue()').
        * Note: This is NOT encryption.  It is meant solely as a means to transmit values that may contain characters not supported for URI query values.
        */
    decodeAll() {
        for (var p in this.values)
            this.decodeValue(p);
    }
    // ---------------------------------------------------------------------------------------------------------------
    /**
       * Converts the underlying query values to a proper search string that can be appended to a URI.
       * @param {boolean} addQuerySeparator If true (the default) prefixes '?' before the returned query string.
       */
    toString(addQuerySeparator = true) {
        var qstr = "";
        for (var pname in this.values)
            if (this.values[pname] !== void 0)
                qstr += (qstr ? "&" : "") + encodeURIComponent(pname) + "=" + encodeURIComponent(this.values[pname]);
        return (addQuerySeparator ? "?" : "") + qstr;
    }
};
Query = Query_1 = __decorate([
    Factories_1.factory(this)
], Query);
exports.Query = Query;
// ==========================================================================================================================
/** This is set automatically to the query for the current page. */
exports.pageQuery = Query.new(DreamSpace_1.DreamSpace.global.location.href);
// ==========================================================================================================================
//# sourceMappingURL=Query.js.map