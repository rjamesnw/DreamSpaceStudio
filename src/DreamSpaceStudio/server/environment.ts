import dotenv = require('dotenv');
var loadConfigResult = dotenv.config();
if (loadConfigResult.error)
    console.log("Could not load environment file (.env):" + loadConfigResult.error + "\r\nSince the file is optional, this error will be logged and ignored.");
else
    console.log("Environment config loaded: \r\n" + DS.Utilities.hideSensitiveData(JSON.stringify(loadConfigResult.parsed)))

export var stage = process.env.NODE_ENV || 'development';
export var isDevelopment = stage == 'development';
export var isQA = stage == 'qa';
export var isStaging = stage == 'staging';
export var isProduction = stage == 'production';

console.log("Current environment: " + stage);

