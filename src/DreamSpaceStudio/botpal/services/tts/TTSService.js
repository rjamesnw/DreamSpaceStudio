"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultTTSService = void 0;
const TTSFile_1 = require("../../db/TTSFile");
class DefaultTTSService {
    constructor() {
        // --------------------------------------------------------------------------------------------------------------------
        this._BotPalDB = new BotPalDB();
        // --------------------------------------------------------------------------------------------------------------------
    }
    static get CurrentAppPath() { return DS.webRoot; }
    static get CurrentTTSPath() { return DS.Path.combine(this.CurrentAppPath, "TTS"); }
    // --------------------------------------------------------------------------------------------------------------------
    /// <summary>
    /// Plays the given MP3 file.
    /// </summary>
    /// <param name="filepath">The MP3 file to play.</param>
    PlayMP3File(filepath) {
        var reader = new Mp3FileReader(filepath);
        var waveOut = new WaveOut(); // or WaveOutEvent()
        waveOut.Init(reader);
        waveOut.Play();
        return Promise.resolve();
    }
    _VoiceCodeParts(voiceCode) {
        var parts = voiceCode.Split('-');
        parts[0] = parts[0].ToLower(); // (make the first one lowercase, since it is only the engine type selector)
        return parts;
    }
    /// <summary>
    /// Gets and plays the audio file associated with the given text and voice code.
    /// If the voice code is not supplied, or null, then the default 'ivona' TTS engine is assumed.
    /// </summary>
    /// <param name="text">The text to get a voice audio file for.</param>
    /// <param name="voiceCode">The voice code for the expected audio.</param>
    async Say(text, voiceCode = "ivona") {
        if (voiceCode == null)
            voiceCode = "ivona";
        var filepath = await this.GetTTSAudioFilePath(text, voiceCode);
        await this.PlayMP3File(filepath);
    }
    GetTTSFileEntry(text, voiceCode) {
        text = text.toLowerCase();
        voiceCode = string.Join("-", _VoiceCodeParts(voiceCode));
        return (from);
        f in _BotPalDB.TTSFiles;
        where;
        f.text.ToLower() == text && f.voice_code == voiceCode;
        select;
        f;
        FirstOrDefault();
    }
    /// <summary>
    /// Gets a cached audio file, or creates a new one.
    /// If the voice code is not supplied, or null, then the default 'ivona' TTS engine is assumed.
    /// </summary>
    /// <param name="text">The text to get an audio file for.</param>
    /// <param name="voiceCode">The voice code is used to select a supported TTS engine and voice profile to use when generating the audio.
    /// <para>The format is '{TTS Engine Type}-{Voice Name/Code/ID}'; where second value after the hyphen is optional (so a default voice profile should be used). </para>
    /// <para>For example, the default voice profile for 'ivona-Joanna' is "Joanna", so only the 'ivona' TTS engine name is required.</para>
    /// <para>Note: An empty TTS Engine Type value will select the operating system's default TTS engine if one exists.</para>
    /// </param>
    /// <returns></returns>
    async GetTTSAudioFilePath(text, voiceCode = "ivona") {
        if (voiceCode == null)
            voiceCode = "ivona";
        string;
        targetFilename = "";
        if (string.IsNullOrWhiteSpace(text))
            new InvalidOperationException("Nothing to say, text is null or empty.");
        TTSFile_1.default;
        exisitngTTSFile = null;
        bool;
        tryGetExistingFile();
        {
            exisitngTTSFile = GetTTSFileEntry(text, voiceCode);
            if (exisitngTTSFile != null) {
                targetFilename = Path.Combine(exisitngTTSFile.location, exisitngTTSFile.filename);
                return File.Exists(targetFilename);
            }
            return false;
        }
        // ... check if text was requested before ...
        var voiceCodeValues = _VoiceCodeParts(voiceCode);
        var ttsEngineType = voiceCodeValues[0];
        var voiceID = voiceCodeValues.Length > 1 ? voiceCodeValues[1] : null;
        if (ttsEngineType == "ivona") {
            if (string.IsNullOrWhiteSpace(voiceID))
                voiceID = "Joanna"; // (Joanna and Salli were also ok for this language and gender)
            voiceCode = ttsEngineType + '-' + voiceID; // (fix the voice code first)
            if (tryGetExistingFile())
                return targetFilename;
            var ivona = new Ivona();
            targetFilename = Path.Combine(CurrentTTSPath, GetOutputAudioFilePath(ttsEngineType, text, voiceID) + ".mp3");
            if (!File.Exists(targetFilename))
                await ivona.CreateSpeech(text, voiceID, targetFilename);
        }
        else {
            voiceCode = ttsEngineType + (string.IsNullOrWhiteSpace(voiceID) ? null : '-' + voiceID); // (fix the voice code first)
            if (tryGetExistingFile())
                return targetFilename;
            var synth = Synthesizer;
            var voice = InstalledVoices.FirstOrDefault(v => v.VoiceInfo.Id == voiceID);
            if (voice != null && voice.Enabled && voice.VoiceInfo.Name != synth.Voice.Name)
                synth.SelectVoice(voice.VoiceInfo.Name);
            targetFilename = Path.Combine(CurrentTTSPath, GetOutputAudioFilePath("windows", text, synth.Voice.Id) + ".mp3");
            if (!File.Exists(targetFilename)) {
                //set some settings
                synth.Volume = 100;
                synth.Rate = 0; //medium
                //save to memory stream
                MemoryStream;
                ms = new MemoryStream();
                synth.SetOutputToWaveStream(ms);
                //do speaking
                synth.Speak(text);
                //now convert to mp3 using LameEncoder or shell out to audio grabber
                await ConvertWavStreamToMp3File(ms, targetFilename);
            }
        }
        if (string.IsNullOrWhiteSpace(targetFilename))
            throw new Exception("Invalid target output audio file path.");
        else {
            // ... save the audio file details and return the audio ...
            if (exisitngTTSFile == null)
                _BotPalDB.TTSFiles.Add(exisitngTTSFile = new TTSFile_1.default());
            exisitngTTSFile.filename = Path.GetFileName(targetFilename);
            exisitngTTSFile.voice_code = string.IsNullOrWhiteSpace(voiceCode) ? null : voiceCode;
            exisitngTTSFile.location = Path.GetDirectoryName(targetFilename);
            exisitngTTSFile.text = text;
            _BotPalDB.SaveChanges();
            return targetFilename;
        }
    }
    // --------------------------------------------------------------------------------------------------------------------
    /// <summary>
    /// Generates a path and filename for the given text and voice code that will be used to created the final MP3 audio file.
    /// </summary>
    /// <param name="text">The text that represents the contents of the audio file.</param>
    /// <param name="voiceID">The voice profile identifier used by the TTS engine to generate the audio data (typically this is the name of the voice actor selected).</param>
    /// <returns></returns>
    GetOutputAudioFilePath(ttsEngineName, text, voiceID) {
        var invalids = Path.GetInvalidFileNameChars();
        text = ttsEngineName + "_" + voiceID + "_" + text;
        var filename = string.Join("_", text.Split(invalids, StringSplitOptions.RemoveEmptyEntries)).TrimEnd('.').Replace(' ', '_');
        if (filename.Length > 50)
            filename = filename.Substring(0, 50);
        // (note: the first name part gives a small glimpse in what the audio is without needing the database; also, if the
        // filename is too long, the file cannot be loaded by the browser)
        return filename + "_" + Guid.NewGuid().ToString("N"); // (finally, use a GUID to make sure the file is unique, since it may have been truncated if too long)
    }
    // --------------------------------------------------------------------------------------------------------------------
    /// <summary>
    /// Converts a given memory stream, representing a WAV file, into an MP3 file.
    /// </summary>
    /// <param name="ms">The WAV memory stream to convert.</param>
    /// <param name="savetofilename">The output path and filename for the resulting MP4 file.</param>
    async ConvertWavStreamToMp3File(stream, savetofilename) {
        //rewind to beginning of stream
        stream.Seek(0, SeekOrigin.Begin);
        using();
        var rdr = new WaveFileReader(stream), using;
        ();
        var wtr = new LameMP3FileWriter(savetofilename, rdr.WaveFormat, LAMEPreset.VBR_90);
        await rdr.CopyToAsync(wtr);
    }
    static DefaultTTSService() {
        // ... setup TTS synthesizer before initializing, otherwise requests may hang (it spawns its own threads) ...
        Synthesizer = new SpeechSynthesizer();
        InstalledVoices = Synthesizer.GetInstalledVoices().ToArray();
        // ... select the default best voices, in best to least order ...
        if (!TryChangeDefaultVoice("Zira") && !TryChangeDefaultVoice("Helen"))
            DefaultVoice = Synthesizer.Voice; // (if cannot change it, just use the existing one as is)
    }
    TryChangeDefaultVoice(string, name) {
        var defaultInstalledVoice = (from), v;
         in InstalledVoices;
        where;
        v.VoiceInfo.Name.Contains(name);
        select;
        v;
        FirstOrDefault();
        if (defaultInstalledVoice != null && defaultInstalledVoice.Enabled) {
            DefaultVoice = defaultInstalledVoice.VoiceInfo;
            Synthesizer.SelectVoice(DefaultVoice.Name);
            return true;
        }
        else {
            DefaultVoice = Synthesizer.Voice;
            return false;
        }
    }
}
exports.DefaultTTSService = DefaultTTSService;
//# sourceMappingURL=TTSService.js.map