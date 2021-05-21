// ###########################################################################################################################
// Text manipulation utility functions.
// ###########################################################################################################################
var DS;
(function (DS) {
    // ========================================================================================================================
    let StringUtils;
    (function (StringUtils) {
        // (this is a more efficient client-side replacement for Chrome)
        StringUtils.replace = function replace(source, replaceWhat, replaceWith, ignoreCase) {
            // (split+join is faster in some browsers, or very close in speed) http://jsperf.com/split-join-vs-regex-replace-the-raven
            if (typeof source !== 'string')
                source = "" + source;
            if (typeof replaceWhat !== 'string')
                replaceWhat = "" + replaceWhat;
            if (typeof replaceWith !== 'string')
                replaceWith = "" + replaceWith;
            if (ignoreCase)
                return source.replace(new RegExp(DS.Utilities.escapeRegex(replaceWhat), 'gi'), replaceWith);
            else if (DS.Browser.type == DS.Browser.BrowserTypes.Chrome)
                return source.split(replaceWhat).join(replaceWith); // (MUCH faster in Chrome [including Chrome mobile])
            else
                return source.replace(new RegExp(DS.Utilities.escapeRegex(replaceWhat), 'g'), replaceWith);
        };
        // ========================================================================================================================
    })(StringUtils = DS.StringUtils || (DS.StringUtils = {}));
    // ############################################################################################################################
})(DS || (DS = {}));
//# sourceMappingURL=StringUtils.js.map