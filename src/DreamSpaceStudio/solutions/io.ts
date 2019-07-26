/** This is the root to all DreamSpaceJS utilities.
 * These utilities cover most common developer needs when building custom components. 
 */
namespace DS {

    export namespace IO {
        // Contains DreamSpace API functions and types that user code can use to work with the system.
        // This API will be a layer of abstraction that keeps things similar between server and client sides.
        export type Methods = "GET" | "POST" | "PUT" | "DELETE";

        //interface IResponse<TData = any> {
        //    status: HttpStatus;
        //    message?: string;
        //    data?: TData;
        //    /** If true then the data can be serialized. The default is false (undefined), which then allows transferring data using 'JSON.stringify()'
        //     * This prevents server-side-only or client-side-only data from being able to transfer between platforms.
        //     */
        //    notSerializable?: boolean;
        //}
        export class Response<TData = any> {
            /** The HTTP status code for the response. */
            status: HttpStatus;
            /** A message for the response. */
            message?: string;
            /** An optional exception object details that may be included if the response is an error. */
            error?: Exception;
            /** Optional data for this response. */
            data?: TData;
            /** If the response is an issue with a view the path is set here. */
            viewPath?: string;
            /** If true then the data can be serialized. The default is false (undefined), which then allows transferring data using 'JSON.stringify()'
             * This prevents server-side-only or client-side-only data from being able to transfer between platforms.
             */
            notSerializable?: boolean;

            constructor(message?: string, data?: any, httpStatusCode = HttpStatus.OK, notSerializable?: boolean, error?: Exception) {
                this.status = +httpStatusCode || 0;
                this.message = '' + message;
                this.data = data;
                this.notSerializable = !!notSerializable;
                this.error = error;
            }

            toString() { return `(${this.status}): ${this.message}`; }
            toValue() { return this.toString(); }

            toJSON() { return JSON.stringify(this); }

            setViewInfo(viewPath?: string): this { this.viewPath = viewPath; return this; }

            static fromError(message: string, error: string | Error | Exception, httpStatusCode = HttpStatus.OK, data?: any) {
                if (!(error instanceof Exception))
                    error = new Exception(error);
                return new Response(getErrorMessage(error, false), data, httpStatusCode, void 0, <Exception>error);
            }
        }

        export interface IResponse<TData = any> extends Response<TData> { }

        /** Contains the results of a component's operation. */
        export function get<T = object>(url: string, type?: ResourceTypes.Application_JSON, method?: Methods, data?: any): Promise<T>;
        export function get<T = string>(url: string, type?: ResourceTypes.Text_XML, method?: Methods, data?: any): Promise<T>;
        export function get<T = string>(url: string, type?: ResourceTypes.Text_Plain, method?: Methods, data?: any): Promise<T>;
        export function get<T = any>(url: string, type?: string, method?: Methods, data?: any): Promise<T>;
        export function get<T>(url: string, type: ResourceTypes, method: Methods = "GET", data?: any): Promise<T> {
            return new Promise<any>((resolve, reject) => {
                var request = new ResourceRequest(url, type);
                request.ready((req) => { resolve(req.transformedResponse); })
                request.catch((req, err) => { reject(err); })
                request.start();
            });
        }
    }
}

const enum HttpStatus {

    /**  This means that the server has received the request headers, and that the client should proceed to send the request body (in the case of a request for which a body needs to be sent; for example, a POST request). If the request body is large, sending it to a server when a request has already been rejected based upon inappropriate headers is inefficient. To have a server check if the request could be accepted based on the request's headers alone, a client must send Expect: 100-continue as a header in its initial request and check if a 100 Continue status code is received in response before continuing (or receive 417 Expectation Failed and not continue). */
    Continue = 100,
    /**  This means the requester has asked the server to switch protocols and the server is acknowledging that it will do so. */
    SwitchingProtocols = 101,

    /**  Standard response for successful HTTP requests. The actual response will depend on the request method used. In a GET request, the response will contain an entity corresponding to the requested resource. In a POST request, the response will contain an entity describing or containing the result of the action. */
    OK = 200,
    /**  The request has been fulfilled and resulted in a new resource being created. */
    Created = 201,
    /**  The request has been accepted for processing, but the processing has not been completed. The request might or might not eventually be acted upon, as it might be disallowed when processing actually takes place. */
    Accepted = 202,
    /**  (since HTTP/1.1) The server successfully processed the request, but is returning information that may be from another source. */
    NonAuthoritativeInformation = 203,
    /**  The server successfully processed the request, but is not returning any content. */
    NoContent = 204,
    /**  The server successfully processed the request, but is not returning any content. Unlike a 204 response, this response requires that the requester reset the document view. */
    ResetContent = 205,
    /**  (RFC 7233) The server is delivering only part of the resource (byte serving) due to a range header sent by the client. The range header is used by HTTP clients to enable resuming of interrupted downloads, or split a download into multiple simultaneous streams. */
    PartialContent = 206,
    /**  (WebDAV; RFC 4918) The message body that follows is an XML message and can contain a number of separate response codes, depending on how many sub-requests were made.[4] */
    MultiStatus = 207,
    /**  (WebDAV; RFC 5842) The members of a DAV binding have already been enumerated in a previous reply to this request, and are not being included again. */
    AlreadyReported = 208,
    /** (RFC 3229) The server has fulfilled a request for the resource, and the response is a representation of the result of one or more instance-manipulations applied to the current instance.[5] */
    IMUsed = 226,

    /**  Indicates multiple options for the resource that the client may follow. It, for instance, could be used to present different format options for video, list files with different extensions, or word sense disambiguation. */
    MultipleChoices = 300,
    /**  This and all future requests should be directed to the given URI. */
    MovedPermanently = 301,
    /**  This is an example of industry practice contradicting the standard. The HTTP/1.0 specification (RFC 1945) required the client to perform a temporary redirect (the original describing phrase was "Moved Temporarily"),[6] but popular browsers implemented 302 with the functionality of a 303 See Other. Therefore, HTTP/1.1 added status codes 303 and 307 to distinguish between the two behaviours.[7] However, some Web applications and frameworks use the 302 status code as if it were the 303.[8] */
    Found = 302,
    /**  (since HTTP/1.1) The response to the request can be found under another URI using a GET method. When received in response to a POST (or PUT/DELETE), it should be assumed that the server has received the data and the redirect should be issued with a separate GET message. */
    SeeOther = 303,
    /**  (RFC 7232) Indicates that the resource has not been modified since the version specified by the request headers If-Modified-Since or If-None-Match. This means that there is no need to retransmit the resource, since the client still has a previously-downloaded copy. */
    NotModified = 304,
    /**  (since HTTP/1.1) The requested resource is only available through a proxy, whose address is provided in the response. Many HTTP clients (such as Mozilla[9] and Internet Explorer) do not correctly handle responses with this status code, primarily for security reasons.[10] */
    UseProxy = 305,
    /**  No longer used. Originally meant "Subsequent requests should use the specified proxy."[11] */
    SwitchProxy = 306,
    /**  (since HTTP/1.1) In this case, the request should be repeated with another URI; however, future requests should still use the original URI. In contrast to how 302 was historically implemented, the request method is not allowed to be changed when reissuing the original request. For instance, a POST request should be repeated using another POST request.[12] */
    TemporaryRedirect = 307,
    /**  (RFC 7538) The request, and all future requests should be repeated using another URI. 307 and 308 (as proposed) parallel the behaviours of 302 and 301, but do not allow the HTTP method to change. So, for example, submitting a form to a permanently redirected resource may continue smoothly.[13] */
    PermanentRedirect = 308,
    /**  (Google) This code is used in the Resumable HTTP Requests Proposal to resume aborted PUT or POST requests.[14] */
    ResumeIncomplete = 308,

    /**  The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).[15] */
    BadRequest = 400,
    /**  (RFC 7235) Similar to 403 Forbidden, but specifically for use when authentication is required and has failed or has not yet been provided. The response must include a WWW-Authenticate header field containing a challenge applicable to the requested resource. See Basic access authentication and Digest access authentication. */
    Unauthorized = 401,
    /**  Reserved for future use. The original intention was that this code might be used as part of some form of digital cash or micropayment scheme, but that has not happened, and this code is not usually used. Google Developers API uses this status if a particular developer has exceeded the daily limit on requests.[16] */
    PaymentRequired = 402,
    /**  The request was a valid request, but the server is refusing to respond to it. Unlike a 401 Unauthorized response, authenticating will make no difference. */
    Forbidden = 403,
    /**  The requested resource could not be found but may be available again in the future. Subsequent requests by the client are permissible. */
    NotFound = 404,
    /**  A request was made of a resource using a request method not supported by that resource; for example, using GET on a form which requires data to be presented via POST, or using PUT on a read-only resource. */
    MethodNotAllowed = 405,
    /**  The requested resource is only capable of generating content not acceptable according to the Accept headers sent in the request. */
    NotAcceptable = 406,
    /**  (RFC 7235) The client must first authenticate itself with the proxy. */
    ProxyAuthenticationRequired = 407,
    /**  The server timed out waiting for the request. According to HTTP specifications: "The client did not produce a request within the time that the server was prepared to wait. The client MAY repeat the request without modifications at any later time." */
    RequestTimeout = 408,
    /**  Indicates that the request could not be processed because of conflict in the request, such as an edit conflict in the case of multiple updates. */
    Conflict = 409,
    /**  Indicates that the resource requested is no longer available and will not be available again. This should be used when a resource has been intentionally removed and the resource should be purged. Upon receiving a 410 status code, the client should not request the resource again in the future. Clients such as search engines should remove the resource from their indices.[17] Most use cases do not require clients and search engines to purge the resource, and a "404 Not Found" may be used instead. */
    Gone = 410,
    /**  The request did not specify the length of its content, which is required by the requested resource. */
    LengthRequired = 411,
    /** (RFC 7232) The server does not meet one of the preconditions that the requester put on the request. */
    PreconditionFailed = 412,
    /**  (RFC 7231) The request is larger than the server is willing or able to process. Called "Request Entity Too Large " previously. */
    PayloadTooLarge = 413,
    /**  The URI provided was too long for the server to process. Often the result of too much data being encoded as a query-string of a GET request, in which case it should be converted to a POST request. */
    RequestURITooLong = 414,
    /**  The request entity has a media type which the server or resource does not support. For example, the client uploads an image as image/svg+xml, but the server requires that images use a different format. */
    UnsupportedMediaType = 415,
    /**  (RFC 7233) The client has asked for a portion of the file (byte serving), but the server cannot supply that portion. For example, if the client asked for a part of the file that lies beyond the end of the file. */
    RequestedRangeNotSatisfiable = 416,
    /**  The server cannot meet the requirements of the Expect request-header field. */
    ExpectationFailed = 417,
    /**  (RFC 2324) This code was defined in 1998 as one of the traditional IETF April Fools' jokes, in RFC 2324, Hyper Text Coffee Pot Control Protocol, and is not expected to be implemented by actual HTTP servers. The RFC specifies this code should be returned by tea pots requested to brew coffee. */
    ImATeapot = 418,
    AuthenticationTimeout = 419,// (not in RFC 2616) Not a part of the HTTP standard, 419 Authentication Timeout denotes that previously valid authentication has expired. It is used as an alternative to 401 Unauthorized in order to differentiate from otherwise authenticated clients being denied access to specific server resources.[citation needed]
    /**  (RFC 7540) The request was directed at a server that is not able to produce a response (for example because a connection reuse).[19] */
    MisdirectedRequest = 421,
    /**  (WebDAV; RFC 4918) The request was well-formed but was unable to be followed due to semantic errors.[4] */
    UnprocessableEntity = 422,
    /**  (WebDAV; RFC 4918) The resource that is being accessed is locked.[4] */
    Locked = 423,
    /**  (WebDAV; RFC 4918) The request failed due to failure of a previous request (e.g., a PROPPATCH).[4] */
    FailedDependency = 424,
    /**  The client should switch to a different protocol such as TLS/1.0, given in the Upgrade header field. */
    UpgradeRequired = 426,
    /**  (RFC 6585) The origin server requires the request to be conditional. Intended to prevent "the 'lost update' problem, where a client GETs a resource's state, modifies it, and PUTs it back to the server, when meanwhile a third party has modified the state on the server, leading to a conflict."[20] */
    PreconditionRequired = 428,
    /**  (RFC 6585) The user has sent too many requests in a given amount of time. Intended for use with rate limiting schemes.[20] */
    TooManyRequests = 429,
    /**  (RFC 6585) The server is unwilling to process the request because either an individual header field, or all the header fields collectively, are too large.[20] */
    RequestHeaderFieldsTooLarge = 431,
    /**  (Microsoft) A Microsoft extension. Indicates that your session has expired.[21] */
    LoginTimeout = 440,
    /**  (Nginx) Used in Nginx logs to indicate that the server has returned no information to the client and closed the connection (useful as a deterrent for malware). */
    NoResponse = 444,
    /**  (Microsoft) A Microsoft extension. The request should be retried after performing the appropriate action.[22] */
    RetryWith = 449,
    /**  (Microsoft) A Microsoft extension. This error is given when Windows Parental Controls are turned on and are blocking access to the given webpage.[23] */
    BlockedByWindowsParentalControls = 450,
    /**  (Internet draft) Defined in the internet draft "A New HTTP Status Code for Legally-restricted Resources".[24] Intended to be used when resource access is denied for legal reasons, e.g. censorship or government-mandated blocked access. A reference to the 1953 dystopian novel Fahrenheit 451, where books are outlawed.[25] */
    UnavailableForLegalReasons = 451,
    /**  (Microsoft) Used in Exchange ActiveSync if there either is a more efficient server to use or the server cannot access the users' mailbox.[26] */
    Redirect = 451,
    /**  (Nginx) Nginx internal code similar to 431 but it was introduced earlier in version 0.9.4 (on January 21, 2011).[28][original research?] */
    RequestHeaderTooLarge = 494,
    /**  (Nginx) Nginx internal code used when SSL client certificate error occurred to distinguish it from 4XX in a log and an error page redirection. */
    CertError = 495,
    /**  (Nginx) Nginx internal code used when client didn't provide certificate to distinguish it from 4XX in a log and an error page redirection. */
    NoCert = 496,
    /**  (Nginx) Nginx internal code used for the plain HTTP requests that are sent to HTTPS port to distinguish it from 4XX in a log and an error page redirection. */
    HTTPtoHTTPS = 497,
    /**  (Esri) Returned by ArcGIS for Server. A code of 498 indicates an expired or otherwise invalid token.[29] */
    TokenExpiredInvalid = 498,
    /**  (Nginx) Used in Nginx logs to indicate when the connection has been closed by client while the server is still processing its request, making server unable to send a status code back.[30] */
    ClientClosedRequest = 499,
    /**  (Esri) Returned by ArcGIS for Server. A code of 499 indicates that a token is required (if no token was submitted).[29] */
    TokenRequired = 499,

    /**  A generic error message, given when an unexpected condition was encountered and no more specific message is suitable. */
    InternalServerError = 500,
    /**  The server either does not recognize the request method, or it lacks the ability to fulfill the request. Usually this implies future availability (e.g., a new feature of a web-service API). */
    NotImplemented = 501,
    /**  The server was acting as a gateway or proxy and received an invalid response from the upstream server. */
    BadGateway = 502,
    /**  The server is currently unavailable (because it is overloaded or down for maintenance). Generally, this is a temporary state. */
    ServiceUnavailable = 503,
    /**  The server was acting as a gateway or proxy and did not receive a timely response from the upstream server. */
    GatewayTimeout = 504,
    /**  The server does not support the HTTP protocol version used in the request. */
    HTTPVersionNotSupported = 505,
    /** (RFC 2295) Transparent content negotiation for the request results in a circular reference.[31] */
    VariantAlsoNegotiates = 506,
    /** (WebDAV; RFC 4918) The server is unable to store the representation needed to complete the request.[4] */
    InsufficientStorage = 507,
    /** (WebDAV; RFC 5842) The server detected an infinite loop while processing the request (sent in lieu of 208 Already Reported). */
    LoopDetected = 508,
    /** (Apache bw/limited extension)[32]This status code is not specified in any RFCs. Its use is unknown. */
    BandwidthLimitExceeded = 509,
    /** (RFC 2774) Further extensions to the request are required for the server to fulfil it.[33] */
    NotExtended = 510,
    /** (RFC 6585) The client needs to authenticate to gain network access. Intended for use by intercepting proxies used to control access to the network (e.g., "captive portals" used to require agreement to Terms of Service before granting full Internet access via a Wi-Fi hotspot).[20] */
    NetworkAuthenticationRequired = 511,
    /**  This status code is not specified in any RFC and is returned by certain services, for instance Microsoft Azure and CloudFlare servers: "The 520 error is essentially a �catch-all� response for when the origin server returns something unexpected or something that is not tolerated/interpreted (protocol violation or empty response)."[34] */
    UnknownError = 520,
    /**  This status code is not specified in any RFCs, but is used by CloudFlare's reverse proxies to signal that a server connection timed out. */
    OriginConnectionTimeout = 522,
    /** (Unknown) This status code is not specified in any RFCs, but is used by Microsoft HTTP proxies to signal a network read timeout behind the proxy to a client in front of the proxy.[citation needed] */
    NetworkReadTimeoutError = 598,
    /** (Unknown) This status code is not specified in any RFCs, but is used by Microsoft HTTP proxies to signal a network connect timeout behind the proxy to a client in front of the proxy.[citation needed] */
    NetworkConnectTimeoutError = 599,
}