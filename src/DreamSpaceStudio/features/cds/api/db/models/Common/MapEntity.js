"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapEntityAttribute = exports.MapEntity = void 0;
const EntityCreatedByBase_1 = require("./EntityCreatedByBase");
/// <summary>
/// The base type for all entities that map data between tables within the partitioned application instance.
/// These are all tables that are NOT related to normal application tables or static lookup tables.
/// </summary>
class MapEntity extends EntityCreatedByBase_1.EntityCreatedByBase {
}
exports.MapEntity = MapEntity;
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
function mapEntityAttribute(left, right) {
    return (target) => {
        target['__map_left__'] = left;
        target['__map_right__'] = left;
    };
}
exports.mapEntityAttribute = mapEntityAttribute;
//# sourceMappingURL=MapEntity.js.map