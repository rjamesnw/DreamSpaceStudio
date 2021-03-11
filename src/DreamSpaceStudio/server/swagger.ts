import { files } from '../features/system/api/file.swagger';

export const swaggerDocument = {
    openapi: '3.0.1',
    info: {
        version: '1.0.0',
        title: 'DreamSpace Server API',
        description: "This is the API for interacting with the DreamSpace server during development.  It's not meant for production deployments.",
        termsOfService: "No warranty is given or implied. Use as is at your own risk. While we try to make sure the software will work as intended, it's your responsibility to back up your work should anything get corrupted or lost.",
        contact: {
            name: 'Inossis Inc.',
            email: 'support@inossis.com',
            url: 'https://inossis.com'
        },
        license: {
            name: 'Apache 2.0',
            url: 'https://www.apache.org/licenses/LICENSE-2.0.html'
        }
    },
    servers: [
        {
            url: 'http://localhost:{port}/api/{basePath}',
            description: 'Local server',
            "variables": {
                "port": {
                    "enum": [
                        "1337",
                        "45000",
                        "443"
                    ],
                    "default": "1337"
                },
                "basePath": {
                    "default": "v1"
                }
            }
        },
        {
            url: 'https://dev.ds.inossis.com/api/v1',
            description: 'DEV Env'
        },
        {
            url: 'https://uat.ds.inossis.com/api/v1',
            description: 'UAT Env'
        }
    ],
    tags: [
        {
            name: 'File'
        }
    ],
    paths: {
        "/system": {
            "file": files
        }
    }
}