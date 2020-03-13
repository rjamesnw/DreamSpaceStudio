// CLIENT GLOBALS ONLY!

namespace DS {
    /** The currently active editor that the user has focused. */
    export var activeEditor: monaco.editor.IStandaloneCodeEditor;

    /** All editor instances created on the page by ID. */
    export var editors: { [index: string]: monaco.editor.IStandaloneCodeEditor } = {};
}

var require: Require;
require && require.config({ paths: { 'vs': 'js/monaco-editor/min/vs' } });

namespace ts {
    export interface IMonacoTypeScriptServiceProxy {
        _getModel(uri: string): Promise<{ _eol: string, _lineStarts: any, _Lines: string[], length: number, _uri: monaco.Uri, _versionId: number }>;
        getCompilationSettings(): Promise<CompilerOptions>;
        getCompilerOptionsDiagnostics(): Promise<Diagnostic[]>;
        getCompletionEntryDetails(uri: string, position: number, name: string, formatOptions: FormatCodeOptions | FormatCodeSettings | undefined, source: string | undefined, preferences: UserPreferences | undefined): Promise<CompletionEntryDetails | undefined>;
        getCompletionsAtPosition(uri: string, position: number, options: GetCompletionsAtPositionOptions | undefined): Promise<WithMetadata<CompletionInfo> | undefined>;
        getCurrentDirectory(): Promise<string>;
        getDefaultLibFileName(options: CompilerOptions): Promise<string>;
        getDefinitionAtPosition(uri: string, position: number): Promise<ReadonlyArray<DefinitionInfo> | undefined>;
        getEmitOutput(uri: string, emitOnlyDtsFiles?: boolean): Promise<EmitOutput>;
        getFormattingEditsAfterKeystroke(uri: string, position: number, key: string, options: FormatCodeOptions | FormatCodeSettings): Promise<TextChange[]>;
        getFormattingEditsForDocument(uri: string, options: FormatCodeOptions | FormatCodeSettings): Promise<TextChange[]>;
        getFormattingEditsForRange(uri: string, start: number, end: number, options: FormatCodeOptions | FormatCodeSettings): Promise<TextChange[]>;
        getNavigationBarItems(uri: string): Promise<NavigationBarItem[]>;
        getOccurrencesAtPosition(uri: string, position: number): Promise<ReadonlyArray<ReferenceEntry> | undefined>;
        getQuickInfoAtPosition(uri: string, position: number): Promise<QuickInfo | undefined>;
        getReferencesAtPosition(uri: string, position: number): Promise<ReferenceEntry[] | undefined>;
        getScriptFileNames(): Promise<string[]>;
        getScriptKind(uri: string): Promise<ScriptKind>;
        getScriptSnapshot(uri: string): Promise<IScriptSnapshot | undefined>;
        getScriptVersion(uri: string): Promise<string>;
        /** The first time this is called, it will return global diagnostics (no location). */
        getSemanticDiagnostics(uri: string): Promise<Diagnostic[]>;
        getSignatureHelpItems(uri: string, position: number, options: SignatureHelpItemsOptions | undefined): Promise<SignatureHelpItems | undefined>;
        getSyntacticDiagnostics(uri: string): Promise<DiagnosticWithLocation[]>;
        isDefaultLibFileName(uri: string): Promise<boolean>;
    }
}