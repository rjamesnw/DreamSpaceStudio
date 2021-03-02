//import type { MysqlError, ConnectionConfig } from 'mysql';

namespace DS.DB.MySQL {
    //x var debug: typeof import("debug") = require("debug");
    //x var log = debug("ICE:MySQL");
    //x var error = debug("ICE:MySQL:ERROR");

    export declare var mysql: typeof import("mysql");
    var _mysql: typeof import("mysql");

    Object.defineProperty(MySQL, 'mysql', {
        get: () => {
            return _mysql || (_mysql = require("mysql"));
        },
        set: (v: typeof _mysql) => {
            if (v) _mysql = v;
        }
    });

    export type ConnectionConfig = import("mysql").ConnectionConfig;
    export type MysqlError = import("mysql").MysqlError;
    export type FieldInfo = import("mysql").FieldInfo;
    export type Connection = import("mysql").Connection;
    export type Pool = import("mysql").Pool;
    export type PoolConnection = import("mysql").PoolConnection;
    export type OkPacket = import("mysql").OkPacket;

    export interface IMySQLColumnInfo {
        Field: string, // (name)
        Type: string; //(example: 'int(11) unsigned')
        Null: 'YES' | 'NO'; //('YES/'NO')
        Key: 'PRI' | 'MUL'; //('PRI'/'NUL')
        Default: string; // (NULL/0/default value)
        Extra: 'auto_increment'; //('auto_increment')
    }

    function _defaultConfig(): ConnectionConfig {
        return {
            host: process.env.MYSQL_HOST || "localhost",
            port: +process.env.MYSQL_PORT || void 0,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASS,
            database: process.env.MYSQL_DB_NAME
        };
    }

    export class MySQLAdapter extends DBAdapter<ConnectionConfig, Pool> {
        constructor(config = _defaultConfig()) {
            super(config);
        }

        /**
          * Returns a MySQL connection from the connection pool using the specified configuration, or a default one if not specified.
          * @returns
          */
        private async _getConnection() {
            if (!this.connectionPool)
                this.connectionPool = mysql.createPool(this.configuration || (this.configuration = _defaultConfig()));
            return new Promise<PoolConnection>((res, rej) =>
                this.connectionPool.getConnection(function (err, conn) {
                    if (err) {
                        var msg = "Error getting a MySQL connection from the pool: " + JSON.stringify(err);
                        error('getMySQLConnection()', msg);
                        return rej(msg);
                    }
                    res(conn);
                }));
        };

        async createConnection() {
            return new MySQLConnection(this, await this._getConnection()); // (create from the default pool)
        }

        async closeConnectionPool() {
            if (this.connectionPool) {
                this.connectionPool.end();
                this.connectionPool = null;
            }
        }

        getSQLErrorMessage(err: MysqlError) {
            if (typeof err != 'object') return super.getSQLErrorMessage(err);
            return `SQL failed with code ${err.code} and error number ${err.errno}: ${err.message}\r\n\r\nSQL message: ${err.sqlMessage}\r\n\r\n${err.stack}`;
        }
    }

    export interface IMySQLSelectQueryResult extends ISelectQueryResult {
        fields?: FieldInfo[];
    }

    export interface IMySQLInsertResult extends IInsertResult, OkPacket {
    }

    export interface IMySQLInsertQueryResult extends IInsertQueryResult<IMySQLInsertResult> {
        fields?: FieldInfo[];
    }

    export function typeFromMySQLType(type: string): ColumnDataTypes | undefined {
        var typeStr = type.toLowerCase();
        if (typeStr.includes('bit') || typeStr.includes('bool')) return ColumnDataTypes.Boolean;
        if (typeStr.includes('int') || typeStr.includes('dec'/*decimal*/) || typeStr.includes('double')
            || typeStr.includes('money') || typeStr.includes('float') || typeStr.includes('real') || typeStr.includes('year')) return ColumnDataTypes.Number;
        if (typeStr.includes('date') || typeStr.includes('time')) return ColumnDataTypes.DateTime;
        if (typeStr.includes('char') || typeStr.includes('text') || typeStr.includes('enum') || typeStr.includes('set')) return ColumnDataTypes.String;
        if (typeStr.includes('blob')) return ColumnDataTypes.Binary;
        return void 0;
    }

    export class MySQLConnection extends DBConnection<Connection> {
        constructor(public readonly adapter: MySQLAdapter, connection: Connection) {
            super(adapter, connection);
        }

        async connect() {
            if (this.connection) {
                if (this.connection.state != 'connected' && this.connection.state != 'authenticated') {
                    await new Promise<void>((res, rej) => this.connection.connect((err) => { if (err) reject(rej, err); else resolve(res); }));
                }
                else return Promise.resolve();
            }
            else throw DS.Exception.error("MSSQLConnection.connect()", "No connection reference was set.");
        }

        query<T extends IQueryResult>(statement: string, values?: any): Promise<T> {
            return new Promise<any>((res, rej) => {
                if (values !== void 0)
                    return this.connection.query(statement, values, (err, result, fields) => {
                        if (err) rej(err);
                        else {
                            var isInsert = statement.includes("insert") && statement.includes("into");
                            if (isInsert)
                                res(<IInsertQueryResult>{
                                    response: result,
                                    fields: fields,
                                    changedRows: (<IMySQLInsertResult>result.response)?.changedRows,
                                    insertId: (<IMySQLInsertResult>result.response)?.insertId
                                });
                            else
                                res(<ISelectQueryResult>{ response: result, fields: fields });
                        }
                    });
                else
                    return this.connection.query(statement, (err, result, fields) => {
                        if (err) rej(err);
                        else res(<ISelectQueryResult>{ response: result, fields: fields });
                    });
            });
        }

        async getColumnDetails(tableName: string): Promise<IColumnInfo[]> {
            try {
                var result = await this.query<ISelectQueryResult>('SHOW COLUMNS FROM ' + tableName);
                log('getColumnDetails()', `Column details received for table '${tableName}': ${JSON.stringify(result)}`);
                var cols: IMySQLColumnInfo[] = result.response, columns: IColumnInfo[] = [];
                for (var i = 0, n = cols.length; i < n; ++i) {
                    var col = cols[i];
                    columns.push({
                        Field: col.Field,
                        Key: /PRI|MUL/gi.test(col.Key),
                        Null: col.Null.toLocaleUpperCase() == 'YES' ? true : col.Null.toLocaleUpperCase() == 'NO' ? false : void 0,
                        Type: typeFromMySQLType(col.Type),
                        Default: col.Default,
                        AutoIncrement: col.Extra.includes('auto_increment')
                    });
                }
                return columns;
            }
            catch (err) {
                throw Exception.error('getColumnDetails()', `Failed to get column details for table '${tableName}'.`, this, err);
            }
        }

        async end() {
            if (this.connection)
                await new Promise((res, rej) => this.connection.end((err) => { if (err) reject(rej, err); else resolve(res); }));
        }
    }
}