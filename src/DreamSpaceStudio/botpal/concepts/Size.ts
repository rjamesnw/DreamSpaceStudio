using BotPal.Utilities;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;

namespace BotPal
{
    /**
     *  Changes the color of a scene object.
    */
    export default class SizeConcept extends Concept
    {
        // --------------------------------------------------------------------------------------------------------------------

        /**
         *  A size to apply (in meters).  If null, then no specific size was given, though one might seem to be implied somehow.
         *  The length, width, and height are stored as Z, X, and Y.
        */
        public Point3D? Size;

        // --------------------------------------------------------------------------------------------------------------------

        public SizeConcept(Scene scene, SceneObject source, DictionaryItem attributeNAme, Point3D? size = null) : base(scene, source, nameof(SizeAttribute))
        {
            Size = size;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
