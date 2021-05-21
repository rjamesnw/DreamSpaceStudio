// ############################################################################################################################################
// Browser detection (for special cases).
// ############################################################################################################################################
var DS;
(function (DS) {
    /** Contains information on the user agent (browser) being used.
      * Note: While it's always better to check objects for supported functions, sometimes an existing function may take different
      * parameters based on the browser (such as 'Worker.postMessage()' using transferable objects with IE vs All Others [as usual]).
      */
    let Browser;
    (function (Browser) {
        // ------------------------------------------------------------------------------------------------------------------
        /** Uses cross-browser methods to return the browser window's viewport size. */
        function getViewportSize() {
            var w = window, d = document, e = d.documentElement, g = d.getElementsByTagName('body')[0], x = w.innerWidth || e.clientWidth || g.clientWidth, y = w.innerHeight || e.clientHeight || g.clientHeight;
            return { width: x, height: y };
        }
        Browser.getViewportSize = getViewportSize;
        // ------------------------------------------------------------------------------------------------------------------
        /**
         * Browser benchmarking for various speed tests. The test uses the high-performance clock system, which exists in most modern browsers.
         * The result is returned in milliseconds.
         * @param init The "setup" code, which is only run once.
         * @param code The code to run a test on.
         * @param trialCount The number of times to run the whole test ('init' together with 'code' loops).  The default is 100. The average time of all tests are returned.
         * @param count The number of loops to run the test code in (test 'code' only, and not the 'init' code). The default is 100,000,000.
         */
        function testSpeed(init, code, trialCount = 100, count = 100000000) {
            count = +count || 0;
            trialCount = +trialCount || 0;
            if (code && count && trialCount) {
                var func = new Function(init + ";\r\n"
                    + "var $__fs_t0 = performance.now();\r\n"
                    + "for (var $__fs_i = 0; $__fs_i < " + count + "; $__fs_i++) {\r\n" + code + ";\r\n}\r\n"
                    + "var $__fs_t1 = performance.now();\r\n"
                    + " return $__fs_t1 - $__fs_t0;\r\n");
                console.log(func);
                var totalTime = 0;
                for (var i = 0; i < trialCount; ++i)
                    totalTime += func();
                var elapsed = totalTime / trialCount;
                console.log("Took: " + elapsed + "ms");
            }
            return elapsed || 0;
        }
        // -----------------------------------------------------------------------------------------------------------------------------------
        /** Contains utility functions and events related to the browser's Document Object Model (DOM). */
        let DOM;
        (function (DOM) {
            /** Fired when the HTML has completed loading and was parsed. */
            DOM.onDOMLoaded = new DS.EventDispatcher(DOM, "onDOMLoaded", true);
            var _domLoaded = false;
            /** True when the DOM has completed loading. */
            function isDOMReady() { return _domLoaded; }
            DOM.isDOMReady = isDOMReady;
            var _domReady = false;
            var _pageLoaded = false;
            /** Fired when a page is loaded, but before it gets parsed. */
            DOM.onPageLoaded = new DS.EventDispatcher(DOM, "onPageLoaded", true);
            /** Called when the page has loaded.
              * Returns true if running upon return, or already running, and false if not ready and queued to run later. */
            function onReady() {
                var log = DS.Diagnostics.log("DOM Loading", "Page loading completed; DOM is ready.").beginCapture();
                //??if ($ICE != null) {
                //    $ICE.loadLibraries(); // (load all ICE libraries after the DreamSpace system is ready, but before the ICE libraries are loaded so proper error details can be displayed if required)
                //}
                // (any errors before this point will terminate the 'onReady()' callback)
                // TODO: $ICE loads as a module, and should do this differently.
                //// ... some delay-loaded modules may be hooked into the window 'load' event, which will never fire at this point, so this has to be re-triggered ...
                //??var event = document.createEvent("Event");
                //event.initEvent('load', false, false);
                //window.dispatchEvent(event);
                // ... the system and all modules are loaded and ready ...
                log.write("Dispatching DreamSpace.DOM 'onReady' event ...", DS.LogTypes.Info);
                Browser.onReady.autoTrigger = true;
                Browser.onReady.dispatchEvent();
                log.write("'DreamSpace.DOM bootstrapping completed.", DS.LogTypes.Success);
                log.endCapture();
                return true;
            }
            ;
            /** Implicit request to run only if ready, and not in debug mode. If not ready, or debug mode is set, ignore the request. (used internally) */
            function _doReady() {
                var log = DS.Diagnostics.log("DOM Loading", "Checking if ready...").beginCapture();
                if (_domLoaded && _pageLoaded)
                    onReady();
                log.endCapture();
            }
            ;
            /** Called first when HTML loading completes and is parsed. */
            function _doOnDOMLoaded() {
                if (!_domLoaded) {
                    _domLoaded = true;
                    var log = DS.Diagnostics.log("DOM Loading", "HTML document has finished loading. Triggering 'onDOMLoaded' ...", DS.LogTypes.Success).beginCapture();
                    DOM.onDOMLoaded.autoTrigger = true;
                    DOM.onDOMLoaded.dispatchEvent();
                    log.endCapture();
                }
            }
            ;
            /** Called last when page completes (all sub-resources, such as CSS, JS, etc., have finished loading). */
            function _doOnPageLoaded() {
                if (!_pageLoaded) {
                    _doOnDOMLoaded(); // (just in case - the DOM load must precede the page load!)
                    _pageLoaded = true;
                    var log = DS.Diagnostics.log("DOM Loading", "The document and all sub-resources have finished loading. Triggering 'onPageLoaded' ...", DS.LogTypes.Success).beginCapture();
                    DOM.onPageLoaded.autoTrigger = true;
                    DOM.onPageLoaded.dispatchEvent();
                    _doReady();
                    log.endCapture();
                }
            }
            ;
            // Note: $XT is initially created with limited functionality until the system is ready!
            // If on the client side, detect when the document is ready for script downloads - this will allow the UI to show quickly, and download script while the user reads the screen.
            // (note: this is a two phased approach - DOM ready, then PAGE ready.
            if (DS.Environment == DS.Environments.Browser)
                (function () {
                    var readyStateTimer;
                    // ... check document ready events first in case we can get more granular feedback...
                    if (document.addEventListener) {
                        document.addEventListener("DOMContentLoaded", () => {
                            if (!_domLoaded)
                                _doOnDOMLoaded();
                        }); // (Firefox - wait until document loads)
                        // (this event is fired after document and inline script loading, but before everything else loads [css, images, etc.])
                    }
                    else if (document.attachEvent && document.all && !window.opera) {
                        // (DOM loading trick for IE8-, inspired by this article: http://www.javascriptkit.com/dhtmltutors/domready.shtml)
                        document.write('<script type="text/javascript" id="domloadedtag" defer="defer" src="javascript:void(0)"><\/script>');
                        document.getElementById("domloadedtag").onreadystatechange = function () {
                            if (this.readyState == "complete" && !_domLoaded)
                                _doOnDOMLoaded(); // (deferred script loading completes when DOM is finally read)
                        }; // (WARNING: The 'complete' state callback may occur AFTER the page load event if done at the same time [has happened during a debug session])
                    }
                    else if (document.readyState) {
                        // ... fallback to timer based polling ...
                        var checkReadyState = () => {
                            if (document.body) // (readyState states: 0 uninitialized, 1 loading, 2 loaded, 3 interactive, 4 complete)
                                if (!_domLoaded && (document.readyState == 'loaded' || document.readyState == 'interactive')) { // (this event is fired after document and inline script loading, but before everything else loads [css, images, etc.])
                                    _doOnDOMLoaded();
                                }
                                else if (!_pageLoaded && document.readyState == 'complete') { // (this event is fired after ALL resources have loaded on the page)
                                    _doOnPageLoaded();
                                }
                            if (!_pageLoaded && !readyStateTimer)
                                readyStateTimer = setInterval(checkReadyState, 10); // (fall back to timer based polling)
                        };
                        checkReadyState();
                    }
                    //??else throw DreamSpace.exception("Unable to detect and hook into the required 'document load' events for this client browser.");
                    // (NOTE: If unable to detect and hook into the required 'document load' events for this client browser, wait for the page load event instead...)
                    // ... hook into window ready events next which execute when the DOM is ready (all resources have loaded, parsed, and executed))...
                    if (window.addEventListener)
                        window.addEventListener("load", () => { _doOnPageLoaded(); }); // (wait until whole page has loaded)
                    else if (window.attachEvent)
                        window.attachEvent('onload', () => { _doOnPageLoaded(); });
                    else { // (for much older browsers)
                        var oldOnload = window.onload; // (backup any existing event)
                        window.onload = (ev) => {
                            oldOnload && oldOnload.call(window, ev);
                            _doOnPageLoaded();
                        };
                    }
                    // ... finally, a timeout in case things are taking too long (for example, an image is holding things up if only the 'load' event is supported ...
                    // (NOTE: If the user dynamically loads this script file, then the page DOM/load events may not be triggered in time.)
                })();
            else {
                _doOnPageLoaded(); // (no UI to wait for, so do this now)
            }
        })(DOM = Browser.DOM || (Browser.DOM = {}));
        // -----------------------------------------------------------------------------------------------------------------------------------
    })(Browser = DS.Browser || (DS.Browser = {}));
})(DS || (DS = {}));
// ############################################################################################################################################
//# sourceMappingURL=Browser.js.map