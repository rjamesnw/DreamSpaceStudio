declare namespace DS {
    /** Loads a file and returns the contents as text. */
    function load(path: string): Promise<string>;
    /** Lists the contents of a directory. */
    function getFiles(path: string): Promise<string[]>;
    /** Lists the contents of a directory. */
    function getDirectories(path: string): Promise<string[]>;
}
declare namespace DS {
    namespace StringUtils {
        /** Replaces one string with another in a given string.
            * This function is optimized to select the faster method in the current browser. For instance, 'split()+join()' is
            * faster in Chrome, and RegEx based 'replace()' in others.
            */
        function replace(source: string, replaceWhat: string, replaceWith: string, ignoreCase?: boolean): string;
    }
}
