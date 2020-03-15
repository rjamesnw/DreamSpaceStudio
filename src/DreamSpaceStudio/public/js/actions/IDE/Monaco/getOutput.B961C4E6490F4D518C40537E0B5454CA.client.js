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
    function getOutput(editor) {
        return __awaiter(this, void 0, void 0, function* () {
            var response;
            // ### USER CODE START ###
            /*this._tsService.getOutput(text); */
            response = new DS.IO.Response("OK");
            // ### USER CODE END ###
            return response;
        });
    }
    exports.default = getOutput;
});
//# sourceMappingURL=getOutput.B961C4E6490F4D518C40537E0B5454CA.client.js.map