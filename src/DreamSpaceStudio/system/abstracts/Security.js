// ############################################################################################################################
// User Access Security
// ############################################################################################################################
var DS;
(function (DS) {
    let UserRoles;
    (function (UserRoles) {
        /** The user has no access. */
        UserRoles[UserRoles["None"] = 0] = "None";
        /** The user has full access as administrator. */
        UserRoles[UserRoles["Admin"] = 1] = "Admin";
        /** The user has read access. */
        UserRoles[UserRoles["Viewer"] = 2] = "Viewer";
        /** The user is allowed to make modifications. Implies read access, but does not include creation access. */
        UserRoles[UserRoles["Editor"] = 3] = "Editor";
        /** The user can create and modify. */
        UserRoles[UserRoles["Creator"] = 4] = "Creator";
        /** The user can delete/remove. */
        UserRoles[UserRoles["Purger"] = 5] = "Purger";
    })(UserRoles = DS.UserRoles || (DS.UserRoles = {}));
    class UserAccessEntry {
        constructor(userID, roles) {
            this.userID = userID;
            this.roles = roles;
        }
        /** Returns true if the specified role exists in this access entry. */
        hasRole(role) {
            if (this.roles)
                for (var i = 0, n = this.roles.length; i < n; ++i)
                    if (this.roles[i] == role)
                        return true;
            return false;
        }
    }
    DS.UserAccessEntry = UserAccessEntry;
    class UserAccess {
        constructor() {
            this._userIDs = [];
        }
        get length() { return this._userIDs.length; }
        /** Assigns a user ID and one or more roles. If roles already exist, the given roles are merged (existing roles are note replaced). */
        add(userID, ...roles) {
            var entry = this.getItem(userID);
            if (!entry) {
                entry = new UserAccessEntry(userID, roles);
                this._userIDs.push(entry);
            }
            else {
                if (!entry.roles)
                    entry.roles = roles;
                else
                    entry.roles.push(...roles);
            }
            return entry;
        }
        revoke(indexOrID) {
            var i = typeof indexOrID == 'number' ? indexOrID : this.indexOf(indexOrID);
            return i >= 0 ? (this._userIDs.splice(i, 1), true) : false;
        }
        /** Finds the index of the entry with the specific user ID. */
        indexOf(userID) {
            for (var i = 0, n = this.length; i < n; ++i)
                if (this._userIDs[i].userID == userID)
                    return i;
            return -1;
        }
        getItem(indexOrID) {
            return this._userIDs[typeof indexOrID == 'number' ? indexOrID : this.indexOf(indexOrID)];
        }
    }
    DS.UserAccess = UserAccess;
})(DS || (DS = {}));
// ############################################################################################################################
//# sourceMappingURL=Security.js.map