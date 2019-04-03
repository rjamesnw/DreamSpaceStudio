import * as Core from "./Core";
import * as System from "./System/System";
import * as PrimitiveTypes from "./System/System.PrimitiveTypes";
import * as Time from "./System/System.Time";
import * as Exception from "./System/System.Exception";
import * as Diagnostics from "./System/System.Diagnostics";
import * as Events from "./System/System.Events";
import * as Browser from "./System/System.Browser";
import * as Text from "./System/System.Text";
import * as Data from "./System/System.Data";
import * as IO from "./System/System.IO";
import * as Storage from "./System/System.Storage";

type DreamSpace =
    typeof Core
    & typeof System
    & typeof PrimitiveTypes
    & typeof Time
    & typeof Exception
    & typeof Diagnostics
    & typeof Events
    & typeof Browser
    & typeof Text
    & typeof Data
    & typeof IO
    & typeof Storage
    ;
var DreamSpace: DreamSpace = <any>Storage;
export default DreamSpace;
