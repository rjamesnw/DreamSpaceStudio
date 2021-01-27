namespace DS {
    /** Database types and abstracts. */
    export namespace DB {
        //import { reject, escapeString, IndexedObject, resolve } from '../utilities';

        /** Defines the format of mapping from object properties to table columns.
         * A function is supported so the name mapped to can be dynamic if need be.
         */
        export interface IColumnTranslations { [name: string]: string | { (name?: string): string } }

        /** When matched against a property, the associated function will be passed the current value,
         * and any non-undefined value returned will be used instead. 
         * Note: The name index is the name of the target table column (the name translated to, if translation is used). */
        export interface ICalculatedColumns { [name: string]: { (value?: any): any } }

        export interface IColumnInfo {
            Field: string, // (name)
            Type: string; //(example: 'int(11) unsigned')
            Null: string; //('YES/'NO')
            Key: string; //('PRI')
            Default: string; // (default value)
            Extra: string; //('auto_increment')
        }

        /** A set of column names and the column details as queried from a database. */
        export interface IColumnInfoMap { [name: string]: IColumnInfo }

        /** Associates some value with a column. */
        export interface IColumnValue { columnName: string; value: any; }

        export interface IQueryResult<T = any> {
            /** The response from the executed query. */
            response?: T;
        }

        export interface ISelectQueryResult<T extends IRecordSet = IRecordSet> extends IQueryResult<T> {
        }

        export interface IInsertResult {
            /** The number of rows changed by the query. */
            changedRows: number;
            /** The ID of the last record inserted, if auto numbers are used with a single primary key.
             * Warning: The ID returned may not be from the target table if stored procedures are involved that insert into other tables.
             */
            insertId: number;
        }

        export interface IInsertQueryResult<T extends IInsertResult = IInsertResult> extends IQueryResult<T> {
        }

        export interface IUpdateResult {
            changedRows: number;
        }

        export interface IUpdaeQueryResult<T extends IUpdateResult = IUpdateResult> extends IQueryResult<T> {
        }

        export interface IRecordSet<T = any> extends Array<T> { }

        /** The keys typically returned from or used in an insert or update operation. */
        export interface IKeys { [name: string]: any; }

        export interface IModifyTableResult {
            /** All operations require an query builder to construct a query based on some data and keys. */
            builder: QueryBuilder;
            /** True if an query succeeded. False if not - for instance, if an update could not find any records. On SQL errors, an exception is thrown instead. */
            success: boolean;
            /** A success message, or error message is 'success' is false. Because SQL errors trigger exceptions, this will not be set in such case. */
            message: string;
        }

        /** A base class to help support various databases. */
        export abstract class DBAdapter<TConfig = any> {
            configuration: TConfig;
            constructor(config: TConfig) { this.configuration = config; }

            abstract createConnection(): Promise<DBConnection>;

            /** Returns a basic error message. Override this to provide a more detailed error message for the database type. */
            getSQLErrorMessage(err: any) {
                return `SQL failed:  ${err}`;
            }
        }

        export abstract class DBConnection<TConnection = any> {
            constructor(public readonly adapter: DBAdapter, public readonly connection: TConnection) { }
            /** Attempts to make a connection. If already connected the function should execute immediately.*/
            abstract connect(): Promise<void>;
            abstract query(statement: string, values?: any): Promise<IQueryResult>;
            abstract getColumnDetails(tableName: string): Promise<IColumnInfo[]>;
            abstract end(): Promise<void>;

            createQueryBuilder(tableName: string, columnInfo?: IColumnInfoMap): QueryBuilder {
                return new QueryBuilder(this, tableName, columnInfo);
            }

            /**
             * Constructs the columns and values from a JSON object, table name, and optional translation array.
             * This is used in building the final statement, such as 'insert', or 'update'.
             * @param json The JSON to insert.
             * @param tableName The destination table to insert into.
             * @param columnTranslations An optional object whose properties are JSON property names set to the names of the table columns they map to. If a property doesn't get mapped, a warning is logged.
             */
            async buildQueryInfo(json: string | IndexedObject,
                tableName: string, columnTranslations?: IColumnTranslations): Promise<QueryBuilder> {

                var data: IndexedObject;

                if (typeof json == 'string')
                    data = JSON.parse(json);
                if (json !== void 0 && typeof json != 'object')
                    throw "The given 'json' argument value is not a valid object, or if a string, could not be parsed into one.";

                data = <IndexedObject>json;

                // ... first get the expected columns ...

                var colResults = await this.getColumnDetails(tableName);
                var colResIndex: IColumnInfoMap = {}; // (named index for quick lookups)

                for (var i = 0, n = colResults.length; i < n; ++i)
                    colResIndex[colResults[i].Field.toLowerCase()] = colResults[i];

                var q = this.createQueryBuilder(tableName);
                q.columnInfo = colResIndex;

                // ... for each property of the object, create an array of column names and values ...

                var unmatchedProperties: string[] = [];

                for (var p in data) {
                    var translatedProp: string = p.toLowerCase(), ct: any;
                    if (columnTranslations && (ct = columnTranslations[p]))
                        translatedProp = (typeof ct == 'string' ? ct : typeof ct == 'function' ? StringUtils.toString(ct(p)) : p).toLowerCase();

                    if (translatedProp)
                        if (colResIndex[translatedProp]) {
                            q.setValue(translatedProp, data[p]);
                        } else {
                            unmatchedProperties.push(`${p}=>${translatedProp}`);
                        }
                }

                if (unmatchedProperties.length)
                    console.warn(`One or more JSON properties do not have a corresponding column target for table '${tableName}'. Provide column translations, or review any existing ones. To ignore a property, set the translation to anything other than a string.`
                        + `\r\nUnmapped properties are as follows:\r\n` + unmatchedProperties.join('\r\n'));

                return q;
            }

            updateOrInsert(data: string | IndexedObject, tableName: string, onQueryBuilderReady?: { (q: QueryBuilder): void },
                columnTranslations?: IColumnTranslations, calculatedColumns?: ICalculatedColumns): Promise<IModifyTableResult> {

                console.log(`*** Insert or update requested for table '${tableName}' ...`);

                return new Promise<IModifyTableResult>((res, rej) => {

                    this.update(data, tableName, onQueryBuilderReady, columnTranslations, calculatedColumns).then((result) => {
                        if (result.success)
                            res(result); // (when a query builder is returned, then the update was a success, otherwise null is returned)
                        else {
                            // ... we should already be connected (since we would not be here on failure) ...
                            // ... we also now already have a query builder to use, so no need to make another ...

                            var qbInfo = result.builder;

                            console.log("No records found to update; inserting ...");

                            // ... this is where we insert a new record ...
                            var st = qbInfo.updateCalculcatedColumns(calculatedColumns)
                                .getInsertStatement();

                            console.log(`Insert statement: ` + st);
                            console.log(`Insert values: ` + JSON.stringify(qbInfo.values));

                            this.query(st).then((result: IInsertQueryResult) => {
                                var msg = `Success: New entry create in table '${tableName}'.`
                                    + "\r\nResult: " + JSON.stringify(result);

                                // ... copy insert key value to existing table data ...

                                var keys = qbInfo.getPrimaryKeys();
                                if (keys)
                                    if (keys.length == 1) {
                                        if (!qbInfo.existingTableData)
                                            qbInfo.existingTableData = {};
                                        console.log("Insert Key Result: " + keys[0] + "=" + result.response.insertId);
                                        qbInfo.existingTableData[keys[0]] = result.response.insertId;
                                    }
                                    else if (keys.length > 1)
                                        console.warn("Since the insert was done using a composite key (multiple columns) no insert ID could be returned from the execution (it only works for single auto-increment key fields).");

                                this.end();

                                resolve(res, <IModifyTableResult>{ builder: qbInfo, success: true, message: msg }, msg);
                            },
                                (err) => { this.end(); reject(rej, this.adapter.getSQLErrorMessage(err)); });
                        }
                    }, (err) => { rej(err); });
                });
            }

            /** Only performs an update of existing data. If no data exists, null is returned. */
            update(data: string | IndexedObject, tableName: string, onQueryBuilderReady?: { (q: QueryBuilder): void },
                columnTranslations?: IColumnTranslations, calculatedColumns?: ICalculatedColumns): Promise<IModifyTableResult> {

                console.log(`*** Update requested for table '${tableName}' ...`);

                return new Promise<IModifyTableResult>((res, rej) => {
                    try {
                        this.connect().then(() => {


                            console.log(`Connected to database. Building database query information to update table '${tableName}' ...`);

                            // ... get the SQL statement to check existing records ...

                            this.buildQueryInfo(data, tableName, columnTranslations)
                                .then((qbInfo) => {

                                    console.log(`Created initial layout from existing table schema for table '${tableName}'.`);

                                    onQueryBuilderReady && onQueryBuilderReady(qbInfo);

                                    var existingWhere = qbInfo.getKeyNameValues().join(' AND ');

                                    if (!existingWhere)
                                        return reject(rej, "insertOrUpdate(): Could not determine a key on the table in order to check existing data.");

                                    var st = qbInfo.getSelectStatement(["*"]) + ` where ` + existingWhere;

                                    console.log(`Query to find existing records: '${st}'.`);

                                    this.query(st).then((result: ISelectQueryResult) => {

                                        var recordSet = result.response;

                                        if (recordSet.length) {
                                            console.log(`Existing records: '${recordSet.length}'; First record: ` + JSON.stringify(recordSet));

                                            qbInfo.existingTableData = recordSet[0]; // (we have key values also now)

                                            // ... this is where we update the existing record entry ...
                                            // (we will also copy over any existing values for calculated columns)
                                            st = qbInfo.updateCalculcatedColumns(calculatedColumns)
                                                .getUpdateStatement();

                                            console.log(`Update statement: ` + st);
                                            console.log(`Update values: ` + JSON.stringify(qbInfo.values));

                                            this.query(st).then((result: IUpdaeQueryResult) => {
                                                var msg = `Success: existing entry in table '${tableName}' updated.`
                                                    + "\r\nResult: " + JSON.stringify(result);
                                                this.end();
                                                resolve(res, { builder: qbInfo, success: true, message: msg }, msg);
                                            },
                                                (err) => { reject(rej, this.adapter.getSQLErrorMessage(err)); });
                                        } else {
                                            var msg = "No existing record was found to update.";
                                            resolve(res, { builder: qbInfo, success: false, message: msg }, msg);
                                        }
                                    },
                                        (err) => {
                                            this.end();
                                            return reject(rej, this.adapter.getSQLErrorMessage(err));
                                        });
                                },
                                    (reason) => { this.end(); reject(rej, reason, "Failed to build query information."); }); // (in case the query info building fails)
                        },
                            (err) => reject(rej, this.adapter.getSQLErrorMessage(err))
                        );
                    }
                    catch (err) { console.log(err); rej(err); }

                });
            }
        }

        /** Holds values for building a query statement. */
        export class QueryBuilder {
            /** The table name to build a query for. */
            tableName: string;

            /** A mapping of values by column name. The values should be stored by the table column name (which is the translated name
             * if translations are used). */
            values: IColumnValue[];

            /** If exists, this references existing table data (one level only, no nested arrays or objects).
             * Existing table data should be provided before calling 'updateCalculcatedColumns()'.
             */
            existingTableData?: IndexedObject;

            /** The columns, in order, for the table.  Usually this is read from the current table schema. */
            columnInfo: IColumnInfoMap;

            /** The statement that is built when calling one of the 'get[Insert|Update|Select]Statement()' functions. */
            statement?: string;

            /** If set, these will be the key names that override the existing primary keys.  
             * This is helpful when a table has an internal primary key, and also contains a unique external ID.
             */
            alternateKeys: string[];

            /** Set to true to force case sensitive matches. */
            caseSensitive?: boolean;

            constructor(public readonly connection: DBConnection, tableName: string, columnInfo?: IColumnInfoMap) {
                this.tableName = tableName;
                this.values = [];
                this.columnInfo = columnInfo;
            }

            private _match(s1: string, s2: string): boolean {
                if (typeof s1 != 'string' || typeof s2 != 'string') return false;
                return this.caseSensitive ? s1 == s2 : s1.toUpperCase() == s2.toUpperCase();
            }

            private _indexOf(strArray: string[], str: string): number {
                if (strArray && strArray.length) {
                    var i = strArray.indexOf ? strArray.indexOf(str) : -1;
                    if (i >= 0) // (if fast lookup fails, and not case-sensitive, iterate to find the index using '_match')
                        return i;
                    else if (!this.caseSensitive)
                        for (var i = 0, n = strArray.length; i < n; ++i)
                            if (this._match(strArray[i], str)) return i;
                }
                return -1;
            }

            /** Returns the index of the table column name from the list of column values. */
            columnValueIndex(tableColumnName: string) {
                for (var i = 0, n = this.values.length; i < n; ++i)
                    if (this._match(this.values[i].columnName, tableColumnName)) return i;
                return -1;
            }

            /** Sets a value on the query builder, which is typically used as argument values to query parameters. */
            setValue(tableColumnName: string, value: string): this {
                if (!this.values || !this.values.push)
                    this.values = [];
                var i = this.columnValueIndex(tableColumnName);
                if (i >= 0)
                    this.values[i].value = value; // (update existing value)
                else
                    this.values.push({ columnName: tableColumnName, value: value }); // (add new value)
                return this;
            }

            hasValueColumn(tableColumnName: string): boolean {
                return this.columnValueIndex(tableColumnName) >= 0;
            }

            /** Returns a value that was set on the query builder.
             * If a set value is not found, and existing table data exists, the current table value is returned. */
            getValue(tableColumnName: string): any {
                var i = this.columnValueIndex(tableColumnName);
                var v = typeof this.values[i] !== 'undefined' && this.values[i] || this.existingTableData && this.existingTableData[tableColumnName];
                return v !== null && typeof v == 'object' ? v.value : v;
            }

            /** Returns an existing table value, or if not specified/undefined, a value that was set on the query builder.
             * This is the reverse of 'getValue()'. */
            getExistingValue(tableColumnName: string): any {
                var v = this.existingTableData && this.existingTableData[tableColumnName];
                if (typeof v === 'undefined') v = this.values[this.columnValueIndex(tableColumnName)];
                return v !== null && typeof v == 'object' ? v.value : v;
            }

            /** Returns a list of columns pulled from the query values, in order of the values added.
             * These are the columns that will be used to construct the final query statement.
             */
            getColumns(includeAutoIncKeys?: boolean): string[] {
                var c: string[] = [];
                for (var i = 0, n = this.values.length; i < n; ++i)
                    if (includeAutoIncKeys || !this.isAutoIncKey(this.values[i].columnName))
                        c.push(this.values[i].columnName);
                return c;
            }

            /** Returns a list of values pulled from the query values, in order of the values added.
             * Each value is converted as required based on the target column info (by calling 'getColumnInfo(value.columnName)' and passing
             * it to 'valueToStr()'). If no column info is found, then conversion checking is skipped and the value is returned as is.
             * These are the values that will be passed to the final query statement parameters (in the same order as the columns
             * returned from 'getColumns()').
             */
            getValues(): any[] {
                var v: any[] = [];
                for (var i = 0, n = this.values.length; i < n; ++i)
                    v.push(this.values[i].value);
                return v;
            }

            /** Returns the names of the primary keys for the table, as described by the underlying table schema (i.e. ignoring 'alternateKeys'). */
            getPrimaryKeys(): string[] {
                var v: string[] = [];
                for (var p in this.columnInfo)
                    if (this.columnInfo[p].Key == "PRI")
                        v.push(p);
                return v;
            }

            /** Returns the names of the keys for the query builder. 
             * 'alternateKeys' is returned if exists, otherwise the value from 'getPrimaryKeys()' is returned.
             */
            getKeys(): string[] {
                if (this.alternateKeys && this.alternateKeys.length) // TODO: Consider returning a copy of this instead, to be safe.
                    return this.alternateKeys; // (user has overridden the key names)
                return this.getPrimaryKeys();
            }

            /** Returns the column information for a column by name, if it exists, or 'undefined' otherwise.
             */
            getColumnInfo(name: string): IColumnInfo {
                if (!this.columnInfo) return void 0;
                var ci = this.columnInfo[name];
                if (ci) return ci;
                ci = this.columnInfo[StringUtils.toString(name).toLowerCase()];
                if (ci) return ci;
                // ... failed fast lookups; need to enumerate to find any matches now ...
                for (var p in this.columnInfo)
                    if (this._match(name, p))
                        return this.columnInfo[p];
                return void 0;
            }

            /** Returns true if the specified name is recognized as a unique column for the table. */
            isKey(name: string): boolean {
                var ci: IColumnInfo;
                return this._indexOf(this.alternateKeys, name) >= 0 || (ci = this.getColumnInfo(name)) && ci.Key == "PRI"; // TODO: 'PRI', etc., needs to more abstracted.
            }

            /** Returns true if the specified name is recognized as a primary key that auto increments. 
             * This can only work if the table schema was already pulled for reference.
             * This function ignores the alternate keys, since alternate keys are rarely primary keys that also auto increment.
             */
            isAutoIncKey(name: string): boolean {
                var ci: IColumnInfo;
                return (ci = this.getColumnInfo(name)) && ci.Key == "PRI" && ci.Extra && ci.Extra.indexOf('auto') >= 0; // TODO: 'PRI', etc., needs to more abstracted.
            }

            /** Returns a '{ name: value, ... }' object based on the primary keys and values in the query builder, or 'undefined' if there are no keys.
             * Note: The value of the key returned is taken from the first non-undefined value, starting with the existing
             * table data, then the current values being set (since keys are rarely, if ever, updated).
             */
            getKeyValues(): IKeys {
                var kvs: IKeys;
                var keys = this.getKeys();
                for (var i = 0, n = keys.length, k; i < n; ++i) {
                    var v = this.getExistingValue(k = keys[i]);
                    if (v === void 0)
                        throw `getKeyValues() Error: There is no value for primary key '${k}' in the query builder (associated with table '${this.tableName}'). You may have to explicitly set key names using the 'alternateKeys' property.`;
                    if (!kvs) kvs = {};
                    kvs[k] = v;
                }
                return kvs;
            }

            /** Returns an array of 'keyName=keyValue' strings that can be joined for query statements, or an empty array if no keys can be determined. 
             * Note: The value of the key returned is taken from the first non-undefined value, starting with the existing
             * table data, then the current values being set (since keys are rarely, if ever, updated).
             */
            getKeyNameValues(): string[] {
                var values = this.getKeyValues();
                var knv: string[] = [];
                for (var p in values)
                    knv.push(p + `=${valueToStr(values[p], this.columnInfo[p])}`);
                return knv;
            }

            /** Goes through the query builder values and applies the dynamic updates to matching columns.
              * This is usually called just before an insert or update query needs to be built.
              * The function returns the same IQueryBuilderInfo instance passed in.
              * @param existingTableData This is usually a SINGLE previous select-query result entry to include in the calculations (flat properties and values only).  Only use this parameter if you didn't already set the 'existingTableData' property on the query builder.
              */
            updateCalculcatedColumns(calculatedColumns?: ICalculatedColumns, existingTableData?: IndexedObject): this {

                if (!existingTableData) existingTableData = this.existingTableData;

                // ... for each table column, look for a function to execute (calculated columns) ...

                if (calculatedColumns)
                    for (var p in this.columnInfo) { // (note: columnInfo is ALL the table columns previously queried)
                        var cc = calculatedColumns[p]; // (check if a function or static value exists)
                        if (typeof cc == 'undefined') {
                            if (p in calculatedColumns)
                                console.warn(`A translation exists for table '${this.tableName}' column '${p}', but the value is undefined.`);
                        } else { // (if not yet already added to the list of columns [will not replace existing data supplied] ...)
                            var currentValue = this.getValue(p);
                            if (typeof cc == 'function') {
                                var calculatedValue = cc(currentValue);
                            } else calculatedValue = cc;

                            if (currentValue !== calculatedValue) // (don't bother to include values that never changed)
                                this.setValue(p, calculatedValue);
                        }
                    }

                return this;
            }

            /** Returns the internal values as strings ready to be placed into an SQL statement. 
             * The order is the sames as the 'values' array. Primary keys are ignored.
             * @param includeKeys True to include primary keys, and false otherwise.  When false, the 'includeAutoIncKey' parameter is ignored.
             * @param includeAutoIncKey When 'includeKeys' is true, pass true to include primary keys, and false otherwise.  When false, the 'includeAutoIncKey' parameter is ignored.
             */
            getSQLReadyValues(includeKeys = false, includeAutoIncKey = false): IColumnValue[] {
                var values: IColumnValue[] = [];

                // ... first, handle the values explicitly set (note: we are not supporting parameter based inserts in order to be consistent) ...

                for (var i = 0, n = this.values.length; i < n; ++i) {
                    // .. do not include primary keys ...
                    var v = this.values[i];

                    if (v === void 0 || !includeKeys && this.isKey(v.columnName) || !includeAutoIncKey && this.isAutoIncKey(v.columnName))
                        continue; // (skip undefined values, but we will process null correctly; also, never update primary keys)

                    values.push({ columnName: v.columnName, value: valueToStr(v.value, this.columnInfo[v.columnName]) });
                }

                return values;
            }

            /**
             * Constructs an 'insert' statement from the given query information.
             */
            getInsertStatement(): string {
                var values = this.getSQLReadyValues(true);
                if (values.length > 0) {
                    //if (columns.length != values.length)
                    //    throw `Cannot create 'insert' statement for table ${this.tableName}: the column count does not match the values count.`;
                    var columns = this.getColumns(); // (note: 'getColumns()' returns the columns in the correct 'this.values' array order)
                    var convertedValues: string[] = values.map((v) => v.value);
                    this.statement = "insert into " + this.tableName + " (" + columns.join(',') + `) values (${convertedValues.join(',')})`;
                }
                else
                    this.statement = "/* No values to insert with. */";
                return this.statement;
            }

            /**
             * Constructs an 'update' statement from the given query information.
             * @param where A 'where' clause that usually selects a record by unique value(s) for updating.
             * If this is not specified, then the primary key(s) values will be used, if they exist, otherwise an error will be thrown.
              * @param existingTableData This is usually a SINGLE previous select-query result entry to include in the calculations (flat properties and values only).  Only use this parameter if you didn't already set the 'existingTableData' property on the query builder.
             */
            getUpdateStatement(where?: string, existingTableData?: IndexedObject): string {

                if (!existingTableData) existingTableData = this.existingTableData;

                var values = this.getSQLReadyValues();
                var nameValues: string[] = values.map((v) => v.columnName + `=${v.value}`);
                var whereConditions: string[] = [];

                // ... next, try to pull any key values from existing data if we need to build a 'where' clause ...

                if (!where)
                    whereConditions = this.getKeyNameValues();

                if (!where && whereConditions && whereConditions.length) {
                    where = whereConditions.join(' AND ');
                    console.log("Auto created update 'where' clause using these 'key=value' pairs: \r\n" + whereConditions.join("\r\n"));
                }

                var columnsToSet = nameValues.join(',');

                if (columnsToSet) {
                    if (!where)
                        throw `Cannot create 'update' statement for table ${this.tableName}: the 'where' clause could not be determined.`;
                    this.statement = "update " + this.tableName + " set " + columnsToSet + ` where ` + where + ";";
                } else
                    this.statement = "/* No values to update with. */";

                return this.statement;
            }

            /**
             * Constructs a 'select' statement from the given query information.
             * To query all columns override the columns with '["*"]'.
             * Note 1: Only columns with values are included in the select. When no values exist, '*' is assumed.
             * Note 2: No 'where' clause is added. This allows the caller to construct one based on the IQueryBuilderInfo supplied.
             * @param columns An override to specify which columns to include in the query.
             */
            getSelectStatement(columns?: string[]): string {
                this.statement = "select " + ((columns || this.getColumns()).join(',') || "*") + " from " + this.tableName;
                return this.statement;
            }


        }

        /**
         * Converts a value to a string based on column information.
         * @param {any} val
         * @param {IColumnInfo} colInfo
         * @returns
         */
        export function valueToStr(val: any, colInfo: IColumnInfo) {
            if (isNullOrUndefined(val)) return 'null';
            if (colInfo) {
                var type = colInfo.Type.toLowerCase();
                if (type.indexOf('timestamp') >= 0 || type.indexOf('datetime') >= 0) {
                    return "'" + DS.StringUtils.escapeString(StringUtils.toString(val).trim(), true) + "'";
                } else if (type.indexOf('int') >= 0 || type.indexOf('bigint') >= 0) {
                    var i = +val;
                    if (isNaN(i)) throw `Cannot convert value ${JSON.stringify(val)} to 'int'.`;
                    return StringUtils.toString(val).trim();
                } else if (type.indexOf('varchar') >= 0 || type.indexOf('nchar') >= 0 || type.indexOf('text') >= 0 || type.indexOf('tinytext') >= 0) {
                    val = `'${DS.StringUtils.escapeString(val, true)}'`;
                    if ((<string>val).indexOf('?') >= 0)
                        val = "concat(" + val.replace(/\?/g, "',char(63),'") + ")"; // (question chars, used as input params by the mysql module, will break the process, so add these a special way)
                    return val;
                } else if (type.indexOf('bit') >= 0) {
                    val = val !== false && (typeof val != 'string' || val.toLowerCase() != "false" && val.toLowerCase() != "no") && val !== '0' && val !== 0;
                    return val ? '1' : '0';
                }
            }
            return "'" + DS.StringUtils.escapeString(val, true) + "'"; // (just use the default, which is typically with single quotes)
        }

        export function getMySQLUTCDate() {
            return new Date().toISOString().replace('T', " ").replace(/\.\d+Z/, "");
        }
    }
}