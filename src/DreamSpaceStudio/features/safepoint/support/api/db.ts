export var cds_db = new DS.DB.MSSQL.MSSQLAdapter({
    user: process.env.CDS_MSSQL_USER,
    password: process.env.CDS_MSSQL_PASS,
    server: process.env.CDS_MSSQL_HOST + (process.env.CDS_MSSQL_INSTANCE ? '\\' + process.env.CDS_MSSQL_INSTANCE : ''), // You can use 'localhost\\instance' to connect to named instance
    database: process.env.CDS_MSSQL_DB_NAME,

    options: {
        encrypt: false // Set this to true if you're on Windows Azure (default is false)
    }
});

export var sp_db = new DS.DB.MSSQL.MSSQLAdapter({
    user: process.env.SP_MSSQL_USER,
    password: process.env.SP_MSSQL_PASS,
    server: process.env.SP_MSSQL_HOST + (process.env.SP_MSSQL_INSTANCE ? '\\' + process.env.SP_MSSQL_INSTANCE : ''), // You can use 'localhost\\instance' to connect to named instance
    database: process.env.SP_MSSQL_DB_NAME,

    options: {
        encrypt: false // Set this to true if you're on Windows Azure (default is false)
    }
});

export var cds_conn: DS.DB.MSSQL.MSSQLConnection;
export var sp_conn: DS.DB.MSSQL.MSSQLConnection;

export async function getCDSConnection() {
    //if (this._BotPalConn && (this._BotPalConn.connection.state == 'connected' || this._BotPalConn.connection.state == 'authenticated'))
    //    return this._BotPalConn;
    return cds_conn || (cds_conn = await cds_db.createConnection()); // (uses the environment default values)
}

export async function getSPConnection() {
    //if (this._BotPalConn && (this._BotPalConn.connection.state == 'connected' || this._BotPalConn.connection.state == 'authenticated'))
    //    return this._BotPalConn;
    return sp_conn || (sp_conn = await sp_db.createConnection()); // (uses the environment default values)
}

