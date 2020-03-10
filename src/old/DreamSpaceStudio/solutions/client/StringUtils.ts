// ###########################################################################################################################
// Text manipulation utility functions.
// ###########################################################################################################################

namespace DS {
    // ========================================================================================================================

    export namespace StringUtils {
        // (this is a more efficient client-side replacement for Chrome)
        StringUtils.replace = function replace(source: string, replaceWhat: string, replaceWith: string, ignoreCase?: boolean): string {
            // (split+join is faster in some browsers, or very close in speed) http://jsperf.com/split-join-vs-regex-replace-the-raven
            if (typeof source !== 'string') source = "" + source;
            if (typeof replaceWhat !== 'string') replaceWhat = "" + replaceWhat;
            if (typeof replaceWith !== 'string') replaceWith = "" + replaceWith;
            if (ignoreCase)
                return source.replace(new RegExp(Utilities.escapeRegex(replaceWhat), 'gi'), replaceWith);
            else
                if (Browser.type == Browser.BrowserTypes.Chrome)
                    return source.split(replaceWhat).join(replaceWith); // (MUCH faster in Chrome [including Chrome mobile])
                else
                    return source.replace(new RegExp(Utilities.escapeRegex(replaceWhat), 'g'), replaceWith);
        }

        // ========================================================================================================================
    }

    // ############################################################################################################################
}