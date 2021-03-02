"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWBConnection = exports.getSPConnection = exports.getCDSConnection = exports.wb_conn = exports.sp_conn = exports.cds_conn = exports.sp_db = exports.wb_db = exports.cds_db = void 0;
exports.cds_db = new DS.DB.MSSQL.MSSQLAdapter({
    user: process.env.CDS_MSSQL_USER,
    password: process.env.CDS_MSSQL_PASS,
    server: process.env.CDS_MSSQL_HOST + (process.env.CDS_MSSQL_INSTANCE ? '\\' + process.env.CDS_MSSQL_INSTANCE : ''),
    database: process.env.CDS_MSSQL_DB_NAME,
    options: {
        encrypt: false // Set this to true if you're on Windows Azure (default is false)
    }
});
exports.wb_db = new DS.DB.MSSQL.MSSQLAdapter({
    user: process.env.WB_MSSQL_USER,
    password: process.env.WB_MSSQL_PASS,
    server: process.env.WB_MSSQL_HOST + (process.env.WB_MSSQL_INSTANCE ? '\\' + process.env.WB_MSSQL_INSTANCE : ''),
    database: process.env.WB_MSSQL_DB_NAME,
    options: {
        encrypt: false // Set this to true if you're on Windows Azure (default is false)
    }
});
exports.sp_db = new DS.DB.MSSQL.MSSQLAdapter({
    user: process.env.SP_MSSQL_USER,
    password: process.env.SP_MSSQL_PASS,
    server: process.env.SP_MSSQL_HOST + (process.env.SP_MSSQL_INSTANCE ? '\\' + process.env.SP_MSSQL_INSTANCE : ''),
    database: process.env.SP_MSSQL_DB_NAME,
    options: {
        encrypt: false // Set this to true if you're on Windows Azure (default is false)
    }
});
async function getCDSConnection() {
    //if (this._BotPalConn && (this._BotPalConn.connection.state == 'connected' || this._BotPalConn.connection.state == 'authenticated'))
    //    return this._BotPalConn;
    return exports.cds_conn || (exports.cds_conn = await exports.cds_db.createConnection()); // (uses the environment default values)
}
exports.getCDSConnection = getCDSConnection;
async function getSPConnection() {
    //if (this._BotPalConn && (this._BotPalConn.connection.state == 'connected' || this._BotPalConn.connection.state == 'authenticated'))
    //    return this._BotPalConn;
    return exports.sp_conn || (exports.sp_conn = await exports.sp_db.createConnection()); // (uses the environment default values)
}
exports.getSPConnection = getSPConnection;
async function getWBConnection() {
    //if (this._BotPalConn && (this._BotPalConn.connection.state == 'connected' || this._BotPalConn.connection.state == 'authenticated'))
    //    return this._BotPalConn;
    return exports.wb_conn || (exports.wb_conn = await exports.wb_db.createConnection()); // (uses the environment default values)
}
exports.getWBConnection = getWBConnection;
//# sourceMappingURL=db.js.map