var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function init(outputTarget) {
        return __awaiter(this, void 0, void 0, function* () {
            var response;
            // ### USER CODE START ###
            if (!require)
                throw "'RequireJS' is not loaded.";
            //if (!ts)
            //    throw "'ts' TypeScript service namespace reference is required - is the 'ace/mode/typescript/typescriptServices.js' file loaded?.";
            console.log("initialize(): Creating the Monaco editor promise ...");
            return new Promise((resolve, reject) => {
                console.log("initialize(): Loading the Monaco editor ...");
                require(['vs/editor/editor.main'], (main) => {
                    if (!main) {
                        var msg = "initialize(): Failed loading 'vs/editor/editor.main'. Make sure 'node_modules\\monaco-editor' exists, as the project will copy it to 'wwwroot\\js'.";
                        (console.error || console.log)(msg);
                        throw msg;
                        return;
                    }
                    console.log("initialize(): Creating the Monaco editor ...");
                    main.languages.typescript.typescriptDefaults.addExtraLib("var ctx: { x: string, y: string };");
                    // ... load the editors ...
                    activeEditor = this._editor = main.editor.create(this.target, {
                        automaticLayout: true,
                        value: [
                            'function x() {',
                            '\tconsole.log("Hello world!");',
                            '}'
                        ].join('\n'),
                        language: 'typescript'
                    });
                    this._outputEditor = main.editor.create(this.outputTarget, {
                        automaticLayout: true,
                        readOnly: true,
                        codeLens: false,
                        contextmenu: false,
                        value: [
                            '// Output JS does here ...'
                        ].join('\n'),
                        language: 'javascript'
                    });
                    var sync = () => {
                        if (this._tsServiceProxy)
                            setTimeout(() => {
                                this._tsServiceProxy.getEmitOutput(this._editor.getModel().uri.toString())
                                    .then((r) => {
                                    this._outputEditor.setValue(r.outputFiles[0].text);
                                });
                            }, 500);
                    };
                    this._editor.onDidChangeModelContent(sync);
                    console.log("initialize(): Monaco editors created. Getting the TS worker ...");
                    // ... get the typescript service ...
                    monaco.languages.typescript.getTypeScriptWorker().then((workerProxy) => {
                        console.log("initialize(): Got the TS worker proxy. Getting the service next ...");
                        var fileUri = this._editor.getModel().uri;
                        workerProxy(fileUri).then((tsProxy) => {
                            console.log("initialize(): Got the TS worker service proxy:");
                            console.log(tsProxy);
                            FlowScript['$__ts'] = tsProxy;
                            this._tsServiceProxy = tsProxy;
                            this._tsServiceProxy.getEmitOutput(fileUri.toString()).then((r) => {
                                // ... execute any "ready" callbacks ...
                                this._outputEditor.setValue(r.outputFiles[0].text);
                                resolve(this);
                            });
                        });
                    }, (reason) => { reject("Error getting TypeScript service worker: " + reason); });
                }, (msg) => {
                    console.log("initialize(): Failed loading the Monaco editor");
                    reject("Failed loading 'FlowScript/ace/ace_ts_editor_main' module: " + msg + "\r\n" + (msg.stack || ""));
                });
            });
            response = new DS.IO.Response("OK", true);
            // ### USER CODE end ###
            return response;
        });
    }
    exports.default = init;
});
//# sourceMappingURL=init.C1963CDC956246598A959CF7609A2669.client.js.map