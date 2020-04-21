using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;

namespace BotPal
{
    /// <summary>
    /// Changes the color of a scene object.
    /// </summary>
    public class ColorConcept : Concept
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// The color to use.  If null, then no specific color was given, though one might seem to be implied somehow.
        /// </summary>
        public Color? Color;

        // --------------------------------------------------------------------------------------------------------------------

        public ColorConcept(Scene scene, SceneObject source, DictionaryItem attributeNAme, Color? color = null) : base(scene, source, nameof(ColorAttribute))
        {
            Color = color;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
