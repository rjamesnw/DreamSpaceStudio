import { ApplicationEntity } from "./Common/ApplicationEntity";
import { INamedEntity } from "./Common/NamedApplicationEntity";
import { column, navigation, table } from "./Common/DbSet";
import { User } from "./User";
import { Application } from "./Application";
import { Organization } from "./Organization";

/** Defines partitioning details for an application.
 * The 'applications' table holds all the applications that are available to be used (like a global registry), and also defines
 * the default system partition, which is usually 1 by default. Each application is partitioned by organizations, and each
 * partition contains the connection details, in case of dedicated servers (such as on-premise ones).
 */
@table("app_partitions")
export class AppPartition extends ApplicationEntity implements INamedEntity {
    @column()
    name: string;
    @column()
    organizations_id: number;
    @column()
    applications_id: number;
    @column()
    db_server_name: string;
    @column()
    db_server_ip: string;
    @column()
    db_server_port: string;
    @column()
    notes: string;

    //PlanSmart: @navigation(Organization, "app_partitions_id")
    //PlanSmart: get Organizations(): Iterable<Organization> { return null; }
    //PlanSmart: @navigation(User, "")
    //PlanSmart: get Users(): Iterable<User> { return null; }
    //PlanSmart: @navigation(Application, "app")
    //PlanSmart: get Applications(): Iterable<Application> { return null; }
}
