import { EntityBase } from "./EntityBase";

/// <summary>
/// The base type for all entities that contain data that is static and usually never changes.
/// These tables cannot be edited by end users, and are part of the application's core design (like representing enums).
/// </summary>
export class StaticEntity extends EntityBase implements ISinglePrimaryKeyEntity<int>
{
    [Required]
    [Key]
    [ReadOnly(true)]
    readonly id: number;
}
