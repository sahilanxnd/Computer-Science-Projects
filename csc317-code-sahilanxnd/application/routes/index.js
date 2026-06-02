var express = require('express');
var router = express.Router();
const db = require('../conf/database');

// Homepage route 
router.get('/', async function (req, res, next) {
  try {
    const [posts] = await db.query(`
      SELECT post_id, title, thumbnail 
      FROM post 
      ORDER BY created_at DESC
    `);

    res.render('index', {
      title: 'iTube',
      posts,
      js: ['index.js'],
      messages: req.flash()
    });
  }
  catch (err) {
    console.error(err);
    res.render('index', {
      title: 'iTube',
      posts: [],
      js: ['index.js'],
      messages: req.flash(),
      error: "Failed to load posts"
    });
  }
});

// Login page
router.get('/login', function (req, res, next) {
  res.render('login', { title: 'Login Page' });
});

// Registration page
router.get('/registration', function (req, res, next) {
  res.render('registration', { title: 'Registration Page', js: ['registration.js'] });
});

// Post video page
router.get('/postvideo', function (req, res, next) {
  res.render('postvideo', { title: 'Post Video Page' });
});

// View single post page
router.get('/viewpost', function (req, res, next) {
  res.render('viewpost', { title: 'View Post Page' });
});

module.exports = router;
