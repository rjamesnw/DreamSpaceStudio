"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.system = void 0;
exports.system = {
    tags: ['Files'],
    description: "Returns all files from a specified path.",
    operationId: 'getFiles',
    //security: [
    //    {
    //        bearerAuth: []
    //    }
    //],
    responses: {
        "200": {
            description: "A list of pets.",
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
//# sourceMappingURL=system.swagger.js.map