using BotPal.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BotPal
{
    /**
     *  Represents the position of subjects in a scene. Positions assume that positive Z is forward, positive Y is up, and 
     *  positive X is right (left handed coordinate system).
    */
    public abstract class PositionalContext : Context
    {
        // --------------------------------------------------------------------------------------------------------------------

        /**
         *  The location of the object in the scene.  It is always relative to the scene center at 0,0,0.
         *  <para>
         *  The Scene class is also a scene object itself. The location of the scene is in the "world view" (or even within another scene).  
         *  By default it is 0,0,0, and is used to offset the subjects and/or modifiers in the scene center.
         *  For point of reference, the default world point will be considered the center of the earth; however, if null, then no proper location 
         *  information was given, and the scene is only 0,0,0 in the *mind's* world view, and not the actual world itself.
         *  </para>
        */
        public Point3D? Location;

        // --------------------------------------------------------------------------------------------------------------------

        public PositionalContext(Memory memory, Concept concept, Context parent = null) : base(memory, concept, parent)
        {
        }

        public PositionalContext(Concept concept, Context parent = null) : this(concept.Memory, concept, parent)
        {
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
