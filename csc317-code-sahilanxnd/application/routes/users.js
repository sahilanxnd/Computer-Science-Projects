var express = require('express');
var router = express.Router();
const { doesUsernameExist, doesEmailExist, validatePassword, validateUsername, validateEmail } = require('../middleware/validate');
const db = require('../conf/database');
const bcrypt = require('bcrypt');

router.get('/registration', function (req, res, next) {
  res.render('registration', {
    title: 'Register',
    messages: req.flash(),
    js: ['registration.js']
  });
});

router.post('/registration',
  validateUsername,
  validatePassword,
  validateEmail,
  doesUsernameExist,
  doesEmailExist,
  async function (req, res, next) {
    var { username, email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 3);
      var [resultObject, _] = await db.query(`INSERT INTO user(username, email, password_hash) VALUES(?,?,?);`, [username, email, hashedPassword]);
      if (resultObject && resultObject.affectedRows) {
        return res.redirect('/login');
      } else {
        return req.session.save((err) => {
          req.flash("error", `Account creation failed!`);
          return res.redirect('/registration');
        });
      }
    } catch (err) { next(err); }
  });

router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const [rows, _] = await db.query('SELECT * FROM user WHERE username = ?', [username]);
    if (rows.length === 1) {
      const user = rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (match) {
        req.session.user = { id: user.user_id, username: user.username, email: user.email };
        return res.redirect('/');
      }
    }
    req.flash('error', 'Invalid username or password.');
    req.session.save(() => res.redirect('/login'));
  } catch (err) { next(err); }
});

router.get('/login', (req, res) => {
  res.render('login', { title: 'Login', messages: req.flash() });
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) { console.log(err); return res.redirect('/'); }
    req.flash("success", "You have been logged out.");
    res.redirect('/login');
  });
});

router.get('/profile', async (req, res) => {
  if (!req.session.user) {
    req.flash("error", "You must be logged in to view your profile.");
    return res.redirect('/users/login');
  }
  try {
    const [posts] = await db.query(
      `SELECT post_id, title FROM post WHERE user_id = ? ORDER BY created_at DESC`,
      [req.session.user.id]
    );
    res.render('profile', {
      title: 'My Profile',   // ← BUG FIX: this line was missing
      user: req.session.user,
      posts,
      messages: req.flash()
    });
  } catch (err) {
    console.error("Profile fetch error:", err.message);
    req.flash("error", "Failed to load profile data.");
    res.redirect('/');
  }
});

module.exports = router;