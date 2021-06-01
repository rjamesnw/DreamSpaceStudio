define(["require", "exports", "babylonjs"], function (require, exports, babylonjs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TownStarPlanner = void 0;
    class TownStarPlanner {
        constructor(elementId) {
            this._canvasElement = document.getElementById(elementId);
            if (!this._canvasElement)
                throw new DS.Exception(`TownStarPlanner(): Could not find canvas element with ID ${elementId}.`);
            // the canvas/window resize event handler
            window.addEventListener('resize', () => {
                var _a;
                (_a = this._engine) === null || _a === void 0 ? void 0 : _a.resize();
            });
        }
        createScene() {
            // Load the 3D engine
            this._engine = new babylonjs_1.Engine(this._canvasElement, true, { preserveDrawingBuffer: true, stencil: true });
            // Create a basic BJS Scene object
            var scene = new babylonjs_1.Scene(this._engine);
            // Create a FreeCamera, and set its position to {x: 0, y: 5, z: -10}
            var camera = new babylonjs_1.FreeCamera('camera1', new babylonjs_1.Vector3(0, 5, -10), scene);
            // Target the camera to scene origin
            camera.setTarget(babylonjs_1.Vector3.Zero());
            // Attach the camera to the canvas
            camera.attachControl(this._canvasElement, false);
            // Create a basic light, aiming 0, 1, 0 - meaning, to the sky
            var light = new babylonjs_1.HemisphericLight('light1', new babylonjs_1.Vector3(0, 1, 0), scene);
            // Create a built-in "sphere" shape; its constructor takes 6 params: name, segment, diameter, scene, updatable, sideOrientation
            var sphere = babylonjs_1.Mesh.CreateSphere('sphere1', 16, 2, scene, false, babylonjs_1.Mesh.FRONTSIDE);
            // Move the sphere upward 1/2 of its height
            sphere.position.y = 1;
            // Create a built-in "ground" shape; its constructor takes 6 params : name, width, height, subdivision, scene, updatable
            var ground = babylonjs_1.Mesh.CreateGround('ground1', 6, 6, 2, scene, false);
            // Return the created scene
            return scene;
        }
        start() {
            var scene = this.createScene();
            this._engine.runRenderLoop(() => {
                scene.render();
            });
        }
    }
    exports.TownStarPlanner = TownStarPlanner;
});
//# sourceMappingURL=tsplanner.js.map