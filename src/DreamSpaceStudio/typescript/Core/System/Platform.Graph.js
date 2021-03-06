"use strict";
// ############################################################################################################################################
// Types for specialized object property management.
// ############################################################################################################################################
Object.defineProperty(exports, "__esModule", { value: true });
const DreamSpace_1 = require("../DreamSpace");
const Utilities_1 = require("../Utilities");
const Factories_1 = require("../Factories");
const Events_1 = require("./Events");
const Properties_1 = require("./Properties");
const Exception_1 = require("./Exception");
const PrimitiveTypes_1 = require("../PrimitiveTypes");
/** A graph item represents a single node on the application graph. */
class GraphNode extends Factories_1.Factory(Properties_1.PropertyEventBase) {
    constructor() {
        super(...arguments);
        // -----------------------------------------------------------------------------------------------------------------------------------
        /** The ID of this graph item, which is useful for synchronizing the graph tree with the server side. */
        this._id = -1;
        /** A globally unique name for this graph item. */
        this._name = "";
        /** The display name for this graph item, which is useful if developing in an IDE. */
        this._displayName = "";
        this.__parent = null;
        this.__children = PrimitiveTypes_1.Array.new();
        /** Holds a collection of properties, indexed by property name, that are used by the active instance.
        */
        this.__properties = {}; // (warning: this may already be set from parsing an HTML template)
        /**
        * Holds a copy of the 'properties' collection before the application starts (set during the initial layout phase).
        * This allows quick restarting the application later if desired.
        */
        this.__initialProperties = null;
        /** Holds a list of event handlers indexed by event name for this GraphItem instance. */
        this.__events = {};
        /** Holds a list of registered handlers to be notified when any property changes within this graph item. */
        this.__propertyChangedHandlers = null;
    }
    /**
        * Creates a new basic GraphNode type.  A graph node is the base type for all UI related elements.  It is a logical
        * layout that can render a view, or partial view.
        * @param parent If specified, the value will be wrapped in the created object.
        */
    static 'new'(parent = null) { return null; }
    static init(o, isnew, parent = null) {
        this.super.init(o, isnew);
        o._id = GraphNode.__nextID++;
        // ... need to initialize the properties to the static defaults ...
        // (note: this pass only creates the property instances in their initial states - no state information is applied)
        var i, n, p, type = o.constructor, sp = type.__staticProperties;
        if (sp !== void 0)
            while (sp) {
                for (i = sp.length - 1; i >= 0; --i) {
                    p = sp[i];
                    o.__properties[p.name] = p.createPropertyInstance(o);
                }
                sp = sp.parent; // (each type has its own array of static properties that have a parent reference to the super class)
            }
        if (parent)
            parent.addChild(o);
    }
    // -------------------------------------------------------------------------------------------------------------------------------
    //?? private static __staticProperties: StaticProperty[] = [];
    /** Registers a list of UI attribute names that, when updated, may trigger a redraw event.
    * @param {GraphItem} factory Your derived 'GraphItem' type.
    * @param {string} name The property name to set internally (this can be different from the static property name).
    * Note: The name you choose will also be set as an attribute on the element, so for example, using 'id' or 'name'
    * as a name will also update the underlying element's 'id' and 'name' attributes.
    * @param {boolean} isVisual Set this to true on properties that affect the visual display of an element.  For example,
    * some derived graph items may contain text, size, or color type properties that, when updated, should be reflected on
    * the UI.  This is managed internally by automatically triggering a call to 'onRedraw()' to update the visual state.
    * @param {Function} changedCallback A callback to execute when the property has changed.
    * @param {Function} changingCallback A callback to execute before the property changes.
    */
    static registerProperty(factory, name, isVisual = false, changedCallback = null, changingCallback = null) {
        function exception(_msg) {
            return Exception_1.Exception.from("GraphNode.registerProperty(" + Utilities_1.getTypeName(factory) + ", " + name + ", " + isVisual + "): " + _msg, this);
        }
        if (!factory)
            throw exception("A class type [function] is required for property registration.");
        if (!name)
            throw exception("A name is required for property registration.");
        var sProp = Properties_1.StaticProperty.new(name, isVisual);
        if (changedCallback != null)
            sProp.registerListener(changedCallback);
        if (changingCallback != null)
            sProp.registerInterceptor(changingCallback);
        var currentSP = factory['__staticProperties'];
        if (currentSP === void 0) {
            factory['__staticProperties'] = currentSP = PrimitiveTypes_1.Array.new();
            currentSP.parent = null;
            currentSP.owner = factory;
        }
        else if (currentSP.owner !== factory) {
            // (since TS's '__extends' function copies forward all the static properties to derived objects, a new array needs to be created at each inheritance level)
            var typeSpecificSP = PrimitiveTypes_1.Array.new();
            typeSpecificSP.parent = currentSP;
            typeSpecificSP.owner = factory;
            //for (var i = 0, n = currentSP.length; i < n; ++i)
            //    typeSpecificSP.push(currentSP[i]);
            factory['__staticProperties'] = currentSP = typeSpecificSP;
        }
        currentSP.push(sProp);
        if (!DreamSpace_1.DreamSpace.global.Object.defineProperty)
            exception("'Object.defineProperty()' not found. This JavaScript environment is not supported.");
        DreamSpace_1.DreamSpace.global.Object.defineProperty(factory, name, {
            configurable: false,
            writable: false,
            get: function () { return this.getValue(sProp.name); },
            set: function (value) { this.setValue(sProp.name, value); }
        });
        return sProp;
    }
    // -----------------------------------------------------------------------------------------------------------------------------------
    /** The UI map is week mapping used to associate graph nodes with UI elements. */
    static get uiElementMap() { return this._uiElementMap; }
    // -------------------------------------------------------------------------------------------------------------------------------
    isInitialized() { return !!this.__initialProperties; }
    //getTypeName(): string {
    //    //var constructorfunctionStr = "" + (<any>this).constructor;
    //    //var i1 = constructorfunctionStr.indexOf("function") + 8, i2 = constructorfunctionStr.indexOf("(");
    //    //return constructorfunctionStr.substring(i1, i2).trim();
    //    return this.getTypeInfo().$__name;
    //}
    // -------------------------------------------------------------------------------------------------------------------------------
    /** Causes the instance '__properties' collection to be replaced by a brand-new copy of the property values in the '__initialProperties' collection. */
    resetProperties() {
        var i, n, p;
        for (p in this.__initialProperties)
            this.__properties[p] = this.__initialProperties[p].clone();
    }
    // -------------------------------------------------------------------------------------------------------------------------------
    /** This is called internally in the layout phase upon creating elements for the first time. */
    updateInitialProperties() {
        this.__initialProperties = {};
        for (var p in this.__properties)
            this.__initialProperties[p] = this.__properties[p].clone();
    }
    setValue(index, value, triggerChangeEvents = true) {
        var name = index.name || index;
        if (typeof value === 'object' && value instanceof Properties_1.Property)
            value = value.getValue(); // (value is a property instance, so get its value)
        var property = this.__properties[name];
        if (property === void 0)
            this.__properties[name] = property = Properties_1.Property.new(this, null, value); // (property doesn't exist yet, so create it [note: no static info exists])
        else
            property.setValue(value, triggerChangeEvents);
        if (this.onPropertyValueSet && triggerChangeEvents)
            this.onPropertyValueSet(name, value);
        return this;
    }
    getValue(index) {
        var name = index.name || index;
        var property = this.__properties[name];
        return (property === void 0) ? this['__' + name] : property.getValue();
    }
    getProperty(index) {
        var name = index.name || index;
        return this.__properties[name];
    }
    // -------------------------------------------------------------------------------------------------------------------------------
    /** Copies over properties from the specified graph item. */
    copyProperties(graphItem, ...excludeList) {
        for (var pname in graphItem.__properties)
            if (excludeList && !~excludeList.indexOf(pname))
                this.setValue(pname, graphItem.__properties[pname]);
    }
    // -------------------------------------------------------------------------------------------------------------------------------
    __DoOnAnyPropertyChanged(property) {
        if (this.__propertyChangedHandlers != null)
            for (var i = 0, n = this.__propertyChangedHandlers.length; i < n; ++i)
                this.__propertyChangedHandlers[i].call(this, this, property);
    }
    // -------------------------------------------------------------------------------------------------------------------------------
    /** Adds a handler that will be called when a property is added, modified, or deleted.
    * @see also: {@link removePropertyChangedHandler}
    */
    addPropertyChangedHandler(handler) {
        if (!this.__propertyChangedHandlers)
            this.__propertyChangedHandlers = [];
        var i = this.__propertyChangedHandlers.indexOf(handler);
        if (i == -1)
            this.__propertyChangedHandlers.push(handler);
    }
    /** Removes property change handlers.
    * @see also: {@link addPropertyChangedHandler}
    */
    removePropertyChangedHandler(handler) {
        var i;
        if (this.__propertyChangedHandlers) {
            i = this.__propertyChangedHandlers.indexOf(handler);
            if (i > 0)
                this.__propertyChangedHandlers.splice(i, 1);
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------
    /** Returns the event manager object for the specified event name. */
    getEvent(eventName) {
        return this.__events[eventName];
    }
    /** Attaches an event handler to the specified event name and returns the event entry. */
    on(eventName, handler) {
        //if (host.isClient())
        //    throw Exception.notImplemented("{GraphNode}.on()", this, "You must call this on a type derived from GraphNode that implements the function.");
        var existingEvent = this.getEvent(eventName);
        if (existingEvent === void 0)
            this.__events[eventName] = existingEvent = Events_1.EventDispatcher.new(this, eventName);
        existingEvent.addListener(handler);
        return existingEvent;
    }
    /** Detaches an event handler from the specified event name and returns the event entry. */
    off(eventName, handler) {
        var existingEvent = this.getEvent(eventName);
        if (existingEvent !== void 0)
            existingEvent.removeListener(this, handler);
        return existingEvent;
    }
    /** Removes all event handlers for the specified event name and returns the event entry. */
    clearHandlers(eventName) {
        var existingEvent = this.getEvent(eventName);
        if (existingEvent !== void 0)
            existingEvent.removeAllListeners();
        return existingEvent;
    }
    // -------------------------------------------------------------------------------------------------------------------------------
    addChild(item) {
        // ... make sure the item doesn't exist, and move it from any other parent ...
        var i = this.__children.indexOf(item);
        if (i == -1) {
            if (item.__parent != null)
                item.__parent.removeChild(item);
            item.__parent = this;
            this.__children.push(item);
        }
        return item;
    }
    /** Detaches this GraphItem from the logical graph tree, but does not remove it from the parent's child list.
      * Only call this function if you plan to manually remove the child from the parent.
      */
    detach() {
        this.__parent = null;
        return this;
    }
    removeChildAt(itemIndex) {
        if (itemIndex >= 0 && itemIndex < this.__children.length) {
            var item = this.__children[itemIndex];
            item.detach();
            return this.__children[itemIndex];
        }
        return null;
    }
    removeChild(item) {
        if (item) {
            var i = this.__children.indexOf(item);
            if (i >= 0)
                this.removeChildAt(i);
        }
        return item;
    }
    removeAllChildren() {
        var items = this.__children;
        for (var i = items.length - 1; i >= 0; --i)
            items[i].detach();
        this.__children.clear();
        return items;
    }
    // -------------------------------------------------------------------------------------------------------------------------------
    /** Returns the graph item with the specified ID (similar to 'getElementById()'). */
    getItem(id) {
        var prop = this.__properties['id'], i, n, item;
        if (prop && prop.getValue() == id)
            return this;
        for (i = 0, n = this.__children.length; i < n; ++i) {
            item = this.__children[i].getItem(id);
            if (item !== void 0)
                return item;
        }
        return void 0;
    }
    // -------------------------------------------------------------------------------------------------------------------------------
    /** The function is called by the system in order to generate/update the initial properties and HTML elements for display.
    * @param {boolean} recursive Set to false to only update this graph item, ignoring all children.
    */
    updateLayout(recursive = true) {
        if (this.onUpdateLayout)
            this.onUpdateLayout();
        // ... update the deepest items first (this is a logical pass only) ...
        if (recursive)
            for (var i = 0, n = this.__children.length; i < n; ++i) {
                this.__children[i].updateLayout(recursive);
            }
        if (this.__initialProperties == null) {
            // ... first time initializing: trigger 'changed' events for all properties in case listeners need to update/configure the graph item or underlying element ...
            for (var pname in this.__properties)
                if (this.__properties[pname].triggerChangedEvent(true))
                    var doRedraw = true;
            this.updateInitialProperties();
        }
        // ... redraw this item after all child items have been updated, and initial properties are set (the visual update pass) ...
        if (doRedraw) // (if not a client, then the server has no UI to redraw for!)
            this.onRedraw(false);
    }
    // -------------------------------------------------------------------------------------------------------------------------------
    /** The function is called in order to produce an HTML element that represents the graph item.
        * The base class, by default, simply returns a new 'HTMLDivElement' element (which doesn't display anything).
        * It is expected that implementers will override this function in derived classes if any custom UI is to be generated.
        * If the derived type doesn't represent a UI element, don't override this function.
        */
    createUIElement() {
        throw Exception_1.Exception.notImplemented("'createUIElement()' must be overridden in a derived type, such as HTMLElement.");
    }
    // -------------------------------------------------------------------------------------------------------------------------------
    /** Updates the visual display of all child graph items (@see GraphItem.updateLayout).
    * Expected to be overridden by derived types that store their layout/css information in the observable properties.
    * This function is called when properties are completely replaced (such as when loading a project), rather than
    * calling an event for each property set, which can be much slower.
    * Typically, derived types simply update their CSS, innerHTML, or both, in this function.
    */
    onRedraw(recursive = true) {
        if (recursive)
            for (var i = 0; i < this.__children.length; i++)
                this.__children[i].onRedraw();
    }
    // -------------------------------------------------------------------------------------------------------------------------------
    // Iteration Support
    /** Returns an enumerable that can be used to iterate over the child graph items. */
    asEnumerable() {
        return null; //TODO: This no longer works: Enumerable.From(this.__children); - use a Linq Ts lib?
    }
    /**
     * Returns an iterator to support Iteration for ES5/ES3.
     */
    iterator() { return this.asEnumerable(); }
    static [DreamSpace_1.DreamSpace.constructor](factory) {
        factory.init = (o, isnew) => {
        };
    }
}
// -------------------------------------------------------------------------------------------------------------------------------
/** This is a counter used to get a unique ID to all graph items. */
GraphNode.__nextID = 0;
GraphNode._uiElementMap = new WeakMap();
// -----------------------------------------------------------------------------------------------------------------------------------
/** Returns a default accessor (get/set) function to be used when creating accessor functions in GraphItem derived types.
* When 'GraphItem' is extended, the developer normally creates special "property functions" that get and set values in
* the internal 'properties' observable array (such as "x = obj.X()" for "get", and "obj.X(x)" for "set"+"get").
* The 'observablePropertyName' parameter is the name that will be used when calling '{GraphItem}.setProperty()' and
* '{GraphItem}.getProperty()' (which ultimately updates the 'properties' array, allowing listeners to be notified).
* Typically, the properties used with accessors include HTML attributes specific to a particular element, but can
* also include custom attributes not part of the element object as well. This allows creating special element
* objects that are a combination of multiple elements, allowing for a very flexible UI model.
*/
GraphNode.accessor = (registeredProperty) => {
    return function (value) {
        if (arguments.length > 0)
            return this.setValue(registeredProperty, value);
        return this.getValue(registeredProperty);
    };
};
exports.GraphNode = GraphNode;
DreamSpace_1.DreamSpace.global.Object.defineProperty(GraphNode, 'uiElementMap', { writable: false, configurable: false });
// ############################################################################################################################################
//# sourceMappingURL=Platform.Graph.js.map