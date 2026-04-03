const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { postQueries, UPLOADS_DIR } = require('../database');

const router = express.Router();

const ADMIN_KEY = process.env.ADMIN_KEY || 'haeon1121';

function isAdmin(req) {
  return req.query.admin === ADMIN_KEY || req.body?.admin === ADMIN_KEY;
}

function requireAdmin(req, res, next) {
  if (!isAdmin(req)) return res.status(403).render('error', { message: '권한이 없습니다.' });
  next();
}

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  }
});

function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.html' || ext === '.htm') {
    cb(null, true);
  } else {
    cb(new Error('HTML 파일만 업로드 가능합니다.'));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// List
router.get('/', (req, res) => {
  const search = req.query.q || '';
  const admin = isAdmin(req);
  const posts = postQueries.findAll(search);
  res.render('index', { posts, search, admin, adminKey: admin ? ADMIN_KEY : '' });
});

// Create form
router.get('/posts/new', requireAdmin, (req, res) => {
  res.render('create', { adminKey: ADMIN_KEY });
});

// Create
router.post('/posts', requireAdmin, upload.single('htmlFile'), (req, res) => {
  const { title, author } = req.body;

  if (!title || !author || !req.file) {
    return res.status(400).render('create', {
      error: '제목, 작성자, HTML 파일 모두 필요합니다.',
      title, author
    });
  }

  const id = postQueries.create({
    title: title.trim(),
    author: author.trim(),
    filename: req.file.filename,
    originalName: req.file.originalname
  });

  res.redirect(`/posts/${id}`);
});

// View - serve HTML file directly
router.get('/posts/:id', (req, res) => {
  const post = postQueries.findById(req.params.id);
  if (!post) return res.status(404).render('error', { message: '게시글을 찾을 수 없습니다.' });
  const filePath = path.join(UPLOADS_DIR, post.filename);
  if (!fs.existsSync(filePath)) return res.status(404).render('error', { message: '파일을 찾을 수 없습니다.' });
  res.sendFile(filePath);
});

// Edit form
router.get('/posts/:id/edit', requireAdmin, (req, res) => {
  const post = postQueries.findById(req.params.id);
  if (!post) return res.status(404).render('error', { message: '게시글을 찾을 수 없습니다.' });
  res.render('edit', { post, adminKey: ADMIN_KEY });
});

// Update
router.post('/posts/:id', requireAdmin, upload.single('htmlFile'), (req, res) => {
  const post = postQueries.findById(req.params.id);
  if (!post) return res.status(404).render('error', { message: '게시글을 찾을 수 없습니다.' });

  const { title, author } = req.body;

  if (!title || !author) {
    return res.status(400).render('edit', {
      error: '제목과 작성자는 필수입니다.',
      post: { ...post, title, author }
    });
  }

  const updateData = { title: title.trim(), author: author.trim() };

  if (req.file) {
    // Delete old file
    const oldPath = path.join(UPLOADS_DIR, post.filename);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

    updateData.filename = req.file.filename;
    updateData.originalName = req.file.originalname;
  }

  postQueries.update(req.params.id, updateData);
  res.redirect(`/posts/${req.params.id}`);
});

// Delete
router.post('/posts/:id/delete', requireAdmin, (req, res) => {
  const post = postQueries.findById(req.params.id);
  if (!post) return res.status(404).render('error', { message: '게시글을 찾을 수 없습니다.' });

  const filePath = path.join(UPLOADS_DIR, post.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  postQueries.delete(req.params.id);
  res.redirect('/');
});

module.exports = router;
