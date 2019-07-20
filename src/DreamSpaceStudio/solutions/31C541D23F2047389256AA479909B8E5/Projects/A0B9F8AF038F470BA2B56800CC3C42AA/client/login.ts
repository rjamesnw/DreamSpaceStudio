export async function login(username: string, password: string): Promise<DS.IO.IResponse<boolean>> {
    var response: DS.IO.IResponse<boolean>;
    // ### USER CODE START ###

    // ... takes the username and password given from the *UI* and attempts to login the user ...
    response = await DS.IO.get<DS.IO.IResponse<boolean>>("api/login", "json", "POST", { username, password });

    // ### USER CODE END ###
    return response;
}
