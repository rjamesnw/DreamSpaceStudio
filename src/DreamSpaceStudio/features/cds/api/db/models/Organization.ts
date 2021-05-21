import { column, navigation, table } from "./Common/DbSet";
import { NamedApplicationEntity } from "./Common/NamedApplicationEntity";

@table("organizations")
export class Organization extends NamedApplicationEntity {
    @column("domain")
    domain: string;

    @foreignKey(nameof(ParentOrganization))
    @column("organizations_id")
    organizationsID: number;

    //[NotMapped]
    //get Users(): Iterable<User> { get { return EntityMap.Get(ref _Users, this, User_Organization_Maps = User_Organization_Maps.EnsureEntityCollection()); } }
    //EntityMap<Organization, User_Organization_Map, User> _Users;
    //protected virtual ICollection<User_Organization_Map> User_Organization_Maps { get; set; }

    @navigation()
    get ParentOrganization(): Organization { return null; }
}