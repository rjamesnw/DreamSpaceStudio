define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // WARNING: This code is auto-generated. Only code placed between the "### USER CODE START ###" and "### USER CODE END ###"
    // comments will be preserved between updates.
    async function loadLibFiles(editor, libFiles) {
        var response;
        // ### USER CODE START ###
        monaco.languages.typescript.typescriptDefaults.addExtraLib("class ctx { x:0; }");
        response = new DS.IO.Response("OK");
        // ### USER CODE END ###
        return response;
    }
    exports.default = loadLibFiles;
});
//# sourceMappingURL=loadLibFiles.61ECF74B49B449B09E2B155BDA3C1B41.client.js.map