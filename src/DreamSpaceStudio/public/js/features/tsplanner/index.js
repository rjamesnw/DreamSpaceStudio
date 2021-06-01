define(["require", "exports", "../startup", "./tsplanner"], function (require, exports, startup_1, tsplanner_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    startup_1.startup.then(() => {
        var planner = new tsplanner_1.TownStarPlanner("canvas");
        planner.start();
    });
});
//# sourceMappingURL=index.js.map