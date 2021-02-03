"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = void 0;
var db = new DS.DB.MSSQL.MSSQLAdapter();
var conn;
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
async function get(req, res, next) {
    var json = { msg: "OK" };
    try {
        var result = await db.query("SELECT display FROM staff where sites_id = 1");
        console.log("Query Result:" + JSON.stringify(result));
        json = result.response;
        res.status(200).json(json);
        //? res.end();
        return Promise.resolve();
    }
    catch (ex) {
        return Promise.reject(ex);
    }
}
exports.get = get;
;
//# sourceMappingURL=analyze.js.map