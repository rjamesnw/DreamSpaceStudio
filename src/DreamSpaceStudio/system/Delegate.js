// ###########################################################################################################################
// Callback Delegates (serializable - closures should not be used)
// ###########################################################################################################################
var DS;
(function (DS) {
    // ============================================================================================================================
    ;
    /**
     * Represents a function of a specific object instance.
     * Functions have no reference to any object instance when invoked statically.  This means when used as "handlers" (callbacks)
     * the value of the 'this' reference is either the global scope, or undefined (in strict mode).   Delegates couple the target
     * object instance (context of the function call [using 'this']) with a function reference.  This allows calling a function
     * on a specific object instance by simply invoking it via the delegate. If not used with closures, a delegate may also be
     * serialized.
     * Note: If the target object is undefined, then 'null' is assumed and passed in as 'this'.
     */
    class Delegate {
        /**
        * Reinitializes a disposed Delegate instance.
        * @param o The Delegate instance to initialize, or re-initialize.
        * @param isnew If true, this is a new instance, otherwise it is from a cache (and may have some preexisting properties).
        * @param object The instance to bind to the resulting delegate object.
        * @param func The function that will be called for the resulting delegate object.
        */
        constructor(object, func) {
            if (object === void 0)
                object = null;
            this.object = object;
            this.func = func;
            this.update();
        }
        /** Creates and returns a string that uniquely identifies the combination of the object instance and function for
         * this delegate.  Since every delegate has a unique object ID across an application domain, key strings can help
         * prevent storage of duplicate delegates all pointing to the same target.
         * Note: The underlying object and function must be registered types first.
         * See 'AppDomain.registerClass()/.registerType()' for more information.
         */
        static getKey(object, func) {
            var isstaticctx = Delegate.__validate("getKey()", object, func);
            var id = isstaticctx ? '-1' : object._id.toString();
            return id + "," + func.$__name; // (note: -1 means "global scope")
        }
        static __validate(callername, object, func) {
            var isstaticctx = object === void 0 || object === null; // ('$__fullname' exists on modules and registered type objects)
            if (!isstaticctx && DS.isEmpty(object._id)) //? Is this still needed?
                throw DS.Exception.error("Delegate." + callername, "The object for this delegate does not contain an '_id' value (used as a global object reference for serialization).  See 'DS.TrackableObject' for more details.", this);
            return isstaticctx;
        }
        //? static readonly $Type = $Delegate;
        [DS.staticConstructor](delegate) {
            /** Generates "case" statements for function templates.  The function template is converted into a string, the resulting cases get inserted,
              * and the compiled result is returned.  This hard-codes the logic for greatest speed, and if more parameters are need, can easily be expanded.
            */
            function makeCases(argsIndexStart, caseCountMax, func, funcName, contextStr, argsStr) {
                var ftext = func.toString();
                var matchRegex = /^.*case 1:.*/m;
                var cases = "", argtext = "";
                for (var i = argsIndexStart, n = argsIndexStart + caseCountMax; i < n; ++i)
                    cases += "case " + (1 + i) + ": return " + funcName + "(" + contextStr + (argtext += argsStr + "[" + i + "], ") + "this);\r\n";
                return DS.safeEval("(" + ftext.replace(matchRegex, cases) + ")");
            }
            // TODO: Look into using the "...spread" operator for supported browsers, based on support: https://goo.gl/a5tvW1
            delegate.fastApply = makeCases(0, 20, function (func, context, args) {
                if (!arguments.length)
                    throw DS.Exception.error("Delegate.fastApply()", "No function specified.");
                if (typeof func !== 'function')
                    throw DS.Exception.error("Delegate.fastApply()", "Function object expected.");
                if (arguments.length == 1 || context == void 0 && (args == void 0 || !args.length))
                    return func();
                switch (args.length) {
                    case 1: return func.call(context, args[0]); /* (this line is matched by the regex and duplicated as needed) */
                    default: return func.apply(context, args); /* (no arguments supplied) */
                }
            }, "func.call", "context, ", "args");
            delegate.fastCall = makeCases(0, 20, function (func, context) {
                if (!arguments.length)
                    throw DS.Exception.error("Delegate.fastCall()", "No function specified.");
                if (typeof func !== 'function')
                    throw DS.Exception.error("Delegate.fastApply()", "Function object expected.");
                var restArgsLength = arguments.length - 2; /* (subtract func and context parameters from the count to get the "...rest" args) */
                if (arguments.length == 1 || context == void 0 && !restArgsLength)
                    return func();
                switch (restArgsLength) {
                    case 1: return func.call(context, arguments[0]); /* (this line is matched by the regex and duplicated as needed) */
                    default: return func.apply(context, arguments); /* (no arguments supplied) */
                }
            }, "func.call", "context, ", "arguments");
            Delegate.prototype.invoke = makeCases(0, 20, function () {
                if (!arguments.length)
                    return this.func(this.object, this);
                var context = (arguments[0] === void 0) ? this : arguments[0];
                switch (arguments.length) {
                    case 1: return this.func(context, arguments[1], this);
                    default: return this.func.apply(this, [context, ...arguments, this]);
                }
            }, "this.func", "context, ", "arguments");
            var call = function (context, ...args) {
                if (arguments.length == 1) { // (only array given)
                    args = context;
                    context = this.object;
                }
                else if (arguments.length > 1 && this.call != this.__call) // ('this.call != this.__call' is true in some browsers, like IE, where a bound function is faster [and since it's bound, the context cannot be changed])
                    return this.__call(context, args); // (only the non-bound version can handle context changes)
                if (args == void 0 || !args.length)
                    return this.func.call(context, this);
                switch (args.length) {
                    case 1: return this.func(context, args[0], this);
                    default: return this.func.call(this, context, ...args, this);
                }
            };
            Delegate.prototype.__call = makeCases(0, 20, call, "this.func", "this.object, ", "args"); // (keep reference to the non-bound version as a fallback for user defined contexts)
            Delegate.prototype.call = ((DS.Browser.type != DS.Browser.BrowserTypes.IE) ?
                Delegate.prototype.__call
                : makeCases(0, 20, call, "this.__boundFunc", "", "args"));
            var apply = function (context, args) {
                if (arguments.length == 1) { // (only array given)
                    args = context;
                    context = this.object;
                }
                else if (arguments.length > 1 && this.apply != this.__apply) // ('this.apply != this.__apply' is true in some browsers, like IE, where a bound function is faster [and since it's bound, the context cannot be changed])
                    return this.__apply(context, args); // (only the non-bound version can handle context changes)
                if (args == void 0 || !args.length)
                    return this.func.call(context, this);
                switch (args.length) {
                    case 1: return this.func(context, args[0], this);
                    default: return this.func.call(this, context, ...args, this);
                }
            };
            Delegate.prototype.__apply = makeCases(0, 20, apply, "this.func", "context, ", "args"); // (keep reference to the non-bound version as a fallback for user defined contexts)
            Delegate.prototype.apply = ((DS.Browser.type != DS.Browser.BrowserTypes.IE) ?
                Delegate.prototype.__apply
                : makeCases(0, 20, apply, "this.__boundFunc", "", "args")); // (note: bound functions are faster in IE)
        }
        /** A read-only key string that uniquely identifies the combination of object instance and function in this delegate.
        * This property is set for new instances by default.  Calling 'update()' will update it if necessary.
        */
        get key() { return this.__key; }
        //? private static $this_REPLACE_REGEX = /([^A-Za-z$_\.])this([^A-Za-z$_])/gm;
        /** If the 'object' or 'func' properties are modified directly, call this function to update the internal bindings. */
        update() {
            if (typeof this.func != 'function')
                DS.Exception.error("Delegate", "The function value is not a function:\r\n {Delegate}.func = " + this.func, this.func);
            if (this.func.bind)
                this.__boundFunc = this.func.bind(this, this.object); // (this can be faster in some cases [i.e. IE])
            if (this.object instanceof Object)
                this.__key = Delegate.getKey(this.object, this.func); // (this also validates the properties first)
            else
                this.__key = void 0;
            return this;
        }
        ///** Attempts to serialize the delegate.  This can only succeed if the underlying object reference is registered with 
        //* an 'AppDomain', and the underlying function reference implements 'IFunctionInfo' (for the '$__name' property).  Be
        //* careful when using function closures, as only the object ID and function name are stored. The object ID and function
        //* name are used to look up the object context and function when loading from saved data.
        //*/
        //? getData(data: SerializedData): void {
        //    var isstatic = Delegate['__validate']("getData()", this.object, this.func);
        //    if (!isstatic)
        //        data.addValue("id", (<ITrackableObject><any>this.object)._uid);
        //    data.addValue("ft", this.__functionText);
        //}
        ///**
        // * Load this delegate from serialized data (See also: getData()).
        // * @param data
        // */
        //? setData(data: SerializedData): void {
        //    var objid = data.getNumber("id");
        //    this.object = (<ITrackableObject><any>this).$__appDomain.objects.getObjectForceCast<TObj>(objid);
        //    this.__functionText = data.getValue("ft");
        //    this.update();
        //    // TODO: Consider functions that implement ITypeInfo, and use that if they are registered.
        //}
        equal(value) {
            return typeof value == 'object' && value instanceof Delegate
                && value.object === this.object && value.func === this.func;
        }
    }
    DS.Delegate = Delegate;
    Delegate.prototype[DS.staticConstructor](Delegate);
    // ============================================================================================================================
})(DS || (DS = {}));
//# sourceMappingURL=Delegate.js.map