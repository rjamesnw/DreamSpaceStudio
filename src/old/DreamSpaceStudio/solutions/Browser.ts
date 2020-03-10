// ############################################################################################################################################
// Browser detection (for special cases).
// ############################################################################################################################################

namespace DS {

    /** Contains information on the user agent (browser) being used.
      * Note: While it's always better to check objects for supported functions, sometimes an existing function may take different
      * parameters based on the browser (such as 'Worker.postMessage()' using transferable objects with IE vs All Others [as usual]).
      */
    export namespace Browser {
        // (Browser detection is a highly modified version of "http://www.quirksmode.org/js/detect.html".)
        // (Note: This is only required for quirk detection in special circumstances [such as IE's native JSON whitespace parsing issue], and not for object feature support)

        /** A list of browsers that can be currently detected. */
        export enum BrowserTypes {
            /** Browser is not yet detected, or detection failed. */
            Unknown = 0,
            /** Represents a non-browser environment. Any value > 1 represents a valid DOM environment (and not in a web worker). */
            None = -1,
            IE = 1,
            Chrome,
            FireFox,
            Safari,
            Opera,
            Netscape,
            OmniWeb,
            iCab,
            Konqueror,
            Camino
        }

        /** A list of operating systems that can be currently detected. */
        export enum OperatingSystems {
            /** OS is not yet detected, or detection failed. */
            Unknown = 0,
            Windows,
            Mac,
            Linux,
            iOS
        }

        /** Holds detection parameters for a single browser agent string version.
        * Note: This is agent string related, as the version number itself is pulled dynamically based on 'versionPrefix'.
        */
        export interface BrowserAgentVersionInfo {
            /** The parent 'BrowserInfo' details that owns this object. */
            parent?: BrowserInfo;
            /** The text to search for to select this version entry. If null, use the browser name string. */
            nameTag: string;
            /** The text to search for that immediately precedes the browser version.
            * If null, use the browser name string, appended with '/'. */
            versionPrefix: string;
            /** Used only to override a browser vendor name if a different vendor owned a browser in the past. */
            vendor?: string;
        }

        /** Holds detection parameters for a single browser type, and supported versions. */
        export interface BrowserInfo {
            /** The name of the browser. */
            name: string;
            /** The browser's vendor. */
            vendor: string;
            /** The browser's enum value (see 'Browser.BrowserTypes'). */
            identity: BrowserTypes;
            /** The browser's AGENT STRING versions (see 'Browser.BrowserVersionInfo').
            * Note: This is the most important part, as browser is detected based on it's version details.
            */
            versions: BrowserAgentVersionInfo[];
        }

        /** Holds detection parameters for the host operating system. */
        export interface OSInfo {
            name: string;
            identity: OperatingSystems;
        }

        var __browserList: BrowserInfo[] = (() => {
            var list: BrowserInfo[] = [];
            list[BrowserTypes.Chrome] =
                {
                    name: "Chrome", vendor: "Google", identity: BrowserTypes.Chrome, // (browser details)
                    versions: [{ nameTag: null, versionPrefix: null }] // (list of browser versions; string values default to the browser name if null)
                };
            list[BrowserTypes.OmniWeb] =
                {
                    name: "OmniWeb", vendor: "The Omni Group", identity: BrowserTypes.OmniWeb,
                    versions: [{ nameTag: null, versionPrefix: null }]
                };
            list[BrowserTypes.Safari] =
                {
                    name: "Safari", vendor: "Apple", identity: BrowserTypes.Safari,
                    versions: [{ nameTag: null, versionPrefix: "Version" }]
                };
            list[BrowserTypes.Opera] =
                {
                    name: "Opera", vendor: "Opera Mediaworks", identity: BrowserTypes.Opera,
                    versions: [{ nameTag: null, versionPrefix: "Version" }]
                };
            if ((<any>window).opera) browserVersionInfo = __browserList[BrowserTypes.Opera].versions[0];
            list[BrowserTypes.iCab] =
                {
                    name: "iCab", vendor: "Alexander Clauss", identity: BrowserTypes.iCab,
                    versions: [{ nameTag: null, versionPrefix: null }]
                };
            list[BrowserTypes.Konqueror] =
                {
                    name: "Konqueror", vendor: "KDE e.V.", identity: BrowserTypes.Konqueror,
                    versions: [{ nameTag: "KDE", versionPrefix: "Konqueror" }]
                };
            list[BrowserTypes.FireFox] =
                {
                    name: "Firefox", vendor: "Mozilla Foundation", identity: BrowserTypes.FireFox,
                    versions: [{ nameTag: null, versionPrefix: null }]
                };
            list[BrowserTypes.Camino] =
                {
                    name: "Camino", vendor: "", identity: BrowserTypes.Camino,
                    versions: [{ nameTag: null, versionPrefix: null }]
                };
            list[BrowserTypes.Netscape] =
                {
                    name: "Netscape", vendor: "AOL", identity: BrowserTypes.Netscape,
                    versions: [
                        { nameTag: null, versionPrefix: null }, // for newer Netscapes (6+)
                        { nameTag: "Mozilla", versionPrefix: "Mozilla", vendor: "Netscape Communications (now AOL)" } // for older Netscapes (4-)
                    ]
                };
            list[BrowserTypes.IE] =
                {
                    name: "Internet Explorer", vendor: "Microsoft", identity: BrowserTypes.IE,
                    versions: [{ nameTag: "MSIE", versionPrefix: "MSIE " }]
                };
            // ... connect the parents and return the static list ...
            for (var i = list.length - 1; i >= 0; --i)
                if (list[i] && list[i].versions)
                    for (var i2 = list[i].versions.length - 1; i2 >= 0; --i2)
                        if (list[i].versions[i2])
                            list[i].versions[i2].parent = list[i];
            return list;
        })();

        var __osList: OSInfo[] = [
            {
                name: "iPhone",
                identity: OperatingSystems.iOS
            },
            {
                name: "Linux",
                identity: OperatingSystems.Linux
            },
            {
                name: "Win",
                identity: OperatingSystems.Windows
            },
            {
                name: "Mac",
                identity: OperatingSystems.Mac
            }
        ];

        /** Holds a reference to the agent data detected regarding browser name and versions. */
        export var browserVersionInfo: BrowserAgentVersionInfo = null;

        /** Holds a reference to the agent data detected regarding the host operating system. */
        export var osInfo: OSInfo = null;

        var __findBrowser = (): BrowserAgentVersionInfo => {
            var agent = navigator.vendor + "," + navigator.userAgent, bInfo: BrowserInfo, version: BrowserAgentVersionInfo, versionPrefix: string;
            for (var i = 0, n = __browserList.length; i < n; ++i) {
                bInfo = __browserList[i];
                if (bInfo)
                    for (var i2 = 0, n2 = bInfo.versions.length; i2 < n2; ++i2) {
                        version = bInfo.versions[i2];
                        versionPrefix = version.versionPrefix || (bInfo.name + '/');
                        if (version && agent.indexOf(version.nameTag || bInfo.name) != -1 && agent.indexOf(versionPrefix) != -1)
                            return version;
                    }
            }
            return null;
        }

        var __findOS = (): OSInfo => {
            var osStrData = navigator.platform || navigator.userAgent;
            for (var i = 0, n = __osList.length; i < n; ++i)
                if (osStrData.indexOf(__osList[i].name) != -1)
                    return __osList[i];
        }

        var __detectVersion = (versionInfo: BrowserAgentVersionInfo): number => {
            var versionStr = navigator.userAgent + " / " + navigator.appVersion;
            var versionPrefix = versionInfo.versionPrefix || (versionInfo.parent.name + "/");
            var index = versionStr.indexOf(versionPrefix);
            if (index == -1) return -1;
            return parseFloat(versionStr.substring(index + versionPrefix.length));
        }

        /** The name of the detected browser. */
        export var name: string = "";

        /** The browser's vendor. */
        export var vendor: string = "";

        /** The operating system detected. */
        export var os: OperatingSystems = OperatingSystems.Unknown;

        /** The browser version detected. */
        export var version: number = -1;

        /** Set to true if ES2015 (aka ES6) is supported ('class', 'new.target', etc.). */
        export const ES6 = DS.ES6;
        // (Note: For extension of native types, the DreamSpace behavior changes depending on ES6 support due to the new 'new.target' feature changing how called native constructors behave)

        /** The type of browser detected. */
        export var type: BrowserTypes = ((): BrowserTypes => {
            var browserType: BrowserTypes = BrowserTypes.Unknown, browserInfo: BrowserInfo;
            if (DS.Environment == DS.Environments.Browser) {
                if (!browserVersionInfo) browserVersionInfo = __findBrowser();
                browserInfo = browserVersionInfo.parent;
                osInfo = __findOS();
                browserType = browserInfo.identity;
                name = browserInfo.name;
                vendor = browserVersionInfo.vendor || browserVersionInfo.parent.vendor;
                browserType = browserInfo != null ? browserInfo.identity : BrowserTypes.Unknown;
                version = __detectVersion(browserVersionInfo);
                os = osInfo != null ? osInfo.identity : OperatingSystems.Unknown;
            }
            else browserType = BrowserTypes.None;
            return browserType;
        })();

        // -----------------------------------------------------------------------------------------------------------------------------------
    }

}

// ############################################################################################################################################
