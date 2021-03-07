import { startup } from "../../startup";

function toggleResetPswd(e: JQuery.ClickEvent) {
    e.preventDefault();
    alert('Please contact your own support team.  Inossis has no control over your login details.');
    //$('#logreg-forms .form-signin').toggle(); // display:block or none
    //$('#logreg-forms .form-reset').toggle(); // display:block or none
}

function toggleSignUp(e: JQuery.ClickEvent) {
    e.preventDefault();
    alert('Please contact your management/support team and request them to have you added to the system.');
    //$('#logreg-forms .form-signin').toggle(); // display:block or none
    //$('#logreg-forms .form-signup').toggle(); // display:block or none
}

async function doLogin(e: JQuery.ClickEvent) {
    let data = {
        username: (<HTMLInputElement>document.getElementById('username')).value.trim(),
        password: (<HTMLInputElement>document.getElementById('password')).value.trim(),
        site: (<HTMLInputElement>document.getElementById('site')).value.trim(),
    };

    if (!data.username) return alert('Please enter your username.');
    if (!data.password) return alert('Please enter your password.');
    if (!+data.site) return alert('Please selecta site.');

    var results = await DS.IO.get<DS.IO.IResponse>("/api/safepoint/support/login", void 0, DS.IO.Methods.POST, data);

    if (results.error?.message)
        alert(results.error.message);
    else {
        if (results.message) alert(results.message);

        location.href = "index";
    }
}

function onReady() {
    // Login Register Form
    $('#logreg-forms #forgot_pswd').click(toggleResetPswd);
    $('#logreg-forms #cancel_reset').click(toggleResetPswd);
    $('#logreg-forms #btn-signup').click(toggleSignUp);
    $('#logreg-forms #cancel_signup').click(toggleSignUp);
    $('#logreg-forms #btn-login').click(doLogin);
}

startup.then(() => { // (always initialize first, then go from there)
    onReady();
});

