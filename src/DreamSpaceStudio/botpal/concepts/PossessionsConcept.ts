import Concept, { concept, conceptHandler } from "../core/Concept";
import { TenseTypes } from "../core/Enums";
import Brain from "../core/Brain";

export enum PossessionTypes {
    Unspecified,
    /**
     *  The subject(s) HAS something.
    */
    ToHave,
    /**
     *  The subject(s) OWN something.
    */
    ToOwn
}

/**
 *  Holds connection and relationship information between concepts.
*/
@concept()
export default class PossessionsConcept extends Concept {
    /**
     *  The subject that is the end point of this frequency modifier, which as such, is related to the source subject.
    */
    readonly Target: Concept;

    PossessionType: PossessionTypes;
    TenseType: TenseTypes;

    constructor(brain: Brain) {
        super(brain)
    }

    // --------------------------------------------------------------------------------------------------------------------

    //@conceptHandler("* has|have *")
    //_ToHave(scene: Scene, leftCtx: Context, rightCtx: Context): DictionaryItem[] {
    //    PossessionType = PossessionTypes.ToHave;
    //}

    //@conceptHandler("* had *")
    //_Had(Scene scene, Context leftCtx, Context rightCtx): DictionaryItem[] {
    //    TenseType = TenseTypes.Past;
    //    return _ToHave(scene, leftCtx, rightCtx);
    //}

    // --------------------------------------------------------------------------------------------------------------------

    //@conceptHandler("* owns|own *")
    //DictionaryItem[] _ToOwn(Scene scene, Context leftCtx, Context rightCtx) {
    //    PossessionType = PossessionTypes.ToOwn;
    //}

    //@conceptHandler("* had *")
    //DictionaryItem[] _Owned(Scene scene, Context leftCtx, Context rightCtx) {
    //    TenseType = TenseTypes.Past;
    //    return _ToHave(scene, leftCtx, rightCtx);
    //}

    // --------------------------------------------------------------------------------------------------------------------
}
