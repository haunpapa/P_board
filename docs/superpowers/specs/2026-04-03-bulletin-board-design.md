# HTML Upload Bulletin Board - Design Spec

## Overview
HTML 파일을 업로드하여 게시글을 관리하는 게시판 사이트.
로그인 없이 링크 공유로 접근 가능.

## Tech Stack
- **Server**: Express.js
- **DB**: SQLite (better-sqlite3)
- **Upload**: multer
- **Template**: EJS
- **Style**: Pure CSS

## DB Schema

### posts
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto increment |
| title | TEXT NOT NULL | Post title |
| author | TEXT NOT NULL | Author name |
| filename | TEXT NOT NULL | Uploaded HTML filename (UUID) |
| created_at | DATETIME | Created timestamp |
| updated_at | DATETIME | Updated timestamp |

## Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | / | Post list |
| GET | /posts/new | Create form |
| POST | /posts | Create post |
| GET | /posts/:id | View post |
| GET | /posts/:id/edit | Edit form |
| POST | /posts/:id | Update post |
| POST | /posts/:id/delete | Delete post |
| GET | /uploads/:filename | Serve uploaded HTML |

## Security
- `.html` / `.htm` extensions only
- UUID filenames (collision prevention)
- iframe sandbox for uploaded HTML
- 5MB file size limit

## Project Structure
```
P_board/
├── server.js
├── package.json
├── database.js
├── routes/posts.js
├── views/ (layout, index, view, create, edit).ejs
├── public/style.css
└── uploads/
```
