import ldap = require('ldapjs');

//? ldap.Attribute.settings.guid_format = ldap.GUID_FORMAT_B;

export async function login(username: string, password: string, ldapPath: string): Promise<ldap.SearchEntryObject> {
    var client = ldap.createClient({
        url: ldapPath
    });

    return new Promise<ldap.SearchEntryObject>((res, rej) => {
        client.bind(username, password, function (err) {
            if (err) return rej(err);

            let opts: ldap.SearchOptions = {
                filter: '(objectclass=user)',
                scope: 'sub',
                attributes: ['objectGUID']
            };

            var base = 'CN=users,' + DS.Path.getName(ldapPath);

            client.search(base, opts, function (err, search) {
                if (err) return rej(err);

                var user: ldap.SearchEntryObject;

                search.on('error', serr => {
                    (client.unbind(), rej(serr))
                });
                search.on('end', () => {
                    res(user);
                });
                search.on('searchEntry', function (entry) {
                    user = entry.object;
                    console.log("LDAP User: " + JSON.stringify(user));
                    res(user);
                    client.unbind();
                    search.removeAllListeners();
                });
            });
        });
    });
}
