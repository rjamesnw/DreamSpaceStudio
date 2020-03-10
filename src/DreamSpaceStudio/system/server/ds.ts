// Simply loads the global API for the NodeJS server-side global scope.
// This code MUST be FIRST in the final server .js.

namespace NodeJS {
    export interface Global {
        DS: typeof DS;
    }
}

eval("var DS = require('../api').DS;")

global.DS = DS;

// ... the server-specific global DS API should follow here ...
