"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.files = void 0;
exports.files = {
    tags: ['Files'],
    description: "Returns a file from a specified file path.",
    operationId: 'getFile',
    //security: [
    //    {
    //        bearerAuth: []
    //    }
    //],
    responses: {
        "200": {
            description: "Returns the requested file information and contents.",
            "content": {
                "application/json": {
                    schema: {
                        type: "array",
                        items: {
                            pet_name: {
                                type: 'string',
                                description: 'Pet Name'
                            },
                            pet_age: {
                                type: 'string',
                                description: 'Pet Age'
                            }
                        }
                    }
                }
            }
        }
    }
};
//# sourceMappingURL=file.swagger.js.map