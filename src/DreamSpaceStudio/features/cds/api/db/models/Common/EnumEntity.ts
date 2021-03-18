/// <summary>
/// The base type for all entities that contain a list of static entries typically representing enum values.
/// These tables cannot be edited by end users, and are part of the application's core design.
/// </summary>
export class EnumEntity extends StaticEntity implements INamedEntity {
    [ReadOnly(true)]
    [Column("name")]
    readonly name: string;

    [Column("description")]
    description: string;
}
