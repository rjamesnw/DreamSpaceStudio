import { column, table } from "./Common/DbSet";
import { NamedApplicationEntity } from "./Common/NamedApplicationEntity";

@table("memberships")
export class Membership extends NamedApplicationEntity {
    @column()
    description: string;

    Application_Membership_Role_Mapping: Iterable<Application_Membership_Role_Map>;

    Organization_User_Application_Membership_Mapping: Iterable<Organization_User_Application_Membership_Map>;
}
