import { column, navigation, table } from "./Common/DbSet";
import { NamedApplicationEntity } from "./Common/NamedApplicationEntity";
import { Application_Membership_Role_Map } from "./Maps/Application_Membership_Role_Map";

@table("roles")
export class Role extends NamedApplicationEntity {
    @column()
    description: string;

    Application_Membership_Role_Mapping: Iterable<Application_Membership_Role_Map>;
}
