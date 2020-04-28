
export default interface ITTSSAPI {
    /// <summary>
    /// The output file from this call should convert the given text, using the specific voice name (or default voice if null/empty), to a WAV audio file.
    /// This WAV file will be later converted into an MP3 file and stored.  The resulting audio files are cached, so this method is normally only called one per new text response encountered.
    /// </summary>
    /// <param name="text">The text to create a WAV file for.</param>
    /// <param name="voiceName">The type of voice to use.</param>
    /// <param name="targetFilename">A target filename the audio should b written to.</param>
    CreateSpeech(text: string, voiceName: string, targetFilename: string): Promise<void>;
}
