function isValidUser(Username) {
    if (Username.length < 3) return false;
    var firstChar = Username.charAt(0);
    if (!((firstChar >= 'A' && firstChar <= 'Z') || (firstChar >= 'a' && firstChar <= 'z'))) {
        return false;
    }
    return true;
}

function isValidPassword(Password) {
    if (Password.length < 8) return false;

    var hasUpper = false;
    var hasDigit = false;
    var hasSpecial = false;
    var specials = "/*-+!@#$^&~[]";

    for (var i = 0; i < Password.length; i++) {
        var c = Password.charAt(i);

        if (c >= 'A' && c <= 'Z') {
            hasUpper = true;
        }
        if (c >= '0' && c <= '9') {
            hasDigit = true;
        }
        if (specials.includes(c)) {
            hasSpecial = true;
        }
    }

    return hasUpper && hasDigit && hasSpecial;
}

var UsernameField = document.getElementById('Username');
var PasswordField = document.getElementById('Password');
var ConfirmPasswordField = document.getElementById('ConfirmPassword');
var EmailField = document.getElementById('Email');

var UsernameError = document.getElementById('username-error');
var EmailError = document.getElementById('email-error');

var regForm = document.getElementById('reg-form');

if (UsernameField) {
    UsernameField.addEventListener('input', function (e) {
        var Username = e.target.value;
        if (isValidUser(Username)) {
            UsernameField.classList.remove("invalid");
            UsernameField.classList.add("valid");
            UsernameError.style.display = "none";
            document.getElementById('submitBtn').removeAttribute("disabled");
        } else {
            UsernameField.classList.add("invalid");
            UsernameField.classList.remove("valid");
            UsernameError.style.display = "inline";
            document.getElementById('submitBtn').setAttribute("disabled", true);
        }
    });
}

if (EmailField) {
    EmailField.addEventListener('input', function (e) {
        var emailValue = e.target.value;
        if (EmailField.checkValidity()) {
            EmailField.classList.remove("invalid");
            EmailField.classList.add("valid");
            EmailError.style.display = "none";
        } else {
            EmailField.classList.add("invalid");
            EmailField.classList.remove("valid");
            EmailError.style.display = "inline";
        }
    });
}

if (PasswordField) {
    PasswordField.addEventListener('input', function (e) {
        var Password = e.target.value;
        if (isValidPassword(Password)) {
            PasswordField.classList.remove("invalid");
            PasswordField.classList.add("valid");
        } else {
            PasswordField.classList.add("invalid");
            PasswordField.classList.remove("valid");
        }
    });
}

if (ConfirmPasswordField) {
    ConfirmPasswordField.addEventListener('input', function (e) {
        var ConfirmPassword = e.target.value;
        var Password = PasswordField.value;
        if (ConfirmPassword === Password && ConfirmPassword !== "") {
            ConfirmPasswordField.classList.remove("invalid");
            ConfirmPasswordField.classList.add("valid");
        } else {
            ConfirmPasswordField.classList.add("invalid");
            ConfirmPasswordField.classList.remove("valid");
        }
    });
}

regForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const Username = UsernameField.value;
    const Password = PasswordField.value;
    const ConfirmPassword = ConfirmPasswordField.value;

    if (!isValidUser(Username)) {
        alert("Invalid Username: must be at least 3 characters and start with a letter.");
        return;
    }

    if (!isValidPassword(Password)) {
        alert("Invalid Password: must be 8+ characters with at least 1 uppercase letter, 1 number, and 1 special character.");
        return;
    }

    if (Password !== ConfirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    regForm.submit();
});