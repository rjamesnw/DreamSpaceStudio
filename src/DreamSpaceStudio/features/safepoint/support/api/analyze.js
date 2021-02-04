"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = void 0;
const cds_1 = require("../cds");
var cds_db = new DS.DB.MSSQL.MSSQLAdapter({
    user: process.env.CDS_MSSQL_USER,
    password: process.env.CDS_MSSQL_PASS,
    server: process.env.CDS_MSSQL_HOST + (process.env.CDS_MSSQL_INSTANCE ? '\\' + process.env.CDS_MSSQL_INSTANCE : ''),
    database: process.env.CDS_MSSQL_DB_NAME,
    options: {
        encrypt: false // Set this to true if you're on Windows Azure (default is false)
    }
});
var cds_conn;
var sp_db = new DS.DB.MSSQL.MSSQLAdapter({
    user: process.env.SP_MSSQL_USER,
    password: process.env.SP_MSSQL_PASS,
    server: process.env.SP_MSSQL_HOST + (process.env.SP_MSSQL_INSTANCE ? '\\' + process.env.SP_MSSQL_INSTANCE : ''),
    database: process.env.SP_MSSQL_DB_NAME,
    options: {
        encrypt: false // Set this to true if you're on Windows Azure (default is false)
    }
});
var sp_conn;
async function _getCDSConnection() {
    //if (this._BotPalConn && (this._BotPalConn.connection.state == 'connected' || this._BotPalConn.connection.state == 'authenticated'))
    //    return this._BotPalConn;
    return cds_conn || (cds_conn = await sp_db.createConnection()); // (uses the environment default values)
}
async function _getSPConnection() {
    //if (this._BotPalConn && (this._BotPalConn.connection.state == 'connected' || this._BotPalConn.connection.state == 'authenticated'))
    //    return this._BotPalConn;
    return sp_conn || (sp_conn = await sp_db.createConnection()); // (uses the environment default values)
}
//let newFile = new TTSFile();
//newFile.filename = DS.Path.getName(targetFilename);
//newFile.voice_code = DS.StringUtils.isEmptyOrWhitespace(voiceCode) ? null : voiceCode;
//newFile.location = DS.Path.getPath(targetFilename);
//newFile.text = text;
//var conn = await this._getConnection();
//await conn.updateOrInsert(newFile, "tts_files");
async function get(req, res, next) {
    var json, results = [];
    try {
        var staffResuts = await cds_db.query("SELECT * FROM staff where sites_id = @site and username=@username", {
            site: 1,
            username: req.query.username
        });
        //if (staff.response)
        for (var staff of staffResuts.response) {
            let analysis = results[results.length] = new cds_1.Analysis(staff);
            console.log("Checking staff:" + staff.display + "...");
            var directors = await cds_db.query(`select map_directors_units_departments.directors_id, map_directors_units_departments.units_departments_id, programs.display as program, units_departments.display as department
                FROM map_directors_units_departments LEFT OUTER JOIN units_departments ON units_departments.id = map_directors_units_departments.units_departments_id 
                LEFT OUTER JOIN staff ON staff.id = map_directors_units_departments.directors_id
                LEFT OUTER JOIN programs ON programs.id = units_departments.programs_id
                where staff.id = @staff_id`, { staff_id: staff.id });
            var supervisors = await cds_db.query(`select map_supervisors_units_departments.supervisors_id, map_supervisors_units_departments.units_departments_id, programs.display as program, units_departments.display as department
                FROM map_supervisors_units_departments LEFT OUTER JOIN units_departments ON units_departments.id = map_supervisors_units_departments.units_departments_id 
                LEFT OUTER JOIN staff ON staff.id = map_supervisors_units_departments.supervisors_id
                LEFT OUTER JOIN programs ON programs.id = units_departments.programs_id
                where staff.id = @staff_id`, { staff_id: staff.id });
            if (directors.response.length) {
                analysis.messages.push("User is a director.");
                analysis.directorOf = directors.response;
            }
            if (supervisors.response.length) {
                analysis.messages.push("User is a supervisor.");
                analysis.supervisorOf = supervisors.response;
            }
            if (!analysis.directorOf && !analysis.supervisorOf)
                analysis.messages.push("User is not a supervisor or director.");
            var delegates = await sp_db.query(`select * from InvolvedUnitsDepartmentsDelegates where StaffID = @staff_id`, { staff_id: staff.id });
            if (!delegates.response.length)
                analysis.messages.push("User is not a delegate.");
            else
                analysis.messages.push("User is a delegate.");
            var specAuthUsers = await sp_db.query(`select * from SpecialAuthorityUsers where StaffID = @staff_id`, { staff_id: staff.id });
            if (!specAuthUsers.response.length)
                analysis.messages.push("User is not a special authority.");
            else
                analysis.messages.push("User is a special authority.");
        }
        res.status(200).json(results);
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