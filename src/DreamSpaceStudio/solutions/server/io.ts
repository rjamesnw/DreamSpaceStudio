// Contains DreamSpace API functions and types that user code can use to work with the system.
// This API will be a layer of abstraction for the SERVER side only.

namespace DS {
    export namespace IO {
        /** Loads a file and returns the contents as text. */
        IO.read = async function (path: string): Promise<Uint8Array> {
            return new Promise<any>((resolve, reject) => {
                var fs: typeof import("fs") = require("fs");
                fs.readFile(path, (err, data) => {
                    if (err) return reject(err);
                    resolve(data);
                });
            });
        }

        /** Lists the contents of a directory. */
        IO.getFiles = async function (path: string): Promise<string[]> {
            return new Promise<any>((resolve, reject) => {
                var fs: typeof import("fs") = require("fs");
                fs.readFile(path, (err, data) => {
                    if (err) return reject(err);
                    resolve(data);
                });
            });
        }

        /** Lists the contents of a directory. */
        IO.getDirectories = async function (path: string): Promise<string[]> {
            return new Promise<any>((resolve, reject) => {
                var fs: typeof import("fs") = require("fs");
                fs.readFile(path, (err, data) => {
                    if (err) return reject(err);
                    resolve(data);
                });
            });
        }
    }
}