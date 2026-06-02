const db = require('../conf/database');

module.exports = {
    // Check if username already exists
    doesUsernameExist: async function (req, res, next) {
        var { username } = req.body;
        var [rows, _] = await db.query('select user_id from user where username=?;', [username]);
        if (rows && rows.length > 0) {
            req.flash("error", `The username, ${username} already exists!`);
            return req.session.save((err) => {
                return res.redirect('/registration');
            });
        } else {
            next()
        }
    },

    // Check if email already exists
    doesEmailExist: async function (req, res, next) {
        var { email } = req.body;
        var [rows, _] = await db.query('select user_id from user where email=?;', [email]);
        if (rows && rows.length > 0) {
            req.flash("error", `The email, ${email} already exists!`);
            return req.session.save((err) => {
                return res.redirect('/registration');
            });
        } else {
            next()
        }
    },

    // Validate username format
    validateUsername: async function (req, res, next) {
        const { username } = req.body;
        if (!username || username.length < 3 || !/^[A-Za-z]/.test(username)) {
            req.flash("error", "Username must be at least 3 characters long and start with a letter.");
            return req.session.save(() => res.redirect('/registration'));
        }
        next()
    },

    // Validate email format
    validateEmail: async function (req, res, next) {
        const { email } = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            req.flash("error", "Invalid email address format.");
            return req.session.save(() => res.redirect('/registration'));
        }
        next()
    },

    // Validate password format
    validatePassword: async function (req, res, next) {
        const { password, cpassword } = req.body;

        if (!password || password.length < 8) {
            req.flash("error", "Password must be at least 8 characters long.");
            return req.session.save(() => res.redirect('/registration'));
        }

        const hasUpper = /[A-Z]/.test(password);
        const hasDigit = /[0-9]/.test(password);
        const hasSpecial = /[\/\*\-\+\!@#\$^&~\[\]]/.test(password);

        if (!hasUpper || !hasDigit || !hasSpecial) {
            req.flash("error", "Password must include an uppercase letter, a number, and a special character.");
            return req.session.save(() => res.redirect('/registration'));
        }

        if (password !== cpassword) {
            req.flash("error", "Passwords do not match.");
            return req.session.save(() => res.redirect('/registration'));
        }

        next();
    }
}