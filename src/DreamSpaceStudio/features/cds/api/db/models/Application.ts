import { NamedApplicationEntity } from "./Common/NamedApplicationEntity";

@table("applications")
export class Application extends NamedApplicationEntity {
    url_dev: string;
    url_prod: string;

    get Application_Membership_Role_Maps(): Iterable<Application_Membership_Role_Map> { return null; }
    get SubscriptionProperties(): Iterable<SubscriptionProperty> { return null; }

    //[NotMapped]
    //get Iterable<SubscriptionModel> SubscriptionModels { get { return EntityMap.Get(ref _SubscriptionModels, this, Subscription_Models_Applications_Maps = Subscription_Models_Applications_Maps.EnsureEntityCollection()); } }
    //EntityMap<Application, Subscription_Models_Applications_Map, SubscriptionModel> _SubscriptionModels;

    get Subscription_Models_Applications_Maps(): Iterable<Subscription_Models_Applications_Map> { return null; }

    get Organization_User_Application_Membership_Maps(): Iterable<Organization_User_Application_Membership_Map> { return null; }

    //public Application Include(string v)
    //{
    //    throw new NotImplementedException();
    //}
}
