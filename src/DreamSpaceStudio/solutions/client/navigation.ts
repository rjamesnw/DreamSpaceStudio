namespace DS {
    // ==========================================================================================================================

    //! if (pageQuery.getValue('debug', '') == 'true') Diagnostics.debug = Diagnostics.DebugModes.Debug_Run; // (only allow this on the sandbox and development servers)
    //! var demo = demo || pageQuery.getValue('demo', '') == 'true'; // (only allow this on the sandbox and development servers)

    /** 
       * Redirect the current page to another location.
       * @param {string} url The URL to redirect to.
       * @param {boolean} url If true, the current page query string is merged. The default is false,
       * @param {boolean} bustCache If true, the current page query string is merged. The default is false,
       */
    export function setLocation(url: string, includeExistingQuery = false, bustCache = false) {
        var query = Query.new(url);
        if (bustCache) query.values[ResourceRequest.cacheBustingVar] = Date.now().toString();
        if (includeExistingQuery)
            query.addOrUpdate(pageQuery.values);
        if (url.charAt(0) == '/')
            url = Path.resolve(url);
        url = query.appendTo(url);
        if (IO.wait)
            IO.wait();
        setTimeout(() => { DS.global.location.href = url; }, 1); // (let events finish before setting)
    }

    // ==========================================================================================================================

    /**
      * Returns true if the page URL contains the given controller and action names (not case sensitive).
      * This only works with typical default routing of "{host}/Controller/Action/etc.".
      * @param action A controller action name.
      * @param controller A controller name (defaults to "home" if not specified)
      */
    export function isView(action: string, controller = "home"): boolean {
        return new RegExp("^\/" + controller + "\/" + action + "(?:[\/?&#])?", "gi").test(DS.global.location.pathname);
    }

}