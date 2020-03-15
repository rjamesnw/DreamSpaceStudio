// WARNING: This code is auto-generated. Only code placed between the "### USER CODE START ###" and "### USER CODE END ###"
// comments will be preserved between updates.
export default async function loadLibFiles(editor: IMonaco, libFiles: string[]): Promise<DS.IO.IResponse<void>> {
    var response: DS.IO.IResponse<void>;
    // ### USER CODE START ###

    monaco.languages.typescript.typescriptDefaults.addExtraLib("class ctx { x:0; }");

    response = new DS.IO.Response("OK");

    // ### USER CODE END ###
    return response;
}