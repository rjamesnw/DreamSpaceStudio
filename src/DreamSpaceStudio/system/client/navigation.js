var DS;
(function (DS) {
    // ==========================================================================================================================
    //! if (pageQuery.getValue('debug', '') == 'true') Diagnostics.debug = Diagnostics.DebugModes.Debug_Run; // (only allow this on the sandbox and development servers)
    //! var demo = demo || pageQuery.getValue('demo', '') == 'true'; // (only allow this on the sandbox and development servers)
    /**
       * Redirect the current page to another location.
       * @param {string} url The URL to redirect to.
       * @param {boolean} url If true, the current page query string is merged. The default is false,
       * @param {boolean} bustCache If true, the current page query string is merged. The default is false,
       */
    function setLocation(url, includeExistingQuery = false, bustCache = false) {
        var query = new DS.Query(url);
        if (bustCache)
            query.values[DS.ResourceRequest.cacheBustingVar] = Date.now().toString();
        if (includeExistingQuery)
            query.addOrUpdate(DS.pageQuery.values);
        if (url.charAt(0) == '/')
            url = DS.Path.resolve(url);
        url = query.appendTo(url);
        if (DS.IO.wait)
            DS.IO.wait();
        setTimeout(() => { DS.global.location.href = url; }, 1); // (let events finish before setting)
    }
    DS.setLocation = setLocation;
    // ==========================================================================================================================
    /**
      * Returns true if the page URL contains the given controller and action names (not case sensitive).
      * This only works with typical default routing of "{host}/Controller/Action/etc.".
      * @param action A controller action name.
      * @param controller A controller name (defaults to "home" if not specified)
      */
    function isView(action, controller = "home") {
        return new RegExp("^\/" + controller + "\/" + action + "(?:[\/?&#])?", "gi").test(DS.global.location.pathname);
    }
    DS.isView = isView;
})(DS || (DS = {}));
//# sourceMappingURL=navigation.js.map