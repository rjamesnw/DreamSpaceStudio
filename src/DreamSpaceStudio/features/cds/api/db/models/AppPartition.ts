import { ApplicationEntity } from "./Common/ApplicationEntity";
import { INamedEntity } from "./Common/NamedApplicationEntity";

@table("app_partitions")
export class AppPartition extends ApplicationEntity implements INamedEntity {
    @column
    name: string;
    @column
    organizations_id: number;
    @column
    applications_id: number;
    @column
    db_server_name: string;
    @column
    db_server_ip: string;
    @column
    db_server_port: string;
    @column
    notes: string;

    @navigation
    get Organizations(): Iterable<Organization>;
    @navigation
    get Users(): Iterable<User>;
    @navigation
    get Applications(): Iterable<Application>;
}
