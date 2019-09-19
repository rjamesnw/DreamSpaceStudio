namespace DS {
    export class FileVersion {
        _filename: string;
        _originalFilename: string;
        file: VirtualFileSystem.Abstract.File;
        originalFile: VirtualFileSystem.Abstract.File;
        version: number;
        replacedOn: Date;

        /** The file name to save the underlying data as. If not specified, then a GUID value will be generated and used automatically. */
        _filename: string;
        /** The version of this persistable instance. If a version number is set, then it will be added to the file name.
         * If not set (the default), then versioning will not be used. Any value set that is less than 1 will be push up to 1 as the
         * starting value during the save process.
         */
        get version(): number { return typeof this._version == 'number' ? this._version : void 0; }
        set version(v: number) { this._version = typeof v != 'number' ? 1 : v < 1 ? 1 : v; }
        private _version?: number;
        /** An optional description for this version. */
        _versionDescription?: string;

        /* Returns the file name with the version appended, or just the file name if no version exists. */
        get versionedFileName() {
            return this._filename + (this.version ? '_' + StringUtils.pad(this.version.toString(16), 8, '0') : '');
        }
    }

    /** Manages lists of file versions. 
     * This object acts like a trash bin by assigning a version counter and date/time to a file in the virtual file system.
     */
    export class FileVersions extends PersistableObject {
        /* The base path where all the replaced files end up. The versioning system will simply swap files as requested from
         * this base directory and the source target directory.
         */
        static versionsBasePath: string = "versions";
        readonly versions: FileVersion[] = [];
    }
}