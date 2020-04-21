using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BotPal
{
    public class Response
    {
        /// <summary> The message the bot wishes to convey to the user. </summary>
        public string Message;

        /// <summary>
        ///     Text that should appear BEFORE the message given to the user. This message is not spoken if TTS is
        ///     enabled.
        /// </summary>
        public string PreMessageText;

        /// <summary>
        ///     Text that should appear AFTER the message given to the user. This message is not spoken if TTS is enabled.
        /// </summary>
        public string PostMessageText;

        public Response(string message, string preMessageText = null, string postMessageText = null)
        {
            Message = message;
            PreMessageText = preMessageText;
            PostMessageText = postMessageText;
        }
    }
}
