define(["require", "exports", "./PrimitiveTypes", "./Events", "./Security"], function (require, exports, PrimitiveTypes_1, Events_1, Security_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // ############################################################################################################################
    /** The current user of the FlowScript system.
     * The user 'id' (a GUID) is used as the root directory for projects.
     */
    class User extends PrimitiveTypes_1.DSObject {
        constructor(email, firstname, lastname) {
            super();
            this.email = email;
            this.firstname = firstname;
            this.lastname = lastname;
            /** Holds a mapping of this user ID to global roles associated with the user. */
            this._security = new Security_1.UserAccess();
        }
        /** Returns the current user object. */
        static get current() { return _currentUser; }
        /** Starts the process of changing the current user. */
        static changeCurrentUser(user) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve, reject) => {
                    this.onCurrentUserChanging.triggerAsync(_currentUser, user)
                        .then(() => this.onCurrentUserChanged.triggerAsync(_currentUser, user), reject) // (any exception in the previous promise will trigger 'reject')
                        .then(resolve, reject); // (any exception in the previous 'then' will trigger 'reject')
                });
            });
        }
    }
    /** Triggered when the current user is about to change.  If any handler returns false then the request is cancelled (such as if the current project is not saved yet). */
    User.onCurrentUserChanging = Events_1.EventDispatcher.new(User, "onCurrentUserChanging");
    /** Triggered when the current user has changed. This event cannot be cancelled - use the 'onCurrentUserChanging' event for that. */
    User.onCurrentUserChanged = Events_1.EventDispatcher.new(User, "onCurrentUserChanged", false, null, false);
    exports.User = User;
    // ========================================================================================================================
    var _currentUser = new User("");
});
// ========================================================================================================================
// ############################################################################################################################
//# sourceMappingURL=User.js.map