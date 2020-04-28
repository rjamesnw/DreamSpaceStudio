import * as util from 'util';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import ITTSSAPI from './ITTSSAPI';

const fs_exists = util.promisify(fs.exists);
const fs_mkdir = util.promisify(fs.mkdir);
const fs_writeFile = util.promisify(fs.writeFile);
const fs_appendFile = util.promisify(fs.appendFile);

export default class Ivona implements ITTSSAPI {

    pollyClient = new AWS.Polly({
        signatureVersion: 'v4',
        region: 'us-east-1'
    });

    public Ivona() {
    }

    async  CreateSpeech(text: string, voiceID: string, targetFilename: string) {
        try {
            if (!DS.Path.getName(targetFilename))
                throw DS.Exception.error("Ivona.CreateSpeech()", "A file name is missing.");

            var fullFilePath = DS.Path.toAbsolute(targetFilename);

            let params = <AWS.Polly.SynthesizeSpeechInput>{
                'Text': text,
                'OutputFormat': 'mp3',
                'VoiceId': voiceID
            }

            var data = await this.pollyClient.synthesizeSpeech(params).promise();
            if (data) {
                if (data.AudioStream instanceof Buffer) {
                    var dir = DS.Path.getPath(fullFilePath);
                    if (!await fs_exists(dir))
                        await fs_mkdir(dir);
                    await fs_writeFile(fullFilePath, data.AudioStream)
                        .catch(function (err) {
                            if (err) {
                                return console.log(err)
                            }
                        });
                    console.log(`Voice has been successfully created at ${fullFilePath}`);
                }
            }
        }
        catch (err) {
            var logpath = DS.Path.getPath(fullFilePath);
            var logFilename = DS.Path.combine(logpath, "ivona_error.log");

            await Ivona.writeErrorMessage(logFilename, DS.getErrorMessage(err));

            throw DS.Exception.error("Failed to get voice audio.", DS.getErrorMessage(err), err);
        }
    }

    static async writeErrorMessage(logpath: string, msg: string) {
        if (!await fs_exists(logpath))
            await fs_mkdir(logpath);

        var logFilename = DS.Path.combine(logpath, "ivona_error.log");

        await fs_appendFile(logFilename, msg + DS.EOL);

        console.log(msg);
    }

    async getAvailableVoiceIDs(): Promise<string[]> {
        let params = <AWS.Polly.Types.DescribeVoicesInput>{
            LanguageCode: "en"
        }
        var response = await this.pollyClient.describeVoices(params).promise();
        return response?.Voices.map(v => v.Id) ?? [];
    }
}