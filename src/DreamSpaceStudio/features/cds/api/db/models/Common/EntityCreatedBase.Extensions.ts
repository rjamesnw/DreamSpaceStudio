using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDS.Entities
{
    public partial class EntityCreatedBase
    {
        public DateTimeOffset? Deleted
        {
            get => _Deleted;
            set
            {
                var now = DateTimeOffset.UtcNow;
                var _deleted = value?.ToUniversalTime() ?? now;
                if (_deleted < now.Date.AddHours(-1)) // (-1 to give a 1 hour tolerance)
                    throw new InvalidOperationException("The deleted date cannot be in the past.");
                if ((_deleted - now).TotalDays > 365)
                    throw new InvalidOperationException("The deleted date cannot be more than a year from now.");
                _Deleted = _deleted;
            }
        }

        public DateTimeOffset? Archived
        {
            get => _Archived;
            set
            {
                var now = DateTimeOffset.UtcNow;
                var _archived = value?.ToUniversalTime() ?? now;
                if (_archived < now.Date.AddHours(-1)) // (-1 to give a 1 hour tolerance)
                    throw new InvalidOperationException("The archived date cannot be in the past.");
                if ((_archived - now).TotalDays > 365)
                    throw new InvalidOperationException("The archived date cannot be more than a year from now.");
                _Archived = _archived;
            }
        }
    }
}
