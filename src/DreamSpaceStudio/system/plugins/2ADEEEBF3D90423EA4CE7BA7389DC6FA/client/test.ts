import { VDOM } from "../shared/modules";

function __class() {
    // ### USER CLASS CODE START ###
    class Test extends VDOM.HTMLElement {
        t = 0;
    };
    // ### USER CLASS CODE END ###
    return Test;
};

export var Test: ReturnType<typeof __class>;

Test = <any>async function () {
    // ### MODULE DEPENDENCIES START ###
    await DS.modules(VDOM);
    // ### MODULE DEPENDENCIES END ###
    return Test = __class();
};
