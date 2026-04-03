const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'board.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    created_at DATETIME DEFAULT (datetime('now', 'localtime')),
    updated_at DATETIME DEFAULT (datetime('now', 'localtime'))
  )
`);

const postQueries = {
  findAll() {
    return db.prepare(
      'SELECT id, title, author, created_at, updated_at FROM posts ORDER BY created_at DESC'
    ).all();
  },

  findById(id) {
    return db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
  },

  create({ title, author, filename, originalName }) {
    const result = db.prepare(
      'INSERT INTO posts (title, author, filename, original_name) VALUES (?, ?, ?, ?)'
    ).run(title, author, filename, originalName);
    return result.lastInsertRowid;
  },

  update(id, { title, author, filename, originalName }) {
    if (filename) {
      return db.prepare(
        `UPDATE posts SET title = ?, author = ?, filename = ?, original_name = ?,
         updated_at = datetime('now', 'localtime') WHERE id = ?`
      ).run(title, author, filename, originalName, id);
    }
    return db.prepare(
      `UPDATE posts SET title = ?, author = ?,
       updated_at = datetime('now', 'localtime') WHERE id = ?`
    ).run(title, author, id);
  },

  delete(id) {
    return db.prepare('DELETE FROM posts WHERE id = ?').run(id);
  }
};

module.exports = { db, postQueries };
