var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Simply loads the global API for the NodeJS server-side global scope.
// This code MUST be FIRST in the final server .js.
eval("var DS = require('../api').DS;");
global.DS = DS;
// ... the server-specific global DS API should follow here ...
// Contains DreamSpace API functions and types that user code can use to work with the system.
// This API will be a layer of abstraction for the SERVER side only.
var DS;
(function (DS) {
    /** Loads a file and returns the contents as text. */
    function load(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                var fs = require("fs");
                fs.readFile(path, (err, data) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(data);
                });
            });
        });
    }
    DS.load = load;
    /** Lists the contents of a directory. */
    function getFiles(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                var fs = require("fs");
                fs.readFile(path, (err, data) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(data);
                });
            });
        });
    }
    DS.getFiles = getFiles;
    /** Lists the contents of a directory. */
    function getDirectories(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                var fs = require("fs");
                fs.readFile(path, (err, data) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(data);
                });
            });
        });
    }
    DS.getDirectories = getDirectories;
})(DS || (DS = {}));
