import { DreamSpace as DS } from "../../../Core/Globals";
import { GraphNode } from "../../../Core/System/Platform.Graph";
import { EventDispatcher } from "../../../Core/System/Events";
import { HTMLElement } from "../../../Core/System/Platform.HTML";
import { Property } from "../../../Core/System/Properties";
import { Factory } from "../../../Core/Types";

if (DS.Environment == DS.Environments.Browser) { // (just in case [should load from the cache if already in place] ...)
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

/** Contains Bootstrap related styling, elements, and components wrapped in GraphNode derived classes. */
// ===================================================================================================================

//import StaticProperty = DreamSpace.StaticProperty;
//import GraphNode = DreamSpace.GraphNode;
//import Property = DreamSpace.Property;

// ===================================================================================================================

export enum ButtonTypes {
    /** Standard gray button. */
    Default = <ButtonTypes><any>"btn",
    /** Provides extra visual weight and identifies the primary action in a set of buttons. */
    Primary = <ButtonTypes><any>"btn btn-primary",
    /** Used as an alternative to the default styles. */
    Info = <ButtonTypes><any>"btn btn-info",
    /** Indicates a successful or positive action. */
    Success = <ButtonTypes><any>"btn btn-success",
    /** Indicates caution should be taken with this action. */
    Warning = <ButtonTypes><any>"btn btn-warning",
    /** Indicates a dangerous or potentially negative action. */
    Danger = <ButtonTypes><any>"btn btn-danger",
    /** Alternate dark gray button, not tied to a semantic action or use. */
    Inverse = <ButtonTypes><any>"btn btn-inverse",
    /** Deemphasize a button by making it look like a link while maintaining button behavior. */
    Link = <ButtonTypes><any>"btn btn-link"
}

export class ButtonSize {
    static Large: ButtonSize = "btn-large";
    static Default: ButtonSize = "";
    static Small: ButtonSize = "btn-small";
    static Mini: ButtonSize = "btn-mini";
}

export class RowStates {
    static Default: RowStates = "";
    static Success: RowStates = "success";
    static Error: RowStates = "error";
    static Warning: RowStates = "warning";
    static Info: RowStates = "info";
}

// ===================================================================================================================

/** Represents a button type in Bootstrap. */
export class Button extends Factory(HTMLElement) {
    static ButtonType = EventDispatcher.registerEvent(Button, "buttonType", true, ButtonTypes.Success);
    static ButtonSize = EventDispatcher.registerEvent(Button, "buttonSize", true, ButtonSize.Default);
    static BLockLevel = EventDispatcher.registerEvent(Button, "blockLevel", true, <boolean>void 0);
    static IsDisabled = Property.register(Button, "isDisabled", true, false);

    // ---------------------------------------------------------------------------------------------------------------

    _buttonType: typeof Button.ButtonType.propertyGetSetHandler;
    buttonType: typeof Button.ButtonType.defaultValue;

    _buttonSize: typeof Button.ButtonSize.propertyGetSetHandler;
    buttonSize: typeof Button.ButtonSize.defaultValue;

    _buttonLevel: typeof Button.BLockLevel.propertyGetSetHandler;
    buttonLevel: typeof Button.BLockLevel.defaultValue;

    _isDisabled: typeof Button.IsDisabled.propertyGetSetHandler;
    isDisabled: typeof Button.IsDisabled.defaultValue;


    // ---------------------------------------------------------------------------------------------------------------

    constructor(parent: GraphNode = null, buttonType: ButtonTypes = ButtonTypes.Success, buttonSize: ButtonSize = ButtonSize.Default) {
        super(parent)
        this._buttonType(buttonType);
        this._buttonSize(buttonSize);
        this.htmlTag = "button";
    }

    // ---------------------------------------------------------------------------------------------------------------

    createUIElement(): Node {
        this.assertUnsupportedElementTypes("html", "head", "body", "script", "audio", "canvas", "object");
        return super.createUIElement();
    }

    // ---------------------------------------------------------------------------------------------------------------

    onUpdateVisual() {
        this.setValue("class", this.__properties[Button.ButtonType.name]
            + " " + this.__properties[Button.ButtonSize.name]
            + " " + (this.__properties[Button.BLockLevel.name] ? "btn-block" : "")
            + " " + (this.__properties[Button.IsDisabled.name] ? "disabled" : "")
            , false);
    }

    // ---------------------------------------------------------------------------------------------------------------
}

// ===================================================================================================================

/** Represents a button type in Bootstrap. */
export class Table extends HTML.Table {
    // ---------------------------------------------------------------------------------------------------------------

    constructor(parent: GraphNode = null) {
        super(parent)
        this.htmlTag = "table";
    }

    // ---------------------------------------------------------------------------------------------------------------

    createUIElement(): Node {
        this.assertSupportedElementTypes("table");
        return super.createUIElement();
    }

    // ---------------------------------------------------------------------------------------------------------------

    onUpdateVisual() {
        //??this.setValue("class", "table", false);
    }

    // ---------------------------------------------------------------------------------------------------------------
}

// ===================================================================================================================

/** Represents a row on a table type in Bootstrap. */
export class TableRow extends HTML.TableRow {
    static RowState = Property.register(TableRow, "rowState", true, RowStates.Default, void 0, TableRow.prototype._rowStateChanged);


    // ---------------------------------------------------------------------------------------------------------------

    _rowState: typeof TableRow.RowState.propertyGetSetHandler;
    rowState: typeof TableRow.RowState.defaultValue;
    _rowStateChanged(property: typeof TableRow.RowState.propertyType) {
        this._cssclass(this._rowState());
    }

    // ---------------------------------------------------------------------------------------------------------------

    constructor(parent: GraphNode = null, rowState: RowStates = RowStates.Default) {
        super(parent)
        this._rowState(rowState);
    }

    // ---------------------------------------------------------------------------------------------------------------

    onUpdateVisual() {
        this.setValue("class", this.__properties[TableRow.RowState.name], false);
    }

    // ---------------------------------------------------------------------------------------------------------------
}

// ===================================================================================================================

/** Return a new model window. */
/** Represents a modal window in Bootstrap. */
export class Modal extends HTMLElement {
    // ---------------------------------------------------------------------------------------------------------------

    constructor(parent: GraphNode) {
        super(parent)
    }

    // ---------------------------------------------------------------------------------------------------------------

    createUIElement(): Node {
        this.assertSupportedElementTypes("div", "span");
        return super.createUIElement();
    }

    // ---------------------------------------------------------------------------------------------------------------

    onUpdateVisual() {
        this.setValue("class", "table", false);
    }

    // ---------------------------------------------------------------------------------------------------------------
}

    // ===================================================================================================================
