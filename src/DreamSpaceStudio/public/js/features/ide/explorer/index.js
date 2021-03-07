define(["require", "exports", "../../startup"], function (require, exports, startup_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DSExplorer = exports.Categories = void 0;
    var Categories;
    (function (Categories) {
        Categories[Categories["System"] = 0] = "System";
        Categories[Categories["Projects"] = 1] = "Projects";
        Categories[Categories["Scripts"] = 2] = "Scripts";
        Categories[Categories["Server"] = 3] = "Server";
    })(Categories = exports.Categories || (exports.Categories = {}));
    class DSExplorer {
        constructor(dstree) {
            var _a;
            this.dstree = typeof dstree == 'string' ? (_a = $(dstree)) === null || _a === void 0 ? void 0 : _a.jstree() : dstree;
            if (!dstree)
                throw DS.Exception.argumentRequired("new DSExplorer()", "dstree");
        }
        /** Clears the tree and creates the default categories. */
        initialize() {
            this.dstree.delete_node(this.dstree.get_node("#").children);
            var id = this.dstree.create_node(null, { "text": "System", "slug": "sys", "id": Categories.System }, 'last');
            this.systemNode = this.dstree.get_node(id);
            id = this.dstree.create_node(null, { "text": "Projects", "slug": "prj", "id": Categories.Projects }, 'last');
            this.projectsNode = this.dstree.get_node(id);
            id = this.dstree.create_node(null, { "text": "Scripts", "slug": "fs", "id": Categories.Scripts }, 'last');
            this.scriptsNode = this.dstree.get_node(id);
            id = this.dstree.create_node(null, { "text": "Server", "slug": "sys", "id": Categories.Server }, 'last');
            this.serverNode = this.dstree.get_node(id);
        }
        async _loadFiles(id, path) {
            var files = await DS.IO.getFiles(path);
            alert(JSON.stringify(files));
        }
        async loadCategories() {
            await this._loadFiles(Categories.Server, "server");
        }
    }
    exports.DSExplorer = DSExplorer;
    startup_1.startup.then(async () => {
        var tree = new DSExplorer('#files');
        tree.initialize();
        await tree.loadCategories();
    });
});
//# sourceMappingURL=index.js.map