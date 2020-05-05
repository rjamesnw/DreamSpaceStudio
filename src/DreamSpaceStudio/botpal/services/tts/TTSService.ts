import ITTSService from "./ITTSService";
import TTSFile from "../../db/TTSFile";
import Ivona from "../apis/tts/Ivona";

export class DefaultTTSService implements ITTSService {
    // --------------------------------------------------------------------------------------------------------------------

    static get CurrentAppPath() { return DS.webRoot; }
    static get CurrentTTSPath() { return DS.Path.combine(this.CurrentAppPath, "TTS"); }

    _BotPalDB = new BotPalDB();

    // --------------------------------------------------------------------------------------------------------------------

    /**
     *  Plays the given MP3 file.
    */
    /// <param name="filepath">The MP3 file to play.</param>
    PlayMP3File(filepath: string) {
        var reader = new Mp3FileReader(filepath);
        var waveOut = new WaveOut(); // or WaveOutEvent()
        waveOut.Init(reader);
        waveOut.Play();
        return Promise.resolve();
    }

    _VoiceCodeParts(voiceCode: string): string[] {
        var parts = voiceCode.split('-');
        parts[0] = parts[0].toLowerCase(); // (make the first one lowercase, since it is only the engine type selector)
        return parts;
    }

    /**
     *  Gets and plays the audio file associated with the given text and voice code.
     *  If the voice code is not supplied, or null, then the default 'ivona' TTS engine is assumed.
    */
    /// <param name="text">The text to get a voice audio file for.</param>
    /// <param name="voiceCode">The voice code for the expected audio.</param>
    async Say(text: string, voiceCode = "ivona"): Promise<void> {
        if (voiceCode == null) voiceCode = "ivona";
        var filepath = await this.GetTTSAudioFilePath(text, voiceCode);
        await this.PlayMP3File(filepath);
    }

    GetTTSFileEntry(text: string, voiceCode: string): TTSFile {
        text = text.toLowerCase();

        voiceCode = this._VoiceCodeParts(voiceCode).join('-');

        return this._BotPalDB.TTSFiles.filter(f => f.text.ToLower() == text && f.voice_code == voiceCode)[0];
    }

    /**
     *  Gets a cached audio file, or creates a new one.
     *  If the voice code is not supplied, or null, then the default 'ivona' TTS engine is assumed.
    */
    /// <param name="text">The text to get an audio file for.</param>
    /// <param name="voiceCode">The voice code is used to select a supported TTS engine and voice profile to use when generating the audio.
    /// <para>The format is '{TTS Engine Type}-{Voice Name/Code/ID}'; where second value after the hyphen is optional (so a default voice profile should be used). </para>
    /// <para>For example, the default voice profile for 'ivona-Joanna' is "Joanna", so only the 'ivona' TTS engine name is required.</para>
    /// <para>Note: An empty TTS Engine Type value will select the operating system's default TTS engine if one exists.</para>
    /// </param>
    /// <returns></returns>
    async GetTTSAudioFilePath(text: string, voiceCode = "ivona"): Promise<string> {
        if (voiceCode == null) voiceCode = "ivona";

        var targetFilename = "";

        if (DS.StringUtils.isEmptyOrWhitespace(text))
            throw new DS.Exception("GetTTSAudioFilePath(): Nothing to say, text is null or empty.");

        var exisitngTTSFile: TTSFile = null;

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
        var voiceID = voiceCodeValues.Length > 1 ? voiceCodeValues[1] : null;

        if (ttsEngineType == "ivona") {
            if (DS.StringUtils.isEmptyOrWhitespace(voiceID))
                voiceID = "Joanna"; // (Joanna and Salli were also ok for this language and gender)

            voiceCode = ttsEngineType + '-' + voiceID; // (fix the voice code first)
            if (tryGetExistingFile()) return targetFilename;

            var ivona = new Ivona();

            targetFilename = DS.Path.combine(this.CurrentTTSPath, this.GetOutputAudioFilePath(ttsEngineType, text, voiceID) + ".mp3");

            if (!DS.IO.exists(targetFilename))
                await ivona.CreateSpeech(text, voiceID, targetFilename);
        }
        else {
            voiceCode = ttsEngineType + (DS.StringUtils.isEmptyOrWhitespace(voiceID) ? null : '-' + voiceID); // (fix the voice code first)
            if (tryGetExistingFile()) return targetFilename;

            var synth = this.Synthesizer;

            var voice = this.InstalledVoices.FirstOrDefault(v => v.VoiceInfo.Id == voiceID);
            if (voice != null && voice.Enabled && voice.VoiceInfo.Name != synth.Voice.Name)
                synth.SelectVoice(voice.VoiceInfo.Name);

            targetFilename = DS.Path.combine(this.CurrentTTSPath, this.GetOutputAudioFilePath("windows", text, synth.Voice.Id) + ".mp3");

            if (!File.Exists(targetFilename)) {
                //set some settings
                synth.Volume = 100;
                synth.Rate = 0; //medium

                //save to memory stream
                var ms = new MemoryStream();
                synth.SetOutputToWaveStream(ms);

                //do speaking
                synth.Speak(text);

                //now convert to mp3 using LameEncoder or shell out to audio grabber
                await this.ConvertWavStreamToMp3File(ms, targetFilename);
            }
        }

        if (DS.StringUtils.isEmptyOrWhitespace(targetFilename))
            throw new DS.Exception("DefaultTTSService.GetTTSAudioFilePath()", "Invalid target output audio file path.");
        else {
            // ... save the audio file details and return the audio ...
            if (exisitngTTSFile == null)
                this._BotPalDB.TTSFiles.Add(exisitngTTSFile = new TTSFile());

            exisitngTTSFile.filename = Path.GetFileName(targetFilename);
            exisitngTTSFile.voice_code = string.IsNullOrWhiteSpace(voiceCode) ? null : voiceCode;
            exisitngTTSFile.location = Path.GetDirectoryName(targetFilename);
            exisitngTTSFile.text = text;

            this._BotPalDB.SaveChanges();

            return targetFilename;
        }
    }

    // --------------------------------------------------------------------------------------------------------------------

    /**
     *  Generates a path and filename for the given text and voice code that will be used to created the final MP3 audio file.
    */
    /// <param name="text">The text that represents the contents of the audio file.</param>
    /// <param name="voiceID">The voice profile identifier used by the TTS engine to generate the audio data (typically this is the name of the voice actor selected).</param>
    /// <returns></returns>
    GetOutputAudioFilePath(ttsEngineName: string, text: string, voiceID: string): string {
        text = ttsEngineName + "_" + voiceID + "_" + text;
        var filename = text.split(DS.Path.restrictedFilenameRegex).filter(s => !!s).join('_').trimRightChar('.').replace(/'\s'/g, '_');
        if (filename.Length > 50)
            filename = filename.Substring(0, 50);
        // (note: the first name part gives a small glimpse in what the audio is without needing the database; also, if the
        // filename is too long, the file cannot be loaded by the browser)
        return filename + "_" + DS.Utilities.createGUID(false); // (finally, use a GUID to make sure the file is unique, since it may have been truncated if too long and cause conflicts)
    }

    // --------------------------------------------------------------------------------------------------------------------

    /**
     *  Converts a given memory stream, representing a WAV file, into an MP3 file.
    */
    /// <param name="ms">The WAV memory stream to convert.</param>
    /// <param name="savetofilename">The output path and filename for the resulting MP4 file.</param>
    async ConvertWavStreamToMp3File(stream: Buffer, savetofilename: string): Promise<void> {
        //rewind to beginning of stream
        stream.Seek(0, SeekOrigin.Begin);

        var rdr = new WaveFileReader(stream);
        var wtr = new LameMP3FileWriter(savetofilename, rdr.WaveFormat, LAMEPreset.VBR_90);
        await rdr.CopyToAsync(wtr);
    }

    // --------------------------------------------------------------------------------------------------------------------
    // The OS voices are used mainly as backups in case the web service is not available.

    // TODO: Put this in a different class under a new TTS "default fallback" plugin.

    static Synthesizer: SpeechSynthesizer;
    static InstalledVoices: InstalledVoice[];
    static DefaultVoice: VoiceInfo;

    private static _DefaultTTSService_ctor = (function (this: typeof DefaultTTSService) { // (static constructor)
        // ... setup TTS synthesizer before initializing, otherwise requests may hang (it spawns its own threads) ...

        this.Synthesizer = new SpeechSynthesizer();
        this.InstalledVoices = this.Synthesizer.GetInstalledVoices().ToArray();

        // ... select the default best voices, in best to least order ...

        if (!this.TryChangeDefaultVoice("Zira") && !this.TryChangeDefaultVoice("Helen"))
            this.DefaultVoice = this.Synthesizer.Voice; // (if cannot change it, just use the existing one as is)
    }).call(DefaultTTSService);

    static TryChangeDefaultVoice(name: string): boolean {
        var defaultInstalledVoice = (from v in this.InstalledVoices where v.VoiceInfo.Name.Contains(name) select v).FirstOrDefault();
        if (defaultInstalledVoice != null && defaultInstalledVoice.Enabled) {
            this.DefaultVoice = defaultInstalledVoice.VoiceInfo;
            this.Synthesizer.SelectVoice(this.DefaultVoice.Name);
            return true;
        }
        else {
            this.DefaultVoice = this.Synthesizer.Voice;
            return false;
        }
    }

    // --------------------------------------------------------------------------------------------------------------------
}
