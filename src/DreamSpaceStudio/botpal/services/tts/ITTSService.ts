
export default interface ITTSService {
    ConvertWavStreamToMp3File(stream: Buffer, savetofilename: string): Promise<void>;
    GetOutputAudioFilePath(ttsEngineName: string, text: string, voiceID: string): string;
    GetTTSAudioFilePath(text: string, voiceCode?: string | "ivona"): Promise<string>;
    PlayMP3File(filepath: string): Promise<void>;
    Say(text: string, voiceCode?: string | "ivona"): Promise<void>;
}