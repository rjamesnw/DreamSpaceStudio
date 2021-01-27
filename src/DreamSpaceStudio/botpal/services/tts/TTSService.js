"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultTTSService = void 0;
const TTSFile_1 = require("../../db/TTSFile");
const Ivona_1 = require("../apis/tts/Ivona");
const node_lame_1 = require("node-lame");
class DefaultTTSService {
    constructor() {
        // --------------------------------------------------------------------------------------------------------------------
        this._BotPalDB = new DS.DB.MySQL.MySQLAdapter();
        // --------------------------------------------------------------------------------------------------------------------
        // The OS voices are used mainly as backups in case the web service is not available.
        // TODO: Put this in a different class under a new TTS "default fallback" plugin.
        //static Synthesizer: SpeechSynthesizer;
        //static InstalledVoices: InstalledVoice[];
        //static DefaultVoice: VoiceInfo;
        //private static _DefaultTTSService_ctor = (function (this: typeof DefaultTTSService) { // (static constructor)
        //    // ... setup TTS synthesizer before initializing, otherwise requests may hang (it spawns its own threads) ...
        //    this.Synthesizer = new SpeechSynthesizer();
        //    this.InstalledVoices = this.Synthesizer.GetInstalledVoices().ToArray();
        //    // ... select the default best voices, in best to least order ...
        //    if (!this.TryChangeDefaultVoice("Zira") && !this.TryChangeDefaultVoice("Helen"))
        //        this.DefaultVoice = this.Synthesizer.Voice; // (if cannot change it, just use the existing one as is)
        //}).call(DefaultTTSService);
        //static TryChangeDefaultVoice(name: string): boolean {
        //    var defaultInstalledVoice = (from v in this.InstalledVoices where v.VoiceInfo.Name.Contains(name) select v).FirstOrDefault();
        //    if (defaultInstalledVoice != null && defaultInstalledVoice.Enabled) {
        //        this.DefaultVoice = defaultInstalledVoice.VoiceInfo;
        //        this.Synthesizer.SelectVoice(this.DefaultVoice.Name);
        //        return true;
        //    }
        //    else {
        //        this.DefaultVoice = this.Synthesizer.Voice;
        //        return false;
        //    }
        //}
        // --------------------------------------------------------------------------------------------------------------------
    }
    static get CurrentAppPath() { return DS.webRoot; }
    static get CurrentTTSPath() { return DS.Path.combine(this.CurrentAppPath, "TTS"); }
    // --------------------------------------------------------------------------------------------------------------------
    async _getConnection() {
        //if (this._BotPalConn && (this._BotPalConn.connection.state == 'connected' || this._BotPalConn.connection.state == 'authenticated'))
        //    return this._BotPalConn;
        return this._BotPalConn || (this._BotPalConn = await this._BotPalDB.createConnection()); // (uses the environment default values)
    }
    // --------------------------------------------------------------------------------------------------------------------
    /**
     *  Sends the given MP3 file to the specified channel.
     *  @param filepath  The MP3 file to play.
     */
    PlayMP3File(filepath, channelID) {
        //var reader = new Mp3FileReader(filepath);
        //var waveOut = new WaveOut(); // or WaveOutEvent()
        //waveOut.Init(reader);
        //waveOut.Play();
        return Promise.resolve();
    }
    _VoiceCodeParts(voiceCode) {
        var parts = voiceCode.split('-');
        parts[0] = parts[0].toLowerCase(); // (make the first one lowercase, since it is only the engine type selector)
        return parts;
    }
    /**
     *  Gets and plays the audio file associated with the given text and voice code.
     *  If the voice code is not supplied, or null, then the default 'ivona' TTS engine is assumed.
     *  @param text The text to get a voice audio file for.
     *  @param voiceCode The voice code for the expected audio.
    */
    async Say(text, channelID, voiceCode = "ivona") {
        if (voiceCode == null)
            voiceCode = "ivona";
        var filepath = await this.GetTTSAudioFilePath(text, voiceCode);
        await this.PlayMP3File(filepath, channelID);
    }
    async GetTTSFileEntry(text, voiceCode) {
        text = text.toLowerCase();
        voiceCode = this._VoiceCodeParts(voiceCode).join('-');
        var result = await this._BotPalDB.query("SELECT * FROM tts_files where lcase(text) = ? and voice_code = ?", [text, voiceCode]);
        return result.response;
    }
    /**
     *  Gets a cached audio file, or creates a new one.
     *  If the voice code is not supplied, or null, then the default 'ivona' TTS engine is assumed.
     *  @param text The text to get an audio file for.
     *  @param voiceCode The voice code is used to select a supported TTS engine and voice profile to use when generating the audio.
     *  @param The format is '{TTS Engine Type}-{Voice Name/Code/ID}'; where second value after the hyphen is optional (so a default voice profile should be used).
     *  For example, the default voice profile for 'ivona-Joanna' is "Joanna", so only the 'ivona' TTS engine name is required.
     *  Note: An empty TTS Engine Type value will select the operating system's default TTS engine if one exists.
    */
    async GetTTSAudioFilePath(text, voiceCode = "ivona") {
        if (voiceCode == null)
            voiceCode = "ivona";
        var targetFilename = "";
        if (DS.StringUtils.isEmptyOrWhitespace(text))
            throw new DS.Exception("GetTTSAudioFilePath(): Nothing to say, text is null or empty.");
        var exisitngTTSFile = null;
        function tryGetExistingFile() {
            exisitngTTSFile = this.GetTTSFileEntry(text, voiceCode);
            if (exisitngTTSFile != null) {
                targetFilename = DS.Path.combine(exisitngTTSFile.location, exisitngTTSFile.filename);
                return DS.IO.exists(targetFilename, true);
            }
            return false;
        }
        // ... check if text was requested before ...
        var voiceCodeValues = this._VoiceCodeParts(voiceCode);
        var ttsEngineType = voiceCodeValues[0];
        var voiceID = voiceCodeValues.length > 1 ? voiceCodeValues[1] : null;
        if (ttsEngineType == "ivona") {
            if (DS.StringUtils.isEmptyOrWhitespace(voiceID))
                voiceID = "Joanna"; // (Joanna and Salli were also ok for this language and gender)
            voiceCode = ttsEngineType + '-' + voiceID; // (fix the voice code first)
            if (tryGetExistingFile())
                return targetFilename;
            var ivona = new Ivona_1.default();
            targetFilename = DS.Path.combine(DefaultTTSService.CurrentTTSPath, this.GetOutputAudioFilePath(ttsEngineType, text, voiceID) + ".mp3");
            if (!DS.IO.exists(targetFilename))
                await ivona.CreateSpeech(text, voiceID, targetFilename);
        }
        //else {
        //    voiceCode = ttsEngineType + (DS.StringUtils.isEmptyOrWhitespace(voiceID) ? null : '-' + voiceID); // (fix the voice code first)
        //    if (tryGetExistingFile()) return targetFilename;
        //    var synth = this.Synthesizer;
        //    var voice = this.InstalledVoices.FirstOrDefault(v => v.VoiceInfo.Id == voiceID);
        //    if (voice != null && voice.Enabled && voice.VoiceInfo.Name != synth.Voice.Name)
        //        synth.SelectVoice(voice.VoiceInfo.Name);
        //    targetFilename = DS.Path.combine(DefaultTTSService.CurrentTTSPath, this.GetOutputAudioFilePath("windows", text, synth.Voice.Id) + ".mp3");
        //    if (!File.Exists(targetFilename)) {
        //        //set some settings
        //        synth.Volume = 100;
        //        synth.Rate = 0; //medium
        //        //save to memory stream
        //        var ms = new MemoryStream();
        //        synth.SetOutputToWaveStream(ms);
        //        //do speaking
        //        synth.Speak(text);
        //        //now convert to mp3 using LameEncoder or shell out to audio grabber
        //        await this.ConvertWavStreamToMp3File(ms, targetFilename);
        //    }
        //}
        if (DS.StringUtils.isEmptyOrWhitespace(targetFilename))
            throw new DS.Exception("DefaultTTSService.GetTTSAudioFilePath()", "Invalid target output audio file path.");
        else {
            // ... save the audio file details and return the audio ...
            if (exisitngTTSFile == null) {
                let newFile = new TTSFile_1.default();
                newFile.filename = DS.Path.getName(targetFilename);
                newFile.voice_code = DS.StringUtils.isEmptyOrWhitespace(voiceCode) ? null : voiceCode;
                newFile.location = DS.Path.getPath(targetFilename);
                newFile.text = text;
                var conn = await this._getConnection();
                await conn.updateOrInsert(newFile, "tts_files");
            }
            return targetFilename;
        }
    }
    // --------------------------------------------------------------------------------------------------------------------
    /**
     *  Generates a path and filename for the given text and voice code that will be used to created the final MP3 audio file.
     *  @param text The text that represents the contents of the audio file.
     *  @param voiceID The voice profile identifier used by the TTS engine to generate the audio data (typically this is the name of the voice actor selected).
    */
    GetOutputAudioFilePath(ttsEngineName, text, voiceID) {
        text = ttsEngineName + "_" + voiceID + "_" + text;
        var filename = text.split(DS.Path.restrictedFilenameRegex).filter(s => !!s).join('_').trimRightChar('.').replace(/'\s'/g, '_');
        if (filename.length > 50)
            filename = filename.substr(0, 50);
        // (note: the first name part gives a small glimpse in what the audio is without needing the database; also, if the
        // filename is too long, the file cannot be loaded by the browser)
        return filename + "_" + DS.Utilities.createGUID(false); // (finally, use a GUID to make sure the file is unique, since it may have been truncated if too long and cause conflicts)
    }
    // --------------------------------------------------------------------------------------------------------------------
    /**
     *  Converts a given memory stream, representing a WAV file, into an MP3 file.
     *  @param stream The WAV memory stream to convert.
     *  @param savetofilename The output path and filename for the resulting MP4 file.
    */
    async ConvertWavStreamToMp3File(stream, savetofilename) {
        let encoder = new node_lame_1.Lame({
            output: savetofilename,
            bitrate: 192
        }).setBuffer(stream);
        await encoder.encode().then(() => {
            // Encoding finished
        }).catch(error => {
            // Something went wrong
            throw error;
        });
    }
}
exports.DefaultTTSService = DefaultTTSService;
//# sourceMappingURL=TTSService.js.map