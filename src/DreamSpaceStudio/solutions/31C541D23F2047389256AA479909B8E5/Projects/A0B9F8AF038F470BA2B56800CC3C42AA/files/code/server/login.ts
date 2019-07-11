async function login(username: string, password: string): Promise<IResponse<boolean>> {
    // ... takes the username and password given from the *client* side and attempts to login the user ...
    // ... this will use the file system to look up the user by iterating over the user GUID directories to find the user by username;
    //     this is find, since there will only ever be a handful of developers working on the system ...

    var dirs = await DS.getDirectories("users");

    return Promise.resolve(<IResponse<boolean>>{ statusCode: 200, message: "OK", data: true });
}