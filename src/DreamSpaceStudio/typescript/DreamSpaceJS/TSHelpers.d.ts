/**
 *  @mdoule Since some plugins require global callbacks, such as when an API gets initialized at some time in the future (i.e. Google Maps, etc.),
 * DreamSpaceJS reserves a global name 'DreamSpace' in the global scope to keep all globals contained in one place.
 */
/** Extends from a base type by chaining a derived type's 'prototype' to the base type's prototype.
* This method takes into account any preset properties that may exist on the derived type's prototype.
* Note: Extending an already extended derived type will recreate the prototype connection again using a new prototype instance pointing to the given base type.
* Note: It is not possible to modify any existing chain of constructor calls.  Only the prototype can be changed.
* @param {Function} derivedType The derived type (function) that will extend from a base type.
* @param {Function} baseType The base type (function) to extend to the derived type.
* @param {boolean} copyBaseProperties If true (default) behaves like the TypeScript "__extends" method, which copies forward any static base properties to the derived type.
*/
export declare function __extends<DerivedType extends Function, BaseType extends Function>(derivedType: DerivedType, baseType: BaseType, copyStaticProperties?: boolean): DerivedType;
/**
 * Copies over the helper functions to the target and returns the target.
 *
 * DreamSpace contains it's own copies of the TypeScript helper functions to help reduce code size. By default the global scope
 * is not polluted with these functions, but you can call this method (without any arguments) to set the functions on the
 * global scope.
 *
 * @param {object} target Allows copying the helper functions to a different object instance other than the global scope.
 */
export declare function installTypeScriptHelpers(target?: Object): Object;
/**
 * Renders the TypeScript helper references in the 'var a=param['a'],b=param['b'],etc.;' format. This is used mainly when executing scripts wrapped in functions.
 * This format allows declaring local function scope helper variables that simply pull references from a given object
 * passed in to a single function parameter.
 *
 * Example: eval("function executeTSCodeInFunctionScope(p){" + renderHelperVarDeclarations("p") + code + "}");
 *
 * Returns an array in the [{declarations string}, {helper object}] format.
 */
export declare function renderHelperVarDeclarations(paramName: string): [string, object];
/**
 * Renders the TypeScript helper references to already existing functions into a string to be executed using 'eval()'.
 * This format is used mainly to declare helpers at the start of a module or function body that simply pulls
 * references to the already existing helper functions to help reduce code size.
 *
 * Example: namespace DreamSpace{ eval(renderHelpers()); ...code that may require helpers... }
 *
 * Returns the code to be execute within scope using 'eval()'.
 */
export declare function renderHelpers(): string;
