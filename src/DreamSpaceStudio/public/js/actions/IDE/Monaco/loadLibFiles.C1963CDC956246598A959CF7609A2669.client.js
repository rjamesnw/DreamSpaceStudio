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
    // WARNING: This code is auto-generated. Only code placed between the "### USER CODE START ###" and "### USER CODE END ###"
    // comments will be preserved between updates.
    () => { };
    function loadLibFiles(editor, libFiles) {
        return __awaiter(this, void 0, void 0, function* () {
            var response;
            // ### USER CODE START ###
            monaco.languages.typescript.typescriptDefaults.addExtraLib("class ctx { x:0; }");
            response = new DS.IO.Response("OK", true);
            // ### USER CODE END ###
            return response;
        });
    }
    exports.default = loadLibFiles;
});
//# sourceMappingURL=loadLibFiles.C1963CDC956246598A959CF7609A2669.client.js.map