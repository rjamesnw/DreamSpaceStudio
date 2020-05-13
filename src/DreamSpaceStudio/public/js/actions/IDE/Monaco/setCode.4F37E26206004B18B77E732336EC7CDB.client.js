var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // WARNING: This code is auto-generated. Only code placed between the "### USER CODE START ###" and "### USER CODE END ###"
    // comments will be preserved between updates.
    function setCode(editor, text) {
        return __awaiter(this, void 0, void 0, function* () {
            var response;
            // ### USER CODE START ###
            /*this._tsService.setCode(text); */
            response = new DS.IO.Response("OK");
            // ### USER CODE END ###
            return response;
        });
    }
    exports.default = setCode;
});
//# sourceMappingURL=setCode.4F37E26206004B18B77E732336EC7CDB.client.js.map