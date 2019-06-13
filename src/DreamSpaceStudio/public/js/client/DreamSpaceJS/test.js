var DreamSpaceTest;
(function (DreamSpaceTest) {
    function ClassFactory(b, f) {
        return null;
    }
    let constructor = Symbol("static constructor");
    class Test {
    }
    Test.s = 3;
    DreamSpaceTest.Test = Test;
    (function (Test) {
        class $__type {
            constructor() {
                this.x = 1;
                this.y = 2;
                this.p = 3;
            }
            static [constructor](factory) {
                factory.new = (x) => {
                    return null;
                };
                factory.init = (o, isnew, x) => {
                    o.x = 1;
                };
            }
        }
        Test.$__type = $__type;
    })(Test = DreamSpaceTest.Test || (DreamSpaceTest.Test = {}));
    var t = Test.new(0);
    let A;
    (function (A) {
        class Test2 {
        }
        Test2.s = 3;
        A.Test2 = Test2;
        (function (Test2) {
            class $__type {
                constructor() {
                    this.x2 = 1;
                    this.y2 = 2;
                }
                static [constructor](factory) {
                    factory['new'] = (x) => {
                        return null;
                    };
                    factory['init'] = (o, isnew, x) => {
                        o.x2 = 1;
                    };
                }
            }
            Test2.$__type = $__type;
        })(Test2 = A.Test2 || (A.Test2 = {}));
    })(A = DreamSpaceTest.A || (DreamSpaceTest.A = {}));
    var t2 = A.Test2.new('');
    DreamSpace.nameof(() => A.Test2.$__type);
})(DreamSpaceTest || (DreamSpaceTest = {}));
//# sourceMappingURL=test.js.map