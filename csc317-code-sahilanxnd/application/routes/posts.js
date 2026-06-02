const express = require('express');
const router = express.Router();
const db = require('../conf/database');
const multer = require('multer');
const path = require('path');
const { makeThumbnail } = require('../middleware/thumbnail');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/videos');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

router.get('/postvideo', (req, res) => {
  if (!req.session.user) {
    req.flash("error", "You must be logged in to post.");
    return res.redirect('/users/login');
  }

  res.render('postvideo', {
    title: 'Upload Video',
    messages: req.flash()
  });
});


router.post('/postvideo', upload.single('video'), makeThumbnail, async (req, res) => {
  if (!req.session.user) {
    req.flash("error", "You must be logged in to post.");
    return res.redirect('/users/login');
  }

  const { title, description } = req.body;
  const videoFile = req.file?.filename;
  const thumbnailPath = req.file?.thumbnail;

  if (!videoFile || !thumbnailPath) {
    req.flash("error", "Video or thumbnail upload failed.");
    return res.redirect('/posts/postvideo');
  }

  try {
    await db.query(
      `INSERT INTO post (user_id, title, description, content, thumbnail) VALUES (?, ?, ?, ?, ?)`,
      [req.session.user.id, title, description, videoFile, thumbnailPath]
    );

    req.flash("success", "Video posted successfully!");
    return res.redirect('/');
  } catch (err) {
    console.error("DB Insert Error:", err.message);
    req.flash("error", "Something went wrong while saving your post.");
    return res.redirect('/posts/postvideo');
  }
});


router.get('/search', async (req, res, next) => {
  const searchTerm = req.query.query;

  if (!searchTerm || searchTerm.trim() === '') {
    req.flash('error', 'Please enter a search term.');
    return res.redirect('/');
  }

  try {
    const [results] = await db.query(
      `SELECT post_id, title, thumbnail FROM post WHERE title LIKE ? OR description LIKE ? ORDER BY created_at DESC`,
      [`%${searchTerm}%`, `%${searchTerm}%`]
    );

    res.render('search', {
      title: 'Search Results',
      posts: results,
      searchTerm,
      messages: req.flash()
    });
  } catch (err) {
    next(err);
  }
});


router.get('/:id', async (req, res, next) => {
  const postId = req.params.id;

  try {
    const [[post]] = await db.query(
      `SELECT p.post_id, p.title, p.description, p.content AS videoFile, p.thumbnail, u.username, p.created_at
       FROM post p
       JOIN user u ON p.user_id = u.user_id
       WHERE p.post_id = ?`,
      [postId]
    );

    if (!post) {
      req.flash('error', 'Post not found.');
      return res.redirect('/');
    }

    const [[likeCount]] = await db.query(
      `SELECT COUNT(*) AS count FROM likes WHERE post_id = ?`,
      [postId]
    );

    let hasLiked = false;
    if (req.session.user) {
      const [existing] = await db.query(
        `SELECT * FROM likes WHERE user_id = ? AND post_id = ?`,
        [req.session.user.id, postId]
      );
      hasLiked = existing.length > 0;
    }

    const [comments] = await db.query(
      `SELECT c.content, c.created_at, u.username
       FROM comment c
       JOIN user u ON c.user_id = u.user_id
       WHERE c.post_id = ?
       ORDER BY c.created_at DESC`,
      [postId]
    );

    post.likeCount = likeCount.count;
    post.hasLiked = hasLiked;
    post.comments = comments;

    res.render('viewpost', {
      title: 'View Post',
      post,
      messages: req.flash()
    });

  } catch (err) {
    next(err);
  }
});


router.post('/:postId/like', async (req, res) => {
  if (!req.session.user) {
    req.flash("error", "You must be logged in to like posts.");
    return res.redirect("/users/login");
  }

  const userId = req.session.user.id;
  const postId = req.params.postId;

  try {
    const [rows] = await db.query(
      `SELECT * FROM likes WHERE user_id = ? AND post_id = ?`,
      [userId, postId]
    );

    if (rows.length > 0) {
      req.flash("error", "You've already liked this post.");
      return res.redirect(`/posts/${postId}`);
    }

    await db.query(
      `INSERT INTO likes (user_id, post_id, created_at) VALUES (?, ?, NOW())`,
      [userId, postId]
    );

    req.flash("success", "Post liked!");
    return res.redirect(`/posts/${postId}`);
  } catch (err) {
    console.error("Like error:", err.message);
    req.flash("error", "Error while liking post.");
    return res.redirect(`/posts/${postId}`);
  }
});


router.post('/:postId/unlike', async (req, res) => {
  if (!req.session.user) {
    req.flash("error", "You must be logged in to unlike posts.");
    return res.redirect("/users/login");
  }

  const userId = req.session.user.id;
  const postId = req.params.postId;

  try {
    const [rows] = await db.query(
      `SELECT * FROM likes WHERE user_id = ? AND post_id = ?`,
      [userId, postId]
    );

    if (rows.length === 0) {
      req.flash("error", "You haven't liked this post.");
      return res.redirect(`/posts/${postId}`);
    }

    await db.query(
      `DELETE FROM likes WHERE user_id = ? AND post_id = ?`,
      [userId, postId]
    );

    req.flash("success", "Post unliked.");
    return res.redirect(`/posts/${postId}`);
  } catch (err) {
    console.error("Unlike error:", err.message);
    req.flash("error", "Error while unliking post.");
    return res.redirect(`/posts/${postId}`);
  }
});


router.post('/:postId/comment', async (req, res) => {
  if (!req.session.user) {
    req.flash("error", "You must be logged in to comment.");
    return res.redirect("/users/login");
  }

  const userId = req.session.user.id;
  const postId = req.params.postId;
  const { comment } = req.body;

  if (!comment || comment.trim() === "") {
    req.flash("error", "Comment cannot be empty.");
    return res.redirect(`/posts/${postId}`);
  }

  try {
    await db.query(
      `INSERT INTO comment (post_id, user_id, content, created_at) VALUES (?, ?, ?, NOW())`,
      [postId, userId, comment]
    );

    req.flash("success", "Comment added.");
    return res.redirect(`/posts/${postId}`);
  } catch (err) {
    console.error("Comment error:", err.message);
    req.flash("error", "Error adding comment.");
    return res.redirect(`/posts/${postId}`);
  }
});


router.post('/:postId/delete', async (req, res) => {
  if (!req.session.user) {
    req.flash("error", "You must be logged in to delete posts.");
    return res.redirect("/users/login");
  }

  const userId = req.session.user.id;
  const postId = req.params.postId;

  try {
    // Ensure user owns the post
    const [[post]] = await db.query(
      `SELECT * FROM post WHERE post_id = ? AND user_id = ?`,
      [postId, userId]
    );

    if (!post) {
      req.flash("error", "You are not authorized to delete this post.");
      return res.redirect("/users/profile");
    }

    // Delete the post
    await db.query(`DELETE FROM post WHERE post_id = ?`, [postId]);

    req.flash("success", "Post deleted.");
    return res.redirect("/users/profile");
  } catch (err) {
    console.error("Delete error:", err.message);
    req.flash("error", "Could not delete post.");
    return res.redirect("/users/profile");
  }
});

module.exports = router;
