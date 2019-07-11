// Contains DreamSpace API functions and types that user code can use to work with the system.
// This API will be a layer of abstraction that keeps things similar between server and client sides.
var isNode = typeof global == 'object' && global.process && global.process.versions && global.process.versions.node;
/** This is the root to all DreamSpaceJS utilities.
 * These utilities cover most common developer needs when buidling custom components.
 */
var DS;
(function (DS) {
    function get(url, type = "any", method = "GET", data) {
        type = typeof type == 'string' ? type.toLocaleLowerCase() : 'any';
        return new Promise((resolve, reject) => {
            if (isNode) {
                var request = require("request");
                request.get(url, { method: method, body: data }, (err, response, body) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(response);
                });
                //var data = '';
                //function response(msg: import('http').IncomingMessage) {
                //    msg.on('data', (chunk) => { data += chunk; });
                //    msg.on('end', () => res(data));
                //}
                //if (url.substr(0, 6).toLowerCase() == "https:")
                //    var request = https.request({ url: url, method: method, json: type.toLowerCase && type.toLowerCase() == "json" }, response);
                //else
                //    var request = http.request(url, response);
                //request.on('error', (err) => { rej(err); })
            }
            else {
                var xhr = new XMLHttpRequest();
                xhr.addEventListener('load', () => { resolve(xhr.response); });
                xhr.addEventListener('error', (err) => { reject(err); });
                xhr.open(method, url);
                if (type == "json") {
                    if (typeof data == 'object')
                        data = JSON.stringify(data);
                    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                }
                xhr.send(data);
            }
        });
    }
    DS.get = get;
})(DS || (DS = {}));
