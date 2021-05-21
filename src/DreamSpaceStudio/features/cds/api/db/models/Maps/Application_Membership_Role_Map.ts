import { Application } from "../Application";
import { column, navigation, navigation_, table } from "../Common/DbSet";
import { MapEntity } from "../Common/MapEntity";
import { Membership } from "../Membership";
import { Role } from "../Role";

@table("map_applications_memberships_roles")
@navigation_(_ => _.applicationsID, Application, _ => _.Application_Membership_Role_Mapping, _ => _.id)
export class Application_Membership_Role_Map extends MapEntity {
    @column("applications_id")
    applicationsID: number;

    @column("memberships_id")
    membershipsID: number;

    @column("roles_id")
    rolesID: number;

    @navigation(Application_Membership_Role_Map, _ => _.applicationsID, Application, _ => _.Application_Membership_Role_Mapping, _ => _.id)
    Application: Application;

    @navigation(Application_Membership_Role_Map, _ => _.membershipsID, Membership, _ => _.Application_Membership_Role_Mapping, _ => _.id)
    Membership: Membership;

    @navigation(Application_Membership_Role_Map, _ => _.rolesID, Role, _ => _.Application_Membership_Role_Mapping, _ => _.id)
    Role: Role;
}
