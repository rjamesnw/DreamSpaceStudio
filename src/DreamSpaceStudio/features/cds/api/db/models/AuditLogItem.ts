    @table("audit_log")
    export class AuditLogItem extends  ApplicationEntity
    {
        @foreignKey(DS.Utilities.nameof(() => Action))
        actions_id: number;

        [Column("")]
        details: string;

        [Column("ip")]
        public string IP { get; set; }

        [Column("host")]
        public string Host { get; set; }

        public virtual User User { get; set; }

        public virtual Action Action { get; set; }
    }
