/**
 * Contains the bot's response information.
 */
export default class Response {
    /**
     * Constructs a new bot response.
     * @param {string} message The message the bot wishes to convey to the user.
     * @param {string} preMessageText Text that should appear BEFORE the message given to the user. This message is not spoken if TTS is enabled.
     * @param {string} postMessageText Text that should appear AFTER the message given to the user. This message is not spoken if TTS is enabled.
     */
    constructor(public message: string, public preMessageText: string = null, public postMessageText: string = null) {
        this.message = message;
        this.preMessageText = preMessageText;
        this.postMessageText = postMessageText;
    }
}
