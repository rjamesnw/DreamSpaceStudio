var DS;
(function (DS) {
    let Utilities;
    (function (Utilities) {
        let HTML;
        (function (HTML) {
            function clearChildNodes(node) {
                if (node)
                    while (node.firstChild)
                        node.removeChild(node.firstChild);
                return node;
            }
            HTML.clearChildNodes = clearChildNodes;
        })(HTML = Utilities.HTML || (Utilities.HTML = {}));
    })(Utilities = DS.Utilities || (DS.Utilities = {}));
})(DS || (DS = {}));
//# sourceMappingURL=Utilities.js.map