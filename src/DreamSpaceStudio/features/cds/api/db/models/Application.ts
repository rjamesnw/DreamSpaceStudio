using CoreXT.Entities;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDS.Entities
{
    [Table("applications")]
    public partial class Application : NamedApplicationEntity
    {

        //? [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Application()
        {
        }

        [Column("url_dev")]
        public string DevURL { get; set; }

        [Column("url_prod")]
        public string ProdURL { get; set; }


        public virtual ICollection<Application_Membership_Role_Map> Application_Membership_Role_Maps { get; set; }

        public virtual ICollection<SubscriptionProperty> SubscriptionProperties { get; set; }

        [NotMapped]
        public virtual ICollection<SubscriptionModel> SubscriptionModels { get { return EntityMap.Get(ref _SubscriptionModels, this, Subscription_Models_Applications_Maps = Subscription_Models_Applications_Maps.EnsureEntityCollection()); } }
        EntityMap<Application, Subscription_Models_Applications_Map, SubscriptionModel> _SubscriptionModels;
        public virtual ICollection<Subscription_Models_Applications_Map> Subscription_Models_Applications_Maps { get; set; }

        public virtual ICollection<Organization_User_Application_Membership_Map> Organization_User_Application_Membership_Maps { get; set; }

        //public Application Include(string v)
        //{
        //    throw new NotImplementedException();
        //}
    }
}
