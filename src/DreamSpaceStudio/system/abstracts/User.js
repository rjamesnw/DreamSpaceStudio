var DS;
(function (DS) {
    // ############################################################################################################################
    // Data Tables
    // ############################################################################################################################
    /** The current user of the FlowScript system.
     * The user 'id' (a GUID) is used as the root directory for projects.
     */
    class User extends DS.TrackableObject {
        constructor(email, firstname, lastname) {
            super();
            this.email = email;
            this.firstname = firstname;
            this.lastname = lastname;
            /** Holds a mapping of this user ID to global roles associated with the user. */
            this._security = new DS.UserAccess();
        }
        /** Returns the current user object. */
        static get current() { return _currentUser; }
        /** Starts the process of changing the current user. */
        static async changeCurrentUser(user) {
            return new Promise((resolve, reject) => {
                this.onCurrentUserChanging.triggerAsync(_currentUser, user)
                    .then(() => this.onCurrentUserChanged.triggerAsync(_currentUser, user), reject) // (any exception in the previous promise will trigger 'reject')
                    .then(resolve, reject); // (any exception in the previous 'then' will trigger 'reject')
            });
        }
    }
    /** Triggered when the current user is about to change.  If any handler returns false then the request is cancelled (such as if the current project is not saved yet). */
    User.onCurrentUserChanging = new DS.EventDispatcher(User, "onCurrentUserChanging");
    /** Triggered when the current user has changed. This event cannot be cancelled - use the 'onCurrentUserChanging' event for that. */
    User.onCurrentUserChanged = new DS.EventDispatcher(User, "onCurrentUserChanged", false, false);
    DS.User = User;
    // ############################################################################################################################
    var _currentUser = new User("");
    // ############################################################################################################################
})(DS || (DS = {}));
//# sourceMappingURL=User.js.map