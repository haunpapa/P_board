const express = require('express');
const path = require('path');
const postRoutes = require('./routes/posts');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/', postRoutes);

app.use((err, _req, res, _next) => {
  if (err.message === 'HTML 파일만 업로드 가능합니다.') {
    return res.status(400).render('error', { message: err.message });
  }
  console.error(err);
  res.status(500).render('error', { message: '서버 오류가 발생했습니다.' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
