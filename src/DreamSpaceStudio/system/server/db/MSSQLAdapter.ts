//import debug = require("debug");
//import * as auditlog from '../logging';
//import MSSQL = require("mssql");
//import { HL7Message } from '../hl7/HL7Parser';
//import { isDevelopment } from '../environment';
//import { IndexedObject } from '../utilities';
//import { importPostalCodes, addressValidator, canadaPostDataIsAvailable } from "../postalcodes/importPostalCodes";

//var mssqlLog = debug("ICE:pqa/hl7:MSSQL");
//var log = debug("ICE:pqa/hl7:logics");
//var error = debug("ICE:pqa/hl7:logics:ERROR");

namespace DS.DB.MSSQL {
    export declare var mssql: typeof import("mssql");
    var _mssql: typeof import("mssql");

    Object.defineProperty(MSSQL, 'mssql', {
        get: () => {
            return _mssql || (_mssql = require("mssql"));
        },
        set: (v: typeof _mssql) => {
            if (v) _mssql = v;
        }
    });

    export type ConnectionPool = import("mssql").ConnectionPool;
    export type ConnectionConfig = import("mssql").config;
    export type ConnectionError = import("mssql").ConnectionError;
    export type RequestError = import("mssql").RequestError;
    export type IColumnMetadata = import("mssql").IColumnMetadata;
    export type IColumn = import("mssql").IColumn;
    export type IColumnOptions = import("mssql").IColumnOptions;
    export type ISqlType = import("mssql").ISqlType;

    export var connectionPool: ConnectionPool;

    function _defaultConfig(): ConnectionConfig {
        return {
            user: process.env.MSSQL_USER,
            password: process.env.MSSQL_PASS,
            server: process.env.MSSQL_HOST + (process.env.MSSQL_INSTANCE ? '\\' + process.env.MSSQL_INSTANCE : ''), // You can use 'localhost\\instance' to connect to named instance
            database: process.env.MSSQL_DB_NAME,

            options: {
                encrypt: false // Set this to true if you're on Windows Azure (default is false)
            }
        };
    }

    export function configureConnectionPool(config = _defaultConfig()) {
        connectionPool = new mssql.ConnectionPool(config);
    }

    export async function getMSSQLConnection(config = _defaultConfig()) {
        try {
            if (!connectionPool)
                configureConnectionPool(config);

            if (!connectionPool.connected)
                await connectionPool.connect();

            log('getMSSQLConnection()', 'Connected to MSSQL database.')

            return connectionPool;
        } catch (err) {
            console.error(err);
            throw Exception.error('getMSSQLConnection()', 'Error connecting to MSSQL database.', this, err);
        }
    }

    export class MSSQLAdapter extends DBAdapter<ConnectionConfig> {
        constructor(config = _defaultConfig()) {
            super(config);
        }

        async createConnection() {
            return new MSSQLConnection(this, await getMSSQLConnection(this.configuration)); // (create from the default pool)
        }

        getSQLErrorMessage(err: RequestError) {
            if (typeof err != 'object') return super.getSQLErrorMessage(err);
            return `SQL failed with code ${err.code} and error number ${err.number}: ${err.name}\r\n\r\nSQL message: ${err.message}\r\n\r\nLine: ${err.lineNumber}`;
        }
    }

    export interface IMSSQLSelectQueryResult<TRecord = any> extends ISelectQueryResult<IRecordSet<TRecord>> {
        fields?: IColumnMetadata[];
    }

    export interface IMSSQLInsertResult extends IInsertResult {
        fieldCount: number;
        serverStatus: number;
        warningCount: number;
        message: string;
        protocol41: boolean;
    }

    export interface IMSSQLInsertQueryResult extends IInsertQueryResult<IMSSQLInsertResult> {
        fields?: IColumnMetadata[];
    }

    export function typeFromMSSQLType(type: (() => ISqlType) | ISqlType): ColumnDataTypes | undefined {
        var typeStr = ('' + ((<any>type).name ?? type)).toLowerCase();
        if (typeStr.includes('bit')) return ColumnDataTypes.Boolean;
        if (typeStr.includes('int') || typeStr.includes('decimal') || typeStr.includes('numeric')
            || typeStr.includes('money') || typeStr.includes('float') || typeStr.includes('real')) return ColumnDataTypes.Number;
        if (typeStr.includes('date') || typeStr.includes('time')) return ColumnDataTypes.DateTime;
        if (typeStr.includes('char') || typeStr.includes('text') || typeStr.includes('xml')) return ColumnDataTypes.String;
        if (typeStr.includes('binary') || typeStr.includes('image') || typeStr.includes('xml')) return ColumnDataTypes.Binary;
        return void 0;
    }

    export class MSSQLConnection extends DBConnection<ConnectionPool> {
        constructor(public readonly adapter: MSSQLAdapter, connection: ConnectionPool) {
            super(adapter, connection);
        }

        async connect() {
            if (this.connection) {
                if (!this.connection.connecting && !this.connection.connected)
                    await this.connection.connect();
                else
                    return Promise.resolve();
            }
            else throw DS.Exception.error("MSSQLConnection.connect()", "No connection pool reference was set.");
        }

        async query<T extends IQueryResult | IMSSQLSelectQueryResult | IMSSQLInsertResult>(statement: string, parameters?: Object & IndexedObject): Promise<T> {

            try {
                await log('MSSQLConnection.query()', statement, void 0, parameters);

                var request = this.connection.request();

                // ... add the inputs to the request ...

                if (typeof parameters == 'object') {
                    let fields: string[] = [], params: string[] = [], assignments: string[] = [];
                    for (var p in parameters)
                        if (parameters.hasOwnProperty(p)) {
                            fields.push(p);
                            params.push('@' + p);
                            assignments.push(p + '=@' + p);
                            request = request.input(p, parameters[p]);
                        }

                    // ... replace special tokens, if any ...

                    var sql = statement.split('{fields}').join(fields.join(', '));
                    sql = sql.split('{parameters}').join(params.join(', '));
                    sql = sql.split('{assignments}').join(assignments.join(', '));
                }
                else sql = statement;

                var isInsert = sql.includes("insert") && sql.includes("into");
                if (isInsert)
                    sql += "; select SCOPE_IDENTITY() as [$insertId];"; // (return the insert ID once the insert completes)

                var queryResult = await request.query(sql);

                if (isInsert)
                    return <any><IInsertResult>{
                        response: queryResult.recordset,
                        fields: queryResult.recordset?.columns,
                        changedRows: queryResult.rowsAffected && queryResult.rowsAffected[0],
                        insertId: isInsert ? (<any>queryResult.recordset[0])?.$insertId : void 0
                    };
                else
                    return <any><IQueryResult>{ response: queryResult.recordset, fields: queryResult.recordset?.columns };
            }
            catch (err) {
                throw await error('executeQuery(): Failed to execute query.', err, sql);
            }
        }

        async getColumnDetails(tableName: string): Promise<IColumnInfo[]> {
            try {
                //var result = await this.query("SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = N'" + tableName + "'");
                var result = await this.query<IMSSQLSelectQueryResult>(`SELECT top 0 * FROM [${tableName}]`);
                log('getColumnDetails(()', `Column details received for table '${tableName}': ${JSON.stringify(result.fields)}`);
                var colInfo: Object & IColumnMetadata = <any>result.fields, columns: IColumnInfo[] = [];
                for (var p in colInfo)
                    if (colInfo.hasOwnProperty(p)) {
                        var col = colInfo[p];
                        columns.push({ Field: col.name, Key: col.identity, Null: col.nullable, Type: typeFromMSSQLType(col.type), Default: void 0, AutoIncrement: col.identity });
                    }
                return columns;
            }
            catch (err) {
                throw Exception.error('getColumnDetails()', `Failed to get column details for table '${tableName}'.`, this, err);
            }
        }

        async end() {
            if (connectionPool) {
                if (connectionPool.connected || connectionPool.connecting)
                    await connectionPool.close();
                connectionPool = null;
            }
        }
    }

    //async function insertError(msh_id: string, mrn: string, accountnum: string, firstname: string, lastname: string, errordate: string, adtmessage: string, HISInternalID: string, IsPending: boolean, fixederror: number, lastupdated: string): Promise<number> {
    //    try {
    //        log(`Checking if message ID '${msh_id}' already exists ...`);

    //        var patregerr = await executeQuery<IPQA_DB_patregerr>("select id from patregerr where msh_id = " + msh_id);

    //        var id = patregerr.recordset[0]['id'];

    //        if (!id) {
    //            mssqlLog(`Message '${msh_id}' doesn't exist yet, adding it now ...`);

    //            var sql = "insert into patregerr ({fields}) values ({parameters})";
    //            patregerr = await executeQuery<IPQA_DB_patregerr>(sql, { msh_id, mrn, accountnum, firstname, lastname, errordate, adtmessage, HISInternalID, IsPending, fixederror, lastupdated });
    //            sql = "select @@Identity";

    //            mssqlLog(`Getting the inserted message ID ...`);
    //            var idRes = await executeQuery<number>(sql);
    //            id = idRes[0]['@@Identity'];
    //        }
    //        else {
    //            mssqlLog(`Table 'patregerr' already contains record ID '${id}' for message ID ${msh_id} ...`);
    //        }

    //        return id;
    //    }
    //    catch (err) {
    //        throw await auditlog.error('Failed to insert PQA record.', err);
    //    }
    //    finally {
    //        await disconnect();
    //    }
    //}

    //export async function insertErrorDetail(patregerr_id: number, error_type_id: ErrorTypes, error_segment: string, error_desc: string, status: boolean) {
    //    error(error_desc);
    //    /*logger.info("inserting error info" + test[0])*/
    //    var sql = "insert into patregerr_detail ({fields}) values ({parameters})";
    //    try {
    //        var result = await executeQuery<number>(sql, {
    //            patregerr_id, error_type_id, error_segment,
    //            error_desc: error_desc.replace(/\r\n|\r|\n/g, "<br/>"), // (new line chars will break the client, so convert them)
    //            status
    //        });
    //    }
    //    finally {
    //        await disconnect();
    //    }
    //}

    //export async function insertWsibVisits(mrn: string, visit_number: string, patient_name: string, registration_datetime: string, location: string, reason_for_visit: string) {
    //    /*logger.info("inserting error info" + test[0])*/
    //    var sql = "insert into wsib_visits ({fields}) values ({parameters})";
    //    try {
    //        var result = await executeQuery<number>(sql, { mrn, visit_number, patient_name, registration_datetime, location, reason_for_visit });
    //    }
    //    finally {
    //        await disconnect();
    //    }
    //}

    export function convertDateTime(msgDateTime: string) {
        if (msgDateTime.length > 8)
            return msgDateTime.substring(0, 4) + "-" + msgDateTime.substring(4, 6) + "-" + msgDateTime.substring(6, 8) + " " + msgDateTime.substring(8, 10) + ":" + msgDateTime.substring(10);
        else if (msgDateTime.length == 8)
            return msgDateTime.substring(0, 4) + "-" + msgDateTime.substring(4, 6) + "-" + msgDateTime.substring(6, 8);
        else
            return "";
    }

    export function getCurrentDateTime() {
        var now = new Date();
        return now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate() + " " + now.getHours() + ":" + now.getMinutes();
    }

    //export async function processMessage(raw_msg: string) {

    //    var msg = new HL7Message(raw_msg);
    //    var type = msg.getFirstValue('MSH.9.2');

    //    log('HL7 Message type: ' + type);

    //    var registered_by_id = msg.getFirstValue('EVN.5.1');
    //    var msh_id = msg.getFirstValue('MSH.10.1');
    //    var mrn = msg.getFirstValue('PID.3.1');
    //    var account_num = msg.getFirstValue('PID.18.1');
    //    var first_name = msg.getFirstValue('PID.5.2');
    //    var last_name = msg.getFirstValue('PID.5.1');
    //    var evn_date = msg.getFirstValue('EVN.2.1');
    //    var err_id = -1;
    //    var allErrors: string[] = [];
    //    var baseUrl = "http://" + process.env.WEBDOMAIN + "/PQA/PatRegErr/ErrorDetail/";
    //    var linkId = 0;
    //    var isWSIBVisit = false;
    //    var city = msg.getFirstValue('PID.11.3');
    //    var prov = msg.getFirstValue('PID.11.4').replace("'", "''");
    //    var postalCode = msg.getFirstValue('PID.11.5');
    //    var street = msg.getFirstValue('PID.11.1').replace("'", "''");

    //    var processResult = <IProcessResult>{};

    //    processResult.mrn = mrn;
    //    processResult.accountNum = account_num;
    //    processResult.name = last_name + ", " + first_name;

    //    if (type != 'A04') {
    //        log("This message is not an A04 so it will be ignored.");
    //        return processResult;
    //    }

    //    var errorParams = [];
    //    var errorDetailParams = [];
    //    var wsibDetailParams = [];
    //    //var dbConn = DatabaseConnectionFactory.createDatabaseConnection('net.sourceforge.jtds.jdbc.Driver', 'jdbc:jtds:sqlserver://localhost:1433/pqa_db;domain=corp.hrrh.on.ca', 'AccessDB1', '2Surgical%$');

    //    var _insertError = async () => {
    //        return await insertError(msh_id, mrn, account_num, first_name, last_name,
    //            convertDateTime(evn_date), raw_msg, registered_by_id, false, 0, getCurrentDateTime());
    //    }

    //    /*logger.info(GetCurrentDateTime());*/

    //    log("Validating critical patient data (PID, IN1) ...");

    //    /**********
    //    Patient Missing Critical Data
    //    **********/
    //    var dob = msg.getFirstValue('PID.7.1');
    //    var hcn = '';
    //    for (var i in msg.segments['IN1']) {
    //        var segment = msg.segments['IN1'][i];
    //        if (segment.getFirstValue('2.1').indexOf("OHIP") >= 0)
    //            hcn = segment.getFirstValue('36.1');
    //    }

    //    if (hcn == '')
    //        hcn = msg.getFirstValue('PID.19.1');

    //    var gender = msg.getFirstValue('PID.8.1');
    //    var m_name = msg.getFirstValue('PID.6.1').replace("'", "''''");

    //    if (false)
    //        if (
    //            (typeof mrn == undefined || mrn == null || mrn.length == 0) ||
    //            (typeof dob == undefined || dob == null || dob.length == 0) ||
    //            (typeof hcn == undefined || hcn == null || hcn.length == 0) ||
    //            (typeof gender == undefined || gender == null || gender.length == 0) ||
    //            (typeof m_name == undefined || m_name == null || m_name.length == 0)
    //        ) {
    //            var err_id = await _insertError();

    //            linkId = err_id;

    //            let errMsg = "Ensure the patient's MRN/DOB/HCN/GENDER/ Mother's First name have been submitted";
    //            allErrors.push(errMsg);

    //            var result = await insertErrorDetail(err_id, ErrorTypes.Missing_Data, "11", errMsg, false);
    //        }

    //    /**********
    //    duplicated patient
    //    **********/
    //    /****
    //    var drConn = DatabaseConnectionFactory.createDatabaseConnection('net.sourceforge.jtds.jdbc.Driver','jdbc:jtds:sqlserver://hub-dr02:1433/PQA;domain=corp.hrrh.on.ca','AccessDB1','2Surgical%$');
    //    logger.info("exec PQACheckDuplicatedPatient @mrn = '"  + mrn + "', @dob = '"+ConvertDateTime(dob)+"', @m_name_first = '"+m_name+"', @gender = '"+gender+"',@hcn = '"+hcn+"', @first_name='" + first_name.replace("'", "''''") + "', @last_name = '" + last_name.replace("'", "''''") + "'");
    //    var ret = drConn.executeCachedQuery("exec PQACheckDuplicatedPatient @mrn = '"  + mrn + "', @dob = '"+ConvertDateTime(dob)+"', @m_name_first = '"+m_name+"', @gender = '"+gender+"',@hcn = '"+hcn+"', @first_name='" + first_name.replace("'", "''''") + "', @last_name = '" + last_name.replace("'", "''''") + "'");
    //    if(ret.first()){
    //        var unitNumbers = ret.getClob(1);
    //        if(unitNumbers != null && unitNumbers != ''){
    //            var len = unitNumbers.length();
    //            var err_id = InsertError(dbConn, errorParams, msh_id);
    //            linkId = err_id;
    //            is_filtered = false;
    //            errorDetailParams.add(err_id.toString());
    //            errorDetailParams.add("4");
    //            errorDetailParams.add("PID");
    //            errorDetailParams.add("Duplicated account with " + unitNumbers.getSubString(1, len));
    //            errorDetailParams.add("0");
    //            err_detail = err_detail +  "Duplicated Patient\n";

    //            InsertErrorDetail(dbConn, errorDetailParams);
    //            errorDetailParams.clear();			
    //        }
    //    }
    //    drConn.close();
    //    ****/

    //    log("Validating insurance (IN1) ...");

    //    for (var i in msg.segments['IN1']) {
    //        var segment = msg.segments['IN1'][i];
    //        var insurnacePlanType = segment.getFirstValue('2.1');

    //        /**********
    //        WSIB validation
    //        **********/
    //        if (insurnacePlanType == "WSIB") {
    //            isWSIBVisit = true;
    //            var policyNum = /^[0-9]{8}$/; // (must be 8 digits)
    //            var isValidWSIB = policyNum.test(segment.getFirstValue('36.1'));

    //            if (!isValidWSIB) {
    //                var err_id = await _insertError();
    //                linkId = err_id;

    //                let errMsg = "Invalid Policy Number.";
    //                allErrors.push(errMsg);

    //                var result = await insertErrorDetail(err_id, ErrorTypes.WSIB_Policy_Num, "IN1", errMsg, false);
    //            }

    //            //logger.info(isValidWSIB);

    //            //err_detail = err_detail + "WSIB visit\n";

    //            let results = await insertWsibVisits(mrn, account_num, first_name + " " + last_name,
    //                convertDateTime(msg.getFirstValue('EVN.2.1')), msg.getFirstValue('PV1.3.1'), msg.getFirstValue('PV2.3.1'));
    //        }

    //        /**********
    //        IFH dates missing
    //        **********/
    //        else if (insurnacePlanType == "INFEHP") {
    //            var planEffectiveDate = segment.getFirstValue('12.1');
    //            var planExpirationDate = segment.getFirstValue('13.1')
    //            if (!planEffectiveDate || !planExpirationDate || !planEffectiveDate.length || !planExpirationDate.length) {
    //                var err_id = await _insertError();
    //                linkId = err_id;

    //                let errMsg = "Effective or Expiry date of Interim Federal Health Program missing.";
    //                allErrors.push(errMsg);

    //                var result = await insertErrorDetail(err_id, ErrorTypes.IFH, "IN1", errMsg, false);
    //            }
    //        }

    //        /**********
    //        OHIP response code missing
    //        **********/
    //        else if (false) {
    //            if (insurnacePlanType == "OHIP" && msg['IN1'][i]['IN1.36']['IN1.36.1'] != "1" && msg['IN1'][i]['IN1.36']['IN1.36.1'] != "99") {
    //                /*
    //                var ohip_response_code = msg['IN1'][key]['IN1.2']['IN1.2.1'].toString();
    //                if (ohip_response_code.substring(0) == "OHIP") {
    //                */
    //                var err_id = await _insertError();
    //                linkId = err_id;

    //                let errMsg = "OHIP Field Left Blank Error.";
    //                allErrors.push(errMsg);

    //                var result = await insertErrorDetail(err_id, ErrorTypes.OHIP_Code, "IN1", errMsg, false);
    //            }
    //        }

    //        /**********
    //        OHIP format incorrect
    //        **********/
    //        else if (insurnacePlanType == "OHIP" && (!account_num || account_num.length < 2 || account_num.substr(0, 2) != 'KR' && account_num.substr(0, 2) != 'RC')) {
    //            var ohipValue = segment.getFirstValue('4.1');
    //            if (ohipValue != "OHIP (PI)") {
    //                /*
    //                var ohip_response_code = msg['IN1'][key]['IN1.2']['IN1.2.1'].toString();
    //                if (ohip_response_code.substring(0) == "OHIP") {
    //                */
    //                var err_id = await _insertError();
    //                linkId = err_id;

    //                var errMsg = `OHIP Fields are not valid. 'OHIP' and 'OHIP (PI)' values were expected.\r\n * MRN tested: ${account_num}\r\n * OHIP value: ${ohipValue}`;
    //                allErrors.push(errMsg);

    //                var result = await insertErrorDetail(err_id, ErrorTypes.OHIP_Code, "IN1", errMsg, false);
    //            }
    //        }
    //    } // (end 'for' loop for keys)

    //    /**********
    //    Postal Code Logic
    //    ****/
    //    if (await importPostalCodes()) { // (if we have Canada Post data available)
    //        //var ret = drConn.executeCachedQuery("exec ip_validate_postal_code @input_street_name = '" + street + "', @input_city = '" + city + "', @input_prov = '" + prov + "', @postal_code = '" + zip + "'");

    //        let errMsgs = addressValidator.validate(prov, city, street, postalCode);

    //        if (errMsgs.length) {
    //            var err_id = await _insertError();
    //            linkId = err_id;

    //            var errMsg = "Incorrect address:\r\n * " + errMsgs.join("\r\n * ");
    //            allErrors.push(errMsg);

    //            var result = await insertErrorDetail(err_id, ErrorTypes.Address_Error, "PID", errMsg, false);
    //        }
    //    }

    //    /**********
    //    Get user's email
    //    **********/
    //    if (isDevelopment) {
    //        processResult.emailTo = 'james.wilkins@inossis.com';
    //    } else {
    //        var emailTo = await getUserEmail(registered_by_id);
    //        if (emailTo != null)
    //            processResult.emailTo = emailTo;
    //        else
    //            processResult.emailTo = 'pqaalert@hrh.ca';
    //    }

    //    /*logger.info(err_detail);*/
    //    processResult.errordetail = allErrors.join("\r\n");
    //    processResult.link = baseUrl + linkId.toString();
    //    processResult.isWSIBVisit = isWSIBVisit;

    //    return processResult;
    //}
}