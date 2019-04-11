export declare enum UserRoles {
    /** The user has no access. */
    None = 0,
    /** The user has full access as administrator. */
    Admin = 1,
    /** The user has read access. */
    Viewer = 2,
    /** The user is allowed to make modifications. Implies read access, but does not include creation access. */
    Editor = 3,
    /** The user can create and modify. */
    Creator = 4,
    /** The user can delete/remove. */
    Purger = 5
}
export declare class UserAccessEntry {
    userID: string;
    roles: UserRoles[];
    constructor(userID: string, roles: UserRoles[]);
    /** Returns true if the specified role exists in this access entry. */
    hasRole(role: UserRoles): boolean;
}
export declare class UserAccess {
    private _userIDs;
    readonly length: number;
    /** Assigns a user ID and one or more roles. If roles already exist, the given roles are merged (existing roles are note replaced). */
    add(userID: string, ...roles: UserRoles[]): UserAccessEntry;
    /** Removes a user's access. */
    revoke(index: number): boolean;
    /** Removes a user's access. */
    revoke(id: string): boolean;
    /** Finds the index of the entry with the specific user ID. */
    indexOf(userID: string): number;
    /** Gets a user access entry using an index. */
    getItem(index: number): UserAccessEntry;
    /** Gets a user access entry using the user ID. */
    getItem(userID: string): UserAccessEntry;
}
