import { Object } from "../PrimitiveTypes";
import { UserAccess } from "./Security";
/** The current user of the FlowScript system.
 * The user 'id' (a GUID) is used as the root directory for projects.
 */
export declare class User extends Object {
    email: string;
    firstname?: string;
    lastname?: string;
    /** Returns the current user object. */
    static readonly current: User;
    /** Triggered when the current user is about to change.  If any handler returns false then the request is cancelled (such as if the current project is not saved yet). */
    static readonly onCurrentUserChanging: import("./Events").IEventDispatcher<typeof User, (oldUser: User, newUser: User) => boolean>;
    /** Triggered when the current user has changed. This event cannot be cancelled - use the 'onCurrentUserChanging' event for that. */
    static readonly onCurrentUserChanged: import("./Events").IEventDispatcher<typeof User, (oldUser: User, newUser: User) => void>;
    /** Starts the process of changing the current user. */
    static changeCurrentUser(user: User): Promise<void>;
    /** Holds a mapping of this user ID to global roles associated with the user. */
    readonly _security: UserAccess;
    constructor(email: string, firstname?: string, lastname?: string);
}
