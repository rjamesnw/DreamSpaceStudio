var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Contains DreamSpace API functions and types that user code can use to work with the system.
// This API will be a layer of abstraction for the SERVER side only.
var DS;
(function (DS) {
    /** Loads a file and returns the contents as text. */
    function load(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (isNode) {
                    var fs = require("fs");
                    fs.readFile(path, (err, data) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(data);
                    });
                }
                else {
                    DS.get(path).then(resolve, (err) => { reject(err); });
                }
            });
        });
    }
    DS.load = load;
    /** Lists the contents of a directory. */
    function getFiles(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (isNode) {
                    var fs = require("fs");
                    fs.readFile(path, (err, data) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(data);
                    });
                }
                else {
                    DS.get(path).then(resolve, (err) => { reject(err); });
                }
            });
        });
    }
    DS.getFiles = getFiles;
    /** Lists the contents of a directory. */
    function getDirectories(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (isNode) {
                    var fs = require("fs");
                    fs.readFile(path, (err, data) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(data);
                    });
                }
                else {
                    DS.get(path).then(resolve, (err) => { reject(err); });
                }
            });
        });
    }
    DS.getDirectories = getDirectories;
})(DS || (DS = {}));
// ###########################################################################################################################
// Text manipulation utility functions.
// ###########################################################################################################################
var DS;
(function (DS) {
    // ========================================================================================================================
    let StringUtils;
    (function (StringUtils) {
        /** Replaces one string with another in a given string.
            * This function is optimized to select the faster method in the current browser. For instance, 'split()+join()' is
            * faster in Chrome, and RegEx based 'replace()' in others.
            */
        function replace(source, replaceWhat, replaceWith, ignoreCase) {
            // (split+join is faster in some browsers, or very close in speed) http://jsperf.com/split-join-vs-regex-replace-the-raven
            if (typeof source !== 'string')
                source = "" + source;
            if (typeof replaceWhat !== 'string')
                replaceWhat = "" + replaceWhat;
            if (typeof replaceWith !== 'string')
                replaceWith = "" + replaceWith;
            if (ignoreCase)
                return source.replace(new RegExp(Utilities.escapeRegex(replaceWhat), 'gi'), replaceWith);
            else if (Browser.type == Browser.BrowserTypes.Chrome)
                return source.split(replaceWhat).join(replaceWith); // (MUCH faster in Chrome [including Chrome mobile])
            else
                return source.replace(new RegExp(Utilities.escapeRegex(replaceWhat), 'g'), replaceWith);
        }
        StringUtils.replace = replace;
        // ========================================================================================================================
    })(StringUtils = DS.StringUtils || (DS.StringUtils = {}));
    // ############################################################################################################################
})(DS || (DS = {}));
// ############################################################################################################################
