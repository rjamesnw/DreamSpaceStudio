"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function login(username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        var response;
        // ### USER CODE START ###
        // ... takes the username and password given from the *client* side and attempts to login the user ...
        // ... this will use the file system to look up the user by iterating over the user GUID directories to find the user by username;
        //     this is find, since there will only ever be a handful of developers working on the system ...
        var dirs = yield DS.IO.getDirectories("users");
        response = new DS.IO.Response("OK", true);
        // ### USER CODE end ###
        return response;
    });
}
exports.default = login;
//# sourceMappingURL=login.4A90CCAE26B943D6B1FF7A6AD37CE615.server.js.map