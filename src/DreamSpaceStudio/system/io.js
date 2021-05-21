/** This is the root to all DreamSpaceJS utilities.
 * These utilities cover most common developer needs when building custom components.
 */
var DS;
(function (DS) {
    /** Contains operations for working with data loading and communication. */
    let IO;
    (function (IO) {
        // Contains DreamSpace API functions and types that user code can use to work with the system.
        // This API will be a layer of abstraction that keeps things similar between server and client sides.
        let Methods;
        (function (Methods) {
            Methods["GET"] = "GET";
            Methods["POST"] = "POST";
            Methods["PUT"] = "PUT";
            Methods["PATCH"] = "PATCH";
            Methods["DELETE"] = "DELETE";
        })(Methods = IO.Methods || (IO.Methods = {}));
        //interface IResponse<TData = any> {
        //    status: HttpStatus;
        //    message?: string;
        //    data?: TData;
        //    /** If true then the data can be serialized. The default is false (undefined), which then allows transferring data using 'JSON.stringify()'
        //     * This prevents server-side-only or client-side-only data from being able to transfer between platforms.
        //     */
        //    notSerializable?: boolean;
        //}
        class Response {
            constructor(message, data, httpStatusCode = 200 /* OK */, notSerializable, error) {
                this.status = +httpStatusCode || 0;
                this.message = '' + (message !== null && message !== void 0 ? message : '');
                this.data = data;
                this.notSerializable = !!notSerializable;
                this.error = DS.isNullOrUndefined(error) || error instanceof DS.Exception ? error : new DS.Exception(error);
            }
            toString() { return `(${this.status}): ${this.message}`; }
            toValue() { return this.toString(); }
            toJSON() {
                if (this.notSerializable)
                    throw DS.Exception.error("Response.toJSON()", "This instance is not allowed to be serialized.");
                var objToSend = {}, ignored = ['notSerializable'];
                for (var p in this)
                    if (ignored.indexOf(p) < 0)
                        objToSend[p] = this[p];
                return objToSend;
            }
            setViewInfo(viewPath) { this.viewPath = viewPath; return this; }
            static fromError(message, error, httpStatusCode = 200 /* OK */, data) {
                if (message)
                    error = new DS.Exception(message, error);
                return new Response(DS.getErrorMessage(error, false), data, httpStatusCode, void 0, error);
            }
        }
        IO.Response = Response;
        function get(url, type = DS.ResourceTypes.Application_JSON, method = Methods.GET, data) {
            return new Promise((resolve, reject) => {
                var request = new DS.ResourceRequest(url, type, method, data);
                request.ready((req) => { resolve(req.transformedResponse); });
                request.catch((req, err) => { reject(err); return null; });
                request.start();
            });
        }
        IO.get = get;
    })(IO = DS.IO || (DS.IO = {}));
})(DS || (DS = {}));
//# sourceMappingURL=io.js.map