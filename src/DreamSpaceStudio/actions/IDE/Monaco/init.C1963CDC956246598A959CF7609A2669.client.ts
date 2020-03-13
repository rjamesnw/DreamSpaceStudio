
export default async function init(outputTarget: string | HTMLElement): Promise<DS.IO.IResponse<boolean>> {
    var response: DS.IO.IResponse<boolean>;
    // ### USER CODE START ###

    if (!require)
        throw "'RequireJS' is not loaded.";

    //if (!ts)
    //    throw "'ts' TypeScript service namespace reference is required - is the 'ace/mode/typescript/typescriptServices.js' file loaded?.";

    console.log("initialize(): Creating the Monaco editor promise ...");

    return new Promise<any>((resolve, reject) => {
        console.log("initialize(): Loading the Monaco editor ...");

        require(['vs/editor/editor.main'], (main: typeof monaco) => {

            if (!main) {
                var msg = "initialize(): Failed loading 'vs/editor/editor.main'. Make sure 'node_modules\\monaco-editor' exists, as the project will copy it to 'wwwroot\\js'.";
                (console.error || console.log)(msg);
                throw msg;
                return;
            }

            console.log("initialize(): Creating the Monaco editor ...");

            main.languages.typescript.typescriptDefaults.addExtraLib("var ctx: { x: string, y: string };");

            // ... load the editors ...

            DS.activeEditor = this._editor = main.editor.create(this.target, {
                automaticLayout: true, // (https://stackoverflow.com/questions/47017753/monaco-editor-dynamically-resizable)
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

            this._editor.onDidChangeModelContent(sync)

            console.log("initialize(): Monaco editors created. Getting the TS worker ...");

            // ... get the typescript service ...

            monaco.languages.typescript.getTypeScriptWorker().then((workerProxy: (v: monaco.Uri) => Promise<ts.IMonacoTypeScriptServiceProxy>) => {
                console.log("initialize(): Got the TS worker proxy. Getting the service next ...");
                var fileUri = this._editor.getModel().uri;
                workerProxy(fileUri).then((tsProxy) => {
                    console.log("initialize(): Got the TS worker service proxy:");
                    console.log(tsProxy);
                    (<any>DS)['$__ts'] = tsProxy;
                    this._tsServiceProxy = tsProxy;
                    this._tsServiceProxy.getEmitOutput(fileUri.toString()).then((r: any) => {
                        // ... execute any "ready" callbacks ...
                        this._outputEditor.setValue(r.outputFiles[0].text);
                        resolve(this);
                    });
                });
            }, (reason) => { reject("Error getting TypeScript service worker: " + reason); });

        }, (msg: RequireError) => {
            console.log("initialize(): Failed loading the Monaco editor");
            reject("Failed loading 'FlowScript/ace/ace_ts_editor_main' module: " + msg + "\r\n" + ((<any>msg).stack || ""));
        });
    });

    response = new DS.IO.Response("OK", true);

    // ### USER CODE end ###
    return response;
}