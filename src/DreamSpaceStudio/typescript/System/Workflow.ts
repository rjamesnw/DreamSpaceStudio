import { Component } from "./Component";
import { TrackableObject } from "./TrackableObject";

export class ValueMap {
    sourcePath: string;
    inputName: string;
}

/** Defines a branch by name, which determines the next step to execute. */
export class Branch extends TrackableObject {
    name: string;
    step: Step;
}

/** References a component and defines translations between previous step's outputs and the next step. */
export class Step extends TrackableObject {
    /** A name for this step. This is also used to resolve property references from other steps. */
    name: string;
    /** The component for this step. */
    component: Component;
    /** If true, the step is executed server-side. The default is client-side. */
    serverSide: boolean;
    /** Maps the outputs of the previous step component's outputs to the inputs of the current component. */
    readonly inputMapping: ValueMap[] = [];
    /** Defines named branches. */
    readonly branches: Branch[] = [];
}

/** A series of steps that will execute associated components in order. */
export class Workflow extends TrackableObject {
    readonly steps: Step[] = [];

    async execute() { }
}


/** One or more "swim-lanes", from top to bottom (in order of sequence), that contain a series of components to execute. */
export class Workflows extends TrackableObject {
    readonly workflows: Workflow[] = [];
}