DreamSpace.using // (this just confirms that the 'DreamSpace.UI.HTML' module is available before continuing)
    .System.UI()
    .System.UI_HTML();
if (DreamSpace.Environment == DreamSpace.Environments.Browser) { // (just in case [should load from the cache if already in place] ...)
    // ... write this inline with the page so it's available asap ...
    //var link = <HTMLLinkElement>document.createElement("link");
    //??link.href = DreamSpace.System.IO.moduleFilesBasePath + "Bootstrap/css/bootstrap.min.css";
    //link.rel = "stylesheet";
    //document.getElementsByTagName("head")[0].appendChild(link);
    //link = <HTMLLinkElement>document.createElement("link");
    //link.href = DreamSpace.moduleFilesBasePath + "Bootstrap/css/bootstrap-theme.min.css";
    //link.rel = "stylesheet";
    //document.getElementsByTagName("head")[0].appendChild(link);
}
var DreamSpace;
(function (DreamSpace) {
    var System;
    (function (System) {
        var Platform;
        (function (Platform) {
            var HTML;
            (function (HTML) {
                /** Contains Bootstrap related styling, elements, and components wrapped in GraphItem derived classes. */
                let Bootstrap;
                (function (Bootstrap) {
                    // ===================================================================================================================
                    //import StaticProperty = DreamSpace.StaticProperty;
                    //import GraphItem = DreamSpace.GraphItem;
                    //import Property = DreamSpace.Property;
                    // ===================================================================================================================
                    let ButtonTypes;
                    (function (ButtonTypes) {
                        /** Standard gray button. */
                        ButtonTypes[ButtonTypes["Default"] = "btn"] = "Default";
                        /** Provides extra visual weight and identifies the primary action in a set of buttons. */
                        ButtonTypes[ButtonTypes["Primary"] = "btn btn-primary"] = "Primary";
                        /** Used as an alternative to the default styles. */
                        ButtonTypes[ButtonTypes["Info"] = "btn btn-info"] = "Info";
                        /** Indicates a successful or positive action. */
                        ButtonTypes[ButtonTypes["Success"] = "btn btn-success"] = "Success";
                        /** Indicates caution should be taken with this action. */
                        ButtonTypes[ButtonTypes["Warning"] = "btn btn-warning"] = "Warning";
                        /** Indicates a dangerous or potentially negative action. */
                        ButtonTypes[ButtonTypes["Danger"] = "btn btn-danger"] = "Danger";
                        /** Alternate dark gray button, not tied to a semantic action or use. */
                        ButtonTypes[ButtonTypes["Inverse"] = "btn btn-inverse"] = "Inverse";
                        /** Deemphasize a button by making it look like a link while maintaining button behavior. */
                        ButtonTypes[ButtonTypes["Link"] = "btn btn-link"] = "Link";
                    })(ButtonTypes = Bootstrap.ButtonTypes || (Bootstrap.ButtonTypes = {}));
                    class ButtonSize {
                    }
                    ButtonSize.Large = "btn-large";
                    ButtonSize.Default = "";
                    ButtonSize.Small = "btn-small";
                    ButtonSize.Mini = "btn-mini";
                    Bootstrap.ButtonSize = ButtonSize;
                    class RowStates {
                    }
                    RowStates.Default = "";
                    RowStates.Success = "success";
                    RowStates.Error = "error";
                    RowStates.Warning = "warning";
                    RowStates.Info = "info";
                    Bootstrap.RowStates = RowStates;
                    /** Represents a button type in Bootstrap. */
                    let Button;
                    (function (Button) {
                        Button.ButtonType = Events.EventDispatcher.registerEvent(Button, "buttonType", true, ButtonTypes.Success);
                        Button.ButtonSize = Events.EventDispatcher.registerEvent(Button, "buttonSize", true, Button.ButtonSize.Default);
                        Button.BLockLevel = Events.EventDispatcher.registerEvent(Button, "blockLevel", true, void 0);
                        Button.IsDisabled = Platform.Property.register(Button, "isDisabled", true, false);
                        class $Type extends __HTMLElement.HTMLElement {
                            // ---------------------------------------------------------------------------------------------------------------
                            constructor(parent = null, buttonType = ButtonTypes.Success, buttonSize = Button.ButtonSize.Default) {
                                super(parent);
                                this._buttonType(buttonType);
                                this._buttonSize(buttonSize);
                                this.htmlTag = "button";
                            }
                            // ---------------------------------------------------------------------------------------------------------------
                            createUIElement() {
                                this.assertUnsupportedElementTypes("html", "head", "body", "script", "audio", "canvas", "object");
                                return super.createUIElement();
                            }
                            // ---------------------------------------------------------------------------------------------------------------
                            onUpdateVisual() {
                                this.setValue("class", this.__properties[Button.ButtonType.name]
                                    + " " + this.__properties[Button.ButtonSize.name]
                                    + " " + (this.__properties[Button.BLockLevel.name] ? "btn-block" : "")
                                    + " " + (this.__properties[Button.IsDisabled.name] ? "disabled" : ""), false);
                            }
                        }
                        Button.$Type = $Type;
                        AppDomain.registerClass(Button, [DreamSpace, System, Platform, UI, HTML, Bootstrap]);
                    })(Button = Bootstrap.Button || (Bootstrap.Button = {}));
                    /** Represents a button type in Bootstrap. */
                    let Table;
                    (function (Table) {
                        class $Type extends HTML.Table.$Type {
                            // ---------------------------------------------------------------------------------------------------------------
                            constructor(parent = null) {
                                super(parent);
                                this.htmlTag = "table";
                            }
                            // ---------------------------------------------------------------------------------------------------------------
                            createUIElement() {
                                this.assertSupportedElementTypes("table");
                                return super.createUIElement();
                            }
                            // ---------------------------------------------------------------------------------------------------------------
                            onUpdateVisual() {
                                //??this.setValue("class", "table", false);
                            }
                        }
                        Table.$Type = $Type;
                        AppDomain.registerClass(Table, [DreamSpace, System, Platform, UI, HTML, Bootstrap]);
                    })(Table = Bootstrap.Table || (Bootstrap.Table = {}));
                    /** Represents a row on a table type in Bootstrap. */
                    let TableRow;
                    (function (TableRow) {
                        TableRow.RowState = Platform.Property.register(TableRow, "rowState", true, RowStates.Default, UNDEFINED, $Type.prototype._rowStateChanged);
                        class $Type extends HTML.TableRow.$Type {
                            // ---------------------------------------------------------------------------------------------------------------
                            constructor(parent = null, rowState = RowStates.Default) {
                                super(parent);
                                this._rowState(rowState);
                            }
                            _rowStateChanged(property) {
                                this._cssclass(this._rowState());
                            }
                            // ---------------------------------------------------------------------------------------------------------------
                            onUpdateVisual() {
                                this.setValue("class", this.__properties[TableRow.RowState.name], false);
                            }
                        }
                        TableRow.$Type = $Type;
                        AppDomain.registerClass(TableRow, [DreamSpace, System, Platform, UI, HTML, Bootstrap]);
                    })(TableRow = Bootstrap.TableRow || (Bootstrap.TableRow = {}));
                    /** Represents a modal window in Bootstrap. */
                    let Modal;
                    (function (Modal) {
                        class $Type extends __HTMLElement.HTMLElement {
                            // ---------------------------------------------------------------------------------------------------------------
                            constructor(parent) {
                                super(parent);
                            }
                            // ---------------------------------------------------------------------------------------------------------------
                            createUIElement() {
                                this.assertSupportedElementTypes("div", "span");
                                return super.createUIElement();
                            }
                            // ---------------------------------------------------------------------------------------------------------------
                            onUpdateVisual() {
                                this.setValue("class", "table", false);
                            }
                        }
                        Modal.$Type = $Type;
                        AppDomain.registerClass(Modal, [DreamSpace, System, Platform, UI, HTML, Bootstrap]);
                    })(Modal = Bootstrap.Modal || (Bootstrap.Modal = {}));
                    // ===================================================================================================================
                })(Bootstrap = HTML.Bootstrap || (HTML.Bootstrap = {}));
            })(HTML = Platform.HTML || (Platform.HTML = {}));
        })(Platform = System.Platform || (System.Platform = {}));
    })(System = DreamSpace.System || (DreamSpace.System = {}));
})(DreamSpace || (DreamSpace = {}));
//# sourceMappingURL=CoreXT.System.Platform.UI.Bootstrap.js.map