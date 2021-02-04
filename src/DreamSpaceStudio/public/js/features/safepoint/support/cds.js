// CDS specific types.
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Analysis = exports.Supervisor = exports.Director = exports.Staff = void 0;
    class Staff {
    }
    exports.Staff = Staff;
    class Director {
    }
    exports.Director = Director;
    class Supervisor {
    }
    exports.Supervisor = Supervisor;
    class Analysis {
        constructor(staff) {
            this.staff = staff;
            this.messages = [];
        }
    }
    exports.Analysis = Analysis;
});
//# sourceMappingURL=cds.js.map