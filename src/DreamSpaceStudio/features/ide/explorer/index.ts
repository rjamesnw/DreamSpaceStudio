import { startup } from "../../startup";

export enum Categories {
    System,
    Projects,
    Scripts,
    Server
}

export class DSExplorer {
    readonly dstree: JSTree;

    systemNode: JSTree;
    projectsNode: JSTree;
    scriptsNode: JSTree;
    serverNode: JSTree;

    constructor(dstree: JSTree | string) {
        this.dstree = typeof dstree == 'string' ? $(dstree)?.jstree() : dstree;
        if (!dstree) throw DS.Exception.argumentRequired("new DSExplorer()", "dstree");
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

    private async _loadFiles(id: string | number, path: string) {
        var files = await DS.IO.getFiles(path);
        alert(JSON.stringify(files));
    }

    async loadCategories() {
        await this._loadFiles(Categories.Server, "server");
    }
}

startup.then(async () => { // (always initialize first, then go from there)
    var tree = new DSExplorer('#files');
    tree.initialize();
    await tree.loadCategories();
});





