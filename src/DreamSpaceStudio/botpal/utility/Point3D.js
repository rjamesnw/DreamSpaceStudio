"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Point3D {
    /// <summary>
    /// Constructor that sets point's initial values.
    /// </summary>
    /// <param name="x">Value of the X coordinate of the new point. 
    /// <param name="y">Value of the Y coordinate of the new point.
    /// <param name="z">Value of the Z coordinate of the new point. 
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.x = x;
        this.y = y;
        this.z = z;
    }
    /// <summary> 
    /// Offset - update point position by adding offsetX to X, offsetY to Y, and offsetZ to Z.
    /// </summary> 
    /// <param name="offsetX">Offset in the X direction.
    /// <param name="offsetY">Offset in the Y direction.
    /// <param name="offsetZ">Offset in the Z direction.
    Offset(offsetX, offsetY, offsetZ) {
        this.x += offsetX;
        this.y += offsetY;
        this.z += offsetZ;
    }
    /// <summary> 
    /// Equals - compares this Point3D with the passed in object.  In this equality
    /// Double.NaN is equal to itself, unlike in numeric equality. 
    /// Note that double values can acquire error when operated upon, such that 
    /// an exact comparison between two values which
    /// are logically equal may fail. 
    /// </summary>
    /// <returns>
    /// bool - true if "value" is equal to "this".
    /// </returns> 
    /// <param name="value">The Point3D to compare to "this"
    equals(p) {
        if (!(p instanceof Point3D))
            return false;
        return this === p ||
            this.x === p.x &&
                this.y === p.y &&
                this.z === p.z;
    }
    /// <summary>
    /// Returns the HashCode for this Point3D
    /// </summary>
    /// <returns> 
    /// int - the HashCode for this Point3D
    /// </returns> 
    GetHashCode() {
        // Perform field-by-field XOR of HashCodes 
        return this.x ^ this.y ^ this.z;
    }
    /**
     * Creates a new point instance from a string.
     * @param {string} source The point as a string, in the form 'x,y,z' or '(x,y,z)'.
     * @returns
     */
    static parse(source) {
        source = ('' + (source !== null && source !== void 0 ? source : '')).trimLeftChar('(').trimRightChar(')');
        var parts = source.split(',');
        if (parts.length != 3)
            throw DS.Exception.error('Point3D.prase()', "Not in a point format of 'X,Y,Z' (example: 0,0,0).");
        return new Point3D(+parts[0], +parts[1], +parts[1]);
    }
    /**
     * Creates a string representation of this point.
     * @returns A string representation of this point.
     */
    toString() {
        return `${(this.x || 0)},${(this.y || 0)},${(this.z || 0)}`;
    }
}
exports.default = Point3D;
//# sourceMappingURL=Point3D.js.map