export class Deed {
}

/** The place upon which deeds are placed. */
export class Land {
    defaultColor: "#A0E031";
    defaultTexture: ""; // (link to a grass image perhaps)
    showGrid: true;
    pixelsPerBlock: 16;

    constructor(target: string | HTMLElement) {

    }

    addDeed(deed: Deed, x: number, y: number) {

    }
}

enum PlotTypes {
    Main, // (the main building for the yellow plot)
    Farming,
    Ranching,
    General,
    Decoration
}

export interface IPlot {
    x: number; y: number;
    w: number; h: number;
    type: PlotTypes;
}

export class Homestead extends Deed {
    private _layout: IPlot[] = [
        { x: 0, y: 0, w: 10, h: 10, type: PlotTypes.Main },
        { x: 11, y: 0, w: 5, h: 5, type: PlotTypes.Farming },
        { x: 11, y: 6, w: 5, h: 5, type: PlotTypes.General },
        { x: 1, y: 11, w: 2, h: 2, type: PlotTypes.Decoration }
    ];

    readonly land: Land;

    render(target: string | HTMLElement) {
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

export class Manager {
    land = new Land("output");
}