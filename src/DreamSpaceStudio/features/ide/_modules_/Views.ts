﻿
export interface IHTTPViewRequestListener { (view: View, request: Net.CachedRequest, ev?: Event): void }

export interface IViewHandler { (view: View): void }

export interface _IViewScript { src?: string; code: string; originalScriptNode?: HTMLScriptElement; newScriptNode?: HTMLScriptElement; applied?: boolean; }

export interface IViewBaseNode extends Node { $__view: ViewBase }
export interface IViewBaseElement extends HTMLElement { $__view: ViewBase }

/**
 * Common 'Views' and 'View' shared properties and functions.
 */
export class ViewBase {
    // --------------------------------------------------------------------------------------------------------------------

    get parent() { return this._parent; }
    protected _parent: ViewBase;

    /** The root node for this view. */
    get rootNode() { return this._rootNode; }
    protected _rootNode: IViewBaseNode;

    /** The root element for this view. This is 'rootNode', or 'null' is 'rootNode' is not an 'HTMLElement' type.*/
    get rootElement(): IViewBaseElement {
        if (this._rootNode instanceof HTMLElement)
            return <IViewBaseElement>this._rootNode;
        else
            throw "'rootNode' is not an HTMLElement based object.";
    }

    /** The node where content will be stored for this view. This defaults to 'rootElement', unless otherwise specified. */
    get contentElement(): HTMLElement { return this._contentElement || this.rootElement; }
    protected _contentElement: HTMLElement;

    // --------------------------------------------------------------------------------------------------------------------

    /** Returns all elements from within this view type object that matches the given query string. */
    queryElements<T extends HTMLElement>(query: string): NodeListOf<T> {
        var node = <Element><Node>this._rootNode;
        if (node.querySelectorAll)
            return <NodeListOf<T>>(<Element><Node>this._rootNode).querySelectorAll(query);
        else
            for (var i = 0, n = this._rootNode.childNodes.length; i < n; ++i) {
                var node = <Element>this._rootNode.childNodes[i];
                if (node.querySelectorAll) {
                    var result = <NodeListOf<T>>node.querySelectorAll(query);
                    if (result)
                        return result;
                }
            }
        return null;
    }

    /** Returns the first matching element from within this view that matches the given query string. */
    queryElement<T extends HTMLElement>(query: string): T {
        var node = <Element><Node>this._rootNode;
        if (node.querySelector)
            return <T>(<Element><Node>this._rootNode).querySelector(query);
        else
            for (var i = 0, n = this._rootNode.childNodes.length; i < n; ++i) {
                var node = <Element>this._rootNode.childNodes[i];
                if (node.querySelector) {
                    var result = <T>node.querySelector(query);
                    if (result)
                        return result;
                }
            }
        return null;
    }

    /** Returns the first matching element from within this view that has the given ID. */
    getElementById<T extends HTMLElement>(id: string): T { return <T>this.queryElement("#" + id); }

    /** Returns all elements from within this view that contains the given attribute name. */
    getElementsByAttribute<T extends HTMLElement>(name: string): NodeListOf<T> { return <NodeListOf<T>>this.queryElements("[" + name + "]"); }

    /** Sets the value of an input element from within the root element for this view that matches the given ID, then returns the element that was set.
     * If there is no value property, the 'innerHTML' property is assumed.
     * If 'ignoreErrors' is false (default) and no element is found, an error is thrown.
     */
    setElementValueById<T extends HTMLElement>(id: string, value = "", ignoreErrors = false): T {
        var el = this.getElementById<T>(id);

        if (!el)
            if (!ignoreErrors)
                throw "There is no element with an ID of '" + id + "' in this view.";
            else
                return null;

        var hasValue = ('value' in el), hasInnerHTML = ('innerHTML' in el);

        if (!hasValue && !hasInnerHTML)
            throw "Element ID '" + id + "' within this view does not represent an element with a 'value' or 'innerHTML' property.";

        if (hasValue)
            (<any>el).value = value;
        else
            el.innerHTML = value;

        return el;
    }

    // --------------------------------------------------------------------------------------------------------------------

    /** Searches the given node and all parents for a view based object. */
    static getViewBase(fromNode: Node, includeSelf = true): ViewBase {
        var el = <IViewBaseNode>fromNode;

        if (el) {
            if (el.$__view)
                if (includeSelf)
                    return el.$__view;
                else if (!el.parentNode && el.$__view.parent)
                    // (if there is no parent node to move to, BUT this node has a view object, then the view object is detached, sub jump to the parent's node)
                    return ViewBase.getViewBase(el.$__view.parent._rootNode);

            do {
                el = <IViewBaseNode><any>el.parentNode;

                if (el && el.$__view)
                    return el.$__view;
            } while (el);
        }

        return null;
    }

    /**
     * Traverse the view object parent hierarchy to find a view that this view based object is contained within.
     * Note: This does not search the parent DOM nodes, only the view object specific hierarchy.
     */
    getParentView(): View {
        if (this._parent)
            if (this._parent instanceof View)
                return <View>this._parent;
            else
                return this._parent.getParentView();
        return null;
    }

    /**
     * Traverse the view object parent hierarchy to find a views container that this view based object is contained within.
     * Note: This does not search the parent DOM nodes, only the view object specific hierarchy.
     */
    getParentViewsContainer(): Views {
        if (this._parent)
            if (this._parent instanceof Views)
                return <Views>this._parent;
            else
                return this._parent.getParentViewsContainer();
        return null;
    }

    static getView(fromNode: Node, includeSelf = true): View {
        var v = ViewBase.getViewBase(fromNode, includeSelf);
        if (v)
            if (v instanceof View)
                return v;
            else
                return ViewBase.getView(v._rootNode, false);
        return null;
    }

    static getViewsContainer(fromNode: Node, includeSelf = true): Views {
        var vc = ViewBase.getViewBase(fromNode, includeSelf);
        if (vc)
            if (vc instanceof Views)
                return vc;
            else
                return ViewBase.getViewsContainer(vc._rootNode, false);
        return null;
    }

    // --------------------------------------------------------------------------------------------------------------------

    /**
     * Builds view containers and views from elements within this container.
     */
    //* When calling this function with no parameters, the default root page view is established, and the other containers
    //* and views are extracted and added in nested form based on nested associations.
    //* @param rootElement The element to start build the views from.
    buildViews(): this {
        // ... look for 'data-view-container' attributes in the root view and extract those now ...

        var containerElements = this.getElementsByAttribute('data-view-container');
        var viewContainers: Views[] = [];

        for (var i = 0, n = containerElements.length; i < n; ++i)
            if (!(<IViewBaseNode><Node>containerElements[i]).$__view) // (make sure this is not already wrapped in a view object)
                viewContainers.push(new Views(containerElements[i]));

        // ... look for 'data-view' attributes on elements and attach those elements to their container parents ...

        var views = this.getElementsByAttribute('data-view');

        for (var i = 0, n = views.length; i < n; ++i) {
            var vEl = <IViewBaseElement>views[i], vname: string = vEl.attributes && vEl.attributes.getNamedItem("data-view").value || null;
            if (!vEl.$__view) { // (only add if not already added)
                var parentContainer = ViewBase.getViewsContainer(vEl, false);

                if (!parentContainer)
                    throw "View '" + vname + "' (element '" + vEl.nodeName + "') does not have a parent views container.";

                parentContainer.createViewFromElement(vname, vEl);
            }
        }

        // ... hook up the view containers to the proper views they are contained in ...

        for (var i = 0, n = viewContainers.length; i < n; ++i) {
            var vc = viewContainers[i];
            var v = ViewBase.getView(vc._rootNode, false);
            if (v && vc.parent != v) {
                if (v)
                    v.addViewContainer(vc); // (adds the container to the list if missing - which is usually true when building for the first time)
            }
        }

        return this;
    }

    // --------------------------------------------------------------------------------------------------------------------
}

export class View extends ViewBase {
    /** The view that was just loaded, in which the currently executing script belongs. This is undefined otherwise (outside of view script executions). */
    static loadedView: FlowScript.View; // (used for script executions after loading views; this is undefined otherwise)

    get parent(): Views { return <Views>this._parent; }

    /** Holds a list of view containers that are managed by this view. */
    childViewContainers(): Views[] { return this._childViewContainers; }
    private _childViewContainers: Views[];

    /** Returns true if this view is the current view in the parent 'Views' container. */
    isCurrentView(): boolean { return this.parent.currentView == this; }

    /** A list of scripts to apply when this view is shown for the first time. */
    _scripts: _IViewScript[];

    /** Set to true when scripts are evaluated so they are not evaluated more than once. */
    get scriptsApplied() { return this._scriptsApplied; }
    _scriptsApplied: boolean;

    /** This is true if this view is the one showing in the parent views container. */
    get attached() { return this._parent ? this.parent.currentView == this : false; }

    get url() { return this._url; }
    private _url: string;

    get name() { return this._name; }
    private _name: string;

    private _request: Net.CachedRequest;

    get originalHTML() { return this._request.result; }

    _oninitHandlers: IViewHandler[];

    _onshowHandlers: IViewHandler[];
    _onhideHandlers: IViewHandler[];

    _onresizeHandlers: IViewHandler[];

    /**
     * Construct a new view from HTML loaded by a URL.
     * @param name A name for this view.
     * @param url The URL of the view to load, if any.
     * @param query Any query string values to add to the URL.
     * @param parent Optionally suggest a parent view container, in case one can't be determined.
     */
    constructor(name: string, url?: string, query?: Net.IHTTPRequestPayload, parent?: Views);
    /**
     * Construct a view from existing DOM elements.
     * @param name A name for this view.
     * @param viewElement The element to use as the content for this view.
     * @param childrenOnly If true, then the child elements of the given view element are removed and added to this view - the given element is ignored and left unchanged.
     * @param rootNode An element to act as the container element for this view. By default a '<DIV>' element is created if not specified.
     * @param parent Optionally suggest a parent view container, in case one can't be determined.
     */
    constructor(name: string, viewElement: HTMLElement, childrenOnly?: boolean, parent?: Views);
    constructor(name: string, urlOrElement?: string | HTMLElement, public queryOrChildrenOnly?: Net.IHTTPRequestPayload | boolean, parent?: Views) {
        super();

        this._name = name || typeof urlOrElement == 'object' && ((<HTMLElement>urlOrElement).id || (<HTMLElement>urlOrElement).nodeName);

        if (urlOrElement instanceof Node && urlOrElement.nodeName == "HTML") {
            // ... the HTML element needs to be hooked up a special way ...
            this._rootNode = <IViewBaseNode><Node>urlOrElement;
            this._contentElement = <HTMLElement>urlOrElement.querySelector("body"); // (note: in most cases, 'this._contentElement' being the 'body', usually also doubles as a view container)
            window.addEventListener("resize", () => { this._doOnResize(); });
            this._doOnResize(); // (this isn't called at least once by default when adding the event, so do so now)
        }
        else {
            // ... all other elements will be meshed with an iframe to capture resize events ...
            this._rootNode = <IViewBaseElement><Node>document.createElement("div"); // (give all views a default DIV container)
            this.rootElement.innerHTML = "<iframe style=width:100%;height:100%;position:absolute;border:none;background-color:transparent;allowtransparency=true;visibility:hidden></iframe><div></div>";

            var iframe = (<HTMLIFrameElement>this._rootNode.firstChild);
            iframe.onload = () => {
                if (iframe.contentWindow)
                    iframe.contentWindow.addEventListener("resize", () => { this._doOnResize(); });
                this._doOnResize(); // (this isn't called at least once by default when adding the event, so do so now)
            };

            this._contentElement = <HTMLElement>this._rootNode.lastChild;

            if (urlOrElement instanceof HTMLElement) {
                if (urlOrElement.attributes)
                    urlOrElement.attributes.removeNamedItem("data-view"); // (just in case, to prevent finding this node again)
                // ... add element, or its children, to this view ...
                if (queryOrChildrenOnly) {
                    if (urlOrElement.childNodes) // (make sure this node supports children)
                        for (var nodes = urlOrElement.childNodes, i = nodes.length - 1; i >= 0; --i) {
                            var child = nodes[i];
                            urlOrElement.removeChild(child);
                            this.contentElement.insertBefore(child, this.contentElement.firstChild);
                        }
                } else {
                    // ... add the element to the container element for this view (remove from any existing parent first) ...
                    if (urlOrElement.parentElement)
                        urlOrElement.parentElement.removeChild(urlOrElement);
                    this.contentElement.appendChild(urlOrElement);
                    this._contentElement = urlOrElement; // (this given element is now the content container)
                }
            }
            else if (urlOrElement) {
                this._url = "" + urlOrElement;
                this._request = new Net.CachedRequest(this._url, <Net.IHTTPRequestPayload>queryOrChildrenOnly);
            }
        }

        if (this._rootNode)
            this._rootNode.$__view = this;

        var parentContainer = ViewBase.getViewsContainer(this._rootNode, false) || parent;
        if (parentContainer)
            parentContainer.addView(this);
    }

    /** Adds a callback that gets executed ONCE when the view is shown.
      * This can be used in view scripts to executed callbacks to run just after a view is attached for the first time. 
      */
    oninit(func: IViewHandler): View {
        if (!this._oninitHandlers)
            this._oninitHandlers = [];
        this._oninitHandlers.push(func);
        return this;
    }

    // --------------------------------------------------------------------------------------------------------------------

    /** Returns a new 'Views' container that wraps an element nested within this view. 
      * Note: If the element exists outside this view, it will not be found.
      * @param elementID The ID of a nested child element within this view.
      * @param existingContentViewName If specified, any child elements of the target element are saved into a new view under this view container.
      * If not specified, the child elements will be cleared out when a view becomes shown.
      * @param showExistingContent If true (default), any existing contents remain visible once copied into a new view.
      * Set this to 'false' to hide the existing contents.
      */
    createViewContainer(elementID: string, existingContentViewName?: string, showExistingContent = true): Views {
        var el = <IViewBaseElement><Node>this.getElementById(elementID);

        if (!el)
            throw "There is no element with ID '" + elementID + "' contained within this view.";

        if (el.$__view)
            if (el.$__view instanceof Views)
                return <Views>el.$__view;
            else
                throw "Element '" + elementID + "' is already connected to view '" + (<View>el.$__view).name + "'.";

        var view = <View>ViewBase.getViewBase(el, false) || this; // (get the child view container to the proper view that will manage it)

        if (view instanceof Views)
            throw "Element '" + elementID + "' is contained within a views container, and not a view. You can only create view containers from elements that have a view in the parent hierarchy.";
        if (!(view instanceof View))
            throw "Element '" + elementID + "' does not contained a view in the parent hierarchy, which is required.";

        var views = new Views(el);
        //? view.addViewContainer(views);

        // ... move any existing elements in this container into a view if requested; otherwise they will be removed when a view is set ...

        if (existingContentViewName && el.firstChild) {
            var viewName = "" + existingContentViewName;
            var view = views.createViewFromElement(viewName, el, true);
            if (showExistingContent)
                view.show();
        }

        return views;
    }

    /** Adds a view container to this view and returns it. The container is first removed from any existing view parent. */
    addViewContainer(views: Views): Views {
        var parentView = views['_parent'];
        if (parentView == this)
            return views; // (already added)
        if (parentView instanceof View)
            parentView.removeViewContainer(views);
        if (views['_parent'] != this) {
            views['_parent'] = this;
            if (!this._childViewContainers)
                this._childViewContainers = [];
            this._childViewContainers.push(views);
        }
        return views;
    }

    /** Removes a view container from this view and returns it. If the container doesn't exist, 'undefined' is returned. */
    removeViewContainer(views: Views): Views {
        views['_parent'] = null;
        if (this._childViewContainers) {
            var i = this._childViewContainers.indexOf(views);
            if (i >= 0)
                return this._childViewContainers.splice(i, 1)[0];
        }
        return void 0;
    }

    /** Find an immediate child container with the specified name.  If 'recursive' is true, all nested child containers are also searched. */
    getViewContainer(name: string, recursive = false) {
        if (this._childViewContainers) {
            for (var i = 0, n = this._childViewContainers.length; i < n; ++i) {
                var vc = this._childViewContainers[i];
                if (vc.name == name)
                    return vc;
            }
            for (var i = 0, n = this._childViewContainers.length; i < n; ++i)
                this._childViewContainers[i].getViewContainer(name, recursive);
        }
        return null;
    }

    // --------------------------------------------------------------------------------------------------------------------

    /** Adds a callback that gets executed each time this view is shown. */
    onshow(func: IViewHandler): View {
        if (!this._onshowHandlers)
            this._onshowHandlers = [];
        this._onshowHandlers.push(func);
        return this;
    }

    show(): View {
        if (this.parent)
            this.parent.showView(this);
        return this;
    }

    private _doOnShow() {
        // ... run all the one-time init handlers, if any, and remove them ...

        if (this._oninitHandlers && this._oninitHandlers.length) {
            for (var i = 0, len = this._oninitHandlers.length; i < len; ++i)
                this._oninitHandlers[i].call(this, this);
            this._oninitHandlers.length = 0; // (these only run once)
        }

        // ... run all the on-show handlers, if any ...

        if (this._onshowHandlers && this._onshowHandlers.length)
            for (var i = 0, len = this._onshowHandlers.length; i < len; ++i)
                this._onshowHandlers[i].call(this, this);

        // ... if this view is showing, which means all child views are also showing, so recursively run the handlers ...

        if (this._childViewContainers && this._childViewContainers.length)
            for (var i = 0, n = this._childViewContainers.length; i < n; ++i)
                for (var vc = this._childViewContainers[i], i2 = 0, n2 = vc.count; i2 < n2; ++i2)
                    vc.views[i2]._doOnShow();
    }

    // --------------------------------------------------------------------------------------------------------------------

    /** Adds a callback that gets executed each time this view is shown. */
    onhide(func: IViewHandler): View {
        if (!this._onhideHandlers)
            this._onhideHandlers = [];
        this._onhideHandlers.push(func);
        return this;
    }

    hide(): View {
        if (this.attached)
            this.parent.hideCurrentView();
        return this;
    }

    private _doOnHide() {

        // ... run all the on-hide handlers, if any ...

        if (this._onhideHandlers && this._onhideHandlers.length)
            for (var i = 0, len = this._onhideHandlers.length; i < len; ++i)
                this._onhideHandlers[i].call(this, this);

        // ... if this view is hidden, which means all child views are also hidden, so recursively run the handlers ...

        if (this._childViewContainers && this._childViewContainers.length)
            for (var i = 0, n = this._childViewContainers.length; i < n; ++i)
                for (var vc = this._childViewContainers[i], i2 = 0, n2 = vc.count; i2 < n2; ++i2)
                    vc.views[i2]._doOnHide();
    }

    // --------------------------------------------------------------------------------------------------------------------

    /** Adds a callback that gets executed each time this view changes size. */
    onresize(func: IViewHandler): View {
        if (!this._onresizeHandlers)
            this._onresizeHandlers = [];
        this._onresizeHandlers.push(func);
        return this;
    }

    private _doOnResize() {

        // ... run all the on-hide handlers, if any ...

        if (this._onresizeHandlers && this._onresizeHandlers.length)
            for (var i = 0, len = this._onresizeHandlers.length; i < len; ++i)
                this._onresizeHandlers[i].call(this, this);

        // ... if this view is resized, that means all child views may also be changed, so recursively run the handlers ...

        if (this._childViewContainers && this._childViewContainers.length)
            for (var i = 0, n = this._childViewContainers.length; i < n; ++i)
                for (var vc = this._childViewContainers[i], i2 = 0, n2 = vc.count; i2 < n2; ++i2)
                    vc.views[i2]._doOnResize();
    }

    // --------------------------------------------------------------------------------------------------------------------

    /** Clears all children from the root node. The view is blank after calling this. */
    clear() { Utilities.HTML.clearChildNodes(this.contentElement); }

    /** Clears all children from the root node and reloads the view. If the view is not loaded yet, then the view is cleared only. */
    reset() { this.contentElement.innerHTML = this._request && this._request.result ? this._request.result : ""; }

    // --------------------------------------------------------------------------------------------------------------------

    //?private _executeScripts() {
    //    if (!this._scriptsApplied) {
    //        this._scriptsApplied = true; // (do first to make sure this doesn't get called again in the evaluation)
    //        try {
    //            if (this._scripts && this._scripts.length) {
    //                View.scriptView = this;

    //                for (var i = 0, len = this._scripts.length; i < len; ++i) {
    //                    var script = this._scripts[i];

    //                    var scriptElement = document.createElement("script"); // TODO: copy attributes also? (ideas: http://stackoverflow.com/questions/1197575/can-scripts-be-inserted-with-innerhtml)

    //                    if (script.code)
    //                        scriptElement.text = script.code;

    //                    script.newScriptNode = scriptElement;

    //                    if (script.originalScriptNode)
    //                        script.originalScriptNode.parentNode.replaceChild(scriptElement, script.originalScriptNode);
    //                    else
    //                        document.body.appendChild(scriptElement);

    //                    if (script.src)
    //                        scriptElement.src = script.src; // (this allows debugging with maps if available!)

    //                    //FlowScript.evalGlobal(this._scripts.join("\r\n\r\n"));
    //                }
    //            }
    //        }
    //        finally {
    //            View.scriptView = void 0;
    //        }
    //    }
    //}

    // --------------------------------------------------------------------------------------------------------------------

    onloaded(func: IHTTPViewRequestListener): View {
        this._request.onloaded((req, ev) => {
            if (this.contentElement && !this.contentElement.innerHTML) { // (only set once - don't clear anything existing)

                this.contentElement.innerHTML = req.result;

                // ... load any scripts if found before triggering the callback ...

                var scripts = this.contentElement.getElementsByTagName("script");

                if (scripts.length) {
                    var checkCompleted = () => {
                        for (var i = 0, len = this._scripts.length; i < len; ++i)
                            if (!this._scripts[i].applied) { loadScript(this._scripts[i]); return; }
                        func.call(this, this, req, ev);
                    };

                    var loadScript = (script: _IViewScript) => {

                        View.loadedView = this;

                        //script.originalScriptNode.parentNode.replaceChild(script.newScriptNode, script.originalScriptNode);
                        script.originalScriptNode.parentNode.removeChild(script.originalScriptNode);
                        document.body.appendChild(script.newScriptNode);

                        if (!script.src) {
                            if (script.code)
                                script.newScriptNode.text = script.code;
                            script.applied = true; // (no synchronous loading required)
                            checkCompleted();
                        }
                        else {
                            script.newScriptNode.onload = (_ev: Event) => {
                                View.loadedView = void 0;
                                script.applied = true;
                                checkCompleted();
                            };
                            script.newScriptNode.onerror = (_ev: Event) => {
                                View.loadedView = void 0;
                                this._request._doOnError(_ev);
                            };
                            script.newScriptNode.src = script.src;
                        }
                    };

                    if (!this._scripts)
                        this._scripts = [];

                    for (var i = 0, len = scripts.length; i < len; ++i)
                        this._scripts.push({ originalScriptNode: scripts[i], src: scripts[i].src, code: scripts[i].text, newScriptNode: <HTMLScriptElement>document.createElement('script') });

                    loadScript(this._scripts[0]);
                }
                else func.call(this, this, req, ev);
            }
            else func.call(this, this, req, ev);
        });
        return this;
    }

    // --------------------------------------------------------------------------------------------------------------------

    onerror(func: IHTTPViewRequestListener): View {
        this._request.onerror((req, ev) => { func.call(this, this, req, ev); });
        return this;
    }

    // --------------------------------------------------------------------------------------------------------------------

    thenLoad(name: string, url: string, payload?: Net.IHTTPRequestPayload, delay = 0): View {
        var view = this.parent.createView(name, url, payload);
        view._request = this._request.thenLoad(url, payload, delay);
        return view;
    }

    // --------------------------------------------------------------------------------------------------------------------

    send(): View { this._request.send(); return this; }

    // --------------------------------------------------------------------------------------------------------------------
}

/**
 * Holds a list of views dynamically loaded from the server.
 */
export class Views extends ViewBase {
    get parent(): View { return <View>this._parent; }

    get name() { return this._name; }
    private _name: string;

    /** Returns the number of views in this container. */
    get count() { return this._views.length; }

    /** Returns the list of all views in this container. */
    get views() { return this._views; }
    private _views: View[] = [];

    get currentView() { return this._currentView; }
    private _currentView: View;

    /** Returns the first view in the collection, or 'null' if empty. */
    get firstView(): View { return this._views && this._views.length && this._views[0] || null; }

    /** Returns the last view in the collection, or 'null' if empty. */
    get lastView(): View { return this._views && this._views.length && this._views[this._views.length - 1] || null; }

    /**
     * Construct an object to hold a list of views dynamically loaded from the server.
     * @param viewsContainer An HTML element that will act as a container to hold the view elements.
     * Note: All direct child elements of this element are removed each time a new view changes.
     */
    constructor(viewsContainer: Node, containerName?: string);
    /**
     * Construct an object to hold a list of views dynamically loaded from the server.
     * @param viewsContainerElementID The ID of an HTML element on the page that will act as a container to hold the view
     * elements.
     * Note: All direct child elements of this element are removed each time a new view changes.
     */
    constructor(viewsContainerElementID: string, containerName?: string);
    constructor(viewsContainerOrID: Node | string, containerName?: string) {
        super();

        if (viewsContainerOrID instanceof Node)
            this._rootNode = <IViewBaseElement>viewsContainerOrID;
        else if (viewsContainerOrID) {
            this._rootNode = <IViewBaseElement><Node>document.getElementById("" + viewsContainerOrID);

            if (!this._rootNode)
                throw "No element with an ID of '" + viewsContainerOrID + "' could be found.";

            if (this._rootNode.$__view != this)
                throw "The specified element is already associated with a view.";
        }

        if (this._rootNode) {
            this._rootNode.$__view = this;

            if (this._rootNode instanceof Element) {
                if (this._rootNode.attributes)
                    this._rootNode.attributes.removeNamedItem("data-view-container"); // (just in case, to prevent finding this node again)

                if (!containerName) {
                    if (this._rootNode.attributes) {
                        var attr = this._rootNode.attributes.getNamedItem("data-view-container");
                        containerName = attr && attr.value;
                    }
                    if (!containerName)
                        containerName = (<Element><Node>this._rootNode).id || this._rootNode.nodeName;
                }
            }
        }

        this._name = containerName || "";

        // ... check if there is a parent 'view' object we need to associated with ...

        var parentView = ViewBase.getView(this._rootNode, false);
        if (parentView)
            parentView.addViewContainer(this);
    }

    addView(view: View, hidden: boolean = !!(this._views && this._views.length)): View {
        var parent = <Views>view["_parent"];
        if (parent)
            if (parent == this)
                return view;
            else
                parent.removeView(view);
        this._views.push(view);
        view["_parent"] = this;
        if (hidden && view.rootNode && view.rootNode.parentNode) // (remove from view when added, until the user decides to show it later)
            view.rootNode.parentNode.removeChild(view.rootNode);
        return view;
    }

    removeView(view: View): View {
        var i = this._views.indexOf(view);
        if (i >= 0) {
            view = this._views.splice(i, 1)[0];
            view["_parent"] = null;
        }
        else view = undefined;
        return view;
    }

    /**
     * Creates a new view from HTML loaded from a given URL.
     * If a view with the same name exists, the view is returned as is, and all other arguments are ignored.
     * @param name A name for this view.
     * @param url The URL to load the view from. If not specified, a blank view is created.
     * @param payload URL query values. Ignored if 'url' is not specified.
     */
    createView(name: string, url?: string, payload?: Net.IHTTPRequestPayload, rootNode?: HTMLElement): View {
        var view = this.getView(name);
        if (view) return view;
        view = new View(name, url, payload, this);
        this.addView(view);
        return view;
    }

    /**
     * Creates a new view from a DOM element, or its children.
     * If a view with the same name exists, the view is returned as is, and all other arguments are ignored.
     * @param name A name for this view.
     * @param element The element to associated with the view (will be removed from any existing parent).  This is the element that will be added and removed from the parent Views container.
     * @param childrenOnly If true, only the children of the specified element are moved into the new view.
     */
    createViewFromElement(name: string, elementOrID: HTMLElement | string, childrenOnly?: boolean): View {
        var view = this.getView(name);
        if (view) return view;
        var element = elementOrID instanceof HTMLElement ? elementOrID : this.getElementById(elementOrID);
        if (!element)
            throw "Element '" + elementOrID + "' does not exist within this view.";
        return new View(name, element, childrenOnly, this);
    }

    getView(name: string): View {
        for (var i = 0, len = this._views.length; i < len; ++i)
            if (this._views[i].name == name) return this._views[i];
        return null;
    }

    showView(view: View): View;
    showView(viewName: string): View;
    showView(viewOrName: View | string): View {
        var _view: View;

        if (_view === null || viewOrName instanceof View) {
            _view = <View>viewOrName;
        }
        else {
            _view = this.getView('' + viewOrName);
            if (!_view)
                throw "There's no view named '" + viewOrName + "' (case sensitive).";
        }

        if (this._currentView != _view) {
            Utilities.HTML.clearChildNodes(this.contentElement);

            if (this._currentView)
                this._currentView['_doOnHide']();

            if (_view && _view.rootNode) {
                this.contentElement.appendChild(_view.rootNode);

                this._currentView = _view;

                _view['_doOnShow']();
            }
            else this._currentView = null;
        }

        return _view;
    }

    hideCurrentView() {
        this.showView(null);
    }

    /** Find the next immediate child container with the specified name.  If 'recursive' is true, all nested child containers are also searched. */
    getViewContainer(name: string, recursive = false) {
        if (this._views)
            for (var i = 0, n = this._views.length; i < n; ++i) {
                var vc = this._views[i].getViewContainer(name, recursive);
                if (vc)
                    return vc;
            }
        return null;
    }

    /**
     * Builds view containers and views from elements, starting with the document root, which is 'window.document' by
     * default if no root is specified. The root document object is the default container when building views.
     * When calling this function with no parameters, the default root page view is established, and the other containers
     * and views are extracted and added in nested form based on nested associations.
     * @param rootElement The element to start build the views from.
     */
    static buildViews(documentRoot: Document = document): Views {
        var rootContainer = new Views(documentRoot);
        return rootContainer.buildViews();
    }
}
