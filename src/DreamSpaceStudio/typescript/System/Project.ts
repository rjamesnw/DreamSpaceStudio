﻿import { TrackableObject } from "./TrackableObject";
import { FileSystem } from "./FileManager";
import { UserAccess } from "./Security";
import { EventDispatcher } from "./Events";
import { Utilities } from "./Utilities";
import { Data } from "./Data";
import { Site } from "./Site";
import { Solution } from "./Solution";
import { nameof } from "../Core/Utilities";
import { SelectedItem } from "./Selection";

// ========================================================================================================================

export interface ISavedProject extends ISavedTrackableObject {
    name: string;
    description?: string;
    directory?: string;
    /** File paths related to this project. */
    files?: string[];
    /** If this is a string, then it represents a GUID that references a script instead. */
    scripts?: (ISavedScript | string)[];
    //comments: string[];
}

export class Project extends TrackableObject {
    // --------------------------------------------------------------------------------------------------------------------

    //x /** The script instance for this project. */
    //x get script() { return this._script; }
    //x protected _script: IFlowScript;

    /** The file storage directory for this project. */
    readonly directory: FileSystem.Directory;

    /** A list of all files associated with this project, indexed by the absolute lowercase file path. */
    readonly files: { [index: string]: FileSystem.File } = {};

    /** A list of user IDs and assigned roles for this project. */
    readonly userSecurity = new UserAccess();

    /** The site for this project.  Every project contains a site object, even for API-only projects. For API-only projects there are no pages. */
    readonly site: Site = new Site();

    // --------------------------------------------------------------------------------------------------------------------
    // Create a type of trash-bin to hold expressions so the user can restore them, or delete permanently.

    /** Holds a list of expressions the developer has removed from scripts. This renders to a global space, which allows
      * developers to move expressions easily between scripts.
      * Use 'addExpressionToBin()' and 'removeExpressionFromBin()' to modify this list, which also triggers the UI to update.
      */
    get expressionBin() { return this._expressionBin; }
    private _expressionBin: SelectedItem[] = [];
    onExpressionBinItemAdded = new EventDispatcher<Project, { (item: SelectedItem, project: Project): void }>(this, "onExpressionBinItemAdded");
    onExpressionBinItemRemoved = new EventDispatcher<Project, { (item: SelectedItem, project: Project): void }>(this, "onExpressionBinItemRemoved");

    /** Returns the expression that was picked by the user for some operation. In the future this may also be used during drag-n-drop operations. */
    get pickedExpression() { return this._pickedItem; }
    private _pickedItem: SelectedItem;

    // --------------------------------------------------------------------------------------------------------------------

    constructor(
            /** The solution this project belongs to. */ public readonly solution: Solution,
            /** The title of the project. */ public name: string,
            /** The project's description. */ public description?: string
    ) {
        super();
        if (!FileSystem.isValidFileName(name))
            throw "The project title '" + name + "' must also be a valid file name. Don't include special directory characters, such as: \\ / ? % * ";
        this.directory = this.solution.directory.createDirectory(FileSystem.combine("projects", this._uid)); // (the path is "User ID"/"project's unique ID"/ )
    }

    // --------------------------------------------------------------------------------------------------------------------

    /** Saves the project and related items to a specified object. 
     * If no object is specified, then a new empty object is created and returned.
     */
    save(target?: ISavedProject): ISavedProject {
        target = target || <ISavedProject>{};

        super.save(target);

        target.name = this.name;
        target.description = this.description;

        for (var p in this.files)
            (target.files || (target.files = [])).push(this.files[p].absolutePath);

        target.scripts = [this.script.save()];

        return target;
    }

    /** Saves the project to a persisted storage, such as the local browser storage, or a remote store, if possible. 
     * Usually the local storage is attempted first, then the system will try to sync with a remote store.  If there
     * is no free space in the local store, the system will try to sync with a remote store.  If that fails, the
     * data will only be in memory and a UI warning will display.
     */
    saveToStorage(source = this.save()) {
        if (!source) return; // (nothing to do)

        if (Array.isArray(source.scripts))
            for (var i = 0, n = source.scripts.length; i < n; ++i) {
                var script = source.scripts[i];

                if (typeof script == 'object' && script.id) {
                    source.scripts[i] = script.id; // (replaced the object entry with the ID before saving the project graph later; these will be files instead)

                    var scriptJSON = script && JSON.stringify(script) || null;

                    var file = this.directory.createFile((script.name || script.id) + ".fs", scriptJSON); // (fs: FlowScript source file)
                    this.files[file.absolutePath.toLocaleLowerCase()] = file;
                }
            }

        var projectJSON = this.serialize(source);

        file = this.directory.createFile(this._uid + ".fsp", projectJSON); // (fsp: FlowScript Project file)
        this.files[file.absolutePath.toLocaleLowerCase()] = file;
    }

    load(target?: ISavedProject): this {
        if (target) {
            var _this = <Writeable<this>>this;

            super.load(target);

            _this.name = target.name;
            _this.description = target.description;

            // TODO: associated files and scripts.
        }
        return this;
    }

    // --------------------------------------------------------------------------------------------------------------------

    /** Saves the project to data objects (calls this.save() when 'source' is undefined) and uses the JSON object to serialize the result into a string. */
    serialize(source = this.save()): string {
        var json = JSON.stringify(source);
        return json;
    }

    // --------------------------------------------------------------------------------------------------------------------

    addToBin(expr: SelectedItem, triggerEvent = true) {
        if (this._expressionBin.indexOf(expr) < 0) {
            this._expressionBin.push(expr);
            if (triggerEvent)
                this.onExpressionBinItemAdded.trigger(expr, this);
        }
    }

    removeFromBin(expr: SelectedItem, triggerEvent = true) {
        var i = this._expressionBin.indexOf(expr);
        if (i >= 0) {
            var expr = this._expressionBin.splice(i, 1)[0];
            if (triggerEvent)
                this.onExpressionBinItemRemoved.trigger(expr, this);
        }
    }

    isInBin(expr: SelectedItem) { return this._expressionBin.indexOf(expr) >= 0; }

    // --------------------------------------------------------------------------------------------------------------------

    pick(expr: SelectedItem) {
        this._pickedItem = expr;
    }

    // --------------------------------------------------------------------------------------------------------------------

    //private _findChildNode(node: HTMLElement, fstype: Type): HTMLElement { //?
    //    if (node) {
    //        for (var i = 0, len = node.childNodes.length; i < len; ++i)
    //            if ((<any>node.childNodes[i])["$__fs_type"] == fstype)
    //                return <HTMLElement>node.childNodes[i];
    //    }
    //    else return null;
    //}

    // --------------------------------------------------------------------------------------------------------------------
}

// ========================================================================================================================
