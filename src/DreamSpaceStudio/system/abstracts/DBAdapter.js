var DS;
(function (DS) {
    /** Database types and abstracts. */
    let DB;
    (function (DB) {
        //import { reject, escapeString, IndexedObject, resolve } from '../utilities';
        let ColumnDataTypes;
        (function (ColumnDataTypes) {
            ColumnDataTypes[ColumnDataTypes["String"] = 0] = "String";
            ColumnDataTypes[ColumnDataTypes["Number"] = 1] = "Number";
            ColumnDataTypes[ColumnDataTypes["Boolean"] = 2] = "Boolean";
            ColumnDataTypes[ColumnDataTypes["DateTime"] = 3] = "DateTime";
            ColumnDataTypes[ColumnDataTypes["Binary"] = 4] = "Binary";
        })(ColumnDataTypes = DB.ColumnDataTypes || (DB.ColumnDataTypes = {}));
        /** A base class to help support various databases. */
        class DBAdapter {
            constructor(config) { this.configuration = config; }
            /**
             * Query shortcut that simply creates a connection, runs the query, closes the connection, and returns the result.
             * @param statement
             * @param values
             */
            async query(statement, values) {
                var conn = await this.createConnection();
                await conn.connect();
                try {
                    return await conn.query(statement, values);
                }
                finally {
                    await conn.end();
                }
            }
            /** Returns a basic error message. Override this to provide a more detailed error message for the database type. */
            getSQLErrorMessage(err) {
                return `SQL failed:  ${err}`;
            }
        }
        DB.DBAdapter = DBAdapter;
        class DBConnection {
            constructor(adapter, connection) {
                this.adapter = adapter;
                this.connection = connection;
            }
            createQueryBuilder(tableName, columnInfo) {
                return new QueryBuilder(this, tableName, columnInfo);
            }
            /**
             * Constructs the columns and values from a JSON object, table name, and optional translation array.
             * This is used in building the final statement, such as 'insert', or 'update'.
             * @param json The JSON to insert.
             * @param tableName The destination table to insert into.
             * @param columnTranslations An optional object whose properties are JSON property names set to the names of the table columns they map to. If a property doesn't get mapped, a warning is logged.
             */
            async buildQueryInfo(json, tableName, columnTranslations) {
                var data;
                if (typeof json == 'string')
                    data = JSON.parse(json);
                if (json !== void 0 && typeof json != 'object')
                    throw "The given 'json' argument value is not a valid object, or if a string, could not be parsed into one.";
                data = json;
                // ... first get the expected columns ...
                var colResults = await this.getColumnDetails(tableName);
                var colResIndex = {}; // (named index for quick lookups)
                for (var i = 0, n = colResults.length; i < n; ++i)
                    colResIndex[colResults[i].Field.toLowerCase()] = colResults[i];
                var q = this.createQueryBuilder(tableName);
                q.columnInfo = colResIndex;
                // ... for each property of the object, create an array of column names and values ...
                var unmatchedProperties = [];
                for (var p in data) {
                    var translatedProp = p.toLowerCase(), ct;
                    if (columnTranslations && (ct = columnTranslations[p]))
                        translatedProp = (typeof ct == 'string' ? ct : typeof ct == 'function' ? DS.StringUtils.toString(ct(p)) : p).toLowerCase();
                    if (translatedProp)
                        if (colResIndex[translatedProp]) {
                            q.setValue(translatedProp, data[p]);
                        }
                        else {
                            unmatchedProperties.push(`${p}=>${translatedProp}`);
                        }
                }
                if (unmatchedProperties.length)
                    console.warn(`One or more JSON properties do not have a corresponding column target for table '${tableName}'. Provide column translations, or review any existing ones. To ignore a property, set the translation to anything other than a string.`
                        + `\r\nUnmapped properties are as follows:\r\n` + unmatchedProperties.join('\r\n'));
                return q;
            }
            updateOrInsert(data, tableName, onQueryBuilderReady, columnTranslations, calculatedColumns) {
                console.log(`*** Insert or update requested for table '${tableName}' ...`);
                return new Promise((res, rej) => {
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
                            this.query(st).then((result) => {
                                var msg = `Success: New entry create in table '${tableName}'.`
                                    + "\r\nResult: " + JSON.stringify(result);
                                // ... copy insert key value to existing table data ...
                                var keys = qbInfo.getPrimaryKeys();
                                if (keys)
                                    if (keys.length == 1) {
                                        if (!qbInfo.existingTableData)
                                            qbInfo.existingTableData = {};
                                        console.log("Insert Key Result: " + keys[0] + "=" + result.insertId);
                                        qbInfo.existingTableData[keys[0]] = result.insertId;
                                    }
                                    else if (keys.length > 1)
                                        console.warn("Since the insert was done using a composite key (multiple columns) no insert ID could be returned from the execution (it only works for single auto-increment key fields).");
                                this.end();
                                DS.resolve(res, { builder: qbInfo, success: true, message: msg }, msg);
                            }, (err) => {
                                this.end();
                                DS.reject(rej, this.adapter.getSQLErrorMessage(err));
                            });
                        }
                    }, (err) => { rej(err); });
                });
            }
            /** Only performs an update of existing data. If no data exists, null is returned. */
            update(data, tableName, onQueryBuilderReady, columnTranslations, calculatedColumns) {
                console.log(`*** Update requested for table '${tableName}' ...`);
                return new Promise((res, rej) => {
                    try {
                        this.connect().then(() => {
                            console.log(`Connected to database. Building database query information to update table '${tableName}' ...`);
                            // ... get the SQL statement to check existing records ...
                            this.buildQueryInfo(data, tableName, columnTranslations)
                                .then((qbInfo) => {
                                console.log(`Created initial layout from existing table schema for table '${tableName}'.`);
                                onQueryBuilderReady && onQueryBuilderReady(qbInfo);
                                var existingWhere = qbInfo.getKeyNameValues(false).join(' AND ');
                                if (!existingWhere) {
                                    var msg = "update(): No key values found in order to check existing data, so assuming no data exists.";
                                    return DS.resolve(res, { builder: qbInfo, success: false, message: msg }, msg);
                                }
                                var st = qbInfo.getSelectStatement(["*"]) + ` where ` + existingWhere;
                                console.log(`Query to find existing records: '${st}'.`);
                                this.query(st).then((result) => {
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
                                        this.query(st).then((result) => {
                                            var msg = `Success: existing entry in table '${tableName}' updated.`
                                                + "\r\nResult: " + JSON.stringify(result);
                                            this.end();
                                            DS.resolve(res, { builder: qbInfo, success: true, message: msg }, msg);
                                        }, (err) => { DS.reject(rej, this.adapter.getSQLErrorMessage(err)); });
                                    }
                                    else {
                                        var msg = "No existing record was found to update.";
                                        DS.resolve(res, { builder: qbInfo, success: false, message: msg }, msg);
                                    }
                                }, (err) => {
                                    this.end();
                                    return DS.reject(rej, this.adapter.getSQLErrorMessage(err));
                                });
                            }, (reason) => { this.end(); DS.reject(rej, reason, "Failed to build query information."); }); // (in case the query info building fails)
                        }, (err) => DS.reject(rej, this.adapter.getSQLErrorMessage(err)));
                    }
                    catch (err) {
                        console.log(err);
                        rej(err);
                    }
                });
            }
        }
        DB.DBConnection = DBConnection;
        /** Holds values for building a query statement. */
        class QueryBuilder {
            constructor(connection, tableName, columnInfo) {
                this.connection = connection;
                this.tableName = tableName;
                this.values = [];
                this.columnInfo = columnInfo;
            }
            _match(s1, s2) {
                if (typeof s1 != 'string' || typeof s2 != 'string')
                    return false;
                return this.caseSensitive ? s1 == s2 : s1.toUpperCase() == s2.toUpperCase();
            }
            _indexOf(strArray, str) {
                if (strArray && strArray.length) {
                    var i = strArray.indexOf ? strArray.indexOf(str) : -1;
                    if (i >= 0) // (if fast lookup fails, and not case-sensitive, iterate to find the index using '_match')
                        return i;
                    else if (!this.caseSensitive)
                        for (var i = 0, n = strArray.length; i < n; ++i)
                            if (this._match(strArray[i], str))
                                return i;
                }
                return -1;
            }
            /** Returns the index of the table column name from the list of column values. */
            columnValueIndex(tableColumnName) {
                for (var i = 0, n = this.values.length; i < n; ++i)
                    if (this._match(this.values[i].columnName, tableColumnName))
                        return i;
                return -1;
            }
            /** Sets a value on the query builder, which is typically used as argument values to query parameters. */
            setValue(tableColumnName, value) {
                if (!this.values || !this.values.push)
                    this.values = [];
                var i = this.columnValueIndex(tableColumnName);
                if (i >= 0)
                    this.values[i].value = value; // (update existing value)
                else
                    this.values.push({ columnName: tableColumnName, value: value }); // (add new value)
                return this;
            }
            hasValueColumn(tableColumnName) {
                return this.columnValueIndex(tableColumnName) >= 0;
            }
            /** Returns a value that was set on the query builder.
             * If a set value is not found, and existing table data exists, the current table value is returned. */
            getValue(tableColumnName) {
                var i = this.columnValueIndex(tableColumnName);
                var v = typeof this.values[i] !== 'undefined' && this.values[i] || this.existingTableData && this.existingTableData[tableColumnName];
                return v !== null && typeof v == 'object' ? v.value : v;
            }
            /** Returns an existing table value, or if not specified/undefined, a value that was set on the query builder.
             * This is the reverse of 'getValue()'. */
            getExistingValue(tableColumnName) {
                var v = this.existingTableData && this.existingTableData[tableColumnName];
                if (typeof v === 'undefined')
                    v = this.values[this.columnValueIndex(tableColumnName)];
                return v !== null && typeof v == 'object' ? v.value : v;
            }
            /** Returns a list of columns pulled from the query values, in order of the values added.
             * These are the columns that will be used to construct the final query statement.
             */
            getColumns(includeAutoIncKeys) {
                var c = [];
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
            getValues() {
                var v = [];
                for (var i = 0, n = this.values.length; i < n; ++i)
                    v.push(this.values[i].value);
                return v;
            }
            /** Returns the names of the primary keys for the table, as described by the underlying table schema (i.e. ignoring 'alternateKeys'). */
            getPrimaryKeys() {
                var v = [];
                for (var p in this.columnInfo)
                    if (this.columnInfo[p].Key)
                        v.push(p);
                return v;
            }
            /** Returns the names of the keys for the query builder.
             * 'alternateKeys' is returned if exists, otherwise the value from 'getPrimaryKeys()' is returned.
             */
            getKeys() {
                if (this.alternateKeys && this.alternateKeys.length) // TODO: Consider returning a copy of this instead, to be safe.
                    return this.alternateKeys; // (user has overridden the key names)
                return this.getPrimaryKeys();
            }
            /** Returns the column information for a column by name, if it exists, or 'undefined' otherwise.
             */
            getColumnInfo(name) {
                if (!this.columnInfo)
                    return void 0;
                var ci = this.columnInfo[name];
                if (ci)
                    return ci;
                ci = this.columnInfo[DS.StringUtils.toString(name).toLowerCase()];
                if (ci)
                    return ci;
                // ... failed fast lookups; need to enumerate to find any matches now ...
                for (var p in this.columnInfo)
                    if (this._match(name, p))
                        return this.columnInfo[p];
                return void 0;
            }
            /** Returns true if the specified name is recognized as a unique column for the table. */
            isKey(name) {
                var ci;
                return this._indexOf(this.alternateKeys, name) >= 0 || (ci = this.getColumnInfo(name)) && ci.Key; // TODO: 'PRI', etc., needs to more abstracted.
            }
            /** Returns true if the specified name is recognized as a primary key that auto increments.
             * This can only work if the table schema was already pulled for reference.
             * This function ignores the alternate keys, since alternate keys are rarely primary keys that also auto increment.
             */
            isAutoIncKey(name) {
                var ci;
                return (ci = this.getColumnInfo(name)) && ci.Key && ci.AutoIncrement; // TODO: 'PRI', etc., needs to more abstracted.
            }
            /** Returns a '{ name: value, ... }' object based on the primary keys and values in the query builder, or 'undefined' if there are no keys.
             * Note: The value of the key returned is taken from the first non-undefined value, starting with the existing
             * table data, then the current values being set (since keys are rarely, if ever, updated).
             * @param required If true (default), an error is thrown if key names are found, but all key values are missing. Typicall this is set to false internally for inserts when first checking if an update operation is required instead.
             * An error is still thrown if one key has a value and other keys do not.
             * @returns An object with key:value properties, or undefined if
             */
            getKeyValues(required = true) {
                var kvs, keys = this.getKeys(), valueCount = 0;
                for (var i = 0, n = keys.length, k; i < n; ++i) {
                    var v = this.getExistingValue(k = keys[i]);
                    if (v === void 0) {
                        if (required)
                            throw DS.Exception.error('getKeyValues()', `There is no value for primary key '${k}' in the query builder (associated with table '${this.tableName}'). If needed, you may have to explicitly set key names using the 'alternateKeys' property.`);
                    }
                    else {
                        if (!kvs)
                            kvs = {};
                        kvs[k] = v;
                        ++valueCount;
                    }
                }
                if (valueCount && valueCount != keys.length) // (all key values must exist, otherwise throw an error)
                    throw DS.Exception.error('getKeyValues()', `If you provide one key value in the query builder, all other key values must be set as well (associated with table '${this.tableName}'). If needed, you may have to explicitly set key names using the 'alternateKeys' property.`);
                return kvs;
            }
            /** Returns an array of 'keyName=keyValue' strings that can be joined for query statements, or an empty array if no keys can be determined.
             * Note: The value of the key returned is taken from the first non-undefined value, starting with the existing
             * table data, then the current values being set (since keys are rarely, if ever, updated).
             * @param required If true (default), an error is thrown if key names are found, but all key values are missing. Typicall this is set to false internally for inserts when first checking if an update operation is required instead.
             * An error is still thrown if one key has a value and other keys do not.
             */
            getKeyNameValues(required = true) {
                var values = this.getKeyValues(required);
                var knv = [];
                for (var p in values)
                    knv.push(p + `=${valueToStr(values[p], this.columnInfo[p])}`);
                return knv;
            }
            /** Goes through the query builder values and applies the dynamic updates to matching columns.
              * This is usually called just before an insert or update query needs to be built.
              * The function returns the same IQueryBuilderInfo instance passed in.
              * @param existingTableData This is usually a SINGLE previous select-query result entry to include in the calculations (flat properties and values only).  Only use this parameter if you didn't already set the 'existingTableData' property on the query builder.
              */
            updateCalculcatedColumns(calculatedColumns, existingTableData) {
                if (!existingTableData)
                    existingTableData = this.existingTableData;
                // ... for each table column, look for a function to execute (calculated columns) ...
                if (calculatedColumns)
                    for (var p in this.columnInfo) { // (note: columnInfo is ALL the table columns previously queried)
                        var cc = calculatedColumns[p]; // (check if a function or static value exists)
                        if (typeof cc == 'undefined') {
                            if (p in calculatedColumns)
                                console.warn(`A translation exists for table '${this.tableName}' column '${p}', but the value is undefined.`);
                        }
                        else { // (if not yet already added to the list of columns [will not replace existing data supplied] ...)
                            var currentValue = this.getValue(p);
                            if (typeof cc == 'function') {
                                var calculatedValue = cc(currentValue);
                            }
                            else
                                calculatedValue = cc;
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
            getSQLReadyValues(includeKeys = false, includeAutoIncKey = false) {
                var values = [];
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
            getInsertStatement() {
                var values = this.getSQLReadyValues(true);
                if (values.length > 0) {
                    //if (columns.length != values.length)
                    //    throw `Cannot create 'insert' statement for table ${this.tableName}: the column count does not match the values count.`;
                    var columns = this.getColumns(); // (note: 'getColumns()' returns the columns in the correct 'this.values' array order)
                    var convertedValues = values.map((v) => v.value);
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
            getUpdateStatement(where, existingTableData) {
                if (!existingTableData)
                    existingTableData = this.existingTableData;
                var values = this.getSQLReadyValues();
                var nameValues = values.map((v) => v.columnName + `=${v.value}`);
                var whereConditions = [];
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
                }
                else
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
            getSelectStatement(columns) {
                this.statement = "select " + ((columns || this.getColumns()).join(',') || "*") + " from " + this.tableName;
                return this.statement;
            }
        }
        DB.QueryBuilder = QueryBuilder;
        /**
         * Converts a value to a string based on column information.
         * @param {any} val
         * @param {IColumnInfo} colInfo
         * @returns
         */
        function valueToStr(val, colInfo) {
            if (DS.isNullOrUndefined(val))
                return 'null';
            if (colInfo) {
                var type = colInfo.Type;
                if (type == ColumnDataTypes.DateTime) {
                    return "'" + DS.StringUtils.escapeString(DS.StringUtils.toString(val).trim(), true) + "'";
                }
                else if (type == ColumnDataTypes.Number) {
                    var i = +val;
                    if (isNaN(i))
                        throw `Cannot convert value ${JSON.stringify(val)} to a number.`;
                    return DS.StringUtils.toString(val).trim();
                }
                else if (type == ColumnDataTypes.String) {
                    val = `'${DS.StringUtils.escapeString(val, true)}'`;
                    if (val.indexOf('?') >= 0)
                        val = "concat(" + val.replace(/\?/g, "',char(63),'") + ")"; // (question chars, used as input params by the mysql module, will break the process, so add these a special way)
                    return val;
                }
                else if (type == ColumnDataTypes.Boolean) {
                    val = val !== false && (typeof val != 'string' || val.toLowerCase() != "false" && val.toLowerCase() != "no") && val !== '0' && val !== 0;
                    return val ? '1' : '0';
                }
            }
            return "'" + DS.StringUtils.escapeString(val, true) + "'"; // (just use the default, which is typically with single quotes)
        }
        DB.valueToStr = valueToStr;
        function getMySQLUTCDate() {
            return new Date().toISOString().replace('T', " ").replace(/\.\d+Z/, "");
        }
        DB.getMySQLUTCDate = getMySQLUTCDate;
    })(DB = DS.DB || (DS.DB = {}));
})(DS || (DS = {}));
//# sourceMappingURL=DBAdapter.js.map