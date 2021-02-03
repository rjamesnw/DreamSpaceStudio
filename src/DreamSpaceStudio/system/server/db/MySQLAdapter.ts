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

    function _defaultConfig(): ConnectionConfig {
        return {
            host: process.env.MYSQL_HOST || "localhost",
            port: +process.env.MYSQL_PORT || void 0,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASS,
            database: process.env.MYSQL_DB_NAME
        };
    }

    export var connectionPool: Pool;

    export async function configureConnectionPool(config = _defaultConfig()) {
        connectionPool = mysql.createPool(config);
    }

    /**
     * Returns a MySQL connection from the connection pool using the specified configuration, or a default one if not specified.
     * @returns
     */
    export async function getMySQLConnection(config = _defaultConfig()) {
        if (!connectionPool)
            configureConnectionPool(config);
        return new Promise<PoolConnection>((res, rej) =>
            connectionPool.getConnection(function (err, conn) {
                if (err) {
                    var msg = "Error getting a MySQL connection from the pool: " + JSON.stringify(err);
                    error('getMySQLConnection()', msg);
                    return rej(msg);
                }
                res(conn);
            }));
    };

    export class MySQLAdapter extends DBAdapter<ConnectionConfig> {
        constructor(config = _defaultConfig()) {
            super(config);
        }

        async createConnection() {
            return new MySQLConnection(this, await getMySQLConnection(this.configuration)); // (create from the default pool)
        }

        getSQLErrorMessage(err: MysqlError) {
            if (typeof err != 'object') return super.getSQLErrorMessage(err);
            return `SQL failed with code ${err.code} and error number ${err.errno}: ${err.message}\r\n\r\nSQL message: ${err.sqlMessage}\r\n\r\n${err.stack}`;
        }
    }

    export interface IMySQLSelectQueryResult extends ISelectQueryResult {
        fields?: FieldInfo[];
    }

    export interface IMySQLInsertResult extends IInsertResult {
        fieldCount: number;
        serverStatus: number;
        warningCount: number;
        message: string;
        protocol41: boolean;
    }

    export interface IMySQLInsertQueryResult extends IInsertQueryResult<IMySQLInsertResult> {
        fields?: FieldInfo[];
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

        query<T>(statement: string, values?: any): Promise<IQueryResult<T>> {
            return new Promise<any>((res, rej) => {
                if (values !== void 0)
                    return this.connection.query(statement, values, (err, result, fields) => {
                        if (err) rej(err);
                        else res(<ISelectQueryResult>{ response: result, fields: fields });
                    });
                else
                    return this.connection.query(statement, (err, result, fields) => {
                        if (err) rej(err);
                        else res(<ISelectQueryResult>{ response: result, fields: fields });
                    });
            });
        }

        getColumnDetails(tableName: string): Promise<IColumnInfo[]> {
            return new Promise<IColumnInfo[]>((res, rej) => {
                this.query('SHOW COLUMNS FROM ' + tableName).then((result: ISelectQueryResult) => {
                    resolve(res, result.response, `Column details received for table '${tableName}': ${JSON.stringify(result)}`);
                }, (err) => {
                    reject(rej, err, `Failed to get column details for table '${tableName}'.`);
                });
            });
        }

        async end() {
            if (this.connection)
                await new Promise((res, rej) => this.connection.end((err) => { if (err) reject(rej, err); else resolve(res); }));
        }
    }
}