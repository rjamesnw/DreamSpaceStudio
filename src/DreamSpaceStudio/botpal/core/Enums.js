"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeographyTypes = exports.TenseTypes = exports.Plurality = exports.Intents = void 0;
/**
 Intents are the core of the bot system.  As users give input, the input is translated into a series of intents for the bot to follow.
 These intents form the core abilities of the bot at a basic primitive level. Intents are allowed to be chained dynamically,
 possibly even interconnecting between each other, controlled by states from 0.0 to 1.0 before triggering the next.
 
 Note: Concept handlers handle the "meanings" of user input and other external stimuli.
*/
var Intents;
(function (Intents) {
    /**
     User text was given.  Split the text and start processing it.
    */
    Intents[Intents["SplitText"] = 0] = "SplitText";
    /**
     We have concepts from the text, and now need to execute the handlers.
    */
    Intents[Intents["ProcessConcepts"] = 1] = "ProcessConcepts";
    /**
     The user is assigning attributes to something.
    */
    Intents[Intents["AssignAttributes"] = 2] = "AssignAttributes";
    /**
     The user is asking a question; find the answer.
    */
    Intents[Intents["Question"] = 3] = "Question";
    /**
     *  The user is making a statement.
    */
    Intents[Intents["Statement"] = 4] = "Statement";
    ///**
    //// If the intent task returns close to 1.0, then execute the next intent
    //*/
    //If,
    ///**
    //// At some point, when this watch task returns close to 1.0, then execute the next intent; may be perpetual
    //*/
    //When,
    ///**
    //// Delay the specified intent for a period of time, then activate the referenced one.
    //*/
    //Delay,
    ///**
    //// Determine if something can be done, or can be like some state. The return value will be 0.0 (cannot) to 1.0 (definitely can).
    //*/
    //Can,
    ///**
    //// Determine if something is like or similar to something else. The return value will be 0.0 (nothing like it) to 1.0 (definitely like it).
    //*/
    //Like,
    ///**
    //// Find a person that matches the subject states and conditions as described.
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
})(Intents = exports.Intents || (exports.Intents = {}));
var Plurality;
(function (Plurality) {
    Plurality[Plurality["Unspecified"] = 0] = "Unspecified";
    Plurality[Plurality["NA"] = 1] = "NA";
    Plurality[Plurality["Singular"] = 2] = "Singular";
    Plurality[Plurality["Plural"] = 3] = "Plural";
})(Plurality = exports.Plurality || (exports.Plurality = {}));
var TenseTypes;
(function (TenseTypes) {
    TenseTypes[TenseTypes["Unspecified"] = 0] = "Unspecified";
    TenseTypes[TenseTypes["NA"] = 1] = "NA";
    TenseTypes[TenseTypes["Past"] = 2] = "Past";
    TenseTypes[TenseTypes["Present"] = 3] = "Present";
    TenseTypes[TenseTypes["Future"] = 4] = "Future";
})(TenseTypes = exports.TenseTypes || (exports.TenseTypes = {}));
var GeographyTypes;
(function (GeographyTypes) {
    GeographyTypes[GeographyTypes["Unspecified"] = 0] = "Unspecified";
    /**
     Unspecific: An entire planet.
    */
    GeographyTypes[GeographyTypes["Planet"] = 1] = "Planet";
    /**
     Unspecific: A region of a planet (earth is usually assumed).
    */
    GeographyTypes[GeographyTypes["Region"] = 2] = "Region";
    /**
     Anything outside the world.
    */
    GeographyTypes[GeographyTypes["Cosmic"] = 3] = "Cosmic";
    /**
     The earth, together with all of its countries, peoples, and natural features.
    */
    GeographyTypes[GeographyTypes["World"] = 4] = "World";
    /**
     A nation with its own government, occupying a particular territory.
    */
    GeographyTypes[GeographyTypes["Country"] = 5] = "Country";
    /**
     A nation or territory that is considered as an organized political community under one government.
    */
    GeographyTypes[GeographyTypes["State"] = 6] = "State";
    /**
     A principal administrative division of certain countries or empires.
    */
    GeographyTypes[GeographyTypes["Province"] = 7] = "Province";
    /**
     A larger than a town.
    */
    GeographyTypes[GeographyTypes["City"] = 8] = "City";
    /**
     A larger than a village - an urban area that has a name, defined boundaries, and local government, and that is generally larger than a village and smaller than a city.
    */
    GeographyTypes[GeographyTypes["Town"] = 9] = "Town";
    /**
     A group of houses and associated buildings, larger than a hamlet and smaller than a town, situated in a rural area.
    */
    GeographyTypes[GeographyTypes["Village"] = 10] = "Village";
    /**
     A small settlement, generally one smaller than a village.
    */
    GeographyTypes[GeographyTypes["Hamlet"] = 11] = "Hamlet";
})(GeographyTypes = exports.GeographyTypes || (exports.GeographyTypes = {}));
//# sourceMappingURL=Enums.js.map