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

        IO.write = async function (path: string, content: Uint8Array): Promise<void> {
            return new Promise<any>((resolve, reject) => {
                var fs: typeof import("fs") = require("fs");
                fs.writeFile(path, content, null, (err) => {
                    if (err) return reject(err);
                    resolve();
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

    export namespace DNS {
        export var hostToIPCache: { [i: string]: string } = {}; // (Note: this "cache" gets updated also when getIP() gets called so we can quickly resolve known IPs)

        export var hostToIPFallbacks: { [i: string]: string } = { // (in case a host fails, these are the known IPs)
        };

        /** Tries to resolve an IP for a host.  It is used mainly to test if a host can be resolved, or to translate known hosts to
         * previously known IPs upon failure. If no IP is found then an empty string is returned (no exception is thrown).
         */
        export function getIP(host: string): Promise<string> {
            if (host in hostToIPCache) return Promise.resolve(hostToIPCache[host]);
            var dns: typeof import('dns') = require('dns');
            return new Promise<string>((res, rej) => dns.lookup(host, function (err, ip) {
                if (err) {
                    if (err) console.warn(`Host '${host}' failed to resolve with this error: `, err);
                    // ... on error try to translate some known hosts ...
                    ip = host in hostToIPFallbacks ? hostToIPFallbacks[host] || "" : "";
                    hostToIPCache[host] = ip;
                    return res(ip); // (failed to pull and IP for this host)
                }
                hostToIPCache[host] = ip;
                res(ip);
            }));
        }
    }
}