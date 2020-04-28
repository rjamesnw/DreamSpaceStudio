"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Contains the bot's response information.
 */
class Response {
    /**
     * Constructs a new bot response.
     * @param {string} message The message the bot wishes to convey to the user.
     * @param {string} preMessageText Text that should appear BEFORE the message given to the user. This message is not spoken if TTS is enabled.
     * @param {string} postMessageText Text that should appear AFTER the message given to the user. This message is not spoken if TTS is enabled.
     */
    constructor(message, preMessageText = null, postMessageText = null) {
        this.message = message;
        this.preMessageText = preMessageText;
        this.postMessageText = postMessageText;
        this.message = message;
        this.preMessageText = preMessageText;
        this.postMessageText = postMessageText;
    }
}
exports.default = Response;
//# sourceMappingURL=Response.js.map