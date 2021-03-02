define(["require", "exports", "./globals"], function (require, exports, globals_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function toggleResetPswd(e) {
        e.preventDefault();
        alert('Please contact your own support team.  Inossis has no control over your login details.');
        //$('#logreg-forms .form-signin').toggle(); // display:block or none
        //$('#logreg-forms .form-reset').toggle(); // display:block or none
    }
    function toggleSignUp(e) {
        e.preventDefault();
        alert('Please contact your management/support team and request them to have you added to the system.');
        //$('#logreg-forms .form-signin').toggle(); // display:block or none
        //$('#logreg-forms .form-signup').toggle(); // display:block or none
    }
    async function doLogin(e) {
        var _a;
        let data = {
            username: document.getElementById('username').value.trim(),
            password: document.getElementById('password').value.trim(),
            site: document.getElementById('site').value.trim(),
        };
        if (!data.username)
            return alert('Please enter your username.');
        if (!data.password)
            return alert('Please enter your password.');
        if (!+data.site)
            return alert('Please selecta site.');
        var results = await DS.IO.get("/api/safepoint/support/login", void 0, DS.IO.Methods.POST, data);
        if ((_a = results.error) === null || _a === void 0 ? void 0 : _a.message)
            alert(results.error.message);
        else {
            if (results.message)
                alert(results.message);
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
    globals_1.bootsrap.then(() => {
        onReady();
    });
});
//# sourceMappingURL=login.js.map