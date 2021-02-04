/*
 * Connects to the SafePoint database to analyze for issues.
 */
import express = require('express');
import { Analysis, Director, IDepartment, IDelegate, ISpecialAuthority, Staff, Supervisor } from '../cds';

var cds_db = new DS.DB.MSSQL.MSSQLAdapter({
    user: process.env.CDS_MSSQL_USER,
    password: process.env.CDS_MSSQL_PASS,
    server: process.env.CDS_MSSQL_HOST + (process.env.CDS_MSSQL_INSTANCE ? '\\' + process.env.CDS_MSSQL_INSTANCE : ''), // You can use 'localhost\\instance' to connect to named instance
    database: process.env.CDS_MSSQL_DB_NAME,

    options: {
        encrypt: false // Set this to true if you're on Windows Azure (default is false)
    }
});
var cds_conn: DS.DB.MSSQL.MSSQLConnection;

var sp_db = new DS.DB.MSSQL.MSSQLAdapter({
    user: process.env.SP_MSSQL_USER,
    password: process.env.SP_MSSQL_PASS,
    server: process.env.SP_MSSQL_HOST + (process.env.SP_MSSQL_INSTANCE ? '\\' + process.env.SP_MSSQL_INSTANCE : ''), // You can use 'localhost\\instance' to connect to named instance
    database: process.env.SP_MSSQL_DB_NAME,

    options: {
        encrypt: false // Set this to true if you're on Windows Azure (default is false)
    }
});
var sp_conn: DS.DB.MSSQL.MSSQLConnection;

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

export async function get(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    var json: string, results: Analysis[] = [];

    try {
        var staffResuts = await <DS.DB.MSSQL.IMSSQLSelectQueryResult<Staff>>cds_db.query("SELECT * FROM staff where sites_id = @site and username=@username", {
            site: 1,
            username: req.query.username
        });

        //if (staff.response)

        for (var staff of staffResuts.response) {
            let analysis = results[results.length] = new Analysis(staff);
            console.log("Checking staff:" + staff.display + "...");

            var directors = await <DS.DB.MSSQL.IMSSQLSelectQueryResult<IDepartment>>cds_db.query(`select map_directors_units_departments.directors_id, map_directors_units_departments.units_departments_id, programs.display as program, units_departments.display as department
                FROM map_directors_units_departments LEFT OUTER JOIN units_departments ON units_departments.id = map_directors_units_departments.units_departments_id 
                LEFT OUTER JOIN staff ON staff.id = map_directors_units_departments.directors_id
                LEFT OUTER JOIN programs ON programs.id = units_departments.programs_id
                where staff.id = @staff_id`,
                { staff_id: staff.id });

            var supervisors = await <DS.DB.MSSQL.IMSSQLSelectQueryResult<IDepartment>>cds_db.query(`select map_supervisors_units_departments.supervisors_id, map_supervisors_units_departments.units_departments_id, programs.display as program, units_departments.display as department
                FROM map_supervisors_units_departments LEFT OUTER JOIN units_departments ON units_departments.id = map_supervisors_units_departments.units_departments_id 
                LEFT OUTER JOIN staff ON staff.id = map_supervisors_units_departments.supervisors_id
                LEFT OUTER JOIN programs ON programs.id = units_departments.programs_id
                where staff.id = @staff_id`,
                { staff_id: staff.id });

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

            var delegates = await <DS.DB.MSSQL.IMSSQLSelectQueryResult<IDelegate>>sp_db.query(`select * from InvolvedUnitsDepartmentsDelegates where StaffID = @staff_id`,
                { staff_id: staff.id });

            if (!delegates.response.length)
                analysis.messages.push("User is not a delegate.");
            else
                analysis.messages.push("User is a delegate.");

            var specAuthUsers = await <DS.DB.MSSQL.IMSSQLSelectQueryResult<ISpecialAuthority>>sp_db.query(`select * from SpecialAuthorityUsers where StaffID = @staff_id`,
                { staff_id: staff.id });

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
};

