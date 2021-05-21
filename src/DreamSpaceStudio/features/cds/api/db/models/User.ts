import { ApplicationEntity } from "./Common/ApplicationEntity";
import { column, table } from "./Common/DbSet";

@table("users")
export class User extends ApplicationEntity
{
        @column("first_name")
        firstName: string;

        @column("last_name")
        lastName: string;

        alias: string;

        [Column("email")]
        email: string = void 0;

        [Column("phone")]
        public string Phone { get; set; }

        [Column("password")]
        public string Password { get; set; }

        [Column("password_reset_key")]
        public string PasswordResetKey { get; set; }

        [Column("last_login")]
        public DateTime? LastLogin { get; set; }

        [Column("reg_mode")]
        public int? reg_mode { get; set; }

        [Column("reg_key")]
        public string reg_key { get; set; }

        public virtual ICollection<User_Organization_Map> User_Organization_Mapping { get; set; }

        public virtual ICollection<Payment> Payments { get; set; }

        [NotMapped]
        public virtual ICollection<Subscription> Subscriptions { get { return EntityMap.Get(ref _Subscriptions, this, Subscription_User_Maps = Subscription_User_Maps.EnsureEntityCollection()); } }
        EntityMap<User, Subscription_User_Map, Subscription> _Subscriptions;
        protected virtual ICollection<Subscription_User_Map> Subscription_User_Maps { get; set; }

        public virtual ICollection<Organization_User_Application_Membership_Map> Organization_User_Application_Membership_Mapping { get; set; }

        public virtual ICollection<Subscription_User_Map> Subscription_SubUser_Mapping { get; set; }

        public virtual ICollection<SavedBillingAddress> SavedBillingAddresses { get; set; }

        public virtual ICollection<SavedCreditCardInfo> SavedCreditCardInfos { get; set; }

        public virtual ICollection<SessionStore> SessionData { get; set; }
    }
}
