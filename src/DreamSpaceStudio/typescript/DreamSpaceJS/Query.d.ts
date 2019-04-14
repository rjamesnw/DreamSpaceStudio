export declare var QUERY_STRING_REGEX: RegExp;
declare const Query_base: {
    new (): any;
    super: any;
    'new'?(...args: any[]): any;
    init?(o: object, isnew: boolean, ...args: any[]): void;
} & {
    [x: string]: any;
    [x: number]: any;
};
/**
  * Helps wrap common functionality for query/search string manipulation.  An internal 'values' object stores the 'name:value'
  * pairs from a URI or 'location.search' string, and converting the object to a string results in a proper query/search string
  * with all values escaped and ready to be appended to a URI.
  * Note: Call 'Query.new()' to create new instances.
  */
export declare class Query extends Query_base {
    /** Helps to build an object of 'name:value' pairs from a URI or 'location.search' string.
    * @param {string|object} query A full URI string, a query string (such as 'location.search'), or an object to create query values from.
    * @param {boolean} makeNamesLowercase If true, then all query names are made lower case when parsing (the default is false).
    */
    static 'new': (query?: string | object, makeNamesLowercase?: boolean) => IQuery;
    /** Helps to build an object of 'name:value' pairs from a URI or 'location.search' string.
    * @param {string|object} query A full URI string, a query string (such as 'location.search'), or an object to create query values from.
    * @param {boolean} makeNamesLowercase If true, then all query names are made lower case when parsing (the default is false).
    */
    static init(o: IQuery, isnew: boolean, query?: string | object, makeNamesLowercase?: boolean): void;
    values: {
        [index: string]: string;
    };
    /**
        * Use to add additional query string values. The function returns the current object to allow chaining calls.
        * Example: add({'name1':'value1', 'name2':'value2', ...});
        * Note: Use this to also change existing values.
        * @param {boolean} newValues An object whose properties will be added to the current query.
        * @param {boolean} makeNamesLowercase If true, then all query names are made lower case when parsing (the default is false).
        */
    addOrUpdate(newValues: object | {
        [index: string]: string;
    }, makeNamesLowercase?: boolean): this;
    /** Use to rename a series of query parameter names.  The function returns the current object to allow chaining calls.
        * Example: rename({'oldName':'newName', 'oldname2':'newName2', ...});
        * Warning: If the new name already exists, it will be replaced.
        */
    rename(newNames: {
        [index: string]: string;
    }): this;
    /** Use to remove a series of query parameter names.  The function returns the current object to allow chaining calls.
        * Example: remove(['name1', 'name2', 'name3']);
        */
    remove(namesToDelete: string[]): this;
    /** Creates and returns a duplicate of this object. */
    clone(): IQuery;
    appendTo(uri: string): string;
    /** Returns the specified value, or a default value if nothing was found. */
    getValue(name: string, defaultValueIfUndefined?: string): any;
    /** Returns the specified value as a lowercase string, or a default value (also made lowercase) if nothing was found. */
    getLCValue(name: string, defaultValueIfUndefined?: string): string;
    /** Returns the specified value as an uppercase string, or a default value (also made uppercase) if nothing was found. */
    getUCValue(name: string, defaultValueIfUndefined?: string): string;
    /** Returns the specified value as an uppercase string, or a default value (also made uppercase) if nothing was found. */
    getNumber(name: string, defaultValueIfUndefined?: number): number;
    /** Obfuscates the specified query value (to make it harder for end users to read naturally).  This is done using Base64 encoding.
        * The existing value is replaced by the encoded value, and the encoded value is returned.
        * Note: This is NOT encryption.  It is meant solely as a means to transmit values that may contain characters not supported for URI query values.
        */
    encodeValue(name: string): string;
    /** De-obfuscates the specified query value (to make it harder for end users to read naturally).  This expects Base64 encoding.
        * The existing value is replaced by the decoded value, and the decoded value is returned.
        */
    decodeValue(name: string): string;
    /** Encode ALL query values (see 'encodeValue()').
        * Note: This is NOT encryption.  It is meant solely as a means to transmit values that may contain characters not supported for URI query values.
        */
    encodeAll(): void;
    /** Decode ALL query values (see 'encodeValue()').
        * Note: This is NOT encryption.  It is meant solely as a means to transmit values that may contain characters not supported for URI query values.
        */
    decodeAll(): void;
    /**
       * Converts the underlying query values to a proper search string that can be appended to a URI.
       * @param {boolean} addQuerySeparator If true (the default) prefixes '?' before the returned query string.
       */
    toString(addQuerySeparator?: boolean): string;
}
export interface IQuery extends Query {
}
/** This is set automatically to the query for the current page. */
export declare var pageQuery: IQuery;
export {};
