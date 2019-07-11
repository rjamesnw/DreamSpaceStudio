async function login(username: string, password: string): Promise<IResponse<boolean>> {
    // ... takes the username and password given from the *UI* and attempts to login the user ...

    var result = await DS.get<IResponse<boolean>>("api/login", "json", "POST", { username, password });

