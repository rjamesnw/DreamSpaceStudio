namespace DS {
    export namespace Utilities {
        export namespace HTML {
            export function clearChildNodes(node: Node): Node {
                if (node)
                    while (node.firstChild)
                        node.removeChild(node.firstChild);
                return node;
            }
        }
    }
}