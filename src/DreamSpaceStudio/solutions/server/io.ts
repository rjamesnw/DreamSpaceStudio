// Contains DreamSpace API functions and types that user code can use to work with the system.
// This API will be a layer of abstraction for the SERVER side only.

namespace DS {
    /** Loads a file and returns the contents as text. */
    export async function load(path: string): Promise<string> {
        return new Promise<any>((resolve, reject) => {
            if (isNode) {
                var fs: typeof import("fs") = require("fs");
                fs.readFile(path, (err, data) => {
                    if (err) { reject(err); return; }
                    resolve(data);
                });
            } else {
                get(path).then(resolve, (err) => { reject(err); });
            }
        });
    }

    /** Lists the contents of a directory. */
    export async function getFiles(path: string): Promise<string[]> {
        return new Promise<any>((resolve, reject) => {
            if (isNode) {
                var fs: typeof import("fs") = require("fs");
                fs.readFile(path, (err, data) => {
                    if (err) { reject(err); return; }
                    resolve(data);
                });
            } else {
                get(path).then(resolve, (err) => { reject(err); });
            }
        });
    }

    /** Lists the contents of a directory. */
    export async function getDirectories(path: string): Promise<string[]> {
        return new Promise<any>((resolve, reject) => {
            if (isNode) {
                var fs: typeof import("fs") = require("fs");
                fs.readFile(path, (err, data) => {
                    if (err) { reject(err); return; }
                    resolve(data);
                });
            } else {
                get(path).then(resolve, (err) => { reject(err); });
            }
        });
    }
}