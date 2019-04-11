declare var manifest: DreamSpace.Scripts.IManifest;
declare namespace DreamSpace.Scripts.Modules.System {
    /** A special collection for indexing objects. */
    var Collections_IndexedObjectCollection: any;
    /** A special collection that allows observing changes (such as add/remove operations). */
    var Collections_ObservableCollection: any;
    /** References all collections. */
    var Collections: any;
    /** The core DreamSpace system. */
    var Core: any;
    /** The core DreamSpace system. */
    var AppDomain: any;
    /** The core DreamSpace system. */
    var Events: any;
    /** System functions and types to help manage the IO process (page and data loading). */
    var IO: any;
    /** Contains specialized classes and functions for dealing with mark-up type code (i.e. HTML, XML, etc.). */
    var Markup: any;
    /** This module contains classes for building DreamSpace applications using a 'Graph' element layout system.
    * Note: This is only the logical application layer, and does not contain any UI classes.  For UI based applications,
    * include System.UI and a UI implementation of your choice (such as System.UI.HTML or Twitter.Bootstrap).
    */
    var Platform: any;
    /** The main DreamSpace system core.  This module is already included by default, and is here only for consistency. */
    var UI: any;
    /** The DreamSpace UI module contains HTML related objects for UI designed.
    * Note: As with most DreamSpace graph objects, the objects are "logical" elements, and thus, a visual layout environment is (eg. browser) is not required.
    */
    var UI_HTML: any;
    /** This module contains types and functions for common communication tasks. */
    var Net: any;
    /** DreamSpace Studio and Server contains a plugin system called 'ICE' (Interface Communications Engine).
    * ICE only works in desktop app or server mode, and as such, this module is only valid in those contexts.
    */
    var ICE: any;
    /** This module contains types and functions for common data manipulation tasks. */
    var Data: any;
}
