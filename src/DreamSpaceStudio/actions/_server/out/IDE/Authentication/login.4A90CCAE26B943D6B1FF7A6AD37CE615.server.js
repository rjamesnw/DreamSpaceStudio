"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function login(username, password) {
    var response;
    // ### USER CODE START ###
    // ... takes the username and password given from the *client* side and attempts to login the user ...
    // ... this will use the file system to look up the user by iterating over the user GUID directories to find the user by username;
    //     this is find, since there will only ever be a handful of developers working on the system ...
    var dirs = await DS.IO.getDirectories("users");
    response = new DS.IO.Response("OK", true);
    // ### USER CODE end ###
    return response;
}
exports.default = login;
//# sourceMappingURL=login.4A90CCAE26B943D6B1FF7A6AD37CE615.server.js.map