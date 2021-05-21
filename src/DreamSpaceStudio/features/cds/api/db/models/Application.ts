import { NamedApplicationEntity } from "./Common/NamedApplicationEntity";
import { column, table } from "./Common/DbSet";
import { Application_Membership_Role_Map } from "./Maps/Application_Membership_Role_Map";

@table("applications")
export class Application extends NamedApplicationEntity {
    @column('url_dev')
    urlDev: string;
    @column('url_prod')
    urlProd: string;

    Application_Membership_Role_Mapping: Iterable<Application_Membership_Role_Map>;
    SubscriptionProperties: Iterable<SubscriptionProperty>;

    //[NotMapped]
    //get Iterable<SubscriptionModel> SubscriptionModels { get { return EntityMap.Get(ref _SubscriptionModels, this, Subscription_Models_Applications_Maps = Subscription_Models_Applications_Maps.EnsureEntityCollection()); } }
    //EntityMap<Application, Subscription_Models_Applications_Map, SubscriptionModel> _SubscriptionModels;

    Subscription_Models_Applications_Maps: Iterable<Subscription_Models_Applications_Map>;

    Organization_User_Application_Membership_Maps: Iterable<Organization_User_Application_Membership_Map>;

    //public Application Include(string v)
    //{
    //    throw new NotImplementedException();
    //}
}
