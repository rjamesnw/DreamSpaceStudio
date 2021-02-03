/*
 * Connects to the SafePoint database to analyze for issues.
 */
import express = require('express');

var db = new DS.DB.MSSQL.MSSQLAdapter();
var conn: DS.DB.MSSQL.MSSQLConnection;

async function _getConnection() {
    //if (this._BotPalConn && (this._BotPalConn.connection.state == 'connected' || this._BotPalConn.connection.state == 'authenticated'))
    //    return this._BotPalConn;
    return conn || (conn = await db.createConnection()); // (uses the environment default values)
}

//let newFile = new TTSFile();
//newFile.filename = DS.Path.getName(targetFilename);
//newFile.voice_code = DS.StringUtils.isEmptyOrWhitespace(voiceCode) ? null : voiceCode;
//newFile.location = DS.Path.getPath(targetFilename);
//newFile.text = text;
//var conn = await this._getConnection();
//await conn.updateOrInsert(newFile, "tts_files");


export async function get(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    var json = { msg: "OK" };

    try {
        var result = await db.query<any>("SELECT display FROM staff where sites_id = 1");

        console.log("Query Result:" + JSON.stringify(result));

        json = result.response;

        res.status(200).json(json);
        //? res.end();

        return Promise.resolve();
    }
    catch (ex) {
        return Promise.reject(ex);
    }
};

