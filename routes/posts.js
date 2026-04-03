const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { postQueries } = require('../database');

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
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
router.get('/', (_req, res) => {
  const posts = postQueries.findAll();
  res.render('index', { posts });
});

// Create form
router.get('/posts/new', (_req, res) => {
  res.render('create');
});

// Create
router.post('/posts', upload.single('htmlFile'), (req, res) => {
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

// View
router.get('/posts/:id', (req, res) => {
  const post = postQueries.findById(req.params.id);
  if (!post) return res.status(404).render('error', { message: '게시글을 찾을 수 없습니다.' });
  res.render('view', { post });
});

// Edit form
router.get('/posts/:id/edit', (req, res) => {
  const post = postQueries.findById(req.params.id);
  if (!post) return res.status(404).render('error', { message: '게시글을 찾을 수 없습니다.' });
  res.render('edit', { post });
});

// Update
router.post('/posts/:id', upload.single('htmlFile'), (req, res) => {
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
    const oldPath = path.join(__dirname, '..', 'uploads', post.filename);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

    updateData.filename = req.file.filename;
    updateData.originalName = req.file.originalname;
  }

  postQueries.update(req.params.id, updateData);
  res.redirect(`/posts/${req.params.id}`);
});

// Delete
router.post('/posts/:id/delete', (req, res) => {
  const post = postQueries.findById(req.params.id);
  if (!post) return res.status(404).render('error', { message: '게시글을 찾을 수 없습니다.' });

  const filePath = path.join(__dirname, '..', 'uploads', post.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  postQueries.delete(req.params.id);
  res.redirect('/');
});

module.exports = router;
