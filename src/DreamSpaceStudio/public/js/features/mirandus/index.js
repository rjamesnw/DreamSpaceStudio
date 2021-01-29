define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Manager = exports.Homestead = exports.Land = exports.Deed = void 0;
    class Deed {
    }
    exports.Deed = Deed;
    /** The place upon which deeds are placed. */
    class Land {
        constructor(target) {
        }
        addDeed(deed, x, y) {
        }
    }
    exports.Land = Land;
    var PlotTypes;
    (function (PlotTypes) {
        PlotTypes[PlotTypes["Main"] = 0] = "Main";
        PlotTypes[PlotTypes["Farming"] = 1] = "Farming";
        PlotTypes[PlotTypes["Ranching"] = 2] = "Ranching";
        PlotTypes[PlotTypes["General"] = 3] = "General";
        PlotTypes[PlotTypes["Decoration"] = 4] = "Decoration";
    })(PlotTypes || (PlotTypes = {}));
    class Homestead extends Deed {
        constructor() {
            super(...arguments);
            this._layout = [
                { x: 0, y: 0, w: 10, h: 10, type: PlotTypes.Main },
                { x: 11, y: 0, w: 5, h: 5, type: PlotTypes.Farming },
                { x: 11, y: 6, w: 5, h: 5, type: PlotTypes.General },
                { x: 1, y: 11, w: 2, h: 2, type: PlotTypes.Decoration }
            ];
        }
        render(target) {
            var _target = typeof target == 'object' ? target : document.getElementById('' + target);
            if (_target) {
                var container = document.createElement("div");
                container.style.display = "relative";
                for (var plot of this._layout) {
                    var plotEl = document.createElement("div");
                    plotEl.style.left = (plot.x * this.land.pixelsPerBlock) + "px";
                    plotEl.style.top = (plot.y * this.land.pixelsPerBlock) + "px";
                    plotEl.style.width = (plot.w * this.land.pixelsPerBlock) + "px";
                    plotEl.style.height = (plot.h * this.land.pixelsPerBlock) + "px";
                    container.appendChild(plotEl);
                }
            }
        }
    }
    exports.Homestead = Homestead;
    class Manager {
        constructor() {
            this.land = new Land("output");
        }
    }
    exports.Manager = Manager;
});
//# sourceMappingURL=index.js.map