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
            var fullPath = DS.Path.toAbsolute(targetFilename);

            let params = <AWS.Polly.SynthesizeSpeechInput>{
                'Text': text,
                'OutputFormat': 'mp3',
                'VoiceId': voiceID
            }

            var synthesizeSpeech = DS.Utilities.promisify(this.pollyClient.synthesizeSpeech);
            var data = await synthesizeSpeech(params);
            if (err) {
                console.log(err.code)
            } else if (data) {
                if (data.AudioStream instanceof Buffer) {
                    var dir = DS.Path.getPath(fullPath);
                    if (!await fs_exists(fullPath))
                        await fs_mkdir(fullPath);
                    await fs_writeFile(fullPath, data.AudioStream)
                        .catch(function (err) {
                            if (err) {
                                return console.log(err)
                            }
                        });
                    console.log(`Voice has been successfully created at ${fullPath}`);
                }
            }
        }
        catch (err) {

            var logpath = DS.Path.getPath(fullPath);
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

    async getAvailableVoiceIDs(): string[] {
        let params = <AWS.Polly.Types.DescribeVoicesInput>{
            LanguageCode: "en"
        }
        this.pollyClient.describeVoices(params, (err, response) => {
            return response.Voices.map(v => v.Id);
        });
    }
}

        private async  IvonaCreateSpeech(string text, string voiceID): byte[]
{
    using(var client = new AmazonPollyClient(_AWSCredentials, RegionEndpoint.USEast1))
        {
            var request = new SynthesizeSpeechRequest
                {
        Text = text,
            VoiceId = voiceID,
            OutputFormat = OutputFormat.Mp3
    };
    var response = await client.SynthesizeSpeechAsync(request);

    if (response != null) {
        using(var memoryStream = new MemoryStream())
            {
                response.AudioStream.CopyTo(memoryStream);
        return memoryStream.ToArray();
    }
}

return new byte[0];
            }
        }
    }
}