using Microsoft.AspNetCore.Mvc.ModelBinding;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDS.Entities
{
    public enum APIActions
    {
        Create,
        Read,
        Update,
        Delete
    }

    /// <summary>
    /// The base type for all entities for the underlying application.
    /// </summary>
    public abstract partial class EntityBase
    {
        /// <summary>
        ///     Returns a model state dictionary as the result of analyzing if the model is valid for the specified API action.
        /// </summary>
        /// <param name="apiAction"> (Optional) The API action. </param>
        /// <returns> A ModelStateDictionary. </returns>
        public virtual ModelStateDictionary Validate(APIActions apiAction) => new ModelStateDictionary();
    }
}
