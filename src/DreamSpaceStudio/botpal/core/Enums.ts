/**
 Intents are the core of the bot system.  As users give input, the input is translated into a series of intents for the bot to follow.
 These intents form the core abilities of the bot at a basic primitive level. Intents are allowed to be chained dynamically,
 possibly even interconnecting between each other, controlled by states from 0.0 to 1.0 before triggering the next.
 
 Note: Concept handlers handle the "meanings" of user input and other external stimuli.
*/
export enum Intents {
    /**
     User text was given.  Split the text and start processing it.
    */
    SplitText,

    /**
     We have concepts from the text, and now need to execute the handlers.
    */
    ProcessConcepts,

    /**
     The user is assigning attributes to something.
    */
    AssignAttributes,

    /**
     The user is asking a question; find the answer.
    */
    Question,

    /**
     *  The user is making a statement.
    */
    Statement,

    ///**
     * // If the intent task returns close to 1.0, then execute the next intent
    //*/
    //If,

    ///**
     * // At some point, when this watch task returns close to 1.0, then execute the next intent; may be perpetual
    //*/
    //When,

    ///**
     * // Delay the specified intent for a period of time, then activate the referenced one.
    //*/
    //Delay,

    ///**
     * // Determine if something can be done, or can be like some state. The return value will be 0.0 (cannot) to 1.0 (definitely can).
    //*/
    //Can,

    ///**
     * // Determine if something is like or similar to something else. The return value will be 0.0 (nothing like it) to 1.0 (definitely like it).
    //*/
    //Like,

    ///**
     * // Find a person that matches the subject states and conditions as described.
    //*/
    //GetWho,
    //GetWhat,
    //GetWhen,
    //GetWhere,
    //GetWhy,
    //GetIs,
    //GetAre,
    //GetURL,
    //GetFTP,
    //GetFile,
}

export enum Plurality {
    Unspecified,
    NA, // (not applicable)
    Singular,
    Plural
}

export enum TenseTypes {
    Unspecified,
    NA, // (not applicable)
    Past,
    Present,
    Future
}

export enum GeographyTypes {
    Unspecified,
    /**
     Unspecific: An entire planet.
    */
    Planet,
    /**
     Unspecific: A region of a planet (earth is usually assumed).
    */
    Region,
    /**
     Anything outside the world.
    */
    Cosmic,
    /**
     The earth, together with all of its countries, peoples, and natural features.
    */
    World,
    /**
     A nation with its own government, occupying a particular territory.
    */
    Country,
    /**
     A nation or territory that is considered as an organized political community under one government.
    */
    State,
    /**
     A principal administrative division of certain countries or empires.
    */
    Province,
    /**
     A larger than a town.
    */
    City,
    /**
     A larger than a village - an urban area that has a name, defined boundaries, and local government, and that is generally larger than a village and smaller than a city.
    */
    Town,
    /**
     A group of houses and associated buildings, larger than a hamlet and smaller than a town, situated in a rural area.
    */
    Village,
    /**
     A small settlement, generally one smaller than a village.
    */
    Hamlet
}
