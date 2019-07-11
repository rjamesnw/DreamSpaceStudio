declare namespace DS {
    /** Loads a file and returns the contents as text. */
    function load(path: string): Promise<string>;
    /** Lists the contents of a directory. */
    function getFiles(path: string): Promise<string[]>;
    /** Lists the contents of a directory. */
    function getDirectories(path: string): Promise<string[]>;
}
