import Concept from "../core/Concept";
import DictionaryItem from "../core/DictionaryItem";
import Point3D from "../utility/Point3D";
import Brain from "../core/Brain";

/**
 *  Changes the color of a scene object.
*/
export default class SizeConcept extends Concept {
    // --------------------------------------------------------------------------------------------------------------------

    /**
     *  A size to apply (in meters).  If null, then no specific size was given, though one might seem to be implied somehow.
     *  The width, height, and depth/length are stored as x, y, and z.
    */
    size: Point3D;

    // --------------------------------------------------------------------------------------------------------------------

    constructor(brain: Brain, size?: Point3D) {
        super(brain)
        this.size = size;
    }

    // --------------------------------------------------------------------------------------------------------------------
}
