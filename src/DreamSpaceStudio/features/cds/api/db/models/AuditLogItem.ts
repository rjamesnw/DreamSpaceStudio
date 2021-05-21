import { Action } from "./Action";
import { ApplicationEntity } from "./Common/ApplicationEntity";
import { User } from "./User";
import { column, table } from "./Common/DbSet";

@table("audit_log")
export class AuditLogItem extends ApplicationEntity {
    @foreignKey(DS.Utilities.nameof(() => Action))
    @column("actions_id")
    actionsID: number;
    @column("details")
    details: string;
    @column("ip")
    ip: string;
    @column("host")
    host: string;

    get User(): User { return null; }
    get Action(): Action { return null; }
}
