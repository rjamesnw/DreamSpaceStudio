import { EntityCreatedByBase } from "./EntityCreatedByBase";

/// <summary>
/// The base type for all entities that map data between tables within the partitioned application instance.
/// These are all tables that are NOT related to normal application tables or static lookup tables.
/// </summary>
export abstract class MapEntity extends EntityCreatedByBase {
}

/**
* Place this attribute on a map entity to designate the left and right sides of the mapping.
* This is used in order to help identify which side of the map table is considered left and right for mapping purposes. 
* If the expected naming convention is used then this attribute is not needed.
* 'getMapEntityInfo()' splits a type name that contains underscores separating left and right
* names, and the word "map".  For example, "Left_Right_Map", "Map_Left_Right", or "Left_Map_Right" will all work as a
* convention. Once the names are extracted, matching navigational properties are expected with the same names (not
* case sensitive). As such, when the left and/or right names are a short abbreviation or mnemonic to make coding easier,
* then this attribute is needed to help the system know what the navigational property names are.
*/
export function mapEntityAttribute(left: string, right: string) {
    return (target: IType) => {
        (<IndexedObject>target)['__map_left__'] = left;
        (<IndexedObject>target)['__map_right__'] = left;
    };
}
